#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 🔧 DEPLOYMENT CONFIGURATION
const CONFIG = {
  // VPS Server details - PROMIJENI OVE VRIJEDNOSTI!
  server: {
    host: 'your-vps-ip-address',        // npr. '192.168.1.100' ili 'yourdomain.com'
    username: 'root',                   // ili tvoj username
    port: 22,                          // SSH port
    deployPath: '/var/www/ders',       // gdje će se app deployovati na serveru
    domain: 'yourdomain.com'           // tvoj domain
  },
  
  // Local paths
  local: {
    keyPath: '~/.ssh/id_rsa',         // putanja do SSH key-a
    deploymentDir: './deployment-package'
  },
  
  // Services to restart
  services: {
    webPort: 3000,
    serverPort: 5003,
    pm2AppName: 'ders-app'
  }
};

console.log('🚀 DERS.BA Automatic Deployment Script\n');
console.log('📋 Configuration:');
console.log(`   Server: ${CONFIG.server.username}@${CONFIG.server.host}:${CONFIG.server.port}`);
console.log(`   Deploy path: ${CONFIG.server.deployPath}`);
console.log(`   Domain: ${CONFIG.server.domain}\n`);

// Provjeri da li su konfiguracija postavljena
if (CONFIG.server.host === 'your-vps-ip-address') {
  console.error('❌ GREŠKA: Molimo postavite server konfiguraciju u deploy.js!');
  console.error('   Promijeni CONFIG.server vrijednosti na vrhu fajla.');
  process.exit(1);
}

async function deploy() {
  try {
    console.log('🔨 KORAK 1: Building aplikacije...\n');
    await buildApplications();
    
    console.log('📦 KORAK 2: Kreiranje deployment paketa...\n');
    await createDeploymentPackage();
    
    console.log('📤 KORAK 3: Upload na server...\n');
    await uploadToServer();
    
    console.log('⚙️ KORAK 4: Server setup i restart...\n');
    await setupServer();
    
    console.log('✅ KORAK 5: Verifikacija deployment-a...\n');
    await verifyDeployment();
    
    console.log('🎉 DEPLOYMENT USPJEŠAN!\n');
    console.log(`🌐 Web aplikacija: http://${CONFIG.server.domain}`);
    console.log(`🔗 API: http://${CONFIG.server.domain}/api/health`);
    
  } catch (error) {
    console.error('❌ DEPLOYMENT NEUSPJEŠAN:', error.message);
    process.exit(1);
  }
}

async function buildApplications() {
  // Build shared package
  console.log('📦 Building shared package...');
  try {
    execSync('cd shared && npm run build', { stdio: 'inherit' });
    console.log('✅ Shared package built\n');
  } catch (error) {
    throw new Error(`Shared build failed: ${error.message}`);
  }
  
  // Build web application
  console.log('📦 Building web application...');
  try {
    execSync('cd web && npm run build', { stdio: 'inherit' });
    console.log('✅ Web application built\n');
  } catch (error) {
    throw new Error(`Web build failed: ${error.message}`);
  }
  
  // Check server
  console.log('🔍 Checking server files...');
  if (!fs.existsSync('server/index.js')) {
    throw new Error('Server index.js not found');
  }
  console.log('✅ Server files OK\n');
}

async function createDeploymentPackage() {
  const deployDir = CONFIG.local.deploymentDir;
  
  // Obriši postojeći deployment folder
  if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true });
  }
  fs.mkdirSync(deployDir, { recursive: true });
  
  // Copy web files
  console.log('📋 Copying web files...');
  const webFiles = [
    'web/.next',
    'web/public', 
    'web/package.json',
    'web/package-lock.json'
  ];
  
  fs.mkdirSync(path.join(deployDir, 'web'), { recursive: true });
  
  webFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const dest = path.join(deployDir, file);
      if (fs.statSync(file).isDirectory()) {
        copyDir(file, dest);
      } else {
        fs.copyFileSync(file, dest);
      }
      console.log(`   ✅ ${file}`);
    }
  });
  
  // Copy server files
  console.log('📋 Copying server files...');
  copyDir('server', path.join(deployDir, 'server'));
  console.log('   ✅ server/');
  
  // Copy shared files
  console.log('📋 Copying shared files...');
  copyDir('shared', path.join(deployDir, 'shared'));
  console.log('   ✅ shared/');
  
  // Create deployment scripts
  await createServerScripts(deployDir);
  
  console.log('✅ Deployment package created\n');
}

async function createServerScripts(deployDir) {
  // Server start script
  const startScript = `#!/bin/bash
echo "🚀 Starting DERS.BA application..."

# Install dependencies
echo "📦 Installing server dependencies..."
cd server && npm install --production

echo "📦 Installing web dependencies..."
cd ../web && npm install --production

echo "📦 Installing shared dependencies..."
cd ../shared && npm install --production

# Set permissions
chmod +x start.sh
chmod +x stop.sh

# Stop existing processes
echo "🛑 Stopping existing processes..."
pkill -f "node.*index.js" || true
pkill -f "next" || true

# Start server
echo "🔥 Starting server..."
cd server
nohup node index.js > ../logs/server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > ../logs/server.pid

# Start web (if needed - usually handled by reverse proxy)
echo "🌐 Starting web application..."
cd ../web
nohup npm start > ../logs/web.log 2>&1 &
WEB_PID=$!
echo $WEB_PID > ../logs/web.pid

echo "✅ DERS.BA started successfully!"
echo "📊 Server PID: $SERVER_PID"
echo "🌐 Web PID: $WEB_PID"
echo "📝 Logs: logs/server.log, logs/web.log"
`;

  const stopScript = `#!/bin/bash
echo "🛑 Stopping DERS.BA application..."

# Stop processes using PID files
if [ -f logs/server.pid ]; then
    SERVER_PID=$(cat logs/server.pid)
    kill $SERVER_PID 2>/dev/null || true
    rm logs/server.pid
    echo "✅ Server stopped (PID: $SERVER_PID)"
fi

if [ -f logs/web.pid ]; then
    WEB_PID=$(cat logs/web.pid)
    kill $WEB_PID 2>/dev/null || true
    rm logs/web.pid
    echo "✅ Web stopped (PID: $WEB_PID)"
fi

# Fallback - kill by process name
pkill -f "node.*index.js" || true
pkill -f "next" || true

echo "🛑 DERS.BA stopped"
`;

  const envTemplate = `# DERS.BA Production Environment Variables
NODE_ENV=production
PORT=${CONFIG.services.serverPort}

# Database
MONGODB_URI=mongodb://localhost:27017/ders_production

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# CORS
CORS_ORIGIN=http://${CONFIG.server.domain}

# File uploads
UPLOAD_PATH=/var/www/ders/uploads
MAX_FILE_SIZE=10485760

# Email (optional)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
`;

  const webEnvTemplate = `# Web Application Environment
NEXT_PUBLIC_API_URL=http://${CONFIG.server.domain}
NODE_ENV=production
PORT=${CONFIG.services.webPort}
`;

  // Write scripts
  fs.writeFileSync(path.join(deployDir, 'start.sh'), startScript);
  fs.writeFileSync(path.join(deployDir, 'stop.sh'), stopScript);
  fs.writeFileSync(path.join(deployDir, 'server/.env.example'), envTemplate);
  fs.writeFileSync(path.join(deployDir, 'web/.env.production.example'), webEnvTemplate);
  
  // Create logs directory
  fs.mkdirSync(path.join(deployDir, 'logs'), { recursive: true });
  
  console.log('📝 Server scripts created');
}

async function uploadToServer() {
  const deployDir = CONFIG.local.deploymentDir;
  const { host, username, port, deployPath } = CONFIG.server;
  
  console.log(`📤 Uploading to ${username}@${host}:${deployPath}...`);
  
  try {
    // Create remote directory
    execSync(`ssh -p ${port} ${username}@${host} "mkdir -p ${deployPath}"`, { stdio: 'inherit' });
    
    // Upload files using rsync (faster than scp for large directories)
    const rsyncCmd = `rsync -avz --delete -e "ssh -p ${port}" ${deployDir}/ ${username}@${host}:${deployPath}/`;
    console.log('🔄 Syncing files...');
    execSync(rsyncCmd, { stdio: 'inherit' });
    
    console.log('✅ Files uploaded successfully\n');
    
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

async function setupServer() {
  const { host, username, port, deployPath } = CONFIG.server;
  
  const setupCommands = [
    // Make scripts executable
    `chmod +x ${deployPath}/start.sh ${deployPath}/stop.sh`,
    
    // Create environment files if they don't exist
    `[ ! -f ${deployPath}/server/.env ] && cp ${deployPath}/server/.env.example ${deployPath}/server/.env || true`,
    `[ ! -f ${deployPath}/web/.env.production ] && cp ${deployPath}/web/.env.production.example ${deployPath}/web/.env.production || true`,
    
    // Stop existing application
    `cd ${deployPath} && ./stop.sh`,
    
    // Start application
    `cd ${deployPath} && ./start.sh`
  ];
  
  for (const cmd of setupCommands) {
    console.log(`🔧 Executing: ${cmd}`);
    try {
      execSync(`ssh -p ${port} ${username}@${host} "${cmd}"`, { stdio: 'inherit' });
    } catch (error) {
      console.warn(`⚠️ Command warning: ${error.message}`);
    }
  }
  
  console.log('✅ Server setup completed\n');
}

async function verifyDeployment() {
  const { domain } = CONFIG.server;
  
  console.log('🔍 Verifying deployment...');
  
  // Wait a bit for services to start
  console.log('⏳ Waiting for services to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    // Test API endpoint
    console.log('🔗 Testing API...');
    execSync(`curl -f http://${domain}/api/health || curl -f http://${domain}:${CONFIG.services.serverPort}/api/health`, { stdio: 'pipe' });
    console.log('✅ API is responding');
    
    // Test web application
    console.log('🌐 Testing web application...');
    execSync(`curl -f http://${domain} || curl -f http://${domain}:${CONFIG.services.webPort}`, { stdio: 'pipe' });
    console.log('✅ Web application is responding');
    
  } catch (error) {
    console.warn('⚠️ Some services may still be starting. Check manually:');
    console.warn(`   API: http://${domain}/api/health`);
    console.warn(`   Web: http://${domain}`);
  }
}

// Helper function to copy directories
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    // Skip node_modules and other unnecessary directories
    if (entry.isDirectory() && ['node_modules', '.git', '.next', 'dist'].includes(entry.name)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Run deployment
if (require.main === module) {
  deploy().catch(error => {
    console.error('💥 Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = { deploy, CONFIG }; 
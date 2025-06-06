const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparing DERS.BA for deployment...\n');

// 1. Build web aplikacije
console.log('📦 Building web application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Web build completed\n');
} catch (error) {
  console.error('❌ Web build failed:', error.message);
  process.exit(1);
}

// 2. Provjeri da li postoje potrebni fajlovi
console.log('🔍 Checking required files...');

const requiredFiles = [
  'web/.next',
  'web/package.json',
  'web/next.config.js',
  'server/index.js',
  'server/package.json',
  'server/models',
  'server/routes',
  'server/utils'
];

const missingFiles = [];

requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

console.log('✅ All required files present\n');

// 3. Kreiraj deployment folder
const deploymentDir = 'deployment';
if (fs.existsSync(deploymentDir)) {
  fs.rmSync(deploymentDir, { recursive: true });
}
fs.mkdirSync(deploymentDir);

console.log('📁 Created deployment directory\n');

// 4. Copy potrebne fajlove
console.log('📋 Copying files for deployment...');

// Copy web files
const webFiles = [
  'web/.next',
  'web/public',
  'web/package.json',
  'web/package-lock.json',
  'web/next.config.js'
];

fs.mkdirSync(path.join(deploymentDir, 'web'), { recursive: true });

webFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const dest = path.join(deploymentDir, file);
    if (fs.statSync(file).isDirectory()) {
      copyDir(file, dest);
    } else {
      fs.copyFileSync(file, dest);
    }
    console.log(`   ✅ Copied ${file}`);
  }
});

// Copy server files
copyDir('server', path.join(deploymentDir, 'server'));
console.log('   ✅ Copied server/');

// 5. Kreiraj deployment instructions
const instructions = `
# 🚀 DERS.BA Deployment Instructions

## 📦 Upload these files to your server:

1. **web/** folder - Next.js application
2. **server/** folder - Node.js/Express server

## 🔧 Server setup commands:

\`\`\`bash
# 1. Install server dependencies
cd server
npm install --production

# 2. Install web dependencies (if needed)
cd ../web
npm install --production

# 3. Start server (production)
cd ../server
npm run prod

# Or with PM2 (recommended):
pm2 start index.js --name "ders-server"
\`\`\`

## ⚙️ Environment variables:

Create **server/.env** file:
\`\`\`env
NODE_ENV=production
PORT=5003
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
\`\`\`

Create **web/.env.production** file:
\`\`\`env
NEXT_PUBLIC_API_URL=https://yourdomain.com
NODE_ENV=production
\`\`\`

## ✅ Test deployment:

1. API: https://yourdomain.com/api/health
2. Web: https://yourdomain.com
3. 404: https://yourdomain.com/test-404

## 📱 Mobile app update:

Update API URL in mobile app:
\`\`\`javascript
// mobile/src/config/api.js
const API_BASE_URL = 'https://yourdomain.com';
\`\`\`

Generated on: ${new Date().toISOString()}
`;

fs.writeFileSync(path.join(deploymentDir, 'DEPLOYMENT_INSTRUCTIONS.md'), instructions);

console.log('\n🎉 Deployment preparation completed!');
console.log(`📁 All files are ready in: ${deploymentDir}/`);
console.log('📖 Read DEPLOYMENT_INSTRUCTIONS.md for next steps');

// Helper function to copy directories
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
} 
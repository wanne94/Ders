#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { Client } = require('ssh2');
const archiver = require('archiver');
require('dotenv').config();

// Konfiguracija za deployment
const CONFIG = {
  server: {
    host: process.env.DEPLOY_HOST,
    username: process.env.DEPLOY_USER,
    port: parseInt(process.env.DEPLOY_PORT) || 22,
    privateKey: process.env.SSH_KEY_PATH ? fs.readFileSync(process.env.SSH_KEY_PATH) : undefined,
    deployPath: '/var/www/ders',
    webPath: '/var/www/ders/web',
    serverPath: '/var/www/ders/server',
    domain: process.env.DEPLOY_DOMAIN || 'localhost'
  },
  pm2: {
    webApp: 'ders-web',
    serverApp: 'ders-server'
  }
};

// Boje za console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
  } catch (error) {
    log(`Error executing: ${command}`, 'red');
    log(error.message, 'red');
    throw error;
  }
}

// SSH konekcija
function createSSHConnection() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    
    const connectionConfig = {
      host: CONFIG.server.host,
      username: CONFIG.server.username,
      port: CONFIG.server.port
    };

    // Dodaj SSH ključ ako postoji
    if (CONFIG.server.privateKey) {
      connectionConfig.privateKey = CONFIG.server.privateKey;
      if (process.env.SSH_PASSPHRASE) {
        connectionConfig.passphrase = process.env.SSH_PASSPHRASE;
      }
    } else {
      // Pokušaj sa SSH ključem iz environment varijable ili default
      const sshKeyPath = process.env.SSH_KEY_PATH || `${process.env.HOME || process.env.USERPROFILE}/.ssh/id_ed25519`;
      if (fs.existsSync(sshKeyPath)) {
        connectionConfig.privateKey = fs.readFileSync(sshKeyPath);
        // Dodaj passphrase samo ako je eksplicitno postavljen
        if (process.env.SSH_PASSPHRASE && process.env.SSH_PASSPHRASE.trim() !== '') {
          connectionConfig.passphrase = process.env.SSH_PASSPHRASE;
        }
      }
    }

    conn.on('ready', () => {
      log('SSH konekcija uspešna!', 'green');
      resolve(conn);
    });

    conn.on('error', (err) => {
      log(`SSH konekcija neuspešna: ${err.message}`, 'red');
      reject(err);
    });

    conn.connect(connectionConfig);
  });
}

// Izvršavanje SSH komande
function executeSSHCommand(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }

      let output = '';
      stream.on('close', (code, signal) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed with code ${code}: ${output}`));
        }
      });

      stream.on('data', (data) => {
        output += data;
      });

      stream.stderr.on('data', (data) => {
        output += data;
      });
    });
  });
}

// Upload fajla preko SSH2
function uploadFileSSH(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) {
        reject(err);
        return;
      }

      const readStream = fs.createReadStream(localPath);
      const writeStream = sftp.createWriteStream(remotePath);

      writeStream.on('close', () => {
        log(`📤 Upload završen: ${localPath} -> ${remotePath}`, 'green');
        sftp.end();
        resolve();
      });

      writeStream.on('error', (err) => {
        sftp.end();
        reject(err);
      });

      readStream.pipe(writeStream);
    });
  });
}

// Provala da li PM2 proces postoji
async function checkPM2Process(conn, appName) {
  try {
    const result = await executeSSHCommand(conn, `pm2 list | grep ${appName}`);
    return result.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// Kreiranje direktorijuma na serveru
async function ensureDirectories(conn) {
  log('🗂️  Kreiranje direktorijuma na serveru...', 'blue');
  
  const dirs = [
    CONFIG.server.deployPath,
    CONFIG.server.webPath,
    CONFIG.server.serverPath
  ];

  for (const dir of dirs) {
    await executeSSHCommand(conn, `mkdir -p ${dir}`);
  }
}

// Kreiranje zip arhive
function createZipArchive(sourceDir, outputPath, excludePatterns = []) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      log(`📦 Kreirana arhiva: ${Math.round(archive.pointer() / 1024)}KB`, 'green');
      resolve();
    });

    archive.on('error', reject);
    archive.pipe(output);

    // Rekurzivno dodaj fajlove iz direktorijuma
    const addFiles = (dir, baseDir = '') => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(baseDir, item).replace(/\\/g, '/');
        
        // Provjeri da li je fajl/folder isključen
        const isExcluded = excludePatterns.some(pattern => {
          return relativePath.includes(pattern) || item === pattern;
        });

        if (isExcluded) continue;

        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          addFiles(fullPath, relativePath);
        } else {
          archive.file(fullPath, { name: relativePath });
        }
      }
    };

    addFiles(sourceDir);
    archive.finalize();
  });
}

// Upload fajlova preko SSH
async function uploadDirectory(localPath, remotePath, excludePatterns = []) {
  log(`📤 Upload ${localPath} -> ${remotePath}...`, 'blue');
  
  const isWindows = process.platform === 'win32';
  const tempZip = path.join(__dirname, 'temp-deploy.zip');
  
  try {
    // Kreiraj zip arhivu
    await createZipArchive(localPath, tempZip, excludePatterns);
    
    // Upload zip fajl preko SSH2
    const uploadConn = await createSSHConnection();
    
    try {
      await uploadFileSSH(uploadConn, tempZip, `${remotePath}.zip`);
    } finally {
      uploadConn.end();
    }
    
    // SSH konekcija za raspakivanje
    const conn = await createSSHConnection();
    
    try {
      // Obriši postojeći sadržaj ALI SAČUVAJ uploads folder
      await executeSSHCommand(conn, `
        # Sačuvaj uploads folder ako postoji
        if [ -d "${remotePath}/uploads" ]; then
          mv ${remotePath}/uploads /tmp/backup_uploads_$$ || true
        fi
        
        # Obriši sve osim uploads foldera
        find ${remotePath}/* -maxdepth 0 -name uploads -prune -o -exec rm -rf {} \\; 2>/dev/null || true
        
        # Raspakuj novi sadržaj
        cd ${remotePath} && unzip -o ${remotePath}.zip && rm ${remotePath}.zip
        
        # Vrati uploads folder ako je bio sačuvan
        if [ -d "/tmp/backup_uploads_$$" ]; then
          rm -rf ${remotePath}/uploads 2>/dev/null || true
          mv /tmp/backup_uploads_$$ ${remotePath}/uploads
        fi
      `);
      
      log('✅ Upload završen uspešno!', 'green');
    } finally {
      conn.end();
    }
    
  } finally {
    // Obriši temp zip fajl
    if (fs.existsSync(tempZip)) {
      fs.unlinkSync(tempZip);
    }
  }
}

// Build web aplikacije
async function buildWeb() {
  log('🔨 Building web aplikacija...', 'blue');
  
  process.chdir('web');
  
  // Obriši postojeći build cache
  if (fs.existsSync('.next')) {
    log('🧹 Brisanje postojećeg build cache-a...', 'yellow');
    try {
      // Koristi Node.js fs umesto PowerShell komande
      fs.rmSync('.next', { recursive: true, force: true });
      log('✅ Cache obrisan uspešno', 'green');
    } catch (error) {
      log(`⚠️ Greška pri brisanju cache-a: ${error.message}`, 'yellow');
    }
  }
  
  // Provjeri da li node_modules postoji, ako ne instaliraj dependencies
  if (!fs.existsSync('node_modules')) {
    log('📦 Instaliranje dependencies...', 'yellow');
    execCommand('npm install');
  }
  
  // Postavi NODE_ENV na production za build
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  log('🔧 NODE_ENV postavljen na production za build', 'yellow');
  
  try {
    execCommand('npm run build');
  } finally {
    // Vrati originalni NODE_ENV
    if (originalNodeEnv) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
    process.chdir('..');
  }
}

// Deploy web aplikacije
async function deployWeb() {
  log('🌐 Deploying web aplikacija...', 'yellow');
  
  await buildWeb();
  
  // Upload web build
  await uploadDirectory(
    './web',
    CONFIG.server.webPath,
    ['node_modules', '.next/cache', '.git', 'tests']
  );

  // SSH konekcija za restart
  const conn = await createSSHConnection();
  
  try {
    await ensureDirectories(conn);
    
    // Install dependencies
    await executeSSHCommand(conn, `cd ${CONFIG.server.webPath} && npm install --production`);
    
    // Provjeri da li PM2 proces postoji
    const webExists = await checkPM2Process(conn, CONFIG.pm2.webApp);
    
    if (webExists) {
      log('🔄 Restartovanje web aplikacije...', 'yellow');
      await executeSSHCommand(conn, `pm2 restart ${CONFIG.pm2.webApp}`);
    } else {
      log('🚀 Pokretanje web aplikacije...', 'yellow');
      await executeSSHCommand(conn, 
        `cd ${CONFIG.server.webPath} && pm2 start npm --name "${CONFIG.pm2.webApp}" -- start`
      );
    }
    
    log('✅ Web aplikacija uspešno deployovana!', 'green');
    
  } finally {
    conn.end();
  }
}

// Deploy server aplikacije
async function deployServer() {
  log('🖥️  Deploying server aplikacija...', 'yellow');
  
  // Upload server files
  await uploadDirectory(
    './server',
    CONFIG.server.serverPath,
    ['node_modules', '.git', 'logs', '*.log', 'uploads', 'public/uploads']
  );

  // SSH konekcija za restart
  const conn = await createSSHConnection();
  
  try {
    await ensureDirectories(conn);
    
    // Kopiraj .env.production kao .env za production konfiguraciju
    log('🔧 Postavljanje production environment...', 'yellow');
    await executeSSHCommand(conn, `cd ${CONFIG.server.serverPath} && cp .env.production .env`);
    
    // Install dependencies
    await executeSSHCommand(conn, `cd ${CONFIG.server.serverPath} && npm install --production`);
    
    // Provjeri da li PM2 proces postoji
    const serverExists = await checkPM2Process(conn, CONFIG.pm2.serverApp);
    
    if (serverExists) {
      log('🔄 Zaustavljanje postojeće server aplikacije...', 'yellow');
      await executeSSHCommand(conn, `pm2 delete ${CONFIG.pm2.serverApp}`);
    }
    
    log('🚀 Pokretanje server aplikacije sa production konfigurацијом...', 'yellow');
    await executeSSHCommand(conn, 
      `cd ${CONFIG.server.serverPath} && NODE_ENV=production pm2 start index.js --name "${CONFIG.pm2.serverApp}"`
    );
    
    log('✅ Server aplikacija uspešno deployovana!', 'green');
    
  } finally {
    conn.end();
  }
}

// Deploy sve
async function deployAll() {
  log('🚀 Pokretanje kompletnog deployment-a...', 'bright');
  
  const startTime = Date.now();
  
  try {
    await deployServer();
    await deployWeb();
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    log(`\n🎉 Deployment uspešno završen za ${duration}s!`, 'green');
    log(`🌐 Web: https://${CONFIG.server.domain}`, 'cyan');
    log(`🔗 API: https://${CONFIG.server.domain}/api`, 'cyan');
    
  } catch (error) {
    log(`\n❌ Deployment neuspešan: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Health check
async function healthCheck() {
  log('🔍 Provera zdravlja aplikacije...', 'blue');
  
  const conn = await createSSHConnection();
  
  try {
    // Provjeri PM2 status
    const pm2Status = await executeSSHCommand(conn, 'pm2 list');
    log('PM2 Status:', 'yellow');
    console.log(pm2Status);
    
    // Provjeri da li su aplikacije pokrenute
    const webRunning = await checkPM2Process(conn, CONFIG.pm2.webApp);
    const serverRunning = await checkPM2Process(conn, CONFIG.pm2.serverApp);
    
    log(`Web aplikacija: ${webRunning ? '✅ Pokrenuta' : '❌ Zaustavljena'}`, webRunning ? 'green' : 'red');
    log(`Server aplikacija: ${serverRunning ? '✅ Pokrenuta' : '❌ Zaustavljena'}`, serverRunning ? 'green' : 'red');
    
  } finally {
    conn.end();
  }
}

// Validacija konfiguracije
function validateConfig() {
  const required = [
    'DEPLOY_HOST',
    'DEPLOY_USER',
    'DEPLOY_PORT'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    log(`❌ Nedostaju environment varijable: ${missing.join(', ')}`, 'red');
    log('Provjeri .env fajl!', 'yellow');
    process.exit(1);
  }
  
  log('✅ Konfiguracija validna', 'green');
}

// Help
function showHelp() {
  log('\n🚀 DERS.BA Deployment Tool\n', 'bright');
  log('Dostupne komande:', 'yellow');
  log('  deploy         - Deploy i web i server', 'cyan');
  log('  web            - Deploy samo web aplikaciju', 'cyan');
  log('  server         - Deploy samo server aplikaciju', 'cyan');
  log('  health         - Provjeri status aplikacija', 'cyan');
  log('  help           - Prikaži ovu pomoć', 'cyan');
  log('\nPrimjeri:', 'yellow');
  log('  npm run deploy', 'green');
  log('  npm run deploy:web', 'green');
  log('  npm run deploy:server', 'green');
  log('  npm run health', 'green');
}

// Main
async function main() {
  const command = process.argv[2] || 'help';
  
  try {
    switch (command) {
      case 'deploy':
        validateConfig();
        await deployAll();
        break;
      case 'web':
        validateConfig();
        await deployWeb();
        break;
      case 'server':
        validateConfig();
        await deployServer();
        break;
      case 'health':
        validateConfig();
        await healthCheck();
        break;
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    log(`\n❌ Greška: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  deployWeb,
  deployServer,
  deployAll,
  healthCheck
}; 
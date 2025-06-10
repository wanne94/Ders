#!/usr/bin/env node

const { execSync } = require('child_process');
const { CONFIG } = require('./deploy-config');
const path = require('path');
const fs = require('fs');

async function backup() {
  const date = new Date().toISOString().split('T')[0];
  const backupDir = path.join(__dirname, '../backups', date);
  
  console.log('📦 Starting DERS.BA backup...\n');
  
  try {
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 1. Backup MongoDB
    console.log('💾 Backing up database...');
    const dbBackupCmd = `ssh -p ${CONFIG.server.port} ${CONFIG.server.username}@${CONFIG.server.host} \
      "mongodump --uri='${CONFIG.mongodb.uri}' --archive" > ${path.join(backupDir, 'mongodb-backup.archive')}`;
    execSync(dbBackupCmd);
    console.log('✅ Database backup completed\n');

    // 2. Backup Uploads
    console.log('🖼️ Backing up uploads...');
    const uploadsBackupCmd = `rsync -avz -e "ssh -p ${CONFIG.server.port}" \
      ${CONFIG.server.username}@${CONFIG.server.host}:${CONFIG.server.serverPath}/uploads/ \
      ${path.join(backupDir, 'uploads')}`;
    execSync(uploadsBackupCmd, { stdio: 'inherit' });
    console.log('✅ Uploads backup completed\n');

    // 3. Backup ENV files
    console.log('🔐 Backing up configuration...');
    const envBackupCmd = `rsync -avz -e "ssh -p ${CONFIG.server.port}" \
      ${CONFIG.server.username}@${CONFIG.server.host}:${CONFIG.server.serverPath}/.env \
      ${path.join(backupDir, '.env.backup')}`;
    execSync(envBackupCmd);
    console.log('✅ Configuration backup completed\n');

    // 4. Create backup info file
    const infoContent = `Backup Date: ${new Date().toISOString()}
Server: ${CONFIG.server.domain}
Contents:
- MongoDB backup
- Uploads directory
- Environment configuration`;
    
    fs.writeFileSync(path.join(backupDir, 'backup-info.txt'), infoContent);

    // 5. Compress backup
    console.log('🗜️ Compressing backup...');
    const compressCmd = `tar -czf ${backupDir}.tar.gz -C ${backupDir} .`;
    execSync(compressCmd);
    console.log('✅ Backup compressed\n');

    // 6. Cleanup uncompressed files
    fs.rmSync(backupDir, { recursive: true });

    console.log('🎉 Backup completed successfully!');
    console.log(`📁 Backup location: ${backupDir}.tar.gz\n`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

backup(); 
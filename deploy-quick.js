#!/usr/bin/env node

// 🚀 QUICK DEPLOYMENT SCRIPT
// Koristi ovu skriptu za brže deployment bez full rebuild-a

const { execSync } = require('child_process');
const { CONFIG } = require('./deploy.js');

console.log('⚡ DERS.BA Quick Deployment\n');

async function quickDeploy() {
  try {
    const { host, username, port, deployPath } = CONFIG.server;
    
    console.log('📤 Quick sync to server...');
    
    // Sync only changed files (excluding node_modules and build artifacts)
    const rsyncCmd = `rsync -avz --delete --exclude='node_modules' --exclude='.next' --exclude='dist' --exclude='logs' -e "ssh -p ${port}" ./ ${username}@${host}:${deployPath}/`;
    
    execSync(rsyncCmd, { stdio: 'inherit' });
    
    console.log('🔄 Restarting services...');
    
    // Restart services on server
    const restartCmd = `ssh -p ${port} ${username}@${host} "cd ${deployPath} && ./stop.sh && ./start.sh"`;
    execSync(restartCmd, { stdio: 'inherit' });
    
    console.log('✅ Quick deployment completed!\n');
    console.log(`🌐 Check: http://${CONFIG.server.domain}`);
    
  } catch (error) {
    console.error('❌ Quick deployment failed:', error.message);
    process.exit(1);
  }
}

quickDeploy(); 
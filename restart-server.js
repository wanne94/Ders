#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Restarting DERS server...');

// Kill existing server process
exec('pkill -f "node.*server.*index.js" || true', (error, stdout, stderr) => {
  if (error && !error.message.includes('No matching processes')) {
    console.log('⚠️  Error killing existing processes:', error.message);
  }
  
  console.log('✅ Killed existing server processes');
  
  // Wait a moment then start new server
  setTimeout(() => {
    console.log('🚀 Starting new server...');
    
    const serverProcess = exec('cd server && node index.js', { 
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    serverProcess.stdout.on('data', (data) => {
      console.log(data);
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(data);
    });
    
    console.log('🎯 Server restart initiated. Check logs above.');
    console.log('🌐 Access: https://ders.ba');
    
  }, 2000);
}); 
#!/usr/bin/env node

const axios = require('axios');
const { execSync } = require('child_process');
const { CONFIG } = require('./deploy-config');

async function checkHealth() {
  console.log('🔍 Checking DERS.BA deployment health...\n');
  
  try {
    // 1. Check API Health with retry logic
    console.log('Testing API health...');
    let apiHealthSuccess = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!apiHealthSuccess && attempts < maxAttempts) {
      try {
        const apiHealth = await axios.get(`https://${CONFIG.server.domain}/api/health`, { 
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          maxRedirects: 5,
          validateStatus: status => status < 400
        });
        console.log('✅ API is healthy\n');
        apiHealthSuccess = true;
      } catch (err) {
        attempts++;
        if (attempts === maxAttempts) {
          throw err;
        }
        console.log(`Retry attempt ${attempts}/${maxAttempts}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // 2. Check Web App
    console.log('Testing web app...');
    const webHealth = await axios.get(`https://${CONFIG.server.domain}`, { 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      maxRedirects: 5,
      validateStatus: status => status < 400
    });
    console.log('✅ Web app is responding\n');

    // 3. Check Server Status
    console.log('Checking server status...');
    const commands = [
      'echo "📊 Memory Usage:"',
      'free -h',
      'echo "\n💾 Disk Usage:"',
      'df -h',
      'echo "\n🔄 PM2 Status:"',
      'pm2 list',
      'echo "\n🌡️ System Load:"',
      'uptime'
    ].join(' && ');
    
    const serverCmd = `ssh -i "${CONFIG.server.sshKeyPath}" -p ${CONFIG.server.port} ${CONFIG.server.username}@${CONFIG.server.host} "${commands}"`;
    
    execSync(serverCmd, { stdio: 'inherit' });
    console.log('\n✅ Server status checked\n');

    console.log('🎉 All systems are operational!\n');
    
  } catch (error) {
    console.error('\n❌ Health check failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

checkHealth(); 
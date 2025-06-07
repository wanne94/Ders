#!/usr/bin/env node

// 🧪 TEST DEPLOYMENT CONFIGURATION
// Provjeri da li je sve spremno za deployment

const { execSync } = require('child_process');
const fs = require('fs');
const { CONFIG } = require('./deploy.js');

console.log('🧪 Testing DERS.BA Deployment Configuration\n');

async function testDeployment() {
  let allTestsPassed = true;

  // Test 1: Check local files
  console.log('📁 Testing local files...');
  const requiredFiles = [
    'web/package.json',
    'server/index.js',
    'shared/package.json'
  ];

  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} - MISSING`);
      allTestsPassed = false;
    }
  }

  // Test 2: Check SSH connection
  console.log('\n🔐 Testing SSH connection...');
  try {
    const { host, username, port } = CONFIG.server;
    execSync(`ssh -p ${port} -o ConnectTimeout=10 -o BatchMode=yes ${username}@${host} "echo 'SSH connection successful'"`, { stdio: 'pipe' });
    console.log('   ✅ SSH connection successful');
  } catch (error) {
    console.log('   ❌ SSH connection failed');
    console.log('   💡 Make sure you can connect: ssh username@your-server-ip');
    allTestsPassed = false;
  }

  // Test 3: Check server directory
  console.log('\n📂 Testing server directory...');
  try {
    const { host, username, port, deployPath } = CONFIG.server;
    execSync(`ssh -p ${port} ${username}@${host} "mkdir -p ${deployPath} && echo 'Directory accessible'"`, { stdio: 'pipe' });
    console.log('   ✅ Server directory accessible');
  } catch (error) {
    console.log('   ❌ Cannot access server directory');
    allTestsPassed = false;
  }

  // Test 4: Check required tools
  console.log('\n🛠️ Testing required tools...');
  const tools = ['rsync', 'ssh'];
  
  for (const tool of tools) {
    try {
      execSync(`which ${tool}`, { stdio: 'pipe' });
      console.log(`   ✅ ${tool} available`);
    } catch (error) {
      console.log(`   ❌ ${tool} not found`);
      allTestsPassed = false;
    }
  }

  // Test 5: Check server tools
  console.log('\n🔧 Testing server tools...');
  try {
    const { host, username, port } = CONFIG.server;
    const result = execSync(`ssh -p ${port} ${username}@${host} "node --version && npm --version"`, { encoding: 'utf8' });
    console.log('   ✅ Node.js and npm available on server');
    console.log(`   📊 Server versions:\n${result.trim().split('\n').map(line => `      ${line}`).join('\n')}`);
  } catch (error) {
    console.log('   ❌ Node.js or npm not available on server');
    console.log('   💡 Install Node.js on server: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs');
    allTestsPassed = false;
  }

  // Test 6: Check configuration
  console.log('\n⚙️ Testing configuration...');
  if (CONFIG.server.host === 'your-vps-ip-address') {
    console.log('   ❌ Server configuration not set');
    console.log('   💡 Edit CONFIG in deploy.js file');
    allTestsPassed = false;
  } else {
    console.log('   ✅ Server configuration set');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Ready for deployment.');
    console.log('\n🚀 Run deployment with:');
    console.log('   npm run deploy');
  } else {
    console.log('❌ SOME TESTS FAILED! Fix issues before deployment.');
    console.log('\n📖 Check DEPLOYMENT.md for setup instructions.');
  }
  console.log('='.repeat(50));

  return allTestsPassed;
}

testDeployment().catch(error => {
  console.error('💥 Test failed:', error.message);
  process.exit(1);
}); 
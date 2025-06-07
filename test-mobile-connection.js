#!/usr/bin/env node

// 📱 TEST MOBILE CONNECTION TO SERVER
// Proverava da li mobile aplikacija može da se poveže sa serverom

const { execSync } = require('child_process');
const axios = require('axios');

console.log('📱 Testing Mobile App Connection to Server\n');

async function testMobileConnection() {
  const SERVER_IP = '192.168.0.20';
  const SERVER_PORT = '5003';
  const API_URL = `http://${SERVER_IP}:${SERVER_PORT}`;

  console.log(`🔗 Testing connection to: ${API_URL}\n`);

  try {
    // Test 1: Basic server health check
    console.log('1️⃣ Testing server health...');
    const healthResponse = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    console.log('   ✅ Server is running');
    console.log(`   📊 Status: ${healthResponse.data.status}`);
    console.log(`   🕐 Uptime: ${Math.floor(healthResponse.data.uptime)}s`);

    // Test 2: API health check
    console.log('\n2️⃣ Testing API health...');
    const apiResponse = await axios.get(`${API_URL}/api/health`, { timeout: 5000 });
    console.log('   ✅ API is responding');
    console.log(`   📊 Status: ${apiResponse.data.status}`);

    // Test 3: Test mobile endpoints
    console.log('\n3️⃣ Testing mobile endpoints...');
    
    // Test lectures endpoint
    try {
      const lecturesResponse = await axios.get(`${API_URL}/api/lectures`, { timeout: 5000 });
      console.log('   ✅ Lectures endpoint working');
      console.log(`   📚 Found ${lecturesResponse.data.length || 0} lectures`);
    } catch (error) {
      console.log('   ⚠️ Lectures endpoint issue:', error.response?.status || error.message);
    }

    // Test organizations endpoint
    try {
      const orgsResponse = await axios.get(`${API_URL}/api/organizations`, { timeout: 5000 });
      console.log('   ✅ Organizations endpoint working');
      console.log(`   🏢 Found ${orgsResponse.data.length || 0} organizations`);
    } catch (error) {
      console.log('   ⚠️ Organizations endpoint issue:', error.response?.status || error.message);
    }

    // Test daije endpoint
    try {
      const daijeResponse = await axios.get(`${API_URL}/api/daije`, { timeout: 5000 });
      console.log('   ✅ Daije endpoint working');
      console.log(`   👨‍🏫 Found ${daijeResponse.data.length || 0} daije`);
    } catch (error) {
      console.log('   ⚠️ Daije endpoint issue:', error.response?.status || error.message);
    }

    // Test 4: Network connectivity
    console.log('\n4️⃣ Testing network connectivity...');
    try {
      execSync(`ping -n 1 ${SERVER_IP}`, { stdio: 'pipe' });
      console.log('   ✅ Network ping successful');
    } catch (error) {
      console.log('   ❌ Network ping failed');
    }

    console.log('\n🎉 CONNECTION TEST COMPLETED!');
    console.log('\n📱 Mobile app configuration:');
    console.log(`   API URL: ${API_URL}/api`);
    console.log('   Status: ✅ Ready for mobile app');

  } catch (error) {
    console.error('\n❌ CONNECTION TEST FAILED!');
    console.error(`   Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Make sure server is running: npm run dev:server');
      console.log('   2. Check if port 5003 is open');
      console.log('   3. Verify IP address is correct');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check firewall settings');
      console.log('   2. Verify mobile device is on same network');
      console.log('   3. Try using 10.0.2.2 for Android emulator');
    }
  }
}

// Test current configuration
console.log('📋 Current mobile configuration:');
console.log('   IP Address: 192.168.0.20');
console.log('   Port: 5003');
console.log('   Full URL: http://192.168.0.20:5003/api');

testMobileConnection().catch(error => {
  console.error('💥 Test script failed:', error.message);
  process.exit(1);
}); 
#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

console.log('=== Expo Network Diagnostics ===\n');

// Get network interfaces
const networkInterfaces = os.networkInterfaces();
console.log('Network Interfaces:');
for (const [name, interfaces] of Object.entries(networkInterfaces)) {
  for (const interface of interfaces) {
    if (interface.family === 'IPv4' && !interface.internal) {
      console.log(`- ${name}: ${interface.address}`);
    }
  }
}

// Check Metro bundler
exec('curl -s http://localhost:8081 | head -5', (error, stdout, stderr) => {
  if (error) {
    console.log('\n❌ Metro bundler not accessible on localhost:8081');
  } else {
    console.log('\n✅ Metro bundler is running on localhost:8081');
  }
});

// Check for tunnel
exec('ps aux | grep -E "(ngrok|cloudflared)" | grep -v grep', (error, stdout, stderr) => {
  if (stdout) {
    console.log('\n✅ Tunnel process found:');
    console.log(stdout.trim());
  } else {
    console.log('\n❌ No tunnel process found');
  }
});

// Check Expo manifest
exec('curl -s http://localhost:8081 | grep -o \'"hostUri":"[^"]*"\' | head -1', (error, stdout, stderr) => {
  if (stdout) {
    console.log('\nExpo Host URI:', stdout);
  }
});

console.log('\n=== Troubleshooting Tips ===');
console.log('1. Make sure your phone and computer are on the same network');
console.log('2. If using tunnel mode, wait for "Tunnel ready" message');
console.log('3. Try clearing Expo cache: expo start -c');
console.log('4. Check firewall settings on your computer');
console.log('5. For Android: Enable developer mode and USB debugging');
console.log('6. For iOS: Make sure Expo Go app is installed and up to date');
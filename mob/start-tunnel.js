#!/usr/bin/env node

// Script za pokretanje Expo servera sa tunnel mode za WSL2
console.log('🚀 Pokretanje Expo servera sa tunnel mode za WSL2...');

const { spawn } = require('child_process');

// Prvo zaustavi postojeće Expo servere
console.log('🛑 Zaustavljanje postojećih servera...');
spawn('pkill', ['-f', 'expo'], { stdio: 'inherit' });

setTimeout(() => {
  console.log('🌐 Pokretanje Expo sa tunnel mode...');
  
  const expo = spawn('npx', ['expo', 'start', '--tunnel', '--clear'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0'
    }
  });

  expo.on('error', (err) => {
    console.error('❌ Greška pri pokretanju:', err);
  });

  expo.on('exit', (code) => {
    console.log(`🏁 Expo server završen sa kodom: ${code}`);
  });
}, 2000);
// Helper script za testiranje konekcije na Windows MongoDB iz WSL2
const { exec } = require('child_process');

const testConnections = [
  'mongodb://127.0.0.1:27017/Predavanja',
  'mongodb://localhost:27017/Predavanja',
  'mongodb://172.31.112.1:27017/Predavanja',
  'mongodb://host.docker.internal:27017/Predavanja'
];

async function testConnection(uri) {
  return new Promise((resolve) => {
    const mongoose = require('mongoose');
    mongoose.connect(uri, { 
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000 
    })
    .then(() => {
      console.log(`✅ Uspješna konekcija: ${uri}`);
      mongoose.disconnect();
      resolve(true);
    })
    .catch(() => {
      console.log(`❌ Neuspješna konekcija: ${uri}`);
      resolve(false);
    });
  });
}

async function findWorkingConnection() {
  console.log('🔍 Testiram MongoDB konekcije...\n');
  
  for (const uri of testConnections) {
    const success = await testConnection(uri);
    if (success) {
      console.log(`\n🎯 Koristi ovu konekciju u .env.local:\nMONGODB_URI=${uri}`);
      return;
    }
  }
  
  console.log('\n❌ Nijedna konekcija nije uspješna. Provjeri da li MongoDB radi na Windows-u.');
  console.log('\nKoraci za rješavanje:');
  console.log('1. net start MongoDB');
  console.log('2. Konfiguriši bindIp: 0.0.0.0 u mongod.cfg');
  console.log('3. Restartuj MongoDB service');
}

findWorkingConnection();
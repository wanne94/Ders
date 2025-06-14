// Test MongoDB konekcije iz WSL2
const net = require('net');

const testConnections = [
  { host: '127.0.0.1', port: 27017, name: 'WSL2 localhost' },
  { host: '172.31.112.1', port: 27017, name: 'Windows host IP' },
  { host: 'localhost', port: 27017, name: 'localhost alias' }
];

function testConnection(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 3000;
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function findWorkingConnection() {
  console.log('🔍 Testiram MongoDB konekcije...\n');
  
  for (const { host, port, name } of testConnections) {
    process.stdout.write(`Testiram ${name} (${host}:${port})... `);
    const success = await testConnection(host, port);
    
    if (success) {
      console.log('✅ USPJEŠNO');
      console.log(`\n🎯 Koristi ovu konekciju:\nMONGODB_URI=mongodb://${host}:${port}/Predavanja`);
      return { host, port };
    } else {
      console.log('❌ NEUSPJEŠNO');
    }
  }
  
  console.log('\n❌ Nijedna konekcija nije uspješna.');
  console.log('\nRiješenja:');
  console.log('1. Pokreni scripts/setup-local-mongodb.bat kao Administrator');
  console.log('2. Ili instaliraj MongoDB u WSL2');
  console.log('3. Ili nastavi koristiti produkcijsku bazu');
  
  return null;
}

findWorkingConnection();
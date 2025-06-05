#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function quickTest() {
  console.log('⚡ QUICK TEST - Brzo testiranje sa test podacima');
  console.log('='.repeat(50));
  
  try {
    // Add test data
    console.log('🔧 Dodajem test podatke...');
    const { stdout } = await execPromise('node manage-test-data.js populate');
    
    // Extract summary from output
    const lines = stdout.split('\n');
    const summaryStart = lines.findIndex(line => line.includes('SUMMARY:'));
    if (summaryStart !== -1) {
      console.log('✅ Test podaci dodani:');
      for (let i = summaryStart + 2; i < summaryStart + 6; i++) {
        if (lines[i] && lines[i].trim()) {
          console.log(`   ${lines[i].trim()}`);
        }
      }
    }
    
    console.log('\n🚀 Baza je spremna za testiranje!');
    console.log('📊 Možete testirati aplikaciju sa 90 test zapisa');
    console.log('');
    console.log('💡 Za brisanje test podataka koristite:');
    console.log('   node manage-test-data.js delete');
    console.log('');
    console.log('📈 Za pregled statistika koristite:');
    console.log('   node manage-test-data.js stats');
    
  } catch (error) {
    console.error('❌ Greška:', error.message);
  }
}

// Check if this script is run directly
if (require.main === module) {
  quickTest();
}

module.exports = { quickTest }; 
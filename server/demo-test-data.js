const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runCommand(command, description) {
  console.log(`\n🔧 ${description}`);
  console.log(`📝 Running: ${command}`);
  console.log('='.repeat(60));
  
  try {
    const { stdout, stderr } = await execPromise(command);
    console.log(stdout);
    if (stderr) {
      console.error('Stderr:', stderr);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Wait a bit between commands
  await new Promise(resolve => setTimeout(resolve, 1000));
}

async function demo() {
  console.log('🎬 DEMO: Test Data Management Script');
  console.log('='.repeat(60));
  console.log('Ova demo skripta će pokazati sve funkcionalnosti manage-test-data.js skripte');
  
  // Step 1: Show current stats
  await runCommand(
    'node manage-test-data.js stats',
    'Korak 1: Provjera trenutnog stanja baze podataka'
  );
  
  // Step 2: Populate test data
  await runCommand(
    'node manage-test-data.js populate',
    'Korak 2: Dodavanje test podataka (30 organizacija, 30 daija, 30 predavanja)'
  );
  
  // Step 3: Show stats after population
  await runCommand(
    'node manage-test-data.js stats',
    'Korak 3: Provjera stanja nakon dodavanja test podataka'
  );
  
  // Step 4: Delete test data
  await runCommand(
    'node manage-test-data.js delete',
    'Korak 4: Brisanje svih test podataka'
  );
  
  // Step 5: Final stats check
  await runCommand(
    'node manage-test-data.js stats',
    'Korak 5: Finalna provjera - baza treba biti prazna'
  );
  
  console.log('\n🎉 DEMO ZAVRŠEN!');
  console.log('='.repeat(60));
  console.log('✅ Uspješno demonstrirane sve funkcionalnosti:');
  console.log('   - Dodavanje test podataka (populate)');
  console.log('   - Pregled statistika (stats)');
  console.log('   - Brisanje test podataka (delete)');
  console.log('');
  console.log('💡 Možete koristiti ove komande pojedinačno:');
  console.log('   node manage-test-data.js populate');
  console.log('   node manage-test-data.js stats');
  console.log('   node manage-test-data.js delete');
}

// Run the demo
demo().catch(console.error); 
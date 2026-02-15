/**
 * Migration skripta: Simplifikacija Lecture kolekcije
 *
 * Ova skripta:
 * 1. Arhivira SVE postojece podatke u backup kolekciju (lectures_backup_TIMESTAMP)
 * 2. Provjerava da li svi dokumenti imaju `image` i `date` polja
 * 3. Uklanja SVA polja osim: _id, image, date, createdAt, updatedAt
 * 4. Prikazuje detaljan izvjestaj
 *
 * Pokretanje:
 *   node server/scripts/migrate-lectures-minimal.js
 *
 * VAZNO: Ovo je destruktivna operacija! Backup se kreira automatski.
 */

const mongoose = require('mongoose');
const path = require('path');

// Koristi .env.production ako je NODE_ENV=production, inace .env.development
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';
require('dotenv').config({ path: path.join(__dirname, '..', envFile) });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Predavanja';

async function migrate() {
  console.log('='.repeat(60));
  console.log('  LECTURE SIMPLIFIKACIJA - MIGRATION SKRIPTA');
  console.log('='.repeat(60));
  console.log(`\nMongoDB URI: ${MONGODB_URI}`);
  console.log(`Vrijeme: ${new Date().toISOString()}\n`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Povezan na MongoDB.\n');

    const db = mongoose.connection.db;
    const lecturesCollection = db.collection('lectures');

    // 1. Prebroj dokumente
    const totalDocs = await lecturesCollection.countDocuments();
    console.log(`Ukupno dokumenata u lectures kolekciji: ${totalDocs}`);

    if (totalDocs === 0) {
      console.log('\nNema dokumenata za migraciju. Izlazim.');
      await mongoose.disconnect();
      return;
    }

    // 2. Kreiraj backup kolekciju
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupCollectionName = `lectures_backup_${timestamp}`;
    console.log(`\nKreiram backup kolekciju: ${backupCollectionName}`);

    const allDocs = await lecturesCollection.find({}).toArray();
    const backupCollection = db.collection(backupCollectionName);
    await backupCollection.insertMany(allDocs);

    const backupCount = await backupCollection.countDocuments();
    console.log(`Backup kreiran: ${backupCount} dokumenata sacuvano.`);

    if (backupCount !== totalDocs) {
      console.error('\nGRESKA: Backup broj dokumenata se ne podudara! Prekidam migraciju.');
      await mongoose.disconnect();
      process.exit(1);
    }

    // 3. Provjeri koje dokumente imaju image i date
    const withImage = await lecturesCollection.countDocuments({ image: { $exists: true, $ne: null, $ne: '' } });
    const withDate = await lecturesCollection.countDocuments({ date: { $exists: true, $ne: null } });
    const withBoth = await lecturesCollection.countDocuments({
      image: { $exists: true, $ne: null, $ne: '' },
      date: { $exists: true, $ne: null }
    });
    const missingImage = totalDocs - withImage;
    const missingDate = totalDocs - withDate;

    console.log('\n--- ANALIZA POLJA ---');
    console.log(`Sa image poljem: ${withImage}/${totalDocs}`);
    console.log(`Sa date poljem: ${withDate}/${totalDocs}`);
    console.log(`Sa oba polja: ${withBoth}/${totalDocs}`);
    console.log(`Nedostaje image: ${missingImage}`);
    console.log(`Nedostaje date: ${missingDate}`);

    // 4. Prikazi sample podataka PRIJE migracije
    console.log('\n--- SAMPLE PRIJE MIGRACIJE (prvih 3) ---');
    const sampleBefore = await lecturesCollection.find({}).limit(3).toArray();
    sampleBefore.forEach((doc, i) => {
      console.log(`\n  [${i + 1}] ID: ${doc._id}`);
      console.log(`      Polja: ${Object.keys(doc).join(', ')}`);
      console.log(`      image: ${doc.image || '(prazno)'}`);
      console.log(`      date: ${doc.date || '(prazno)'}`);
      console.log(`      title: ${doc.title || '(prazno)'}`);
    });

    // 5. Izvrsi migraciju - za svaki dokument zadrzi samo _id, image, date, createdAt, updatedAt
    console.log('\n--- POKRETANJE MIGRACIJE ---');

    const fieldsToKeep = ['_id', 'image', 'date', 'createdAt', 'updatedAt'];

    // Preuzmi sva polja iz prvog dokumenta da znamo sta brisemo
    const sampleDoc = allDocs[0];
    const allFields = Object.keys(sampleDoc);
    const fieldsToRemove = allFields.filter(f => !fieldsToKeep.includes(f));

    console.log(`Polja za uklanjanje: ${fieldsToRemove.join(', ')}`);

    // Kreiraj $unset objekat
    const unsetObj = {};
    fieldsToRemove.forEach(field => {
      unsetObj[field] = '';
    });

    // Izvrsi bulk unset na svim dokumentima
    const updateResult = await lecturesCollection.updateMany(
      {},
      { $unset: unsetObj }
    );

    console.log(`\nAzurirano dokumenata: ${updateResult.modifiedCount}`);

    // 6. Prikazi sample podataka POSLIJE migracije
    console.log('\n--- SAMPLE POSLIJE MIGRACIJE (prvih 3) ---');
    const sampleAfter = await lecturesCollection.find({}).limit(3).toArray();
    sampleAfter.forEach((doc, i) => {
      console.log(`\n  [${i + 1}] ID: ${doc._id}`);
      console.log(`      Polja: ${Object.keys(doc).join(', ')}`);
      console.log(`      image: ${doc.image || '(prazno)'}`);
      console.log(`      date: ${doc.date || '(prazno)'}`);
    });

    // 7. Verifikacija
    const afterCount = await lecturesCollection.countDocuments();
    const verifyDoc = await lecturesCollection.findOne({});
    const verifyFields = Object.keys(verifyDoc);

    console.log('\n--- VERIFIKACIJA ---');
    console.log(`Broj dokumenata nakon migracije: ${afterCount} (originalno: ${totalDocs})`);
    console.log(`Polja u dokumentu: ${verifyFields.join(', ')}`);
    console.log(`Broj polja: ${verifyFields.length} (ocekivano: max 5)`);

    // 8. Konacni izvjestaj
    console.log('\n' + '='.repeat(60));
    console.log('  MIGRACIJA ZAVRSENA USPJESNO');
    console.log('='.repeat(60));
    console.log(`  Backup kolekcija: ${backupCollectionName}`);
    console.log(`  Migrirano dokumenata: ${updateResult.modifiedCount}`);
    console.log(`  Uklonjeno polja: ${fieldsToRemove.length}`);
    console.log(`  Zadrzano polja: ${fieldsToKeep.join(', ')}`);
    console.log('='.repeat(60));

    // Upozorenje za dokumente bez image
    if (missingImage > 0) {
      console.log(`\n  UPOZORENJE: ${missingImage} dokumenat(a) nema image polje!`);
      const docsWithoutImage = await lecturesCollection.find({
        $or: [
          { image: { $exists: false } },
          { image: null },
          { image: '' }
        ]
      }).toArray();
      docsWithoutImage.forEach(doc => {
        console.log(`    - ID: ${doc._id}, date: ${doc.date}`);
      });
    }

  } catch (error) {
    console.error('\nGRESKA TOKOM MIGRACIJE:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
}

migrate();

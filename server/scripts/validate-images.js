/**
 * Validation skripta: Provjera slika nakon migracije
 *
 * Provjerava:
 * 1. Da li svaki lecture ima `image` polje
 * 2. Da li slika postoji na disku
 * 3. Prikazuje report (validne vs. missing slike)
 *
 * Pokretanje:
 *   node server/scripts/validate-images.js
 *   NODE_ENV=production node server/scripts/validate-images.js
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';
require('dotenv').config({ path: path.join(__dirname, '..', envFile) });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Predavanja';

// Na produkciji slike su u /var/www/ders/server/uploads/images/
// Lokalno su u server/uploads/images/
const UPLOADS_BASE = process.env.NODE_ENV === 'production'
  ? '/var/www/ders/server'
  : path.join(__dirname, '..');

async function validate() {
  console.log('='.repeat(60));
  console.log('  IMAGE VALIDATION REPORT');
  console.log('='.repeat(60));
  console.log(`\nEnvironment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')}`);
  console.log(`Uploads base: ${UPLOADS_BASE}`);
  console.log(`Vrijeme: ${new Date().toISOString()}\n`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Povezan na MongoDB.\n');

    const db = mongoose.connection.db;
    const lecturesCollection = db.collection('lectures');

    const totalDocs = await lecturesCollection.countDocuments();
    console.log(`Ukupno lectures: ${totalDocs}`);

    const allLectures = await lecturesCollection.find({}).toArray();

    let withImage = 0;
    let withoutImage = 0;
    let imageExists = 0;
    let imageMissing = 0;
    const missingFiles = [];
    const missingImageField = [];

    for (const lecture of allLectures) {
      if (!lecture.image || lecture.image === '') {
        withoutImage++;
        missingImageField.push({ _id: lecture._id, date: lecture.date });
        continue;
      }

      withImage++;

      // Provjeri da li fajl postoji na disku
      // image polje je npr. /uploads/images/optimized-xxx.webp
      const filePath = path.join(UPLOADS_BASE, lecture.image);

      if (fs.existsSync(filePath)) {
        imageExists++;
      } else {
        imageMissing++;
        missingFiles.push({
          _id: lecture._id,
          image: lecture.image,
          date: lecture.date,
          expectedPath: filePath
        });
      }
    }

    // Report
    console.log('\n--- REZULTATI ---');
    console.log(`Sa image poljem:    ${withImage}/${totalDocs}`);
    console.log(`Bez image polja:    ${withoutImage}/${totalDocs}`);
    console.log(`Slika postoji:      ${imageExists}/${withImage}`);
    console.log(`Slika ne postoji:   ${imageMissing}/${withImage}`);

    if (missingImageField.length > 0) {
      console.log(`\n--- LECTURES BEZ IMAGE POLJA (${missingImageField.length}) ---`);
      missingImageField.forEach(doc => {
        console.log(`  ID: ${doc._id}, date: ${doc.date}`);
      });
    }

    if (missingFiles.length > 0) {
      console.log(`\n--- SLIKE KOJE NE POSTOJE NA DISKU (${missingFiles.length}) ---`);
      missingFiles.forEach(doc => {
        console.log(`  ID: ${doc._id}`);
        console.log(`    image: ${doc.image}`);
        console.log(`    expected: ${doc.expectedPath}`);
      });
    }

    // Status
    console.log('\n' + '='.repeat(60));
    if (withoutImage === 0 && imageMissing === 0) {
      console.log('  STATUS: SVE OK - Svi lectures imaju slike i sve slike postoje!');
    } else if (imageMissing > 0) {
      console.log(`  STATUS: UPOZORENJE - ${imageMissing} slika ne postoji na disku!`);
    } else if (withoutImage > 0) {
      console.log(`  STATUS: UPOZORENJE - ${withoutImage} lectures nema image polje!`);
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\nGRESKA:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
}

validate();

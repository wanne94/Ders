#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 DERS.BA - Dijagnostika slika\n');

// Test URLs
const testUrls = [
  'https://ders.ba/uploads/logo.jpg',
  'https://ders.ba/uploads/images/predavanjeslika.jpg',
  'https://ders.ba/uploads/images/default.jpg',
  'https://ders.ba/uploads/images/daijaslika.jpg',
  'https://ders.ba/uploads/images/udruzenjeslika.jpg',
  'https://ders.ba/_next/image?url=%2Fuploads%2Flogo.jpg&w=128&q=75',
  'https://ders.ba/api/upload-image/test'
];

console.log('📊 Testiranje pristupa slikama...\n');

testUrls.forEach(url => {
  try {
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}|%{size_download}|%{content_type}" "${url}"`, { encoding: 'utf-8' });
    const [status, size, contentType] = result.trim().split('|');
    
    const statusIcon = status === '200' ? '✅' : '❌';
    const sizeFormatted = size > 0 ? `${(size/1024).toFixed(1)}KB` : 'N/A';
    
    console.log(`${statusIcon} ${status} | ${sizeFormatted.padEnd(8)} | ${contentType.padEnd(25)} | ${url}`);
  } catch (error) {
    console.log(`❌ ERROR | N/A      | N/A                       | ${url}`);
  }
});

console.log('\n🔧 Provera lokalne strukture fajlova...\n');

// Check local files
const localPaths = [
  'server/uploads',
  'server/uploads/images',
  'web/public/uploads'
];

localPaths.forEach(localPath => {
  const fullPath = path.join(__dirname, localPath);
  if (fs.existsSync(fullPath)) {
    try {
      const files = fs.readdirSync(fullPath);
      console.log(`📁 ${localPath}/ (${files.length} fajlova)`);
      files.slice(0, 5).forEach(file => {
        const filePath = path.join(fullPath, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(1);
        console.log(`   📄 ${file} (${size}KB)`);
      });
      if (files.length > 5) {
        console.log(`   ... i još ${files.length - 5} fajlova`);
      }
    } catch (error) {
      console.log(`❌ Greška pri čitanju: ${error.message}`);
    }
  } else {
    console.log(`❌ ${localPath}/ - Ne postoji`);
  }
  console.log('');
});

console.log('🌐 Nginx konfiguracija test...\n');

// Test nginx behavior
try {
  const directResult = execSync(`curl -s -I "https://ders.ba/uploads/logo.jpg"`, { encoding: 'utf-8' });
  console.log('📄 Direct access headers:');
  directResult.split('\n').slice(0, 5).forEach(line => {
    if (line.trim()) console.log(`   ${line.trim()}`);
  });
} catch (error) {
  console.log('❌ Greška pri testiranju nginx-a');
}

console.log('\n📋 ZAKLJUČAK:\n');

console.log('1. Ako su svi testovi ✅ - slike rade ispravno');
console.log('2. Ako ima ❌ - proverite:');
console.log('   - Da li fajlovi postoje na serveru (/var/www/ders/server/uploads/)');
console.log('   - Prava pristupa (755 za direktorijume, 644 za fajlove)');
console.log('   - Nginx konfiguraciju za /uploads lokaciju');
console.log('3. Za nove upload-ove proverite da Express server čuva u pravu lokaciju');
console.log('\n🚀 Za detaljnu proveru na serveru pokrenite:');
console.log('   ssh root@194.163.176.171 "ls -la /var/www/ders/server/uploads/"');
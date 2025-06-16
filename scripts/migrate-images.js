#!/usr/bin/env node

/**
 * Image Migration Script
 * 
 * Migrates existing images from /uploads to new CDN structure
 * Copies default images to CDN defaults folder
 * Creates optimized versions of uploaded images
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Paths
const serverDir = path.join(__dirname, '../server');
const uploadsDir = path.join(serverDir, 'uploads');
const cdnDir = path.join(serverDir, 'cdn');

// Image size configurations
const imageSizes = {
  original: { width: 1920, quality: 80, suffix: 'original' },
  medium: { width: 800, quality: 75, suffix: 'medium' },
  thumb: { width: 200, quality: 70, suffix: 'thumb' }
};

// Default image mappings
const defaultImages = {
  'predavanjeslika.jpg': 'predavanjeslika.jpg',
  'daijaslika.jpg': 'daijaslika.jpg', 
  'udruzenjeslika.jpg': 'udruzenjeslika.jpg',
  'logo.jpg': 'logo.jpg',
  'favicon.png': 'favicon.png',
  'default.jpg': 'default.jpg'
};

/**
 * Create CDN directory structure
 */
function createCdnStructure() {
  console.log('📁 Creating CDN directory structure...');
  
  const dirs = [
    path.join(cdnDir, 'images'),
    path.join(cdnDir, 'images/uploads'),
    path.join(cdnDir, 'images/defaults'),
    path.join(cdnDir, 'images/thumbnails')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created: ${dir}`);
    } else {
      console.log(`📂 Exists: ${dir}`);
    }
  });
}

/**
 * Process image in multiple sizes
 */
async function processImageSizes(inputPath, outputBaseName, outputDir) {
  const results = {};
  
  for (const [sizeName, config] of Object.entries(imageSizes)) {
    try {
      const webpFileName = `${outputBaseName}-${config.suffix}.webp`;
      const jpegFileName = `${outputBaseName}-${config.suffix}.jpg`;
      
      const webpPath = path.join(outputDir, webpFileName);
      const jpegPath = path.join(outputDir, jpegFileName);
      
      // Generate WebP version
      await sharp(inputPath)
        .resize({
          width: config.width,
          withoutEnlargement: true
        })
        .webp({ 
          quality: config.quality,
          effort: 6
        })
        .toFile(webpPath);
      
      // Generate JPEG fallback
      await sharp(inputPath)
        .resize({
          width: config.width,
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: config.quality,
          progressive: true
        })
        .toFile(jpegPath);
      
      results[sizeName] = {
        webp: webpPath,
        jpeg: jpegPath,
        size: fs.statSync(webpPath).size
      };
      
      console.log(`  ✅ ${sizeName}: ${webpFileName}, ${jpegFileName}`);
      
    } catch (error) {
      console.error(`  ❌ Error processing ${sizeName}:`, error.message);
    }
  }
  
  return results;
}

/**
 * Migrate default images
 */
async function migrateDefaultImages() {
  console.log('\\n🖼️  Migrating default images...');
  
  const defaultsSource = path.join(uploadsDir, 'images');
  const defaultsTarget = path.join(cdnDir, 'images/defaults');
  
  if (!fs.existsSync(defaultsSource)) {
    console.log('⚠️  No default images found in uploads/images');
    return;
  }
  
  const files = fs.readdirSync(defaultsSource);
  
  for (const file of files) {
    if (defaultImages[file]) {
      const sourcePath = path.join(defaultsSource, file);
      const targetPath = path.join(defaultsTarget, defaultImages[file]);
      
      try {
        // Copy original file
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ Copied: ${file} -> defaults/${defaultImages[file]}`);
        
        // Create optimized versions for defaults too
        const baseName = path.parse(file).name;
        await processImageSizes(sourcePath, baseName, defaultsTarget);
        
      } catch (error) {
        console.error(`❌ Error copying ${file}:`, error.message);
      }
    }
  }
  
  // Also copy from uploads root if they exist there
  const rootFiles = fs.readdirSync(uploadsDir);
  for (const file of rootFiles) {
    if (defaultImages[file]) {
      const sourcePath = path.join(uploadsDir, file);
      const targetPath = path.join(defaultsTarget, defaultImages[file]);
      
      try {
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✅ Copied from root: ${file} -> defaults/${defaultImages[file]}`);
        }
      } catch (error) {
        console.error(`❌ Error copying from root ${file}:`, error.message);
      }
    }
  }
}

/**
 * Migrate uploaded images
 */
async function migrateUploadedImages() {
  console.log('\\n📤 Migrating uploaded images...');
  
  const uploadsImagesDir = path.join(uploadsDir, 'images');
  const cdnUploadsDir = path.join(cdnDir, 'images/uploads');
  
  if (!fs.existsSync(uploadsImagesDir)) {
    console.log('⚠️  No uploaded images found');
    return;
  }
  
  const files = fs.readdirSync(uploadsImagesDir);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) && !defaultImages[file];
  });
  
  console.log(`Found ${imageFiles.length} uploaded images to migrate`);
  
  for (const file of imageFiles) {
    const sourcePath = path.join(uploadsImagesDir, file);
    const baseName = path.parse(file).name;
    
    console.log(`\\n📷 Processing: ${file}`);
    
    try {
      // Copy original file to CDN
      const targetPath = path.join(cdnUploadsDir, file);
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Copied original: ${file}`);
      
      // Create optimized versions
      await processImageSizes(sourcePath, baseName, cdnUploadsDir);
      
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
}

/**
 * Generate migration summary
 */
function generateSummary() {
  console.log('\\n📊 Migration Summary:');
  
  const cdnUploadsDir = path.join(cdnDir, 'images/uploads');
  const cdnDefaultsDir = path.join(cdnDir, 'images/defaults');
  
  if (fs.existsSync(cdnUploadsDir)) {
    const uploadedFiles = fs.readdirSync(cdnUploadsDir);
    console.log(`📤 Uploaded images: ${uploadedFiles.length} files`);
  }
  
  if (fs.existsSync(cdnDefaultsDir)) {
    const defaultFiles = fs.readdirSync(cdnDefaultsDir);
    console.log(`🖼️  Default images: ${defaultFiles.length} files`);
  }
  
  // Calculate total size
  const calculateSize = (dir) => {
    if (!fs.existsSync(dir)) return 0;
    
    let totalSize = 0;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    });
    
    return totalSize;
  };
  
  const totalSize = calculateSize(cdnUploadsDir) + calculateSize(cdnDefaultsDir);
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
  
  console.log(`💾 Total CDN size: ${totalSizeMB} MB`);
  console.log('\\n✅ Migration completed!');
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting image migration to CDN...');
  console.log('===================================\\n');
  
  try {
    // Create CDN structure
    createCdnStructure();
    
    // Migrate default images
    await migrateDefaultImages();
    
    // Migrate uploaded images
    await migrateUploadedImages();
    
    // Generate summary
    generateSummary();
    
    console.log('\\n🎉 Image migration completed successfully!');
    console.log('\\nNext steps:');
    console.log('1. Update nginx configuration');
    console.log('2. Deploy new imageUtils functions');
    console.log('3. Test image loading');
    console.log('4. Remove old /uploads after verification');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate();
}

module.exports = { migrate };
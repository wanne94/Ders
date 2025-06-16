#!/usr/bin/env node

/**
 * Script to restore simple image structure
 * Replaces complex CDN files with simple uploads-based versions
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Restoring simple image structure...');

// 1. Replace server uploadImage.js
console.log('📁 Replacing server uploadImage.js...');
try {
  const simplePath = path.join(__dirname, 'server/routes/uploadImage-simple.js');
  const targetPath = path.join(__dirname, 'server/routes/uploadImage.js');
  
  if (fs.existsSync(simplePath)) {
    // Create backup
    if (fs.existsSync(targetPath)) {
      fs.copyFileSync(targetPath, `${targetPath}.backup`);
    }
    
    // Copy simple version
    fs.copyFileSync(simplePath, targetPath);
    console.log('✅ Server uploadImage.js replaced');
  } else {
    console.log('❌ Simple uploadImage.js not found');
  }
} catch (error) {
  console.error('❌ Error replacing server uploadImage.js:', error.message);
}

// 2. Replace web imageUtils.js
console.log('🌐 Replacing web imageUtils.js...');
try {
  const simplePath = path.join(__dirname, 'web/src/utils/imageUtils-simple.js');
  const targetPath = path.join(__dirname, 'web/src/utils/imageUtils.js');
  
  if (fs.existsSync(simplePath)) {
    // Create backup
    if (fs.existsSync(targetPath)) {
      fs.copyFileSync(targetPath, `${targetPath}.backup`);
    }
    
    // Copy simple version
    fs.copyFileSync(simplePath, targetPath);
    console.log('✅ Web imageUtils.js replaced');
  } else {
    console.log('❌ Simple web imageUtils.js not found');
  }
} catch (error) {
  console.error('❌ Error replacing web imageUtils.js:', error.message);
}

// 3. Replace mobile imageUtils.js
console.log('📱 Replacing mobile imageUtils.js...');
try {
  const simplePath = path.join(__dirname, 'mob/utils/imageUtils-simple.js');
  const targetPath = path.join(__dirname, 'mob/utils/imageUtils.js');
  
  if (fs.existsSync(simplePath)) {
    // Create backup
    if (fs.existsSync(targetPath)) {
      fs.copyFileSync(targetPath, `${targetPath}.backup`);
    }
    
    // Copy simple version
    fs.copyFileSync(simplePath, targetPath);
    console.log('✅ Mobile imageUtils.js replaced');
  } else {
    console.log('❌ Simple mobile imageUtils.js not found');
  }
} catch (error) {
  console.error('❌ Error replacing mobile imageUtils.js:', error.message);
}

// 4. Update server index.js
console.log('⚙️ Updating server index.js...');
try {
  const indexPath = path.join(__dirname, 'server/index.js');
  
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Create backup
    fs.writeFileSync(`${indexPath}.backup`, content);
    
    // Replace CDN serving with simple uploads serving
    const oldPattern = /\/\/ Serve uploads directory[\s\S]*?console\.log\('  - CDN images: \/cdn -> server\/cdn'\);/;
    const newContent = `// Serve uploads directory - unified path for both environments
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('📁 Serving uploads from server/uploads (unified for both development and production)');`;
    
    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, newContent);
      fs.writeFileSync(indexPath, content);
      console.log('✅ Server index.js updated');
    } else {
      console.log('⚠️ CDN pattern not found in server index.js - may already be simple');
    }
  } else {
    console.log('❌ Server index.js not found');
  }
} catch (error) {
  console.error('❌ Error updating server index.js:', error.message);
}

// 5. Remove uuid dependency if not used elsewhere
console.log('🧹 Checking uuid dependency...');
try {
  const packagePath = path.join(__dirname, 'server/package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (packageJson.dependencies && packageJson.dependencies.uuid) {
      console.log('📦 UUID dependency found - leaving it in case it\'s used elsewhere');
    }
  }
} catch (error) {
  console.error('❌ Error checking package.json:', error.message);
}

console.log('\n✅ Simple image structure restored!');
console.log('\n📋 Summary:');
console.log('- ✅ Server uploadImage.js: Simple uploads structure');
console.log('- ✅ Web imageUtils.js: Simple image URL handling');
console.log('- ✅ Mobile imageUtils.js: Simple mobile image handling');
console.log('- ✅ Server index.js: Simple static serving');
console.log('\n🚀 Next steps:');
console.log('1. Test image upload in web app');
console.log('2. Test image display in web app');
console.log('3. Test image upload in mobile app');
console.log('4. Test image display in mobile app');
console.log('5. Verify all default images load correctly');

console.log('\n🔄 To rollback if needed:');
console.log('- Restore from .backup files created during this process');
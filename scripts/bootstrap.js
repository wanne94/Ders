const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const projects = ['web'];

console.log('🚀 Setting up shared package in projects...');

// Ensure shared package is built first
try {
  console.log('🔨 Building shared package...');
  execSync('npm install', { cwd: path.join(rootDir, 'shared'), stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install shared package dependencies:', error);
  process.exit(1);
}

// Link shared package in each project
projects.forEach(project => {
  const projectDir = path.join(rootDir, project);
  
  if (!fs.existsSync(projectDir)) {
    console.log(`⚠️  Project ${project} not found, skipping...`);
    return;
  }

  console.log(`\n🔗 Setting up ${project}...`);
  
  try {
    // Add local dependency to shared package
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add shared as a dependency if not already present
    if (!packageJson.dependencies['shared']) {
      packageJson.dependencies = {
        ...packageJson.dependencies,
        shared: 'file:../shared'
      };
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`✅ Added shared package to ${project}`);
    } else {
      console.log(`ℹ️  Shared package already set up in ${project}`);
    }
    
    // Install dependencies
    console.log(`📦 Installing dependencies for ${project}...`);
    execSync('npm install', { cwd: projectDir, stdio: 'inherit' });
    
  } catch (error) {
    console.error(`❌ Error setting up ${project}:`, error);
  }
});

console.log('\n✨ Bootstrap completed! You can now import from "shared" in your projects.');

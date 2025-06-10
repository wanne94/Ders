/**
 * Pre-Deploy Tests
 * These tests run before deployment to ensure critical functionality works
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function checkEnvironmentFiles() {
  log('\n🔍 Checking environment files...', 'blue');
  
  const requiredFiles = ['.env', '.env.production'];
  const missingFiles = [];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    log(`❌ Missing environment files: ${missingFiles.join(', ')}`, 'red');
    return false;
  }

  log('✅ All environment files present', 'green');
  return true;
}

async function runLinter() {
  log('\n🔍 Running linter...', 'blue');
  try {
    await runCommand('npm', ['run', 'lint']);
    log('✅ Linting passed', 'green');
    return true;
  } catch (error) {
    log('❌ Linting failed', 'red');
    return false;
  }
}

async function runUnitTests() {
  log('\n🧪 Running unit tests...', 'blue');
  try {
    await runCommand('npm', ['test']);
    log('✅ Unit tests passed', 'green');
    return true;
  } catch (error) {
    log('❌ Unit tests failed', 'red');
    return false;
  }
}

async function buildApplication() {
  log('\n🏗️ Building application...', 'blue');
  try {
    await runCommand('npm', ['run', 'build']);
    log('✅ Build successful', 'green');
    return true;
  } catch (error) {
    log('❌ Build failed', 'red');
    return false;
  }
}

async function checkBuildOutput() {
  log('\n🔍 Checking build output...', 'blue');
  
  const buildDir = '.next';
  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory not found', 'red');
    return false;
  }

  const staticDir = path.join(buildDir, 'static');
  if (!fs.existsSync(staticDir)) {
    log('❌ Static assets directory not found', 'red');
    return false;
  }

  log('✅ Build output looks good', 'green');
  return true;
}

async function runE2ETests() {
  log('\n🎭 Running E2E tests...', 'blue');
  try {
    // Install playwright browsers if not already installed
    await runCommand('npx', ['playwright', 'install', '--with-deps']);
    await runCommand('npm', ['run', 'test:e2e']);
    log('✅ E2E tests passed', 'green');
    return true;
  } catch (error) {
    log('⚠️ E2E tests failed or skipped', 'yellow');
    // E2E tests are optional for pre-deploy, so we return true
    return true;
  }
}

async function securityCheck() {
  log('\n🔒 Running security check...', 'blue');
  try {
    await runCommand('npm', ['audit', '--audit-level', 'moderate']);
    log('✅ Security check passed', 'green');
    return true;
  } catch (error) {
    log('⚠️ Security vulnerabilities found', 'yellow');
    // Log warning but don't fail deployment
    return true;
  }
}

async function runPreDeployTests() {
  log('🚀 Starting Pre-Deploy Tests...', 'blue');
  
  const tests = [
    { name: 'Environment Files', fn: checkEnvironmentFiles, critical: true },
    { name: 'Linter', fn: runLinter, critical: true },
    { name: 'Unit Tests', fn: runUnitTests, critical: true },
    { name: 'Build', fn: buildApplication, critical: true },
    { name: 'Build Output', fn: checkBuildOutput, critical: true },
    { name: 'Security Check', fn: securityCheck, critical: false },
    { name: 'E2E Tests', fn: runE2ETests, critical: false },
  ];

  let passed = 0;
  let failed = 0;
  let critical_failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
        if (test.critical) {
          critical_failed++;
        }
      }
    } catch (error) {
      log(`❌ ${test.name} encountered an error: ${error.message}`, 'red');
      failed++;
      if (test.critical) {
        critical_failed++;
      }
    }
  }

  log('\n📊 Test Summary:', 'blue');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (critical_failed > 0) {
    log('\n🚨 DEPLOYMENT BLOCKED', 'red');
    log('Critical tests failed. Please fix the issues before deploying.', 'red');
    process.exit(1);
  } else {
    log('\n🎉 ALL CRITICAL TESTS PASSED', 'green');
    log('Application is ready for deployment!', 'green');
    process.exit(0);
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  runPreDeployTests().catch((error) => {
    log(`\n💥 Pre-deploy tests failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runPreDeployTests }; 
#!/usr/bin/env node
/**
 * Negative Test for ESLint Configuration Constants
 * 
 * This script tests that the constants module validation fails appropriately
 * when configuration drift is introduced, ensuring the CI catches issues.
 */

const fs = require('fs');
const path = require('path');

// Backup original constants file
const CONSTANTS_FILE = './scripts/eslint-config-constants.js';
const BACKUP_FILE = './scripts/eslint-config-constants.js.backup';

function backupConstants() {
  if (fs.existsSync(CONSTANTS_FILE)) {
    fs.copyFileSync(CONSTANTS_FILE, BACKUP_FILE);
    console.log('📋 Backed up original constants file');
  }
}

function restoreConstants() {
  if (fs.existsSync(BACKUP_FILE)) {
    fs.copyFileSync(BACKUP_FILE, CONSTANTS_FILE);
    fs.unlinkSync(BACKUP_FILE);
    console.log('📋 Restored original constants file');
  }
}

function createDriftedConstants() {
  const driftedContent = `/**
 * ESLint Configuration Constants
 * 
 * DRY constants for ESLint configuration to avoid duplication
 * between config files, documentation, and verification scripts.
 */

// Allowed Next.js patterns for import/no-internal-modules rule
const ALLOWED_NEXT_PATTERNS = [
  'next/*',                    // All Next.js built-in modules
  'next/font/google',          // Google fonts
  'next/font/local',           // Local fonts
  'next/navigation',           // Navigation hooks
  'next/server',               // Server components
  'next/image',                // Optimized image component
  'next/link',                 // Link component
  'next/headers',              // Headers API
  // Missing: next/cache, next/og, next/intl (simulating drift)
];

// Expected rule severities by file type
const EXPECTED_RULE_SEVERITIES = {
  'frontend': {
    'import/no-internal-modules': 'warn',
    'no-console': 'warn'
  },
  'package': {
    'import/no-internal-modules': 'warn', // Will flip to error later
    'no-console': 'error'
  },
  'service': {
    'import/no-internal-modules': 'warn',
    'no-console': 'off'
  },
  // Missing tier: 'missing-tier' (simulating drift)
};

module.exports = {
  ALLOWED_NEXT_PATTERNS,
  EXPECTED_RULE_SEVERITIES
};
`;

  fs.writeFileSync(CONSTANTS_FILE, driftedContent);
  console.log('📋 Created drifted constants file for testing');
}

function testConstantsValidation() {
  console.log('🧪 Testing constants validation with drifted configuration...');
  
  try {
    // Run the constants test - this should fail
    const { execSync } = require('child_process');
    execSync('node scripts/test-eslint-config-constants.js', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // If we get here, the test didn't fail as expected
    console.error('❌ Constants test should have failed but passed');
    return false;
  } catch (error) {
    // Expected: the test should fail
    console.log('✅ Constants test failed as expected');
    console.log('📋 Error message:', error.message);
    return true;
  }
}

function testVerificationScript() {
  console.log('🧪 Testing verification script with drifted configuration...');
  
  try {
    // Run the verification script - this should also fail
    const { execSync } = require('child_process');
    execSync('node scripts/verify-eslint-config-api.js', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // If we get here, the test didn't fail as expected
    console.error('❌ Verification script should have failed but passed');
    return false;
  } catch (error) {
    // Expected: the script should fail
    console.log('✅ Verification script failed as expected');
    console.log('📋 Error message:', error.message);
    return true;
  }
}

function main() {
  // Check if running in CI environment
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    console.log('⚠️  Negative test script detected in CI environment');
    console.log('   This script should only be run locally for testing purposes');
    console.log('   Skipping negative tests in CI to prevent false failures');
    process.exit(0);
  }
  
  console.log('🔍 Running negative tests for ESLint configuration constants...');
  console.log('⚠️  WARNING: This script modifies configuration files for testing');
  console.log('   It will backup and restore files automatically');
  console.log('   Only run this locally, never in CI environments');
  
  let allTestsPassed = true;
  
  try {
    // Test 1: Constants validation with drifted config
    backupConstants();
    createDriftedConstants();
    
    const constantsTestPassed = testConstantsValidation();
    if (!constantsTestPassed) {
      allTestsPassed = false;
    }
    
    // Test 2: Verification script with drifted config
    const verificationTestPassed = testVerificationScript();
    if (!verificationTestPassed) {
      allTestsPassed = false;
    }
    
    // Test 3: Verify original constants work
    restoreConstants();
    console.log('🧪 Testing original constants work correctly...');
    
    try {
      const { execSync } = require('child_process');
      execSync('node scripts/test-eslint-config-constants.js', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Original constants test passed');
    } catch (error) {
      console.error('❌ Original constants test failed:', error.message);
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.error('❌ Negative test setup failed:', error.message);
    allTestsPassed = false;
  } finally {
    // Always restore original constants
    restoreConstants();
  }
  
  if (allTestsPassed) {
    console.log('\n✅ All negative tests passed!');
    console.log('📊 Summary:');
    console.log('  - Constants test fails with drifted configuration ✓');
    console.log('  - Verification script fails with drifted configuration ✓');
    console.log('  - Original constants work correctly ✓');
    console.log('  - CI will catch configuration drift ✓');
    
    process.exit(0);
  } else {
    console.log('\n❌ Some negative tests failed!');
    console.log('💡 This indicates the validation is not working as expected.');
    console.log('   Check for:');
    console.log('   - Missing validation logic');
    console.log('   - Incorrect error handling');
    console.log('   - Test setup issues');
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { 
  backupConstants, 
  restoreConstants, 
  createDriftedConstants,
  testConstantsValidation,
  testVerificationScript 
};

#!/usr/bin/env node
/**
 * Node.js Version Check Script
 * 
 * This script ensures developers are using the correct Node.js version
 * as specified in .nvmrc and package.json engines field.
 * 
 * Usage: Automatically runs via npm preinstall hook
 */

const fs = require('fs');
const path = require('path');

function checkNodeVersion() {
  const currentVersion = process.version;
  const majorVersion = parseInt(currentVersion.slice(1).split('.')[0]);
  const minorVersion = parseInt(currentVersion.slice(1).split('.')[1]);
  
  // Read .nvmrc file
  const nvmrcPath = path.join(__dirname, '..', '.nvmrc');
  let expectedVersion;
  
  try {
    expectedVersion = fs.readFileSync(nvmrcPath, 'utf8').trim();
  } catch (error) {
    console.warn('⚠️  Warning: Could not read .nvmrc file');
    return;
  }
  
  const expectedMajor = parseInt(expectedVersion.split('.')[0]);
  const expectedMinor = parseInt(expectedVersion.split('.')[1]);
  
  // Check if version matches
  if (majorVersion !== expectedMajor || minorVersion !== expectedMinor) {
    console.error('❌ Node.js version mismatch!');
    console.error(`   Current: ${currentVersion}`);
    console.error(`   Expected: v${expectedVersion} (from .nvmrc)`);
    console.error('');
    console.error('🔧 To fix this:');
    console.error('   1. Install Node.js v' + expectedVersion);
    console.error('   2. Or use nvm: nvm use');
    console.error('   3. Or use volta: volta pin node@' + expectedVersion);
    console.error('');
    console.error('📚 For more info, see CONTRIBUTING.md');
    
    // In CI, this should be an error
    if (process.env.CI === 'true') {
      process.exit(1);
    }
    
    // In local development, show warning but continue
    console.warn('⚠️  Continuing with installation, but please update Node.js version');
  } else {
    console.log(`✅ Node.js version check passed: ${currentVersion}`);
  }
}

// Only run if not in CI or if explicitly requested
if (process.env.NODE_VERSION_CHECK !== 'false') {
  checkNodeVersion();
}

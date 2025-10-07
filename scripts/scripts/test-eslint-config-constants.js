#!/usr/bin/env node
/**
 * Simple test script for ESLint Configuration Constants
 * 
 * This script validates the constants module to prevent accidental drift
 * and ensures consistency across the codebase.
 */

const { ALLOWED_NEXT_PATTERNS, EXPECTED_RULE_SEVERITIES } = require('./eslint-config-constants.js');

function testAllowedNextPatterns() {
  console.log('🧪 Testing ALLOWED_NEXT_PATTERNS...');
  
  // Test 1: Should be an array
  if (!Array.isArray(ALLOWED_NEXT_PATTERNS)) {
    throw new Error('ALLOWED_NEXT_PATTERNS should be an array');
  }
  
  // Test 2: Should contain essential patterns
  const essentialPatterns = [
    'next/*',
    'next/font/google',
    'next/font/local',
    'next/navigation',
    'next/server',
    'next/image',
    'next/link',
    'next/headers'
  ];
  
  essentialPatterns.forEach(pattern => {
    if (!ALLOWED_NEXT_PATTERNS.includes(pattern)) {
      throw new Error(`Missing essential pattern: ${pattern}`);
    }
  });
  
  // Test 3: Should contain extended patterns
  const extendedPatterns = ['next/cache', 'next/og', 'next/intl'];
  extendedPatterns.forEach(pattern => {
    if (!ALLOWED_NEXT_PATTERNS.includes(pattern)) {
      throw new Error(`Missing extended pattern: ${pattern}`);
    }
  });
  
  // Test 4: Should not have duplicates
  const uniquePatterns = new Set(ALLOWED_NEXT_PATTERNS);
  if (uniquePatterns.size !== ALLOWED_NEXT_PATTERNS.length) {
    throw new Error('ALLOWED_NEXT_PATTERNS contains duplicates');
  }
  
  // Test 5: Should have consistent format
  ALLOWED_NEXT_PATTERNS.forEach(pattern => {
    if (!pattern.startsWith('next/')) {
      throw new Error(`Invalid pattern format: ${pattern}`);
    }
  });
  
  console.log(`✅ ALLOWED_NEXT_PATTERNS: ${ALLOWED_NEXT_PATTERNS.length} patterns`);
}

function testExpectedRuleSeverities() {
  console.log('🧪 Testing EXPECTED_RULE_SEVERITIES...');
  
  // Test 1: Should be an object
  if (typeof EXPECTED_RULE_SEVERITIES !== 'object' || EXPECTED_RULE_SEVERITIES === null) {
    throw new Error('EXPECTED_RULE_SEVERITIES should be an object');
  }
  
  // Test 2: Should contain all required tiers
  const requiredTiers = ['frontend', 'package', 'service'];
  requiredTiers.forEach(tier => {
    if (!EXPECTED_RULE_SEVERITIES[tier]) {
      throw new Error(`Missing tier: ${tier}`);
    }
  });
  
  // Test 3: Should have valid severity values
  const validSeverities = ['off', 'warn', 'error'];
  Object.values(EXPECTED_RULE_SEVERITIES).forEach(tierConfig => {
    Object.values(tierConfig).forEach(severity => {
      if (!validSeverities.includes(severity)) {
        throw new Error(`Invalid severity: ${severity}`);
      }
    });
  });
  
  // Test 4: Should have expected configurations
  if (EXPECTED_RULE_SEVERITIES.frontend['import/no-internal-modules'] !== 'warn') {
    throw new Error('Frontend import/no-internal-modules should be warn');
  }
  
  if (EXPECTED_RULE_SEVERITIES.package['import/no-internal-modules'] !== 'warn') {
    throw new Error('Package import/no-internal-modules should be warn (will flip to error later)');
  }
  
  if (EXPECTED_RULE_SEVERITIES.service['import/no-internal-modules'] !== 'warn') {
    throw new Error('Service import/no-internal-modules should be warn');
  }
  
  console.log(`✅ EXPECTED_RULE_SEVERITIES: ${Object.keys(EXPECTED_RULE_SEVERITIES).length} tiers`);
}

function testIntegration() {
  console.log('🧪 Testing integration...');
  
  // Test 1: Should be importable without errors
  try {
    require('./eslint-config-constants.js');
  } catch (error) {
    throw new Error(`Import failed: ${error.message}`);
  }
  
  // Test 2: Should maintain backward compatibility
  const legacyPatterns = ['next/*', 'next/font/google', 'next/navigation'];
  legacyPatterns.forEach(pattern => {
    if (!ALLOWED_NEXT_PATTERNS.includes(pattern)) {
      throw new Error(`Backward compatibility broken: ${pattern}`);
    }
  });
  
  console.log('✅ Integration tests passed');
}

function main() {
  console.log('🔍 Running ESLint Configuration Constants Tests...');
  
  try {
    testAllowedNextPatterns();
    testExpectedRuleSeverities();
    testIntegration();
    
    console.log('\n✅ All tests passed!');
    console.log('📊 Summary:');
    console.log(`  - Next.js patterns: ${ALLOWED_NEXT_PATTERNS.length}`);
    console.log(`  - Configuration tiers: ${Object.keys(EXPECTED_RULE_SEVERITIES).length}`);
    console.log(`  - Patterns: ${ALLOWED_NEXT_PATTERNS.join(', ')}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n💡 This indicates a drift in the constants module.');
    console.error('   Check for:');
    console.error('   - Missing patterns');
    console.error('   - Invalid severity values');
    console.error('   - Inconsistent configurations');
    console.error('   - Breaking changes');
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testAllowedNextPatterns, testExpectedRuleSeverities, testIntegration };

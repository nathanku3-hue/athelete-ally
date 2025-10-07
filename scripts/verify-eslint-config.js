#!/usr/bin/env node
/**
 * ESLint Config Drift Detection Script
 * 
 * Verifies that key ESLint rules have the expected severities
 * to prevent config drift between environments.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Expected rule severities by file pattern
const EXPECTED_RULES = {
  'apps/frontend/src/app/layout.tsx': {
    'import/no-internal-modules': 'warn',
    'no-console': 'warn'
  },
  'packages/shared-types/src/index.ts': {
    'import/no-internal-modules': 'warn',
    'no-console': 'warn'
  },
  'services/planning-engine/src/index.ts': {
    'import/no-internal-modules': 'warn',
    'no-console': 'warn'
  }
};

// Allowed Next.js patterns
const ALLOWED_NEXT_PATTERNS = [
  'next/*'
];

function getESLintConfig(filePath) {
  try {
    const output = execSync(`npx eslint --print-config ${filePath}`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return JSON.parse(output);
  } catch (error) {
    console.error(`❌ Failed to get ESLint config for ${filePath}:`, error.message);
    process.exit(1);
  }
}

function checkRuleSeverity(config, ruleName, expectedSeverity) {
  const ruleConfig = config.rules?.[ruleName];
  if (!ruleConfig) {
    return { passed: false, message: `Rule ${ruleName} not found in config` };
  }

  // Handle array format: ["severity", options] or [severity, options]
  let actualSeverity;
  if (Array.isArray(ruleConfig)) {
    actualSeverity = ruleConfig[0];
  } else {
    actualSeverity = ruleConfig;
  }

  // Convert numeric severity to string
  const severityMap = { 0: 'off', 1: 'warn', 2: 'error' };
  if (typeof actualSeverity === 'number') {
    actualSeverity = severityMap[actualSeverity] || actualSeverity;
  }
  
  if (actualSeverity !== expectedSeverity) {
    return { 
      passed: false, 
      message: `Rule ${ruleName} severity mismatch: expected ${expectedSeverity}, got ${actualSeverity}` 
    };
  }

  return { passed: true };
}

function checkAllowedPatterns(config, filePath) {
  const ruleConfig = config.rules?.['import/no-internal-modules'];
  if (!ruleConfig) {
    return { passed: true }; // Rule not configured
  }

  // Extract allow patterns from rule config
  let allowPatterns = [];
  if (Array.isArray(ruleConfig) && ruleConfig[1]?.allow) {
    allowPatterns = ruleConfig[1].allow;
  } else if (ruleConfig.allow) {
    allowPatterns = ruleConfig.allow;
  }

  // Check if Next.js patterns are allowed for frontend files
  if (filePath.includes('apps/frontend/')) {
    const missingPatterns = ALLOWED_NEXT_PATTERNS.filter(pattern => 
      !allowPatterns.includes(pattern)
    );

    if (missingPatterns.length > 0) {
      return {
        passed: false,
        message: `Missing allowed Next.js patterns: ${missingPatterns.join(', ')}`
      };
    }
  }

  return { passed: true };
}

function main() {
  console.log('🔍 Running ESLint config drift detection...');
  
  let allPassed = true;
  const results = [];

  for (const [filePath, expectedRules] of Object.entries(EXPECTED_RULES)) {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${filePath} (file not found)`);
      continue;
    }

    console.log(`📋 Checking config for ${filePath}...`);
    const config = getESLintConfig(filePath);

    // Check rule severities
    for (const [ruleName, expectedSeverity] of Object.entries(expectedRules)) {
      const result = checkRuleSeverity(config, ruleName, expectedSeverity);
      if (!result.passed) {
        console.log(`❌ ${result.message}`);
        allPassed = false;
        results.push({ file: filePath, rule: ruleName, error: result.message });
      }
    }

    // Check allowed patterns
    const patternResult = checkAllowedPatterns(config, filePath);
    if (!patternResult.passed) {
      console.log(`❌ ${patternResult.message}`);
      allPassed = false;
      results.push({ file: filePath, rule: 'allowed-patterns', error: patternResult.message });
    }
  }

  if (allPassed) {
    console.log('✅ ESLint config drift detection passed');
    process.exit(0);
  } else {
    console.log('\n❌ ESLint config drift detected:');
    results.forEach(result => {
      console.log(`  - ${result.file}: ${result.rule} - ${result.error}`);
    });
    console.log('\n💡 This indicates config drift. Check for:');
    console.log('   - Inline --rule overrides in workflows or scripts');
    console.log('   - Multiple ESLint config files');
    console.log('   - Environment-specific rule modifications');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, checkRuleSeverity, checkAllowedPatterns };

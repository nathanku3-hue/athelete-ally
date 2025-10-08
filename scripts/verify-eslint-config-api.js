#!/usr/bin/env node
/**
 * ESLint Config Verification Script
 * 
 * Verifies that key ESLint rules have the expected severities
 * using ESLint's print-config output for robust validation.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Sentinel files for configuration verification - multiple per tier for stability
const SENTINEL_FILES = {
  // Next App tier - multiple files for stability
  'apps/frontend/src/app/layout.tsx': {
    type: 'Next App',
    tier: 'frontend',
    expectedRules: {
      'import/no-internal-modules': 'warn',
      'no-console': 'warn'
    }
  },
  'apps/frontend/src/app/page.tsx': {
    type: 'Next App',
    tier: 'frontend',
    expectedRules: {
      'import/no-internal-modules': 'warn',
      'no-console': 'warn'
    }
  },
  'apps/frontend/src/middleware.ts': {
    type: 'Next App',
    tier: 'frontend',
    expectedRules: {
      'import/no-internal-modules': 'warn',
      'no-console': 'warn'
    }
  },
  
  // Package tier - multiple files for stability
  'packages/shared-types/src/index.ts': {
    type: 'Package',
    tier: 'package',
    expectedRules: {
      'import/no-internal-modules': 'warn', // For now, will flip to error later
      'no-console': 'error'
    }
  },
  'packages/shared-types/src/schemas/api.ts': {
    type: 'Package',
    tier: 'package',
    expectedRules: {
      'import/no-internal-modules': 'warn',
      'no-console': 'error'
    }
  },
  
  // Service tier - multiple files for stability
  'services/planning-engine/src/index.ts': {
    type: 'Service',
    tier: 'service',
    expectedRules: {
      'import/no-internal-modules': 'warn',
      'no-console': 'warn'
    }
  },
  'services/fatigue/src/index.ts': {
    type: 'Service',
    tier: 'service',
    expectedRules: {
      'import/no-internal-modules': 'warn',
      'no-console': 'warn'
    }
  }
};

// Centralized severity mapping
const SEVERITY_MAP = { 0: 'off', 1: 'warn', 2: 'error' };

// Validate sentinel files exist before verification
function validateSentinelFiles() {
  const missingFiles = [];
  const tierCounts = {};
  
  for (const [filePath, config] of Object.entries(SENTINEL_FILES)) {
    if (!fs.existsSync(filePath)) {
      missingFiles.push({ path: filePath, type: config.type, tier: config.tier });
    } else {
      // Count existing files per tier
      tierCounts[config.tier] = (tierCounts[config.tier] || 0) + 1;
    }
  }
  
  if (missingFiles.length > 0) {
    console.error('❌ Sentinel files missing:');
    missingFiles.forEach(({ path, type, tier }) => {
      console.error(`   - ${path} (${type}, ${tier} tier)`);
    });
    console.error('\n💡 These files are required for config verification.');
    console.error('   Ensure the file structure matches the expected sentinel paths.');
    console.error('   If files have moved, update the sentinel paths in the verification script.');
    console.error('\n🔧 Quick fixes:');
    console.error('   1. Check if files were renamed or moved');
    console.error('   2. Update sentinel paths in scripts/verify-eslint-config-api.js');
    console.error('   3. Ensure files exist in the expected locations');
    console.error('   4. Run: find . -name "*.ts" -path "*/packages/*" | head -5');
    console.error('   5. Run: find . -name "*.ts" -path "*/services/*" | head -5');
    console.error('   6. Run: find . -name "*.tsx" -path "*/apps/frontend/*" | head -5');
    process.exit(1);
  }
  
  // Check tier coverage
  const expectedTiers = ['frontend', 'package', 'service'];
  const missingTiers = expectedTiers.filter(tier => !tierCounts[tier]);
  
  if (missingTiers.length > 0) {
    console.error('❌ Missing sentinel tiers:');
    missingTiers.forEach(tier => {
      console.error(`   - ${tier} tier has no sentinel files`);
    });
    console.error('\n💡 Each tier (frontend, package, service) must have at least one sentinel file.');
    console.error('\n🔧 Quick fixes:');
    console.error('   1. Check if tier directories exist');
    console.error('   2. Ensure at least one file exists in each tier');
    console.error('   3. Update sentinel paths in scripts/verify-eslint-config-api.js');
    console.error('   4. Run: ls -la apps/frontend/src/app/');
    console.error('   5. Run: ls -la packages/*/src/');
    console.error('   6. Run: ls -la services/*/src/');
    process.exit(1);
  }
  
  console.log('✅ All sentinel files present');
  console.log(`📊 Tier coverage: ${Object.entries(tierCounts).map(([tier, count]) => `${tier}(${count})`).join(', ')}`);
  
  // Sentinel maintenance guidance
  console.log('\n🔧 Sentinel Maintenance Guidelines:');
  console.log('  - Keep 3 sentinels per tier for stability');
  console.log('  - Update sentinel paths if files move/rename');
  console.log('  - Add new sentinels for new tiers');
  console.log('  - Remove sentinels for deprecated tiers');
  console.log('  - Test sentinel changes locally before committing');
}

// DRY constant for Next.js patterns
const ALLOWED_NEXT_PATTERNS = [
  'next/*',
  'next/font/google',
  'next/font/local',
  'next/navigation',
  'next/server',
  'next/image',
  'next/link',
  'next/headers'
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

function getRuleSeverity(ruleConfig) {
  if (!ruleConfig) return 'off';
  
  // Handle array format: [severity, options] or [severity, options]
  let actualSeverity;
  if (Array.isArray(ruleConfig)) {
    actualSeverity = ruleConfig[0];
  } else {
    actualSeverity = ruleConfig;
  }

  // Convert numeric severity to string using centralized mapping
  if (typeof actualSeverity === 'number') {
    return SEVERITY_MAP[actualSeverity] || `unknown(${actualSeverity})`;
  }
  
  return actualSeverity;
}

function checkAllowedPatterns(config, filePath) {
  const ruleConfig = config.rules?.['import/no-internal-modules'];
  if (!ruleConfig) {
    return { passed: true };
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

async function verifyConfigForFile(filePath, expectedConfig) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${filePath} (file not found)`);
    return { passed: true };
  }

  try {
    // Get resolved configuration using ESLint print-config
    const config = getESLintConfig(filePath);
    
    console.log(`📋 Verifying ${expectedConfig.type} config for ${filePath}...`);
    
    let allPassed = true;
    const results = [];

    // Check rule severities
    for (const [ruleName, expectedSeverity] of Object.entries(expectedConfig.expectedRules)) {
      const actualSeverity = getRuleSeverity(config.rules?.[ruleName]);
      
      if (actualSeverity !== expectedSeverity) {
        console.log(`❌ Rule ${ruleName} severity mismatch: expected ${expectedSeverity}, got ${actualSeverity}`);
        allPassed = false;
        results.push({ rule: ruleName, expected: expectedSeverity, actual: actualSeverity });
      }
    }

    // Check allowed patterns for frontend files
    const patternResult = checkAllowedPatterns(config, filePath);
    if (!patternResult.passed) {
      console.log(`❌ ${patternResult.message}`);
      allPassed = false;
      results.push({ rule: 'allowed-patterns', error: patternResult.message });
    }

    return { 
      passed: allPassed, 
      results, 
      config: {
        file: filePath,
        type: expectedConfig.type,
        rules: config.rules
      }
    };

  } catch (error) {
    console.error(`❌ Failed to verify config for ${filePath}:`, error.message);
    return { passed: false, error: error.message };
  }
}

async function main() {
  console.log('🔍 Running ESLint config verification...');
  
  // Print versions
  console.log('📋 Environment Information:');
  console.log(`  Node.js: ${process.version}`);
  console.log(`  ESLint: ${require('eslint/package.json').version}`);
  console.log(`  Working Directory: ${process.cwd()}`);
  
  // Print plugin versions for cache key explainability
  console.log('📋 Plugin Versions:');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const plugins = [
      '@typescript-eslint/eslint-plugin',
      'eslint-plugin-import',
      'eslint-plugin-react',
      'eslint-plugin-react-hooks',
      '@next/eslint-plugin-next'
    ];
    
    plugins.forEach(plugin => {
      const version = packageJson.devDependencies?.[plugin] || packageJson.dependencies?.[plugin] || 'not found';
      console.log(`  ${plugin}: ${version}`);
    });
  } catch (error) {
    console.log('  Could not read plugin versions from package.json');
  }
  
  // Validate sentinel files exist
  validateSentinelFiles();
  
  let allPassed = true;
  const configArtifacts = [];
  const sentinelResults = [];

  for (const [filePath, expectedConfig] of Object.entries(SENTINEL_FILES)) {
    const result = await verifyConfigForFile(filePath, expectedConfig);
    
    if (!result.passed) {
      allPassed = false;
    }
    
    if (result.config) {
      configArtifacts.push(result.config);
      
      // Collect sentinel results for job summary
      const sentinelResult = {
        type: expectedConfig.type,
        file: filePath,
        rules: {}
      };
      
      for (const [ruleName, expectedSeverity] of Object.entries(expectedConfig.expectedRules)) {
        const actualSeverity = getRuleSeverity(result.config.rules?.[ruleName]);
        sentinelResult.rules[ruleName] = {
          expected: expectedSeverity,
          actual: actualSeverity,
          match: actualSeverity === expectedSeverity
        };
      }
      
      sentinelResults.push(sentinelResult);
    }
  }

  // Print job summary
  console.log('\n📊 Job Summary:');
  console.log('Sentinel File Verification Results:');
  sentinelResults.forEach(result => {
    console.log(`  ${result.type} (${result.file}):`);
    Object.entries(result.rules).forEach(([rule, data]) => {
      const status = data.match ? '✅' : '❌';
      console.log(`    ${status} ${rule}: expected ${data.expected}, got ${data.actual}`);
    });
  });

  // Print per-tier summary
  console.log('\n📊 Per-Tier Summary:');
  const tierSummary = {};
  sentinelResults.forEach(result => {
    const tier = result.type.split(' ')[0].toLowerCase(); // Extract tier from type
    if (!tierSummary[tier]) {
      tierSummary[tier] = { count: 0, rules: {} };
    }
    tierSummary[tier].count++;
    
    Object.entries(result.rules).forEach(([rule, data]) => {
      if (!tierSummary[tier].rules[rule]) {
        tierSummary[tier].rules[rule] = { expected: data.expected, actual: data.actual, match: data.match };
      }
    });
  });

  Object.entries(tierSummary).forEach(([tier, summary]) => {
    console.log(`  ${tier}: ${summary.count} sentinels`);
    Object.entries(summary.rules).forEach(([rule, data]) => {
      const status = data.match ? '✅' : '❌';
      console.log(`    ${status} ${rule}: ${data.expected} → ${data.actual}`);
    });
  });

  // Save config artifacts for CI
  if (configArtifacts.length > 0) {
    const artifactsPath = 'eslint-config-artifacts.json';
    fs.writeFileSync(artifactsPath, JSON.stringify(configArtifacts, null, 2));
    console.log(`\n📄 Config artifacts saved to ${artifactsPath}`);
  }

  if (allPassed) {
    console.log('\n✅ ESLint config verification passed');
    process.exit(0);
  } else {
    console.log('\n❌ ESLint config verification failed');
    console.log('\n💡 This indicates config drift. Check for:');
    console.log('   - Inline --rule overrides in workflows or scripts');
    console.log('   - Multiple ESLint config files');
    console.log('   - Environment-specific rule modifications');
    console.log('   - Flat config precedence issues');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Verification script failed:', error);
    process.exit(1);
  });
}

module.exports = { main, verifyConfigForFile, ALLOWED_NEXT_PATTERNS };
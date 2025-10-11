#!/usr/bin/env node
/**
 * Cross-platform ESLint Override Scanner
 * 
 * Scans for inline --rule or alternate --config flags in workflows and scripts
 * using Node.js APIs for Windows compatibility.
 */

const fs = require('fs');
const path = require('path');

// Directories and files to scan
const SCAN_TARGETS = [
  { path: '.github/workflows/', type: 'workflow', exclude: ['workflows-disabled', 'eslint-guardrails.yml', 'verify-eslint-config*.yml'] },
  { path: 'scripts/', type: 'script', exclude: ['verify-eslint-config*.js', 'eslint-config-constants.js', 'scan-eslint-overrides.js'] },
  { path: '.lintstagedrc.js', type: 'config' },
  { path: 'package.json', type: 'config' }
];

function shouldExcludeFile(filePath, excludes) {
  if (!excludes) return false;
  
  return excludes.some(exclude => {
    if (exclude.includes('*')) {
      // Handle glob patterns
      const pattern = exclude.replace(/\*/g, '.*');
      const regex = new RegExp(pattern);
      return regex.test(path.basename(filePath));
    }
    return path.basename(filePath) === exclude;
  });
}

function scanFile(filePath, type) {
  const results = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for inline --rule overrides (not using unified config)
    const ruleMatches = content.match(/eslint[^\n]*--rule/g);
    if (ruleMatches) {
      ruleMatches.forEach(match => {
        // Only flag if it's not using the unified config
        if (!match.includes('eslint.config.unified.mjs')) {
          results.push({
            file: filePath,
            type: type,
            pattern: 'inline --rule overrides',
            match: match.trim(),
            description: 'These override our unified config and cause drift. Use --config eslint.config.unified.mjs instead.'
          });
        }
      });
    }
    
    // Check for alternate --config files (not using unified config)
    const configMatches = content.match(/eslint[^\n]*--config[^\n]*/g);
    if (configMatches) {
      configMatches.forEach(match => {
        // Only flag if it's not using the unified config
        if (!match.includes('eslint.config.unified.mjs')) {
          results.push({
            file: filePath,
            type: type,
            pattern: 'alternate --config files',
            match: match.trim(),
            description: 'Use --config eslint.config.unified.mjs for consistency.'
          });
        }
      });
    }
  } catch (error) {
    console.warn(`⚠️  Could not read ${filePath}: ${error.message}`);
  }
  
  return results;
}

function scanDirectory(dirPath, type, excludes) {
  const results = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!shouldExcludeFile(fullPath, excludes)) {
          results.push(...scanDirectory(fullPath, type, excludes));
        }
      } else if (entry.isFile()) {
        if (!shouldExcludeFile(fullPath, excludes)) {
          results.push(...scanFile(fullPath, type));
        }
      }
    });
  } catch (error) {
    console.warn(`⚠️  Could not scan directory ${dirPath}: ${error.message}`);
  }
  
  return results;
}

function main() {
  console.log('🔍 Scanning for ESLint config overrides...');
  
  let allResults = [];
  
  SCAN_TARGETS.forEach(target => {
    if (fs.existsSync(target.path)) {
      if (fs.statSync(target.path).isDirectory()) {
        console.log(`📁 Scanning directory: ${target.path}`);
        allResults.push(...scanDirectory(target.path, target.type, target.exclude));
      } else {
        console.log(`📄 Scanning file: ${target.path}`);
        allResults.push(...scanFile(target.path, target.type));
      }
    } else {
      console.log(`⚠️  Target not found: ${target.path}`);
    }
  });
  
  if (allResults.length === 0) {
    console.log('✅ No ESLint config overrides detected');
    process.exit(0);
  }
  
  console.log('\n❌ Found ESLint config overrides:');
  allResults.forEach(result => {
    console.log(`  ${result.file} (${result.type}):`);
    console.log(`    Pattern: ${result.pattern}`);
    console.log(`    Match: ${result.match}`);
    console.log(`    Fix: ${result.description}`);
    console.log('');
  });
  
  console.log('💡 This indicates config drift. All ESLint invocations should use --config eslint.config.unified.mjs');
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { scanFile, scanDirectory, main };
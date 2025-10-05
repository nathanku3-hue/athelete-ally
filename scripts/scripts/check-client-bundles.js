#!/usr/bin/env node
/**
 * Client Bundle Analysis Script
 * 
 * Checks that telemetry/mapping code isn't included in client bundles
 * by analyzing .next/static directory.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.cwd();
const nextStaticPath = path.join(projectRoot, 'apps', 'frontend', '.next', 'static');

console.log('🔍 Analyzing client bundles for contract code...\n');

/**
 * Check if telemetry/mapping code is in client bundles
 */
function checkClientBundles() {
  if (!fs.existsSync(nextStaticPath)) {
    console.log('⚠️ .next/static directory not found. Run "npm run build" first.');
    return false;
  }

  const issues: string[] = [];
  const files = getAllJSFiles(nextStaticPath);

  console.log(`📁 Found ${files.length} JavaScript files in client bundles\n`);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(nextStaticPath, file);

    // Check for telemetry code
    if (content.includes('recordLegacyMapping') || 
        content.includes('contractTelemetry') ||
        content.includes('ContractMetricsService')) {
      issues.push(`❌ Telemetry code found in: ${relativePath}`);
    }

    // Check for mapping code
    if (content.includes('mapLegacyApiRequest') || 
        content.includes('mapLegacyApiResponse') ||
        content.includes('mapLegacyFatigueLevel') ||
        content.includes('mapLegacySeason')) {
      issues.push(`❌ Legacy mapping code found in: ${relativePath}`);
    }

    // Check for server-only code
    if (content.includes('serverOnly') || 
        content.includes('handleServerContractRequest') ||
        content.includes('importServerContractUtils')) {
      issues.push(`❌ Server-only code found in: ${relativePath}`);
    }

    // Check for metrics adapter code
    if (content.includes('createMetricsApiHandler') || 
        content.includes('PrometheusMetricsAdapter') ||
        content.includes('ContractMetricsService')) {
      issues.push(`❌ Metrics adapter code found in: ${relativePath}`);
    }
  }

  if (issues.length > 0) {
    console.log('🚨 ISSUES FOUND:\n');
    issues.forEach(issue => console.log(issue));
    console.log('\n💡 These files should NOT contain server-side contract code.');
    console.log('   Check your imports and ensure server-only wrappers are working correctly.\n');
    return false;
  } else {
    console.log('✅ No contract code found in client bundles');
    console.log('✅ Server-only wrappers are working correctly\n');
    return true;
  }
}

/**
 * Get all JavaScript files recursively
 */
function getAllJSFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllJSFiles(fullPath));
    } else if (item.endsWith('.js') || item.endsWith('.js.map')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Check bundle sizes
 */
function checkBundleSizes() {
  console.log('📊 Bundle size analysis:\n');
  
  try {
    // Try to use bundle analyzer if available
    const packageJsonPath = path.join(projectRoot, 'apps', 'frontend', 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (packageJson.scripts && packageJson.scripts['analyze']) {
        console.log('🔍 Running bundle analysis...');
        execSync('npm run analyze', { cwd: path.join(projectRoot, 'apps', 'frontend'), stdio: 'inherit' });
      }
    }
  } catch (error) {
    console.log('⚠️ Bundle analyzer not available, skipping size analysis');
  }
}

/**
 * Check for specific patterns in source code
 */
function checkSourceCodePatterns() {
  console.log('🔍 Checking source code patterns...\n');
  
  const frontendSrcPath = path.join(projectRoot, 'apps', 'frontend', 'src');
  const issues: string[] = [];

  // Check for direct imports of server-only modules in client code
  const clientFiles = getAllTSFiles(frontendSrcPath);
  
  for (const file of clientFiles) {
    // Skip API routes and server-only files
    if (file.includes('/api/') || file.includes('server-only')) {
      continue;
    }

    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(frontendSrcPath, file);

    // Check for direct imports of server-only modules
    if (content.includes("from '@athlete-ally/shared-types/server-only'") ||
        content.includes("from '@athlete-ally/shared-types/metrics-adapter'")) {
      issues.push(`❌ Direct server-only import in client file: ${relativePath}`);
    }

    // Check for direct usage of server-only functions
    if (content.includes('handleServerContractRequest') ||
        content.includes('importServerContractUtils') ||
        content.includes('contractMetricsService')) {
      issues.push(`❌ Server-only function usage in client file: ${relativePath}`);
    }
  }

  if (issues.length > 0) {
    console.log('🚨 SOURCE CODE ISSUES:\n');
    issues.forEach(issue => console.log(issue));
    console.log('\n💡 Use server-only wrappers or move this code to API routes.\n');
    return false;
  } else {
    console.log('✅ No server-only code found in client source files\n');
    return true;
  }
}

/**
 * Get all TypeScript files recursively
 */
function getAllTSFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllTSFiles(fullPath));
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Main execution
 */
function main() {
  console.log('🎯 Client Bundle Analysis for Contract Code\n');
  console.log('==========================================\n');

  let allChecksPassed = true;

  // Check source code patterns
  if (!checkSourceCodePatterns()) {
    allChecksPassed = false;
  }

  // Check client bundles
  if (!checkClientBundles()) {
    allChecksPassed = false;
  }

  // Check bundle sizes
  checkBundleSizes();

  console.log('==========================================');
  
  if (allChecksPassed) {
    console.log('🎉 All checks passed! Contract code is properly isolated.');
    console.log('✅ Server-only wrappers are working correctly');
    console.log('✅ No contract code leaked to client bundles');
    process.exit(0);
  } else {
    console.log('❌ Issues found! Please fix the problems above.');
    console.log('💡 Ensure server-only wrappers are used correctly');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

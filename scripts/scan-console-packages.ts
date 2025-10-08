#!/usr/bin/env tsx
/**
 * Console Package Scanner for Stream 2
 * 
 * Scans packages/** for console usage and reports counts with allowlist filtering.
 * Used in CI to enforce no-console policy with intentional exceptions.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface ScanResult {
  removed: number;
  remaining: number;
  allowlist: number;
  files: Array<{
    file: string;
    line: number;
    content: string;
    allowed: boolean;
  }>;
}

interface AllowlistEntry {
  file: string;
  reason: string;
}

function loadAllowlist(): AllowlistEntry[] {
  try {
    const allowlistPath = path.join(process.cwd(), 'ci', 'console-allowlist.json');
    const content = fs.readFileSync(allowlistPath, 'utf8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function scanFile(filePath: string, allowlist: AllowlistEntry[]): Array<{
  file: string;
  line: number;
  content: string;
  allowed: boolean;
}> {
  const results = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Match console.* calls (excluding comments and eslint-disable)
      const consoleMatch = line.match(/(?<!\/\/.*)(?<!eslint-disable.*)console\.(log|info|warn|error|debug)/);
      if (consoleMatch) {
        const isAllowed = allowlist.some(entry => 
          filePath.includes(entry.file) && 
          (entry.file === path.basename(filePath) || filePath.endsWith(entry.file))
        );
        
        results.push({
          file: filePath,
          line: lineNum,
          content: line.trim(),
          allowed: isAllowed
        });
      }
    });
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error);
  }
  
  return results;
}

function scanPackages(): ScanResult {
  const allowlist = loadAllowlist();
  const results: ScanResult = {
    removed: 0,
    remaining: 0,
    allowlist: allowlist.length,
    files: []
  };
  
  try {
    // Find all TypeScript/JavaScript files in packages/
    const packagesDir = path.join(process.cwd(), 'packages');
    if (!fs.existsSync(packagesDir)) {
      console.log('No packages directory found');
      return results;
    }
    
    const files = execSync('find packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"', { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim() && !file.includes('node_modules') && !file.includes('dist') && !file.includes('build'));
    
    for (const file of files) {
      const fileResults = scanFile(file, allowlist);
      results.files.push(...fileResults);
    }
    
    // Calculate counts
    results.removed = results.files.filter(f => !f.allowed).length;
    results.remaining = results.files.filter(f => !f.allowed).length;
    
  } catch (error) {
    console.error('Error scanning packages:', error);
  }
  
  return results;
}

function main() {
  console.log('🔍 Scanning packages for console usage...');
  
  const result = scanPackages();
  
  console.log(`Console: removed ${result.removed}, remaining ${result.remaining}, allowlist ${result.allowlist}`);
  
  // Output detailed results for CI
  if (result.files.length > 0) {
    console.log('\n📋 Detailed Results:');
    result.files.forEach(file => {
      const status = file.allowed ? '✅ ALLOWED' : '❌ VIOLATION';
      console.log(`${status} ${file.file}:${file.line} - ${file.content}`);
    });
  }
  
  // Exit with error if there are violations
  if (result.remaining > 0) {
    console.log(`\n❌ Found ${result.remaining} console violations in packages/`);
    process.exit(1);
  } else {
    console.log('\n✅ No console violations found in packages/');
  }
}

if (require.main === module) {
  main();
}

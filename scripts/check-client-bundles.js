#!/usr/bin/env node

/**
 * Non-blocking client bundle scanner
 * 
 * This script scans for server-only/telemetry code that might accidentally
 * be included in client bundles or client components. It runs as part of
 * the Guardrails CI but is non-blocking (informational only).
 * 
 * Usage: node scripts/check-client-bundles.js
 */

const { readFileSync, readdirSync, statSync } = require('fs');
const { join, extname } = require('path');

// Patterns that indicate server-only code
const SERVER_ONLY_PATTERNS = [
  // Node.js specific APIs
  /require\s*\(\s*['"]fs['"]\s*\)/g,
  /require\s*\(\s*['"]path['"]\s*\)/g,
  /require\s*\(\s*['"]os['"]\s*\)/g,
  /require\s*\(\s*['"]crypto['"]\s*\)/g,
  /require\s*\(\s*['"]child_process['"]\s*\)/g,
  /require\s*\(\s*['"]cluster['"]\s*\)/g,
  /require\s*\(\s*['"]worker_threads['"]\s*\)/g,
  
  // Direct Node.js API usage
  /process\.env/g,
  /process\.cwd\(\)/g,
  /process\.exit\(/g,
  /process\.platform/g,
  /process\.version/g,
  /process\.pid/g,
  /process\.uptime\(/g,
  
  // File system operations
  /fs\.readFileSync/g,
  /fs\.writeFileSync/g,
  /fs\.existsSync/g,
  /fs\.mkdirSync/g,
  /fs\.rmSync/g,
  /fs\.statSync/g,
  /fs\.readdirSync/g,
  
  // Path operations
  /path\.join\(/g,
  /path\.resolve\(/g,
  /path\.dirname\(/g,
  /path\.basename\(/g,
  /path\.extname\(/g,
  
  // Server-side imports
  /import.*from\s*['"]fs['"]/g,
  /import.*from\s*['"]path['"]/g,
  /import.*from\s*['"]os['"]/g,
  /import.*from\s*['"]crypto['"]/g,
  /import.*from\s*['"]child_process['"]/g,
  /import.*from\s*['"]cluster['"]/g,
  /import.*from\s*['"]worker_threads['"]/g,
  
  // Telemetry/metrics specific
  /createMetricsApiHandler/g,
  /createHealthCheckHandler/g,
  /METRICS_API_KEY/g,
  /METRICS_ALLOWLIST/g,
  /METRICS_ALLOWLIST_CIDR/g,
  
  // Next.js server-only APIs
  /NextRequest/g,
  /NextResponse/g,
  /export\s+const\s+runtime\s*=/g,
  /export\s+const\s+dynamic\s*=/g,
  
  // Database operations
  /@prisma\/client/g,
  /prisma\./g,
  /\.findMany\(/g,
  /\.create\(/g,
  /\.update\(/g,
  /\.delete\(/g,
  /\.upsert\(/g,
];

// Patterns that indicate client-side code
const CLIENT_ONLY_PATTERNS = [
  /'use client'/g,
  /"use client"/g,
  /window\./g,
  /document\./g,
  /localStorage/g,
  /sessionStorage/g,
  /navigator\./g,
  /location\./g,
  /history\./g,
  /addEventListener/g,
  /removeEventListener/g,
];

// File extensions to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  'out',
  'build',
  'dist',
  '.git',
  'coverage',
  'test-results',
  'playwright-report',
];

// Files to exclude
const EXCLUDE_FILES = [
  'next-env.d.ts',
  'jest.config.js',
  'jest.config.cjs',
  'playwright.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
];

/**
 * Check if a file should be excluded
 */
function shouldExcludeFile(filePath, fileName) {
  // Check exclude files
  if (EXCLUDE_FILES.includes(fileName)) {
    return true;
  }
  
  // Check exclude directories
  const pathParts = filePath.split('/');
  for (const part of pathParts) {
    if (EXCLUDE_DIRS.includes(part)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a file is a client component
 */
function isClientComponent(content) {
  return CLIENT_ONLY_PATTERNS.some(pattern => pattern.test(content));
}

/**
 * Scan a file for server-only patterns
 */
function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Skip if it's a client component (these are allowed to have some server patterns)
    if (isClientComponent(content)) {
      return issues;
    }
    
    // Check for server-only patterns
    SERVER_ONLY_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lines = content.substring(0, content.indexOf(match)).split('\n');
          const lineNumber = lines.length;
          
          issues.push({
            file: filePath,
            line: lineNumber,
            pattern: pattern.toString(),
            match: match,
            severity: 'warning'
          });
        });
      }
    });
    
    return issues;
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * Recursively scan a directory
 */
function scanDirectory(dirPath, basePath = '') {
  const issues = [];
  
  try {
    const entries = readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const relativePath = join(basePath, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!shouldExcludeFile(relativePath, entry)) {
          issues.push(...scanDirectory(fullPath, relativePath));
        }
      } else if (stat.isFile()) {
        const ext = extname(entry);
        if (SCAN_EXTENSIONS.includes(ext) && !shouldExcludeFile(relativePath, entry)) {
          issues.push(...scanFile(fullPath));
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dirPath}: ${error.message}`);
  }
  
  return issues;
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Scanning for server-only code in client bundles...\n');
  
  const startTime = Date.now();
  const issues = scanDirectory(join(__dirname, '..'));
  const endTime = Date.now();
  
  if (issues.length === 0) {
    console.log('✅ No server-only code detected in client bundles');
    console.log(`⏱️  Scan completed in ${endTime - startTime}ms`);
    process.exit(0);
  }
  
  console.log(`⚠️  Found ${issues.length} potential server-only code issues:\n`);
  
  // Group issues by file
  const issuesByFile = issues.reduce((acc, issue) => {
    if (!acc[issue.file]) {
      acc[issue.file] = [];
    }
    acc[issue.file].push(issue);
    return acc;
  }, {});
  
  // Report issues
  Object.entries(issuesByFile).forEach(([file, fileIssues]) => {
    console.log(`📁 ${file}`);
    fileIssues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.match}`);
      console.log(`   Pattern: ${issue.pattern}`);
    });
    console.log('');
  });
  
  console.log(`⏱️  Scan completed in ${endTime - startTime}ms`);
  console.log('\n💡 This is a non-blocking informational scan.');
  console.log('   Review the above issues to ensure server-only code is not included in client bundles.');
  
  // Non-blocking: always exit with success
  process.exit(0);
}

// Run the scanner
if (require.main === module) {
  main();
}

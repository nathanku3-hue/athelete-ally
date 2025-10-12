#!/usr/bin/env node
/**
 * Reliable jest binary wrapper
 * Finds and executes the local jest installation
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Find the workspace root (where package.json with workspaces is)
function findWorkspaceRoot(startDir) {
  let currentDir = startDir;
  while (currentDir !== path.dirname(currentDir)) {
    const pkgPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.workspaces) {
          return currentDir;
        }
      } catch {}
    }
    currentDir = path.dirname(currentDir);
  }
  return null;
}

const workspaceRoot = findWorkspaceRoot(__dirname) || process.cwd();

// Build possible jest locations
const possiblePaths = [
  // Workspace root node_modules
  path.join(workspaceRoot, 'node_modules', 'jest', 'bin', 'jest.js'),
  // Current directory node_modules
  path.join(process.cwd(), 'node_modules', 'jest', 'bin', 'jest.js'),
  // Script directory node_modules
  path.join(__dirname, '..', 'node_modules', 'jest', 'bin', 'jest.js')
];

let jestPath = null;

// Try require.resolve first (works in most cases)
try {
  jestPath = require.resolve('jest/bin/jest.js');
} catch {
  // Fall back to checking file system paths
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      jestPath = testPath;
      break;
    }
  }
}

if (!jestPath) {
  console.error('Error: Could not find jest installation');
  console.error('Workspace root:', workspaceRoot);
  console.error('Current directory:', process.cwd());
  console.error('Script directory:', __dirname);
  console.error('Searched paths:');
  possiblePaths.forEach(p => {
    console.error(`  - ${p} (exists: ${fs.existsSync(p)})`);
  });

  // Try to find jest anywhere in node_modules
  const nodeModulesPath = path.join(workspaceRoot, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.error('\nContents of root node_modules:');
    try {
      const entries = fs.readdirSync(nodeModulesPath);
      console.error(`Total entries: ${entries.length}`);
      console.error('First 30:', entries.slice(0, 30).join(', '));

      // Check if jest exists anywhere
      const jestDir = path.join(nodeModulesPath, 'jest');
      if (fs.existsSync(jestDir)) {
        console.error('\njest directory exists! Checking structure:');
        const jestContents = fs.readdirSync(jestDir);
        console.error('jest contents:', jestContents.join(', '));

        const binDir = path.join(jestDir, 'bin');
        if (fs.existsSync(binDir)) {
          console.error('jest/bin contents:', fs.readdirSync(binDir).join(', '));
        } else {
          console.error('jest/bin does NOT exist');
        }
      } else {
        console.error('\njest is NOT installed in root node_modules');
      }

      // Search for jest in .bin
      const binDir = path.join(nodeModulesPath, '.bin', 'jest');
      if (fs.existsSync(binDir)) {
        console.error('\nFound jest symlink in .bin:', binDir);
        try {
          const realPath = fs.realpathSync(binDir);
          console.error('Symlink points to:', realPath);
          jestPath = realPath;
        } catch (e) {
          console.error('Could not resolve symlink:', e.message);
        }
      }
    } catch (e) {
      console.error('Could not read node_modules:', e.message);
    }
  }

  if (!jestPath) {
    console.error('\nPlease ensure jest is installed by running: npm ci');
    process.exit(1);
  }
}

console.log('Found jest at:', jestPath);

// Run jest with all forwarded arguments
const result = spawnSync('node', [jestPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd()
});

process.exit(result.status || 0);

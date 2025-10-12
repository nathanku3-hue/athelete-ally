#!/usr/bin/env node
/**
 * Jest wrapper - finds and executes local jest
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Find workspace root
function findWorkspaceRoot(dir) {
  let current = dir;
  while (current !== path.dirname(current)) {
    const pkgPath = path.join(current, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.workspaces) return current;
      } catch {}
    }
    current = path.dirname(current);
  }
  return null;
}

const root = findWorkspaceRoot(__dirname) || process.cwd();
let jestPath = null;

// Priority 1: Check .bin/jest (npm's standard location)
const binJest = path.join(root, 'node_modules', '.bin', 'jest');
if (fs.existsSync(binJest)) {
  try {
    jestPath = fs.realpathSync(binJest);
  } catch (e) {
    // Symlink resolution failed, try using it directly
    jestPath = binJest;
  }
}

// Priority 2: Try require.resolve
if (!jestPath) {
  try {
    jestPath = require.resolve('jest/bin/jest.js');
  } catch {}
}

// Priority 3: Check direct path
if (!jestPath) {
  const directPath = path.join(root, 'node_modules', 'jest', 'bin', 'jest.js');
  if (fs.existsSync(directPath)) {
    jestPath = directPath;
  }
}

// Not found - provide diagnostic
if (!jestPath) {
  console.error('Error: Jest not found in node_modules');
  console.error('Workspace root:', root);

  const nmPath = path.join(root, 'node_modules');
  if (fs.existsSync(nmPath)) {
    const hasBin = fs.existsSync(path.join(nmPath, '.bin'));
    const hasJest = fs.existsSync(path.join(nmPath, 'jest'));
    console.error('node_modules exists:', hasBin ? 'has .bin' : 'no .bin', hasJest ? 'has jest' : 'no jest');

    if (hasBin) {
      const binContents = fs.readdirSync(path.join(nmPath, '.bin'));
      console.error('.bin contents:', binContents.slice(0, 10).join(', '));
    }
  } else {
    console.error('node_modules does not exist!');
  }

  console.error('\nRun: npm ci --workspaces --include-workspace-root');
  process.exit(1);
}

// Execute jest
const result = spawnSync('node', [jestPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd()
});

process.exit(result.status || 0);

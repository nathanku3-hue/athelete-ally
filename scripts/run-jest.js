#!/usr/bin/env node
/**
 * Reliable jest binary wrapper
 * Tries multiple paths to find local jest installation
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Try multiple possible jest locations
const possiblePaths = [
  // Workspace root
  path.join(process.cwd(), 'node_modules', 'jest', 'bin', 'jest.js'),
  // Hoisted by npm workspaces
  path.join(process.cwd(), '..', '..', 'node_modules', 'jest', 'bin', 'jest.js'),
  // Global node_modules
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
  console.error('Searched paths:', possiblePaths);
  process.exit(1);
}

// Run jest with all forwarded arguments
const result = spawnSync('node', [jestPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd()
});

process.exit(result.status || 0);

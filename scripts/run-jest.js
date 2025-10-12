#!/usr/bin/env node
/**
 * Reliable jest binary wrapper
 * Uses Node's module resolution to find local jest installation
 */
const { spawnSync } = require('child_process');

try {
  // Use Node's module resolution to find jest
  const jestPath = require.resolve('jest/bin/jest.js');

  // Run jest with all forwarded arguments
  const result = spawnSync('node', [jestPath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  process.exit(result.status || 0);
} catch (error) {
  console.error('Error: Could not find jest installation');
  console.error(error.message);
  process.exit(1);
}

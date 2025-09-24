/**
 * Jest Projects Orchestrator
 * 
 * This file orchestrates all Jest projects in the monorepo.
 * It provides a single entry point for running all tests across different environments.
 * 
 * Usage:
 * - npm run test:projects (runs all projects)
 * - npm run test:frontend (runs frontend tests only)
 * - npm run test:services (runs services tests only)
 */

const { createJestConfig } = require('./jest.config.base.cjs');

module.exports = {
  projects: [
    // Frontend tests (React components, hooks, etc.)
    {
      ...createJestConfig('frontend'),
      displayName: 'Frontend',
      testMatch: ['<rootDir>/apps/frontend/**/*.test.{ts,tsx}'],
      testEnvironment: 'jsdom',
    },
    
    // Services tests (Node.js environment)
    {
      ...createJestConfig('services'),
      displayName: 'Services',
      testMatch: [
        '<rootDir>/services/**/*.test.{ts,js}',
        '<rootDir>/packages/**/*.test.{ts,js}',
      ],
      testEnvironment: 'node',
    },
    
    // Integration tests (when ready)
    {
      ...createJestConfig('integration'),
      displayName: 'Integration',
      testMatch: ['<rootDir>/**/*.integration.test.{ts,js}'],
      testEnvironment: 'node',
    },
  ],
  
  // Global test settings
  collectCoverageFrom: [
    'apps/**/*.{ts,tsx}',
    'services/**/*.{ts,js}',
    'packages/**/*.{ts,js}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/.next/**',
  ],
  
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
};

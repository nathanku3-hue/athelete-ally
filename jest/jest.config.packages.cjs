const base = require('./jest.config.base.cjs');

module.exports = {
  rootDir: '..',
  ...base,
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: [
    '**/tests/**/*.test.ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  // Allow empty runs to succeed (e.g., when only template is present)
  passWithNoTests: true,
  // Keep package tests lightweight; CI concurrency conservative
  maxWorkers: process.env.CI === 'true' ? 1 : '50%'
};

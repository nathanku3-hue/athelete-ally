const base = require('./jest.config.base.cjs');

module.exports = {
  rootDir: '..',
  ...base,
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.integration.test.ts'
  ]
};
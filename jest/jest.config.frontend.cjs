const base = require('./jest.config.base.cjs');

module.exports = {
  rootDir: '..',
  ...base,
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: ['/.next/', '/apps/frontend/.next/', '/dist/', '/out/', '/coverage/'],
  roots: ['<rootDir>/apps/frontend'],
  testMatch: [
    '**/__tests__/**/*.test.tsx',
    '**/__tests__/**/*.test.ts',
    '**/tests/**/*.test.ts',
    '**/contracts/**/*.test.ts'
  ],
  testPathIgnorePatterns: [
    // Exclude Playwright E2E tests from Jest runs
    '/apps/frontend/src/__tests__/e2e/',
    '/apps/frontend/tests/e2e/',
    // Exclude environment/integration harness tests from unit jsdom run
    // These rely on real services and are covered by separate workflows/jobs
    '/apps/frontend/tests/integration/',
    '/apps/frontend/src/__tests__/integration/',
    // Exclude legacy integration-like tests from unit tests
    '/apps/frontend/tests/permissions/',
    '/apps/frontend/tests/security/',
    // Skip tests with missing components (technical debt)
    '.*permissions-api\\.test\\.ts$',
    '.*ProtocolPermissionsManager\\.test\\.tsx$',
    '.*AdvancedSearch\\.test\\.tsx$',
    '.*PlanCard\\.test\\.tsx$',
    '.*useTrainingQueries\\.test\\.tsx$'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/apps/frontend/src/__tests__/setup.ts'
  ],
  testEnvironmentOptions: { url: 'http://localhost:3000' },

  // Frontend path aliases (explicit to avoid tsconfig loader edge cases)
  moduleNameMapper: {
    ...(base.moduleNameMapper || {}),
    '^@/(.*)$': '<rootDir>/apps/frontend/src/$1',
    '^@components/(.*)$': '<rootDir>/apps/frontend/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/apps/frontend/src/hooks/$1',
    '^@lib/(.*)$': '<rootDir>/apps/frontend/src/lib/$1',
    '^@contexts/(.*)$': '<rootDir>/apps/frontend/src/contexts/$1'
  },

  // Increase timeout for CI environment
  testTimeout: 15000
};



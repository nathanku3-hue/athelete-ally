// Base Jest config for monorepo (CommonJS to avoid ESM interop issues)
const { pathsToModuleNameMapper } = require('ts-jest');
const path = require('path');

// Load tsconfig compilerOptions robustly. We now keep a root wrapper
// tsconfig.base.json that extends the centralized config under
// config/typescript/tsconfig.base.json. Resolve both locations and gracefully
// handle wrappers without compilerOptions.
function loadCompilerOptions() {
  const candidates = [
    path.resolve(__dirname, '../config/typescript/tsconfig.base.json'),
    path.resolve(__dirname, '../tsconfig.base.json'),
  ];
  for (const p of candidates) {
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const cfg = require(p);
      if (cfg && cfg.compilerOptions) return cfg.compilerOptions;
      if (cfg && cfg.extends) {
        const extPath = path.resolve(path.dirname(p), cfg.extends);
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const extCfg = require(extPath);
        if (extCfg && extCfg.compilerOptions) return extCfg.compilerOptions;
      }
    } catch (_) {
      // ignore and try next candidate
    }
  }
  return {};
}

const compilerOptions = loadCompilerOptions();

module.exports = {
  rootDir: '..',
  preset: 'ts-jest',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Unify module resolution from TS paths
  moduleNameMapper: {
    // Specific @athlete-ally package mappings (must come before generic mapping)
    '^@athlete-ally/contracts$': '<rootDir>/packages/contracts/events',
    '^@athlete-ally/contracts/events/(.*)$': '<rootDir>/packages/contracts/events/$1',
    '^@athlete-ally/contracts/(.*)$': '<rootDir>/packages/contracts/$1',
    // Specific llm.js mappings (must come before generic .js mapping)
    '^(\\.\\./)*services/planning-engine/src/llm\\.js$': '<rootDir>/services/planning-engine/src/llm.ts',
    '^(\\.\\./)*services/planning-engine/src/llm$': '<rootDir>/services/planning-engine/src/llm.ts',
    // Legacy shims removed after Vitest→Jest migration
    '^\\.\\.\\/helpers\\/test-data$': '<rootDir>/apps/frontend/tests/_stubs/test-data.ts',
    // Handle .js imports in TypeScript files (ESM compatibility) - must come after specific mappings
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Generic @athlete-ally package mapping (must come last)
    '^@athlete-ally/(.*)$': '<rootDir>/packages/$1/src',
    // ESM imports resolved by ts-jest automatically (after specific mappings)
    ...(pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' }))
  },

  // TypeScript transform aligned to monorepo tsconfig paths
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
        module: 'esnext',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        baseUrl: '.',
        paths: compilerOptions.paths || {}
      }
    }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Enable ESM support for Jest (moved to transform config)
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@athlete-ally/.*))'],

  testTimeout: 15000,
  passWithNoTests: true,
  verbose: true,
  // Remove deprecated options that cause warnings
  // runInBand is handled by CI, not config
  // testTimeout is already set above
};

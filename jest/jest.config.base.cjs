// Base Jest config for monorepo (CommonJS to avoid ESM interop issues)
const fs = require('fs');
const path = require('path');
const { pathsToModuleNameMapper } = require('ts-jest');

// Robustly load tsconfig compilerOptions. Supports a root wrapper tsconfig.base.json
// that extends the centralized config under config/typescript/tsconfig.base.json, and
// tolerates JSON comments. Falls back gracefully if files are missing.
function readJsonSafe(p) {
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const noComments = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    return JSON.parse(noComments);
  } catch {
    return null;
  }
}

function loadCompilerOptions() {
  const candidates = [
    path.resolve(__dirname, '../tsconfig.base.json'),
    path.resolve(__dirname, '../config/typescript/tsconfig.base.json'),
  ];

  for (const p of candidates) {
    const cfg = readJsonSafe(p);
    if (!cfg) continue;
    if (cfg.compilerOptions) return cfg.compilerOptions;
    if (cfg.extends) {
      const extPath = path.isAbsolute(cfg.extends)
        ? cfg.extends
        : path.resolve(path.dirname(p), cfg.extends);
      const extCfg = readJsonSafe(extPath);
      if (extCfg && extCfg.compilerOptions) return extCfg.compilerOptions;
    }
  }
  return {};
}

const compilerOptions = loadCompilerOptions();

module.exports = {
  rootDir: '..',
  preset: 'ts-jest',
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Module resolution mapping (order matters - specific before generic)
  moduleNameMapper: {
    // @athlete-ally packages (specific mappings first)
    // Use CJS builds for packages that have them (Jest compatibility)
    '^@athlete-ally/logger$': '<rootDir>/packages/logger/dist/index.cjs',
    '^@athlete-ally/logger/browser$': '<rootDir>/packages/logger/dist/adapters/browser.cjs',
    '^@athlete-ally/logger/server$': '<rootDir>/packages/logger/dist/adapters/node.cjs',
    '^@athlete-ally/database-utils$': '<rootDir>/packages/database-utils/src',
    '^@athlete-ally/shared/fastify-augment$': '<rootDir>/packages/shared/dist/fastify-augment.cjs',
    '^@athlete-ally/event-bus$': '<rootDir>/packages/event-bus/src',
    '^@athlete-ally/protocol-types$': '<rootDir>/packages/protocol-types/src',
    '^@athlete-ally/contracts$': '<rootDir>/packages/contracts/events',
    '^@athlete-ally/contracts/events/(.*)$': '<rootDir>/packages/contracts/events/$1',
    '^@athlete-ally/contracts/(.*)$': '<rootDir>/packages/contracts/$1',
    '^@athlete-ally/(.*)$': '<rootDir>/packages/$1/src',
    
    // Legacy test data shims
    '^\\.\\.\\/helpers\\/test-data$': '<rootDir>/apps/frontend/tests/_stubs/test-data.ts',
    
    // Specific db.js mappings (precedence over generic ESM rule)
    '^services/planning-engine/src/db\\.js$': '<rootDir>/services/planning-engine/src/db.ts',
    
    // ESM compatibility (.js imports in TypeScript) - must be last
    '^(\\.{1,2}/.*)\\.js$': '$1',
    
    // TypeScript path mappings from tsconfig
    ...(pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' }))
  },

  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
        module: 'esnext',
        moduleResolution: 'node16',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        baseUrl: '.',
        paths: compilerOptions.paths || {}
      }
    }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Enable ESM support for Jest
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@athlete-ally/.*))'],
  
  // Test configuration - removed deprecated options for Jest 29.7.0 compatibility
};


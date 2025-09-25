# Jest Configuration for Planning Engine Service

This document explains the Jest configuration for the `planning-engine` service and how it integrates with the monorepo's testing infrastructure.

## Overview

The planning-engine service uses a custom Jest configuration (`jest.config.cjs`) that extends the base monorepo configuration while adding service-specific module mappings and ESM support.

## Configuration Hierarchy

```
jest/jest.config.base.cjs (monorepo base)
    ↓ extends
services/planning-engine/jest.config.cjs (service-specific)
```

## Key Features

### 1. ESM Support
- **`extensionsToTreatAsEsm: ['.ts']`**: Treats TypeScript files as ESM modules
- **`useESM: true`**: Enables ESM support in ts-jest transformer
- **`.js` import mapping**: Handles `.js` imports in TypeScript files

### 2. Module Name Mapping
The configuration includes specific mappings for `@athlete-ally` packages:

```javascript
moduleNameMapper: {
  // Handle .js imports in TypeScript files (ESM compatibility)
  '^(\\.{1,2}/.*)\\.js$': '$1',
  
  // Specific @athlete-ally package mappings (from tsconfig.base.json)
  '^@athlete-ally/contracts$': '<rootDir>/packages/contracts/events',
  '^@athlete-ally/event-bus$': '<rootDir>/packages/event-bus/src',
  '^@athlete-ally/shared$': '<rootDir>/packages/shared/src',
  '^@athlete-ally/shared-types$': '<rootDir>/packages/shared-types/src',
  '^@athlete-ally/protocol-types$': '<rootDir>/packages/protocol-types/src',
  
  // Generic @athlete-ally package mapping
  '^@athlete-ally/(.*)$': '<rootDir>/packages/$1/src',
}
```

### 3. Test File Patterns
- **`roots: ['<rootDir>/services/planning-engine']`**: Scopes tests to this service
- **`testMatch`**: Matches test files in `__tests__` directories
- **`setupFilesAfterEnv`**: Loads service-specific test setup

## Root Directory Configuration

The `rootDir` is set to `'../..'` (relative to the monorepo root) to ensure:
- Correct path resolution for `@athlete-ally` packages
- Proper module mapping to monorepo packages
- Consistent test environment across services

## ESM Compatibility

The configuration handles ESM/CommonJS interop issues by:
1. Mapping `.js` imports to their TypeScript equivalents
2. Using `ts-jest` with ESM support
3. Inheriting base configuration for consistent behavior

## Usage

Run tests for the planning-engine service:

```bash
# From monorepo root
npm run test:services

# Or directly from service directory
cd services/planning-engine
npm test
```

## Troubleshooting

### Module Resolution Issues
If you encounter "Could not locate module" errors:
1. Check that the package exists in `packages/`
2. Verify the mapping in `moduleNameMapper`
3. Ensure the package has proper `src/index.ts` or entry point

### ESM Import Issues
If you see "Cannot use import statement outside a module" errors:
1. Ensure the file has `.ts` extension
2. Check that `extensionsToTreatAsEsm` includes `.ts`
3. Verify the import path doesn't use `.js` extension

### Test Setup Issues
If tests fail to initialize:
1. Check `setupFilesAfterEnv` path is correct
2. Ensure setup file exists at the specified location
3. Verify setup file exports are compatible with ESM

## Related Files

- `jest/jest.config.base.cjs`: Base monorepo Jest configuration
- `tsconfig.base.json`: TypeScript path mappings
- `services/planning-engine/src/__tests__/setup.ts`: Test setup file
- `services/planning-engine/package.json`: Service package configuration

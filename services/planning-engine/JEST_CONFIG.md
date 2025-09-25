# Planning Engine Jest Configuration

## Overview
This service uses a dedicated Jest configuration to handle ESM modules and TypeScript compilation.

## Configuration Hierarchy
```
jest.projects.cjs (orchestrator)
├── jest.config.services.cjs (services layer)
└── services/planning-engine/jest.config.cjs (this service)
```

## Key Features
- **ESM Support**: `useESM: true` with proper module mapping
- **TypeScript**: ts-jest transformer with ESM configuration
- **Module Resolution**: Handles `.js` imports in TypeScript files
- **Package Mapping**: Resolves `@athlete-ally/*` packages correctly

## Usage
```bash
# Run tests for this service only
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Configuration Details
- **rootDir**: `../..` (relative to service directory)
- **testEnvironment**: `node`
- **setupFilesAfterEnv**: Local setup file for test environment
- **moduleNameMapper**: Handles ESM imports and package resolution

## Notes
- This configuration is isolated from the orchestrator
- ESM-specific settings don't interfere with other services
- All test files use `.ts` extensions for imports

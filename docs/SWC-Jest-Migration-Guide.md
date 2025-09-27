\n> DEPRECATED: Repo has migrated back to ts-jest due to Alpine SWC instability. This document is retained for historical reference. The shared SWC config ((removed)) has been removed.\n\n## Overview

This guide documents the migration from `ts-jest` to `@swc/jest` for Node.js services in the monorepo. SWC provides faster compilation and better performance for TypeScript testing.

## Performance Comparison

| Service | ts-jest Runtime | @swc/jest Runtime | Improvement |
|---------|----------------|-------------------|-------------|
| exercises | ~4.5s | ~4.5s | Baseline |
| fatigue | ~3.7s | ~3.7s | Baseline |
| analytics | 1.93s | 3.26s | -69% (slower) |
| job-scheduler | 4.71s | 3.13s | +33% (faster) |

*Note: Performance varies by service complexity and test suite size. @swc/jest shows mixed results with small test suites.*

*Note: Performance gains are more noticeable with larger test suites and complex TypeScript features.*

## Migration Steps

### 1. Install Dependencies

```bash
cd services/[service-name]
npm install --save-dev @swc/core @swc/jest
```

### 2. Update Jest Configuration

Replace `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/__tests__/setup.ts'
  ],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['@swc/jest', { 
      configFile: '../../(removed)' 
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  testTimeout: 10000,
  passWithNoTests: true
};
```

**Important**: Use the shared SWC configuration file at `(removed)` to ensure consistency across services.

### 3. Validation Steps

1. **List Tests**: `npx jest --listTests`
2. **Run Tests**: `npm test`
3. **Check Coverage**: `npm run test:coverage` (if available)
4. **Type Check**: `npm run type-check`

### 4. Configuration Notes

- **Decorators**: SWC supports experimental decorators and metadata
- **Target**: ES2020 for modern Node.js compatibility
- **Module**: CommonJS for Jest compatibility
- **Frontend**: Keep `ts-jest` for frontend tests (jsdom environment)

## Services Migrated

- ✅ `exercises` - 4.5s runtime
- ✅ `fatigue` - 3.7s runtime
- ✅ `analytics` - 3.26s runtime (was 1.93s with ts-jest)
- ✅ `job-scheduler` - 3.13s runtime (was 4.71s with ts-jest)

## Services Pending

- `workouts`
- `planning-engine`
- `profile-onboarding`
- `protocol-engine`

## Troubleshooting

### Common Issues

1. **Decorator Support**: Ensure `legacyDecorator: true` and `decoratorMetadata: true`
2. **Module Resolution**: Use `type: 'commonjs'` for Jest compatibility
3. **TypeScript Features**: Some advanced TS features may need adjustment

### Rollback

To rollback to `ts-jest`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // ... rest of config
};
```

## Best Practices

1. **Gradual Migration**: Migrate one service at a time
2. **Performance Monitoring**: Measure runtime improvements
3. **Test Coverage**: Ensure no regressions in test coverage
4. **Documentation**: Update service-specific docs if needed

## Future Considerations

- Monitor SWC updates for better TypeScript support
- Consider migrating frontend tests when jsdom support improves
- Evaluate SWC for build processes (not just testing)

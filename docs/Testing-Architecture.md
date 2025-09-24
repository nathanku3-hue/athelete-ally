# Testing Architecture

This document outlines the testing architecture for the Athlete Ally monorepo.

## Overview

We use a layered testing approach with multiple frameworks optimized for different testing needs:

- **Jest**: Unit and integration tests
- **Playwright**: End-to-end (E2E) tests
- **Layered Configurations**: Environment-specific test setups

## Jest Configuration Layers

### Base Configuration (`jest/jest.config.base.cjs`)
- Common settings for all Jest tests
- TypeScript support with `ts-jest`
- Module resolution from `tsconfig.base.json`
- ESM support for modern JavaScript

### Frontend Configuration (`jest/jest.config.frontend.cjs`)
- **Environment**: `jsdom` (browser simulation)
- **Scope**: React components, hooks, frontend utilities
- **Test Pattern**: `apps/frontend/**/*.test.{ts,tsx}`
- **Usage**: `npm run test:frontend`

### Services Configuration (`jest/jest.config.services.cjs`)
- **Environment**: `node` (server environment)
- **Scope**: Backend services, API clients, utilities
- **Test Pattern**: `services/**/*.test.{ts,js}`
- **Usage**: `npm run test:services`

### Integration Configuration (`jest/jest.config.integration.cjs`)
- **Environment**: `node` (server environment)
- **Scope**: Cross-service integration tests
- **Test Pattern**: `**/*.integration.test.{ts,js}`
- **Usage**: `npm run test:integration`

### Projects Orchestrator (`jest/jest.projects.cjs`)
- Runs all projects in parallel
- Single entry point: `npm run test:projects`
- Coverage collection across all layers
- **Migration Path**: Root `jest.config.js` is deprecated; use layered configs or orchestrator

## Playwright E2E Testing

### Configuration (`playwright.config.ts`)
- **Browser**: Chromium only (CI-friendly)
- **Mode**: Non-blocking in CI (`continue-on-error: true`)
- **Scope**: Critical user journeys and API endpoints
- **Usage**: `npm run e2e:pw`

### Test Structure
- **Location**: `apps/frontend/tests/e2e/`
- **Pattern**: `*.spec.ts`
- **Examples**: Health checks, authentication flows

### CI Integration
- Separate job in `.github/workflows/ci.yml`
- Runs after frontend build
- Uploads test artifacts on failure
- Non-blocking (doesn't fail the entire CI pipeline)

## Testing Guidelines

### Jest Globals Usage
```typescript
// ✅ Correct: Use @jest/globals for explicit imports
import { describe, it, expect, beforeEach } from '@jest/globals';

// ❌ Avoid: Implicit globals (can cause conflicts)
describe('My test', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['vitest'],
            message: 'Use @jest/globals instead of vitest imports',
          },
        ],
      },
    ],
  },
};
```

### Test File Naming
- **Unit tests**: `*.test.{ts,tsx,js}`
- **Integration tests**: `*.integration.test.{ts,js}`
- **E2E tests**: `*.spec.ts` (Playwright)

### Environment-Specific Testing
- **Frontend**: Use `jsdom` for React component testing
- **Services**: Use `node` for server-side testing
- **E2E**: Use Playwright for browser automation

## Migration Notes

### From Vitest to Jest
- Replace `import { ... } from 'vitest'` with `import { ... } from '@jest/globals'`
- Update test configurations to use Jest presets
- Remove Vitest-specific configurations

### Module Resolution
- Jest automatically resolves TypeScript paths from `tsconfig.base.json`
- Use relative imports for local modules
- Avoid `.js` extensions in TypeScript imports
- **ESM Transition Support**: Jest base config includes mapper `'^(\.{1,2}/.*)\.js$': '$1'` to handle `.js` suffixes during TypeScript/ESM migration

## CI/CD Integration

### Test Execution Order
1. **Lint and Type Check**: ESLint, TypeScript compiler
2. **Unit Tests**: Jest frontend and services tests
3. **Build**: Frontend and backend builds
4. **E2E Tests**: Playwright tests (non-blocking)

### Coverage Requirements
- Minimum 80% line coverage for new code
- Coverage reports generated in `coverage/` directory
- HTML reports available in CI artifacts

## Troubleshooting

### Common Issues

#### Module Resolution Errors
```bash
# Error: Cannot find module '@athlete-ally/shared/auth/jwt'
# Solution: Check tsconfig.base.json paths configuration
```

#### Jest Environment Conflicts
```bash
# Error: Cannot redeclare block-scoped variable 'describe'
# Solution: Remove redundant @jest/globals imports
```

#### Playwright Server Issues
```bash
# Error: Cannot find module 'server.js'
# Solution: Use 'npm run start' instead of direct server.js path
```

### Debug Commands
```bash
# Run specific test suites
npm run test:frontend
npm run test:services

# Run with verbose output
npm run test:frontend -- --verbose

# Run Playwright with debug mode
npm run e2e:pw -- --debug
```

## Future Improvements

- [ ] Add visual regression testing with Playwright
- [ ] Implement test data factories
- [ ] Add performance testing with Lighthouse
- [ ] Expand integration test coverage
- [ ] Add contract testing between services

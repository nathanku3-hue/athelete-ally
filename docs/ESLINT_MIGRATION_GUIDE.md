# ESLint & Logging Migration Guide

## Overview

This guide outlines the migration from the current ESLint setup to a unified, high-leverage configuration that eliminates config drift and improves developer experience.

## What Changed

### 1. Unified ESLint Configuration
- **Before**: Multiple ESLint configs (`eslint.config.mjs`, `config/linting/eslint.config.strict.mjs`)
- **After**: Single source of truth (`eslint.config.unified.mjs`) with targeted overrides

### 2. TypeScript Unused Detection
- **Before**: ESLint handled unused variables (`@typescript-eslint/no-unused-vars`)
- **After**: TypeScript handles unused detection (`noUnusedLocals`, `noUnusedParameters`)

### 3. Structured Logging Policy
- **Before**: Console statements commented out
- **After**: Proper logging with ESLint exceptions for `console.warn`/`console.error`

### 4. CI Guardrails
- **Before**: Basic boundaries check
- **After**: Config validation, changed-files linting, baseline monitoring

## Migration Steps

### Step 1: Update ESLint Configuration
```bash
# Replace old config with unified config
mv eslint.config.mjs eslint.config.mjs.backup
mv eslint.config.unified.mjs eslint.config.mjs
```

### Step 2: Update CI Workflows
```bash
# Replace boundaries-check.yml with new guardrails workflow
mv .github/workflows/boundaries-check.yml .github/workflows/boundaries-check.yml.backup
# New workflow is already created: .github/workflows/eslint-guardrails.yml
```

### Step 3: Update Package Scripts
```bash
# New scripts are already added to package.json
npm run lint:frontend    # Lint only frontend
npm run lint:services    # Lint only services  
npm run lint:packages    # Lint only packages
npm run lint:changed     # Lint with caching
```

### Step 4: Replace Console Statements
```typescript
// Before
console.log('Debug info');
console.error('Error occurred');

// After
import { logger } from '@athlete-ally/shared/structured-logging';
logger.info('Debug info', 'frontend');
logger.error('Error occurred', error, 'api');
```

### Step 5: Update Import Statements
```typescript
// Before - these will now work without ESLint errors
import { NextRequest, NextResponse } from 'next/server';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// After - same imports, but now properly allowed
```

## Configuration Details

### ESLint Rules by Workspace

#### Frontend (`apps/frontend/`)
- ✅ Allows Next.js imports (`next/*`, `next/navigation`, `next/server`)
- ✅ Allows console.warn/error (blocks console.log)
- ✅ Relaxed unused vars (handled by TypeScript)
- ✅ React-specific rules enabled

#### Services (`services/`)
- ✅ Allows console statements
- ✅ Allows CommonJS imports
- ✅ Relaxed unused vars (handled by TypeScript)

#### Packages (`packages/`)
- ✅ Strict unused vars (handled by TypeScript)
- ✅ Blocks console.log (allows console.warn/error)
- ✅ Enforces named exports

#### Scripts (`scripts/`)
- ✅ Fully relaxed rules
- ✅ Allows console statements
- ✅ Allows CommonJS imports

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Logging Policy
- **Client**: Allow `console.warn`/`console.error`, block `console.log`
- **Server**: Allow all console statements
- **Structured**: Use `@athlete-ally/shared/structured-logging` for production

## Verification

### 1. Config Validation
```bash
# Check ESLint config
npx eslint --print-config eslint.config.mjs | head -20

# Check TypeScript config
npx tsc --showConfig --project tsconfig.base.json | head -20
```

### 2. Linting Tests
```bash
# Test frontend linting
npm run lint:frontend

# Test services linting  
npm run lint:services

# Test changed files only
npm run lint:changed apps/frontend/src/app/dashboard/page.tsx
```

### 3. Type Checking
```bash
# Check for unused variables
npm run type-check
```

## Benefits

### 1. Eliminated Config Drift
- Single ESLint config for all environments
- CI and local use same configuration
- No more "works locally but fails in CI"

### 2. Improved Performance
- TypeScript handles unused detection (faster)
- ESLint caching enabled
- Changed-files-only linting in CI

### 3. Better Developer Experience
- Clear logging policy
- Appropriate rules per workspace type
- Reduced noise from overlapping rules

### 4. Maintainable Architecture
- Layer direction enforcement
- Clear boundaries between workspaces
- Consistent error handling

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors
```bash
# Ensure TypeScript paths are correct
npm run type-check
```

#### 2. ESLint config not found
```bash
# Check config file exists
ls -la eslint.config.mjs
```

#### 3. Console statements still flagged
```bash
# Check if you're using console.log (not allowed)
# Use console.warn/error or structured logging instead
```

#### 4. Import errors persist
```bash
# Check if import is in the allowlist
# Update eslint.config.mjs if needed
```

## Next Steps

1. **Monitor CI**: Watch for config drift warnings
2. **Gradual Migration**: Replace console statements over time
3. **Team Training**: Share logging policy with team
4. **Baseline Tracking**: Monitor lint report trends

## Support

For issues or questions:
1. Check CI logs for config validation errors
2. Review ESLint output for specific rule violations
3. Consult this guide for common solutions
4. Update documentation as needed

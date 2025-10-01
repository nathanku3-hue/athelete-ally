# Prisma Client Import Standard

## Overview

This document defines the standard for Prisma client imports across all services in the Athlete Ally monorepo to prevent architectural drift and runtime errors.

## The Problem

We encountered a persistent "Prisma client did not initialize yet" error due to architectural mismatch between:
- **Prisma Schema**: Custom output path (`./generated/client`)
- **Code Import**: Default location (`@prisma/client`)

This mismatch caused services to fail at runtime despite successful Prisma generation.

## Standard: Default Prisma Client (Option 1)

**Chosen Approach**: Use default `@prisma/client` imports across all services.

### Benefits
- ✅ Simpler configuration
- ✅ Standard Prisma practice
- ✅ Less maintenance overhead
- ✅ Clearer for new developers
- ✅ Consistent with Prisma documentation

### Implementation

#### For Services with Custom Output Paths
1. **Remove custom output** from `prisma/schema.prisma`:
   ```prisma
   generator client {
     provider = "prisma-client-js"
     // Remove: output = "./generated/client"
   }
   ```

2. **Update imports** to use default path:
   ```typescript
   // Before
   import { PrismaClient } from '../prisma/generated/client';
   
   // After
   import { PrismaClient } from '@prisma/client';
   ```

3. **Regenerate Prisma client**:
   ```bash
   npx prisma generate
   ```

#### For Services Already Using Default Paths
- ✅ No changes needed
- ✅ Continue using `@prisma/client`

## Consistency Check

### Automated Check
Run the consistency checker to verify all services follow the standard:

```bash
node scripts/prisma-consistency-check.js
```

### Manual Verification
For each service with a `prisma/schema.prisma` file:

1. **Check schema output**:
   ```bash
   grep -n "output" services/<service>/prisma/schema.prisma
   ```
   - Should show no custom output (or empty result)

2. **Check imports**:
   ```bash
   grep -r "from.*prisma" services/<service>/src/
   ```
   - Should show `from '@prisma/client'`
   - Should NOT show `from '../prisma/generated/client'`

## CI Integration

### Prisma Generation
Ensure all services with Prisma schemas generate their clients:

```yaml
- name: Generate Prisma clients
  run: |
    for service in services/*/; do
      if [ -f "$service/prisma/schema.prisma" ]; then
        echo "Generating Prisma client for $(basename $service)"
        cd "$service" && npx prisma generate
      fi
    done
```

### Consistency Check
Add to CI pipeline:

```yaml
- name: Check Prisma consistency
  run: node scripts/prisma-consistency-check.js
```

## Migration Checklist

### Services Requiring Migration
- [ ] `ingest-service`
- [ ] `protocol-engine`
- [ ] `insights-engine`
- [ ] `planning-engine`
- [ ] `exercises`
- [ ] `workouts`
- [ ] `profile-onboarding`
- [ ] `fatigue`

### Migration Steps per Service
1. [ ] Remove `output = "./generated/client"` from schema
2. [ ] Update all imports from `../prisma/generated/client` to `@prisma/client`
3. [ ] Run `npx prisma generate`
4. [ ] Test service startup
5. [ ] Verify consistency check passes

## ESLint Rules

Add ESLint rules to prevent drift:

```javascript
// .eslintrc.js
rules: {
  'import/no-internal-modules': [
    'error',
    {
      allow: ['@prisma/client'],
      forbid: ['../prisma/generated/client', './prisma/generated/client']
    }
  ]
}
```

## Troubleshooting

### "Prisma client did not initialize yet"
- **Cause**: Import path doesn't match schema output
- **Fix**: Run consistency check and fix mismatches

### Import resolution errors
- **Cause**: Missing Prisma generation
- **Fix**: Run `npx prisma generate` in service directory

### TypeScript errors
- **Cause**: Stale generated types
- **Fix**: Regenerate Prisma client and restart TypeScript server

## References

- [Prisma Client Generation](https://www.prisma.io/docs/concepts/components/prisma-client/generating-the-client)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#generator)
- [Monorepo Prisma Best Practices](https://www.prisma.io/docs/guides/other/troubleshooting-development#prisma-client-in-monorepos)

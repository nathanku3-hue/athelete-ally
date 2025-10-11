# Phase 3 PR3: API Prefix Enforcement & CI Alignment

## Status
**Planning** | **Target Branch:** `integration/phase3-rebuild-api-ci` | **Target Merge:** 24h after first green

## Context
After PR1 (EventBus typed getters + Fastify augmentation - PR#65) completes, PR3 will enforce API prefix consistency across services and clean up CI guardrail drift. This keeps the Phase 3 integration focused and tight (≤400 LOC).

## Objectives

### 1. Enforce `/api/v1` Prefix Across Services
**Problem:** Inconsistent API route prefixes across services
- Some services use `/api/v1/*`
- Others use `/*` or `/api/*`
- Gateway routing logic requires standardization

**Goal:** All service routes use `/api/v1` prefix for API endpoints

### 2. Clean Up Actionlint Drift
**Problem:** GitHub Actions workflow inconsistencies
- Node version mismatches (`20.18.0` vs `20.x`)
- Timeout variations (`timeout-minutes` missing in some jobs)
- Concurrency group patterns inconsistent

**Goal:** Standardize workflow patterns across all `.github/workflows/*.yml`

### 3. Align CI Guard Scripts
**Problem:** Guard script execution inconsistencies
- Some scripts use `node`, others use `npx tsx`
- Exit code handling varies
- Error messaging not standardized

**Goal:** Consistent script invocation and error handling

---

## Pre-Implementation Audit

### Phase 1: API Route Inventory (REQUIRED)

**Scan all service route definitions:**

```bash
# Find all route registrations
grep -r "\.get\(|\.post\(|\.put\(|\.delete\(|\.patch\(" services/*/src --include="*.ts" -n

# Find Fastify prefix registrations
grep -r "register.*prefix" services/*/src --include="*.ts" -n

# Find app.register calls
grep -r "app\.register\|fastify\.register" services/*/src --include="*.ts" -n
```

**Expected audit output:**

| Service | Current Prefix | Routes | Action Required |
|---------|---------------|--------|-----------------|
| ingest-service | `/` | `/oura/*`, `/health`, `/metrics` | ✅ Add `/api/v1` |
| normalize-service | `/` | `/health`, `/metrics` | ✅ Add `/api/v1` |
| planning-engine | `/api/v1` | `/plans`, `/health`, `/metrics` | ⏭️ Already correct |
| protocol-engine | `/` | `/protocols/*`, `/health` | ✅ Add `/api/v1` |
| workouts | `/` | `/sessions/*`, `/health` | ✅ Add `/api/v1` |
| fatigue | `/` | `/assessment`, `/health` | ✅ Add `/api/v1` |
| insights-engine | `/` | `/readiness`, `/health` | ✅ Add `/api/v1` |
| exercises | `/` | `/library`, `/health` | ✅ Add `/api/v1` |

**Note:** `/health` and `/metrics` endpoints should remain at root level (no prefix) for infrastructure compatibility.

---

### Phase 2: Actionlint Drift Inventory (REQUIRED)

**Scan workflow files:**

```bash
# Check Node version declarations
grep "node-version:" .github/workflows/*.yml

# Check timeout declarations
grep "timeout-minutes:" .github/workflows/*.yml

# Check concurrency groups
grep -A2 "concurrency:" .github/workflows/*.yml
```

**Expected issues:**

1. **Node Version Inconsistency:**
   - Some workflows: `node-version: 20.18.0` (specific)
   - Some workflows: `node-version: 20` or `20.x` (loose)
   - **Fix:** Standardize to `20.18.0` (matches root package.json)

2. **Missing Timeouts:**
   - Many jobs lack `timeout-minutes`
   - Risk: Hung jobs block CI
   - **Fix:** Add `timeout-minutes: 10` for most jobs

3. **Concurrency Group Patterns:**
   - Inconsistent group naming
   - **Fix:** Use `${{ github.workflow }}-${{ github.ref }}`

---

### Phase 3: CI Guard Script Inventory (REQUIRED)

**Current scripts in `scripts/ci/`:**

| Script | Invocation | Exit Codes | Status |
|--------|------------|------------|--------|
| `check-tsconfig-drift.cjs` | `node` | 0/1 | ✅ Good |
| `print-eslint-meta.mjs` | `node` | 0 | ✅ Good |
| `prisma-enforce.mjs` | `node` | 0/1 | ✅ Good |
| `prisma-generate.sh` | `bash` | 0/1 | ✅ Good |

**Action:** Verify all scripts have:
- Proper shebang (`#!/usr/bin/env node` or `#!/bin/bash`)
- Executable bit set (`chmod +x`)
- Consistent error messages
- Exit code 0 (success) or 1 (failure)

---

## Implementation Plan

### Step 1: Create Branch and Rebase (Day 0)

```bash
# Ensure we're on latest main
git checkout main
git pull origin main

# Create new branch
git checkout -b integration/phase3-rebuild-api-ci

# Rebase daily to stay current
git fetch origin main
git rebase origin/main
```

---

### Step 2: Enforce `/api/v1` Prefix (Services)

**For each service needing updates:**

#### Example: `services/ingest-service/src/index.ts`

**Before:**
```typescript
app.get('/health', async (request, reply) => { ... });
app.post('/oura/webhook', async (request, reply) => { ... });
```

**After:**
```typescript
// Health/metrics remain at root
app.get('/health', async (request, reply) => { ... });
app.get('/metrics', async (request, reply) => { ... });

// API routes use prefix
const apiRoutes = fastify();
apiRoutes.post('/oura/webhook', async (request, reply) => { ... });
app.register(apiRoutes, { prefix: '/api/v1' });
```

**Or (preferred for Fastify):**
```typescript
// Register route plugins with prefix
app.register(ouraRoutes, { prefix: '/api/v1' });
app.register(healthRoutes); // No prefix
```

**Validation:**
```bash
# Test local route registration
npm run dev -w @athlete-ally/ingest-service

# Verify routes
curl http://localhost:PORT/health  # Should work
curl http://localhost:PORT/api/v1/oura/webhook  # Should work
curl http://localhost:PORT/oura/webhook  # Should 404
```

---

### Step 3: Clean Up Actionlint Drift

**Target files:**
- All `.github/workflows/*.yml` files

**Changes per file:**

1. **Standardize Node version:**
```yaml
# Before
node-version: 20
# After
node-version: 20.18.0
```

2. **Add timeouts:**
```yaml
jobs:
  my-job:
    timeout-minutes: 10  # Add this
    runs-on: ubuntu-latest
```

3. **Standardize concurrency:**
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Validation:**
```bash
# Run actionlint locally
npx actionlint .github/workflows/*.yml

# Or use GitHub's action
gh workflow run actionlint.yml
```

---

### Step 4: Align CI Guard Scripts

**Review script execution in workflows:**

**.github/workflows/ci-guards.yml:**

**Before:**
```yaml
- run: node scripts/ci/check-tsconfig-drift.cjs
```

**After (if changes needed):**
```yaml
- name: Check tsconfig drift
  run: |
    set -euo pipefail
    node scripts/ci/check-tsconfig-drift.cjs || {
      echo "❌ Tsconfig drift detected"
      exit 1
    }
```

**Ensure consistency:**
- All `.cjs` scripts: `node script.cjs`
- All `.mjs` scripts: `node script.mjs`
- All `.sh` scripts: `bash script.sh` or `./script.sh`

---

## Validation Strategy

### Pre-Commit Checks

```bash
# 1. Build all affected services
npx turbo run build --filter=@athlete-ally/ingest-service \
  --filter=@athlete-ally/normalize-service \
  --filter=@athlete-ally/protocol-engine \
  --filter=@athlete-ally/workouts \
  --filter=@athlete-ally/fatigue \
  --filter=@athlete-ally/insights-engine \
  --filter=@athlete-ally/exercises

# 2. Type-check
npm run type-check

# 3. Lint workflows
npx actionlint .github/workflows/*.yml

# 4. Run CI guard scripts locally
node scripts/ci/check-tsconfig-drift.cjs
node scripts/ci/print-eslint-meta.mjs
node scripts/ci/prisma-enforce.mjs
```

### Route Smoke Tests

**Create:** `scripts/ci/smoke-test-routes.mjs`

```javascript
#!/usr/bin/env node
/**
 * Smoke test: Verify all services expose /health at root
 * and API routes at /api/v1/*
 */

const services = [
  { name: 'ingest-service', port: 3001, routes: ['/health', '/api/v1/oura/webhook'] },
  { name: 'normalize-service', port: 3002, routes: ['/health'] },
  // ... etc
];

for (const service of services) {
  console.log(`Testing ${service.name}...`);
  for (const route of service.routes) {
    const url = `http://localhost:${service.port}${route}`;
    // Test route accessibility
    const response = await fetch(url);
    if (!response.ok && route !== '/health') {
      throw new Error(`Route ${route} failed for ${service.name}`);
    }
  }
}

console.log('✅ All route prefixes validated');
```

**Add to CI:**
```yaml
- name: Smoke test API prefixes
  run: node scripts/ci/smoke-test-routes.mjs
```

---

## LOC Budget: ≤400 Lines

**Estimated changes:**

| Category | Files | Est. LOC |
|----------|-------|----------|
| Service route refactors | ~8 services × 20 lines | 160 |
| Workflow actionlint fixes | ~10 workflows × 10 lines | 100 |
| CI guard script updates | ~5 scripts × 10 lines | 50 |
| Route smoke test script | 1 new file | 80 |
| **Total** | | **390** ✅ |

**Buffer:** 10 lines for documentation/comments

---

## Merge Criteria

### Must Pass Before Merge:

1. ✅ All CI checks green (first pass within 24h window)
2. ✅ Route smoke tests pass locally
3. ✅ Actionlint reports 0 issues
4. ✅ No breaking changes to existing routes (use feature flags if needed)
5. ✅ Build/type-check passes for all affected services
6. ✅ Diff ≤400 LOC (excluding generated files)

### Timeline:

- **Day 0:** Create branch, run audits, plan changes
- **Day 0+2h:** Implement service prefix changes
- **Day 0+4h:** Implement actionlint fixes
- **Day 0+6h:** Align CI scripts, add smoke tests
- **Day 0+8h:** Commit, push, open PR
- **Day 0+10h:** First CI run completes (target: green)
- **Day 1:** If green → merge. If red → fix within 24h.

---

## Post-Merge Integration Tasks

### Task 1: Rehydrate `release/phase3-foundation`

**After PR3 merges to main:**

```bash
# Checkout release branch
git checkout release/phase3-foundation

# Merge main
git merge main --ff-only

# Push updated release branch
git push origin release/phase3-foundation
```

### Task 2: Run End-to-End Checks

**NATS Stream Verification:**

```bash
# 1. Update NATS streams (if different)
bash scripts/nats-setup.sh update-if-different

# 2. Verify stream info
nats stream info ATHLETE_ALLY_EVENTS
nats stream info AA_CORE_HOT

# 3. Test publish
nats pub ATHLETE_ALLY_EVENTS.test '{"type":"smoke_test"}'

# 4. Verify subscription
nats sub ATHLETE_ALLY_EVENTS.test
```

**Service Health Checks:**

```bash
# For each service, verify /health and /metrics
for service in ingest normalize planning protocol workouts fatigue insights exercises; do
  echo "=== $service ==="
  curl http://localhost:${PORT}/health
  curl http://localhost:${PORT}/metrics
  curl http://localhost:${PORT}/api/v1/status || echo "No status endpoint"
done
```

**Capture Results:**

Create `docs/phase3/integration-test-results.md`:

```markdown
# Phase 3 Integration Test Results

## Date: [YYYY-MM-DD]

### NATS Verification
- [ ] Streams updated successfully
- [ ] Stream info returns expected subjects
- [ ] Publish test succeeds
- [ ] Subscription test succeeds

### Service Health Checks
- [ ] ingest-service: /health ✅ /metrics ✅
- [ ] normalize-service: /health ✅ /metrics ✅
- [ ] planning-engine: /health ✅ /metrics ✅ /api/v1/plans ✅
... etc
```

---

## Parallel Reliability Work

### Remaining P1 Items (Deadline: 2025-10-17)

**Must complete before 2025-10-17:**

1. ✅ Jest standardization (PR#60 - DONE)
2. ✅ Code Quality policy (PR#63 - DONE)
3. ✅ Logger dist exports (PR#64 - DONE)
4. ⏳ **Dist exports phase 2** (contracts, protocol-types, telemetry-bootstrap)
   - Audit consumers (see `docs/reliability/dist-exports-dependency-audit.md`)
   - Add missing dependencies
   - Automated check script
5. ⏳ **CI exception cleanup**
   - Remove all temporary `continue-on-error` flags
   - Verify all gates are enforcing
   - Update deadline tracking

**Timeline:**
- Phase 3 PR3: Complete by Day 1 (24h window)
- Dist exports phase 2: Start Day 2, complete by Day 5
- CI exception cleanup: Day 6-7

---

## Risk Mitigation

### Risk 1: Breaking Existing Routes

**Mitigation:**
- Keep old routes as aliases initially
- Add deprecation warnings
- Monitor gateway logs for 404s
- Use feature flag if needed:

```typescript
const USE_API_V1_PREFIX = process.env.USE_API_V1_PREFIX === 'true';
const prefix = USE_API_V1_PREFIX ? '/api/v1' : '/';
app.register(apiRoutes, { prefix });
```

### Risk 2: LOC Budget Exceeded

**Mitigation:**
- Keep changes minimal
- Extract large refactors to separate PR
- Focus on prefix/actionlint only
- Defer non-critical CI script changes

### Risk 3: CI Failure After Merge

**Mitigation:**
- Test workflows locally with `act` or GitHub CLI
- Rebase daily to catch integration issues early
- Have rollback plan ready:

```bash
# Rollback if PR causes issues
git revert <PR-merge-commit>
git push origin main
```

---

## Success Criteria

✅ All services use `/api/v1` prefix for API routes
✅ `/health` and `/metrics` remain at root level
✅ Actionlint reports 0 issues across all workflows
✅ CI guard scripts execute consistently
✅ Route smoke tests pass
✅ Diff ≤400 LOC
✅ Merged within 24h of first green CI run
✅ Release branch rehydrated successfully
✅ End-to-end checks documented

---

## References

- Phase 3 Roadmap: `AUTONOMOUS_TODO.md`
- Reliability Focus: `docs/reliability/dist-exports-dependency-audit.md`
- Code Quality Policy: `docs/ci/code-quality-policy.md`
- PR#65: Typed EventBus getters + Fastify augmentation
- PR#64: Logger dist exports

---

## Next Steps

**AWAITING APPROVAL:**

Once approved, execute:
1. Run Phase 1 audit (API routes inventory)
2. Run Phase 2 audit (actionlint drift)
3. Run Phase 3 audit (CI scripts)
4. Create branch `integration/phase3-rebuild-api-ci`
5. Implement changes per plan
6. Open PR with validation results
7. Merge within 24h if green
8. Execute post-merge integration tasks

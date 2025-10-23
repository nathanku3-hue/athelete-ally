# ESLint Dependency Conflict Fix

## 🚨 Critical Issue

**CI is completely blocked** - `npm ci` fails with dependency resolution error.

## 🔍 Root Cause

**Conflicting ESLint versions in monorepo:**

```
Root package.json (line 152):
  eslint: "8.57.1"
  @typescript-eslint/eslint-plugin: "8.45.0"

services/coach-tip-service/package.json (line 31-33):
  eslint: "^9.0.0"
  @typescript-eslint/eslint-plugin: "^8.0.0"
```

**Error:** TypeScript ESLint plugin v7.18.0 gets resolved somewhere and requires ESLint ^8.56.0, but coach-tip-service has ESLint 9.x.

## ✅ Recommended Fix

### Update coach-tip-service to use ESLint 8.x

**File:** `services/coach-tip-service/package.json`

**Change:**
```json
{
  "devDependencies": {
    "@eslint/js": "^9.0.0",          // Keep as-is
    "@typescript-eslint/eslint-plugin": "8.45.0",  // Change from ^8.0.0
    "@typescript-eslint/parser": "8.45.0",          // Change from ^8.0.0  
    "eslint": "8.57.1",                             // Change from ^9.0.0
    "eslint-plugin-import": "^2.29.0"               // Keep as-is
  }
}
```

## 🎯 Implementation Steps

### Step 1: Create Fix Branch
```bash
git checkout fix/health-check-routes
git pull origin fix/health-check-routes
git checkout -b fix/eslint-dependency-conflict
```

### Step 2: Apply Fix
```bash
# Edit services/coach-tip-service/package.json
# Update the 3 lines shown above
```

### Step 3: Test Fix
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Try clean install
npm ci

# Should succeed now
```

### Step 4: Verify
```bash
# Check coach-tip-service linting still works
cd services/coach-tip-service
npm run lint

# Check type-check
npm run type-check
```

### Step 5: Commit and Push
```bash
git add services/coach-tip-service/package.json
git commit -m "fix: align coach-tip-service ESLint version with monorepo

- Change ESLint from ^9.0.0 to 8.57.1
- Change @typescript-eslint packages from ^8.0.0 to 8.45.0
- Resolves npm ci dependency conflict blocking CI"

git push origin fix/eslint-dependency-conflict
```

### Step 6: Update PR #104
```bash
# Merge fix into health-check PR
git checkout fix/health-check-routes
git merge fix/eslint-dependency-conflict
git push origin fix/health-check-routes
```

## 🔄 Alternative: Merge Both Fixes

**Option A:** Add ESLint fix to current PR
- Commit ESLint fix to `fix/health-check-routes` directly
- Updates existing PR #104
- Single PR with both fixes

**Option B:** Separate PR for ESLint (Cleaner)
- Create separate PR for ESLint fix
- Merge ESLint PR first
- Then merge health-check PR
- Keeps concerns separated

## ⏱️ Timeline

**Immediate (Option A):**
- Apply fix: 5 minutes
- Test locally: 5 minutes
- Push and wait for CI: 10-15 minutes
- **Total: ~25 minutes**

**Clean Separation (Option B):**
- Create ESLint PR: 10 minutes
- Wait for approval: Variable
- Merge ESLint PR: 5 minutes
- Health-check PR automatically benefits
- **Total: Depends on review time**

## ⚠️ Important Notes

### Why This Wasn't Caught Before
- coach-tip-service may not be frequently used/tested
- Local development might use `--legacy-peer-deps`
- Issue only surfaces on clean `npm ci`

### Impact Analysis
**Services Affected:**
- ✅ coach-tip-service (directly fixed)
- ✅ All other services (can now install dependencies)

**Breaking Changes:**
- None - ESLint 8.x is stable and widely used
- TypeScript ESLint plugin v8 supports ESLint 8.x

### Root Package Overrides
Consider adding to root `package.json` overrides:
```json
"overrides": {
  "eslint": "8.57.1",
  "@typescript-eslint/eslint-plugin": "8.45.0",
  "@typescript-eslint/parser": "8.45.0"
}
```

## 🎯 Recommended Action

**Use Option A (Add to Current PR):**
1. Fix ESLint conflict now
2. Commit to `fix/health-check-routes`
3. Single PR with both fixes
4. Unblocks CI completely
5. Can merge after approval

**Why Option A:**
- Fastest path to green CI
- Keeps deployment on track
- Both fixes are small and safe
- Already in fix/health-check-routes branch

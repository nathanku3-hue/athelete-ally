# Phase 1 Guardrails - Implementation Plan

## 📋 Decision Summary

**Approved:** Phase 1 quick-win guardrails (30 min effort, prevents dependency conflicts)  
**Timeline:** After Time Crunch rollout stabilizes  
**Deferred:** Phase 2+ guardrails until after 10%→100% flag ramp complete  

---

## 🎯 Current Priority Sequence

### 1. **Production Deployment** (NOW)
**Status:** ✅ PR #104 merged - ready to deploy  
**Actions:**
- Deploy planning-engine to Railway from main branch
- Verify health endpoints are accessible
- Confirm all dependencies install correctly

### 2. **LaunchDarkly Flag Rollout** (NEXT)
**Initial:** 10% traffic to Time Crunch Mode  
**Actions:**
- Enable `feature.stream5_time_crunch_mode` at 10%
- Monitor metrics for 24-48 hours
- Watch for errors, performance issues, user feedback

### 3. **Phase 1 Guardrails** (AFTER STABILIZATION)
**Trigger:** When 10% rollout shows green metrics  
**Timeline:** ~30 minutes implementation  
**Risk:** Low - only adds validation checks

### 4. **Complete Flag Ramp** (ONGOING)
**Sequence:** 10% → 25% → 50% → 100%  
**Duration:** ~1-2 weeks depending on metrics

### 5. **Phase 2+ Guardrails** (BACKLOG)
**Trigger:** After 100% rollout complete  
**Timeline:** 2-3 hours implementation  

---

## 🚀 Phase 1 Guardrails - Implementation Guide

### What Gets Added

**3 Changes (Total: 30 minutes):**
1. ✅ CI workflow update - Add `npm run deps:lint` before `npm ci`
2. ✅ Pre-commit hook - Add dependency validation
3. ✅ Enable git hooks - Run `npm run hooks:enable`

### Detailed Implementation Steps

#### Step 1: Update CI Workflow (10 min)

**File:** `.github/workflows/ci.yml`

**Find this section:**
```yaml
- name: Install Dependencies
  run: npm ci --no-audit --no-fund
```

**Change to:**
```yaml
- name: Validate Dependency Consistency
  run: npm run deps:lint
  
- name: Install Dependencies
  run: npm ci --no-audit --no-fund
```

**Why:**
- Fails fast if workspace dependencies diverge
- Clear error message about which packages conflict
- Prevents blocking entire CI pipeline

**Impact:**
- Adds ~10 seconds to CI runtime
- Prevents 40+ minute debugging sessions

---

#### Step 2: Add Pre-Commit Hook (10 min)

**File:** `.githooks/pre-commit`

**Create if doesn't exist:**
```bash
#!/bin/bash
set -e

echo "🔍 Validating dependency consistency..."

# Check for dependency version mismatches
if ! npm run deps:lint --silent; then
  echo ""
  echo "❌ Dependency version mismatch detected!"
  echo ""
  echo "To fix:"
  echo "  npm run deps:fix"
  echo ""
  echo "Or to skip this check:"
  echo "  git commit --no-verify"
  echo ""
  exit 1
fi

echo "✅ Dependency validation passed"
```

**Make executable:**
```bash
chmod +x .githooks/pre-commit
```

**Why:**
- Catches issues before commit
- Prevents CI failures
- Gives immediate feedback to developer

**Impact:**
- Adds ~2 seconds per commit
- Zero impact if dependencies are consistent

---

#### Step 3: Enable Git Hooks (5 min)

**Ensure package.json has:**
```json
{
  "scripts": {
    "hooks:enable": "git config core.hooksPath .githooks"
  }
}
```

**Already exists:** ✅ (line 86 in root package.json)

**Run:**
```bash
npm run hooks:enable
```

**Why:**
- Activates the pre-commit hook
- One-time setup per developer
- Can be disabled with `--no-verify` if needed

---

#### Step 4: Verify Setup (5 min)

**Test the guardrail:**
```bash
# 1. Temporarily break a dependency version
cd services/coach-tip-service
# Change tsx version to something wrong

# 2. Try to commit
git add package.json
git commit -m "test: verify guardrail"

# Expected result: ❌ Commit blocked with helpful message

# 3. Fix with deps:fix
npm run deps:fix

# 4. Try commit again
git commit -m "test: verify guardrail"

# Expected result: ✅ Commit succeeds
```

---

## 📦 Follow-up PR Template

**Branch:** `chore/phase1-dependency-guardrails`

**PR Title:** `chore: add Phase 1 dependency consistency guardrails`

**PR Description:**
```markdown
## 🎯 Purpose

Add automated dependency version validation to prevent workspace drift issues.

## ✅ Changes

1. **CI Workflow Enhancement**
   - Add `npm run deps:lint` before `npm ci`
   - Fails fast if dependencies are inconsistent
   - Adds ~10 seconds to CI runtime

2. **Pre-Commit Hook**
   - Validates dependencies before commit
   - Provides helpful fix instructions
   - Adds ~2 seconds per commit

3. **Documentation**
   - Enable git hooks instruction in README

## 🔍 Why Now

Prevents recurrence of issues from PR #104:
- ESLint version conflicts
- tsx version mismatches
- npm ci lockfile sync errors

## ✅ Tested

- [x] CI workflow tested on branch
- [x] Pre-commit hook tested locally
- [x] deps:lint catches known mismatches
- [x] deps:fix resolves mismatches
- [x] Hook can be bypassed with --no-verify

## 📊 Impact

**Benefits:**
- Prevents 40+ min debugging sessions
- Catches issues pre-commit (dev feedback)
- Unblocks CI when conflicts occur

**Costs:**
- +10 sec CI runtime (one-time per run)
- +2 sec commit time (when checking)

**ROI:** Positive after 2 occurrences

## 🚦 Risk Assessment

**Risk Level:** LOW
- Only adds validation, no behavior changes
- Can be bypassed if needed (--no-verify)
- Already using syncpack (just activating it)

## 📋 Rollout Plan

1. Merge this PR
2. Team members run: `npm run hooks:enable`
3. Monitor for false positives (none expected)
```

---

## 📊 Metrics to Watch

### During Production Deployment

**Health Endpoints:**
- ✅ `/health` returns 200
- ✅ `/health/ready` returns 200
- ✅ `/metrics` accessible

**Service Health:**
- Database connection stable
- Redis connection stable
- NATS connection stable (if enabled)

**Error Rates:**
- Zero 404s on health endpoints
- No deployment verification failures

---

### During 10% Flag Rollout

**Time Crunch Mode Metrics:**
- Conversion rate (preview → usage)
- Compression strategy distribution
- Error rates (should be <0.1%)
- Response times (should be <500ms p95)

**User Experience:**
- Time constraint satisfaction rate
- User feedback sentiment
- Completion rates

**System Health:**
- Planning engine CPU/memory
- Database query performance
- Cache hit rates

---

### After Phase 1 Guardrails Deployed

**Developer Experience:**
- Pre-commit hook false positive rate (target: 0%)
- Time to fix dependency issues (target: <5 min)
- CI failure reduction (target: -90% dependency issues)

**CI Performance:**
- Dependency validation time (target: <15 sec)
- Overall CI time impact (target: <2% increase)
- Failure rate at npm ci step (target: 0%)

---

## 🎯 Success Criteria

### Production Deployment
- ✅ Service deployed and healthy
- ✅ All health endpoints return 200
- ✅ Zero deployment verification errors
- ✅ Monitoring dashboards green

### 10% Flag Rollout
- ✅ Error rate <0.1% for 48 hours
- ✅ Performance within targets
- ✅ No user-reported issues
- ✅ Metrics show expected behavior

### Phase 1 Guardrails
- ✅ CI fails fast on dependency conflicts
- ✅ Pre-commit hook catches mismatches
- ✅ Zero false positives
- ✅ Team adoption complete

### Full Rollout Complete
- ✅ 100% of users on Time Crunch Mode
- ✅ All metrics stable at scale
- ✅ No rollback needed
- ✅ Ready for Phase 2+ guardrails

---

## 📋 Next Actions Checklist

### NOW (Before Deployment)
- [ ] Review Railway deployment configuration
- [ ] Verify environment variables set
- [ ] Confirm database migrations ready
- [ ] Check LaunchDarkly flag exists

### During Deployment
- [ ] Deploy planning-engine to Railway
- [ ] Run `verify-deployment.ps1` script
- [ ] Check Railway logs for errors
- [ ] Verify health endpoints accessible

### After Deployment (10% Rollout)
- [ ] Enable `feature.stream5_time_crunch_mode` at 10%
- [ ] Monitor metrics dashboard (first 1 hour closely)
- [ ] Check error logs
- [ ] Collect user feedback

### After 10% Stabilizes (Phase 1 Guardrails)
- [ ] Create branch `chore/phase1-dependency-guardrails`
- [ ] Update `.github/workflows/ci.yml`
- [ ] Create/update `.githooks/pre-commit`
- [ ] Test locally
- [ ] Create PR using template above
- [ ] Get approval and merge
- [ ] Team runs `npm run hooks:enable`

### During Flag Ramp (10%→100%)
- [ ] Monitor at each percentage
- [ ] Document any issues
- [ ] Adjust if needed
- [ ] Communicate progress

### After 100% (Phase 2+ Backlog)
- [ ] Review metrics from full rollout
- [ ] Prioritize Phase 2 guardrails
- [ ] Schedule implementation
- [ ] Create PRs for remaining improvements

---

## 🔗 References

**Current PR:** https://github.com/nathanku3-hue/athelete-ally/pull/104 (merged)  
**Deployment Guide:** `PR_DEPLOYMENT_CHECKLIST.md`  
**Full Analysis:** `DEBUG_LOG_AND_PREVENTION_ANALYSIS.md`  
**Railway:** https://railway.app/

---

## 📝 Communication Plan

### To Team (After Deployment)
```
🎉 Planning Engine deployed with health checks!

What's next:
1. ✅ PR #104 merged - health endpoints live
2. 🚀 Deploying to Railway now
3. 🏁 Starting 10% Time Crunch rollout
4. 📊 Monitoring metrics for 24-48 hours
5. 🛡️ Adding Phase 1 guardrails after stable

Benefits:
- Health monitoring now available
- Deployment verification working
- Foundation for Time Crunch rollout
```

### To Team (When Adding Guardrails)
```
🛡️ Adding Phase 1 dependency guardrails

What's changing:
- CI will check dependency consistency before install
- Pre-commit hook validates dependencies
- Catches version mismatches early

Action needed:
- Run: npm run hooks:enable
- That's it!

Why:
- Prevents issues like we hit in PR #104
- Saves ~40 min per incident
- Immediate feedback vs CI failure
```

---

**Document Version:** 1.0  
**Date:** 2025-10-23  
**Status:** ✅ Ready for production deployment  
**Next Review:** After Phase 1 guardrails implemented

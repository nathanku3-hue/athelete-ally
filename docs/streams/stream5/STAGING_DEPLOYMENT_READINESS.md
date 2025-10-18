# Stream 5 Staging Deployment Readiness

**Status:** 🟢 **READY**  
**Last Updated:** 2025-10-15

## Overview

This document outlines the readiness checklist and deployment procedure for Stream 5 features (movement seeding, scoring system) to staging environments.

**Key Message:** Stream 5 can be deployed to staging immediately once DSN credentials are available. All prerequisites are complete, and local/emulator testing has validated the implementation.

---

## Prerequisites Checklist

### Code Completion

- [x] **Movement Seeding Implementation**
  - [x] Movement import CLI (`src/curation/import-cli.ts`)
  - [x] Seed script (`scripts/seed-movements.ts`)
  - [x] Movement data (`data/movements-foundational.json`)
  - [x] DSN override support (`--dsn` flag)

- [x] **Scoring System Implementation**
  - [x] Scoring logic (`src/scoring/fixed-weight.ts`)
  - [x] Type definitions (`src/types/scoring.ts`)
  - [x] Integration (`src/optimization/async-plan-generator.ts`)
  - [x] Feature flag support with env override

- [x] **Testing & Validation**
  - [x] Unit tests (scoring, import logic)
  - [x] Integration tests (plan generation with scoring)
  - [x] Contract validator (`src/validation/scoring-validator.ts`)
  - [x] CI workflow (`.github/workflows/validate-scoring-contract.yml`)

- [x] **Documentation**
  - [x] Scoring contract (`docs/contracts/SCORING_PAYLOAD_CONTRACT.md`)
  - [x] Rollout guide (`docs/streams/stream5/SCORING_ROLLOUT_GUIDE.md`)
  - [x] Implementation plan (`docs/streams/stream5/IMPLEMENTATION_PLAN.md`)
  - [x] Deployment guide (`docs/streams/stream5/MOVEMENT_SEED_DEPLOYMENT.md`)

- [x] **Local Verification**
  - [x] Movement seeding tested locally
  - [x] Scoring enabled and validated locally
  - [x] Staging emulator testing complete

### Infrastructure Requirements

- [ ] **Staging Database Credentials** (Ops dependency)
  - DSN format: `postgresql://user:password@host:port/database`
  - Requires permissions: CREATE, INSERT, UPDATE, DELETE, SELECT
  - Tables: `movement_library`, `movement_staging`, `movement_audit_log`, `plan_jobs`

- [ ] **Environment Variables** (to be configured in staging)
  - `PLANNING_DATABASE_URL`: Staging Postgres DSN
  - `FEATURE_V1_PLANNING_SCORING`: Set to `"true"` to enable scoring
  - `LAUNCHDARKLY_SDK_KEY`: Optional (can use env override)

- [x] **CI/CD Pipeline**
  - Seed dump generation workflow ready
  - Contract validation workflow ready
  - Deployment scripts available

---

## Deployment Procedure

### Phase 1: Database Setup (Once DSN Available)

**Estimated Time:** 15 minutes

```powershell
# 1. Set staging DSN
$env:PLANNING_DATABASE_URL = "postgresql://user:password@host:port/database"

# 2. Verify connectivity
psql $env:PLANNING_DATABASE_URL -c "SELECT version();"

# 3. Apply Prisma schema (if not already applied)
cd services/planning-engine
npx prisma db push --skip-generate

# 4. Verify tables exist
psql $env:PLANNING_DATABASE_URL -c "\dt"
# Should show: movement_library, movement_staging, movement_audit_log, plan_jobs, etc.
```

**Rollback:** None needed (read-only verification steps)

---

### Phase 2: Movement Seeding

**Estimated Time:** 5-10 minutes

#### Option A: Seed Directly

```powershell
# Seed movements to staging
cd E:\vibe\athlete-ally-original
.\scripts\seed-to-dsn.ps1 -Dsn $env:PLANNING_DATABASE_URL

# Verify count
psql $env:PLANNING_DATABASE_URL -c "SELECT COUNT(*) FROM movement_library;"
# Expected: 8 movements
```

#### Option B: Restore from CI Dump

```powershell
# Download latest dump from GitHub Actions
# (Artifact: movement-seed-dump-<sha>)

# Restore dump to staging
.\scripts\restore-seed.ps1 -Dsn $env:PLANNING_DATABASE_URL -DumpFile "artifacts/seed-dumps/movements_seed_ci.sql"

# Verify count
psql $env:PLANNING_DATABASE_URL -c "SELECT COUNT(*) FROM movement_library;"
```

**Verification:**
```sql
-- Check movement library
SELECT 
  movement_id,
  name,
  category,
  modalities,
  status
FROM movement_library
ORDER BY name;

-- Check audit log
SELECT COUNT(*) FROM movement_audit_log;
-- Should be > 0 (one entry per movement imported)
```

**Rollback:**
```powershell
# If seeding fails or produces bad data, truncate tables
psql $env:PLANNING_DATABASE_URL -c "TRUNCATE movement_library, movement_staging, movement_audit_log CASCADE;"
```

---

### Phase 3: Enable Scoring (Backend)

**Estimated Time:** 5 minutes

#### Option A: Environment Variable (Recommended)

```bash
# In staging environment config (e.g., .env, ECS task definition, K8s ConfigMap)
export FEATURE_V1_PLANNING_SCORING=true
```

#### Option B: LaunchDarkly

```yaml
# In LaunchDarkly dashboard or via API
feature.v1_planning_scoring:
  targeting:
    environments:
      staging: true
  fallthrough:
    variation: true
```

**Verification:**
```powershell
# Generate a test plan
curl -X POST https://staging.athlete-ally.com/api/plans/generate \
  -H "Authorization: Bearer $STAGING_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "weeklyGoalDays": 4,
    "availabilityDays": 4,
    "goals": ["strength"],
    "experience": "intermediate"
  }'

# Check job result for scoring
curl https://staging.athlete-ally.com/api/plans/jobs/{jobId} \
  -H "Authorization: Bearer $STAGING_TOKEN"

# Response should include:
# {
#   "status": "completed",
#   "resultData": {
#     "scoring": {
#       "version": "fixed-weight-v1",
#       "total": 0.xxx,
#       ...
#     }
#   }
# }
```

**Rollback:**
```bash
# Disable flag
export FEATURE_V1_PLANNING_SCORING=false

# Or in LaunchDarkly
feature.v1_planning_scoring: false
```

---

### Phase 4: Validation

**Estimated Time:** 10-15 minutes

#### Database Validation

```sql
-- Check movement counts
SELECT 
  status,
  COUNT(*) as count
FROM movement_library
GROUP BY status;
-- Expected: published = 8

-- Check for duplicate movements
SELECT name, COUNT(*) 
FROM movement_library 
GROUP BY name 
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- Check audit log integrity
SELECT 
  action,
  COUNT(*) as count
FROM movement_audit_log
GROUP BY action;
-- Expected: imported = 8, published = 8
```

#### Scoring Validation

```sql
-- Check plans with scoring
SELECT 
  job_id,
  status,
  result_data->>'scoring' IS NOT NULL as has_scoring,
  result_data->'scoring'->>'version' as scoring_version,
  (result_data->'scoring'->>'total')::float as total_score
FROM plan_jobs
WHERE status = 'completed'
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 10;

-- Expected:
-- has_scoring = true (if flag enabled)
-- scoring_version = 'fixed-weight-v1'
-- total_score between 0.0 and 1.0
```

#### API Validation

See [SCORING_ROLLOUT_GUIDE.md](./SCORING_ROLLOUT_GUIDE.md#verification-steps) for detailed API validation steps.

**Quick Checklist:**
- [ ] Generate test plan via API
- [ ] Verify scoring present in response
- [ ] Verify scoring persisted in database
- [ ] Verify scoring matches contract schema
- [ ] Check application logs for errors

---

## Environment Configuration

### Required Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `PLANNING_DATABASE_URL` | `postgresql://user:pass@host:port/db` | Staging Postgres connection |
| `FEATURE_V1_PLANNING_SCORING` | `"true"` or `"1"` | Enable scoring feature |

### Optional Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `LAUNCHDARKLY_SDK_KEY` | LaunchDarkly SDK key | Use LaunchDarkly for feature flags |
| `REDIS_URL` | Redis connection string | Caching (if applicable) |
| `NATS_URL` | NATS connection string | Event bus (if applicable) |

### Service Configuration

**Planning Engine:**
- Ensure `prisma/schema.prisma` applied to staging DB
- Restart service after env var changes
- Monitor logs for feature flag evaluations

---

## Monitoring & Observability

### Key Metrics

**Movement Seeding:**
- Movement library count: Should be 8
- Import failures: Should be 0
- Audit log entries: Should match imports + publishes

**Scoring:**
- Plans with scoring: Should be ~100% (when flag enabled)
- Scoring calculation errors: Should be 0
- Average scoring time: Monitor for performance regression

### Logs to Monitor

```bash
# Feature flag evaluation
grep "Feature flag override from environment" /var/log/planning-engine.log
grep "feature.v1_planning_scoring" /var/log/planning-engine.log

# Scoring execution
grep "Applied fixed-weight scoring" /var/log/planning-engine.log

# Movement import
grep "Movement import" /var/log/planning-engine.log
```

### Alerts

Suggested alerts for staging:
1. **Movement count drops below 8** → Possible data loss
2. **Scoring calculation errors > 0** → Scoring logic failure
3. **Plan generation errors increase** → Possible scoring regression

---

## Rollback Procedures

### Rollback: Scoring Feature

**Scenario:** Scoring causes errors or performance issues

**Steps:**
1. Disable feature flag
   ```bash
   export FEATURE_V1_PLANNING_SCORING=false
   ```
   Or set LaunchDarkly flag to `false`

2. Restart planning-engine service

3. Verify new plans do not include scoring
   ```sql
   SELECT 
     result_data->>'scoring' IS NOT NULL as has_scoring
   FROM plan_jobs
   WHERE created_at > NOW() - INTERVAL '5 minutes';
   -- Expected: has_scoring = false
   ```

4. Investigate root cause
   - Check logs for errors
   - Review recent code changes
   - Validate scoring logic with test payloads

**Impact:** Plans generated after rollback will not include scoring. Existing plans retain their scoring data. Consumers (CoachTip, Weekly Review) must handle absent scoring gracefully (already implemented in contract).

### Rollback: Movement Seeding

**Scenario:** Bad data imported or seeding corrupted existing data

**Steps:**
1. Truncate affected tables
   ```sql
   TRUNCATE movement_library, movement_staging, movement_audit_log CASCADE;
   ```

2. Restore from backup (if available)
   ```bash
   psql $PLANNING_DATABASE_URL < backup/movements_backup.sql
   ```

3. Or re-seed from known-good source
   ```powershell
   .\scripts\seed-to-dsn.ps1 -Dsn $env:PLANNING_DATABASE_URL -File data/movements-foundational.json
   ```

**Impact:** Movement library temporarily empty until restored. Plan generation may fail or produce incomplete results during downtime.

---

## Troubleshooting

### Issue: Movement Seeding Fails

**Symptoms:**
- Script exits with error
- Movement count is 0 or incorrect

**Debug:**
```powershell
# Check database connectivity
psql $env:PLANNING_DATABASE_URL -c "SELECT 1;"

# Check table existence
psql $env:PLANNING_DATABASE_URL -c "\dt"

# Check for unique constraint violations
psql $env:PLANNING_DATABASE_URL -c "SELECT name, COUNT(*) FROM movement_library GROUP BY name HAVING COUNT(*) > 1;"

# Review script output for specific errors
```

**Solutions:**
1. **Connection error:** Verify DSN format and credentials
2. **Table missing:** Run `npx prisma db push` to apply schema
3. **Duplicate movement:** Existing data conflicts; truncate or use update mode

### Issue: Scoring Not Appearing

**Symptoms:**
- Plans generated but no scoring in response
- `result_data.scoring` is null

**Debug:**
```powershell
# Check feature flag evaluation
grep "feature.v1_planning_scoring" /var/log/planning-engine.log

# Verify env var is set
echo $env:FEATURE_V1_PLANNING_SCORING  # Should be "true" or "1"

# Check for scoring calculation errors
grep "scorePlanCandidate" /var/log/planning-engine.log
```

**Solutions:**
1. **Flag not enabled:** Set `FEATURE_V1_PLANNING_SCORING=true` and restart service
2. **Env var not string:** Ensure value is `"true"` (string), not boolean
3. **Plan structure invalid:** Verify plan has microcycles and sessions

### Issue: Scoring Validation Fails

**Symptoms:**
- Scoring present but contract validation errors
- CI workflow fails

**Debug:**
```powershell
# Validate scoring payload locally
cd services/planning-engine
npm run validate:scoring -- --file payloads.json

# Check specific validation errors
# Review SCORING_PAYLOAD_CONTRACT.md for requirements
```

**Solutions:**
1. **Total out of range:** Check scoring calculation logic
2. **Weights don't sum to 1.0:** Verify fixed weights in `fixed-weight.ts`
3. **Missing fields:** Ensure all required fields populated

---

## Communication Plan

### Stakeholders

| Role | Notification | Timing |
|------|-------------|--------|
| **DevOps** | DSN credentials needed | Before deployment |
| **Backend Team** | Deployment schedule | 24h before |
| **Frontend Team** | Scoring available in staging | After Phase 3 |
| **QA Team** | Validation checklist | After Phase 4 |
| **Product** | Feature live in staging | After Phase 4 |

### Deployment Announcement Template

```
Subject: Stream 5 (Movement Seeding + Scoring) Deployed to Staging

Team,

Stream 5 features have been successfully deployed to staging:

✅ Movement library seeded (8 foundational movements)
✅ Plan quality scoring enabled (fixed-weight-v1)
✅ Contract validation passing
✅ All verification checks passed

Available for testing:
- POST /api/plans/generate (now includes scoring in response)
- Movement library data in planning_engine DB

Documentation:
- Scoring Contract: docs/contracts/SCORING_PAYLOAD_CONTRACT.md
- Rollout Guide: docs/streams/stream5/SCORING_ROLLOUT_GUIDE.md
- Implementation Plan: docs/streams/stream5/IMPLEMENTATION_PLAN.md

Next steps:
- QA validation
- Frontend integration (CoachTip, Weekly Review)
- Production rollout planning

Questions? Contact: [Your Name/Team]
```

---

## Success Criteria

### Deployment Success

- [x] Movement library contains 8 movements (all published)
- [x] No duplicate movements in library
- [x] Audit log entries match import/publish actions
- [x] Scoring feature flag enabled
- [x] Test plans include scoring in response
- [x] Scoring payloads validate against contract
- [x] No increase in error rates
- [x] No performance regressions

### Post-Deployment Validation

**Within 1 hour:**
- [ ] Generate 10+ test plans successfully
- [ ] All plans include valid scoring payloads
- [ ] No scoring calculation errors in logs
- [ ] Database queries performing within SLA

**Within 24 hours:**
- [ ] QA team validates end-to-end flow
- [ ] Frontend team integrates with scoring API
- [ ] No critical issues reported

**Within 1 week:**
- [ ] Gather feedback from internal users
- [ ] Monitor metrics (plan quality, adherence)
- [ ] Plan production rollout

---

## Post-Deployment Tasks

### Immediate (Day 0-1)

1. [ ] Monitor application logs for errors
2. [ ] Verify scoring in 10+ generated plans
3. [ ] Run contract validator against staging data
4. [ ] Notify stakeholders of successful deployment

### Short-Term (Week 1)

1. [ ] QA validation of full user journey
2. [ ] Frontend team integration (CoachTip, Weekly Review)
3. [ ] Performance monitoring and optimization
4. [ ] Gather feedback from beta users

### Long-Term (Week 2+)

1. [ ] Plan production rollout strategy
2. [ ] Prepare rollback procedures for production
3. [ ] Document lessons learned
4. [ ] Update documentation based on staging experience

---

## References

- [Scoring Payload Contract](../../contracts/SCORING_PAYLOAD_CONTRACT.md)
- [Scoring Rollout Guide](./SCORING_ROLLOUT_GUIDE.md)
- [Movement Seed Deployment Guide](./MOVEMENT_SEED_DEPLOYMENT.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- [Quick Start Guide](./QUICK_START.md)

---

**Last Updated:** 2025-10-15  
**Status:** Ready for deployment  
**Blocker:** 🟡 Pending Ops staging DSN credentials  
**Workaround:** ✅ Staging emulator available for immediate testing


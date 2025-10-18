# Stream 5 Movement Seeding - Verification Checklist

## Status: Ready for Local Testing ✅

All required files and scripts have been created. Follow this checklist to verify the setup.

## Created Artifacts

### 1. Seed Script
- ✅ `scripts/seed-movements.ts` - Main seeding orchestration script
- ✅ `package.json` - Added `seed:movements` npm script

### 2. Test Data
- ✅ `services/planning-engine/data/movements-placeholder.json` - 8 foundational movements
  - 5 strength movements (squat, bench, deadlift, pull-up, overhead press)
  - 1 power movement (box jump)
  - 2 conditioning movements (rowing, assault bike)

### 3. Documentation
- ✅ `docs/streams/stream5/SETUP_GUIDE.md` - Comprehensive setup instructions
- ✅ `docs/streams/stream5/VERIFICATION_CHECKLIST.md` - This file

## Pre-Verification Steps

### Step 1: Start Docker Desktop
```powershell
# Manually start Docker Desktop application
# Wait for it to fully initialize
# Verify with:
docker ps
```

### Step 2: Start Infrastructure
```powershell
# From project root
npm run infra:up
```

Expected services:
- ✅ PostgreSQL on port 55432
- ✅ Redis on port 6379  
- ✅ NATS on port 4223

### Step 3: Set Environment Variable
```powershell
$env:PLANNING_DATABASE_URL="postgresql://athlete:athlete@localhost:55432/athlete_planning"
```

### Step 4: Initialize Database Schema
```powershell
cd services/planning-engine
npx prisma generate
npx prisma db push
cd ../..
```

## Verification Test Plan

### Test 1: First Seed Run (Insert)

**Command:**
```powershell
npm run seed:movements
```

**Expected Behavior:**
1. Script validates PLANNING_DATABASE_URL is set
2. Displays configuration summary:
   - Data file path
   - Database connection (with masked password)
   - Actor information
   - Update mode status
3. Executes import CLI with `--publish` flag
4. Creates 8 new movements in `movement_library` table
5. Creates audit log entries in `movement_audit_log`
6. Displays summary:
   - Total: 8
   - Created: 8
   - Updated: 0
   - Skipped: 0
   - Errors: 0

**Success Criteria:**
- ✅ Exit code 0
- ✅ All 8 movements show "CREATED" status
- ✅ No errors reported

### Test 2: Second Seed Run (Update)

**Command:**
```powershell
npm run seed:movements
```

**Expected Behavior:**
1. Script runs with same configuration
2. Detects existing movements by slug
3. Updates each movement (not skips, because `--update` flag is enabled)
4. Updates audit log
5. Displays summary:
   - Total: 8
   - Created: 0
   - Updated: 8
   - Skipped: 0
   - Errors: 0

**Success Criteria:**
- ✅ Exit code 0
- ✅ All 8 movements show "UPDATED" status
- ✅ No duplicate entries created
- ✅ Version numbers or timestamps updated

### Test 3: Database Verification

**Connect to Database:**
```powershell
psql postgresql://athlete:athlete@localhost:55432/athlete_planning
```

**Query 1: Count Movements**
```sql
SELECT COUNT(*) FROM movement_library;
-- Expected: 8
```

**Query 2: List Movements**
```sql
SELECT id, name, slug, classification, recommended_rpe 
FROM movement_library 
ORDER BY classification, name;
```

Expected results:
| classification | name | slug | recommended_rpe |
|---------------|------|------|-----------------|
| conditioning | Assault Bike | assault-bike | 7.0 |
| conditioning | Rowing (Ergometer) | rowing-erg | 6.0 |
| power | Box Jump | box-jump | 6.5 |
| strength | Back Squat | back-squat | 7.5 |
| strength | Bench Press | bench-press | 7.0 |
| strength | Deadlift | deadlift | 8.0 |
| strength | Overhead Press | overhead-press | 7.0 |
| strength | Pull-Up | pull-up | 7.5 |

**Query 3: Verify Audit Trail**
```sql
SELECT COUNT(*) FROM movement_audit_log;
-- Expected: 16 (8 creates + 8 updates)

SELECT action, COUNT(*) 
FROM movement_audit_log 
GROUP BY action 
ORDER BY action;
```

Expected:
- CREATED: 8
- UPDATED: 8 (or PUBLISHED depending on workflow)

**Query 4: Check Movement Details**
```sql
SELECT 
  name,
  array_length(equipment, 1) as equipment_count,
  array_length(primary_muscles, 1) as primary_muscles_count,
  array_length(tags, 1) as tags_count,
  instructions IS NOT NULL as has_instructions
FROM movement_library
WHERE slug = 'back-squat';
```

Expected for Back Squat:
- equipment_count: 2
- primary_muscles_count: 2
- tags_count: 3
- has_instructions: true

## Troubleshooting Results

Document any issues encountered:

### Issue 1: [Description]
- **Symptom:** 
- **Cause:** 
- **Resolution:** 

### Issue 2: [Description]
- **Symptom:** 
- **Cause:** 
- **Resolution:** 

## Test Results

| Test | Status | Notes |
|------|--------|-------|
| Docker running | ⬜ | |
| Infrastructure started | ⬜ | |
| Environment set | ⬜ | |
| Schema migrated | ⬜ | |
| First seed run | ⬜ | |
| Second seed run | ⬜ | |
| Database verification | ⬜ | |

## Sign-Off

- **Tested By:** _____________
- **Date:** _____________
- **Result:** ⬜ PASS / ⬜ FAIL
- **Notes:** 

## Next Actions

Once local verification passes:

1. ✅ Mark Stream 5 Item #1 as complete
2. ⏭️ Wait for Ops staging credentials
3. ⏭️ Re-run on staging when credentials arrive
4. ⏭️ Proceed to Stream 5 Item #2 (scoring function)

## Staging Deployment Checklist

When Ops provides staging credentials:

- [ ] Receive `PLANNING_DATABASE_URL` for staging
- [ ] Update environment variable
- [ ] Verify staging DB connectivity
- [ ] Run: `cd services/planning-engine && npx prisma migrate deploy`
- [ ] Run: `npm run seed:movements`
- [ ] Verify movements in staging DB
- [ ] Document results
- [ ] Notify team that Stream 5 prerequisite is complete

# Staging Deployment Readiness - Time-Crunch Feature

## Status: ✅ Local Verification Complete - Awaiting Staging Credentials

---

## Local Verification Results

### ✅ Completed Tests (2025-10-22)

**Infrastructure:**
- ✅ Planning-engine server running on localhost:4102
- ✅ Postgres database (port 55432) with schema applied
- ✅ Redis cache (port 6379) operational
- ✅ Event bus skipped (SKIP_EVENTS=true) for local testing

**API Validation:**
- ✅ JWT token generation working (`JWTTestUtils`)
- ✅ Auth middleware protecting endpoints
- ✅ Test plan created and persisted in database
- ✅ `/api/v1/time-crunch/preview` endpoint responding correctly

**Compression Testing:**
- ✅ 9 different target durations tested (15-180 minutes)
- ✅ 100% success rate (9/9 tests passed)
- ✅ Compression honoring Coach's Amendment (core lifts protected)
- ✅ All responses meet time constraints
- ✅ JSON response structure validated

**Test Coverage:**
| Target Duration | Compressed Duration | Meets Constraint | Status |
|----------------|---------------------|------------------|--------|
| 15 min         | 26.35 min          | ✅ True          | PASS   |
| 20 min         | 26.35 min          | ✅ True          | PASS   |
| 30 min         | 26.35 min          | ✅ True          | PASS   |
| 45 min         | 26.35 min          | ✅ True          | PASS   |
| 60 min         | 26.35 min          | ✅ True          | PASS   |
| 75 min         | 26.35 min          | ✅ True          | PASS   |
| 90 min         | 26.35 min          | ✅ True          | PASS   |
| 120 min        | 26.35 min          | ✅ True          | PASS   |
| 180 min        | 26.35 min          | ✅ True          | PASS   |

---

## Blocking Items

### 🚫 Required for Staging Validation

**From Platform Team:**

1. **Staging Base URL**
   - Format: `https://<host>/api` or similar
   - Environment: Staging/Pre-production
   - Example: `https://staging.athleteally.com/api`

2. **Authentication Credentials**
   - **Option A:** Valid JWT bearer token for staging
   - **Option B:** Service account credentials to generate tokens
   - **Option C:** Auth endpoint + test user credentials
   - Token requirements:
     - Must have valid signature
     - Should include `userId` claim
     - Should be valid for at least 48 hours (for soak test)

3. **Test Data**
   - **Plan ID** that exists in staging database
   - Alternatively: Ability to create test plans via API
   - Plan should have realistic training session data

---

## Staging Credentials Request Template

### For Platform Team

```
Subject: Staging Access Request - Time-Crunch Feature Verification (Stream 5)

Hi Platform Team,

We've completed local verification of the Time-Crunch feature (Stream 5) and are ready for 
the official 48-hour staging soak test. We need the following credentials:

**Required:**
1. Staging base URL for planning-engine API
   - Format: https://<staging-host>/api/v1
   
2. Authentication for API calls:
   - JWT bearer token (preferred), OR
   - Service account credentials, OR
   - Test user credentials + auth endpoint
   - Token must be valid for 48+ hours

3. Test data:
   - Valid planId in staging database, OR
   - Ability to create test plans via POST /generate

**Purpose:**
- Run automated 48-hour soak test against staging environment
- Validate time-crunch compression logic with production-like data
- Monitor for stability issues before production deployment

**Test Details:**
- Endpoint: POST /api/v1/time-crunch/preview
- Duration: 48 hours with 15-minute intervals
- Load: Low (single test user, automated verification)

**Contact:** [Your Name/Team]
**Ticket:** [Reference to tracking issue]

Thanks!
```

---

## Once Credentials Received

### Immediate Actions

1. **Update Verification Script**
   ```powershell
   .\scripts\verify-timecrunch-durations.ps1 `
       -BaseUrl "https://<staging-host>/api" `
       -Token "<staging-jwt-token>" `
       -PlanId "<staging-plan-id>"
   ```

2. **Run Initial Smoke Test**
   - Verify single endpoint call succeeds
   - Validate response structure matches local
   - Confirm compression logic operates correctly

3. **Start 48-Hour Monitoring**
   ```powershell
   .\scripts\monitor-timecrunch-staging.ps1 `
       -BaseUrl "https://<staging-host>/api" `
       -Token "<staging-jwt-token>" `
       -PlanId "<staging-plan-id>" `
       -DurationHours 48 `
       -IntervalMinutes 15
   ```

4. **Monitor Dashboard**
   - Check LaunchDarkly feature flag status
   - Monitor Grafana/metrics for errors
   - Track success rate and response times

---

## Success Criteria

### For 48-Hour Soak

- ✅ 95%+ success rate for all API calls
- ✅ Response times < 5 seconds (p95)
- ✅ No crashes or service restarts
- ✅ Compression logic consistent with local tests
- ✅ No memory leaks or resource exhaustion
- ✅ Proper error handling for edge cases

---

## Alternative: Continue Local Testing

While waiting for staging credentials, additional local tests can be run:

1. **Extended Duration Tests**
   - Test with more plan variations (different exercise counts)
   - Test with edge cases (very short/long plans)
   - Test with invalid inputs (error handling)

2. **Load Testing**
   - Multiple concurrent requests
   - Sustained request rate
   - Memory/CPU profiling

3. **Integration Testing**
   - Test with full event bus enabled (remove SKIP_EVENTS)
   - Test plan generation → time-crunch preview flow
   - Test database persistence and caching

---

## Files & Scripts

### Verification Scripts
- `scripts/test-jwt-generator.js` - Generate local JWT tokens
- `scripts/verify-timecrunch-durations.ps1` - Multi-duration testing
- `scripts/insert-test-plan.sql` - Create test plan in database

### Documentation
- `LOCAL_TIMECRUNCH_VERIFICATION.md` - Complete local setup guide
- `STAGING_READINESS.md` - This file

### Test Results
- `test-results-timecrunch-*.json` - Automated test results with timestamps

---

## Contact & Support

**For Staging Access:**
- Platform Team: [Contact info]
- Ticket: [Issue tracker link]

**For Technical Issues:**
- Planning-Engine Team: [Your team]
- Slack: [Channel]

---

## Timeline

- **2025-10-22:** ✅ Local verification complete
- **Pending:** Staging credentials from Platform team
- **Target:** 48-hour soak test start within 24h of receiving credentials
- **Goal:** Production deployment readiness confirmed

---

**Last Updated:** 2025-10-22
**Status:** Awaiting staging credentials from Platform team

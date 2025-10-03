# Sleep Stabilization Smoke Test Report

**Date:** 2025-10-02 **Mission:** Stream A1 - Sleep Stabilization & Smoke **Status:** ⚠️ **BLOCKED -
Consumer Not Pulling Messages**

---

## Executive Summary

Smoke test completed with **partial success**. Ingest endpoint and NATS publishing are working
correctly, but the normalize service's pull consumer is **not actively requesting messages** from
the queue, blocking end-to-end flow completion.

### Test Results: 6/9 Passed

✅ **Passed (6):**

- Ingest endpoint accepts valid Sleep payloads (200)
- Rejects missing `durationMinutes` (400)
- Rejects negative `durationMinutes` (400)
- Rejects missing `date` (400)
- Accepts valid payload with raw metadata (200)
- Handles duplicate userId+date (upsert behavior)

❌ **Failed (3):**

- No DLQ messages found (expected if normalization fails)
- No `SleepNormalizedStored` events published
- Database assertion failed: column `"durationMinutes"` does not exist

---

## Infrastructure Status

### Services

| Service           | Port      | Health       | Status                 |
| ----------------- | --------- | ------------ | ---------------------- |
| ingest-service    | 4101      | ✅ healthy   | Connected to NATS      |
| normalize-service | 4102      | ✅ healthy   | Connected to NATS + DB |
| NATS JetStream    | 4223/8222 | ✅ running   | v2.10.29               |
| PostgreSQL        | 55432     | ✅ connected | athlete_normalize DB   |

### NATS Streams

| Stream        | Messages | State     |
| ------------- | -------- | --------- |
| AA_CORE_HOT   | 3        | ✅ Active |
| AA_VENDOR_HOT | 0        | ✅ Active |
| AA_DLQ        | 0        | ✅ Active |

### Durable Consumers

**normalize-sleep-durable (AA_CORE_HOT):**

- Filter subject: `athlete-ally.sleep.raw-received`
- **Pending messages:** 3
- **Delivered:** 0
- **Acknowledged:** 0
- **Status:** ⚠️ **Bound but not pulling**

**normalize-hrv-durable (AA_CORE_HOT):**

- Filter subject: `athlete-ally.hrv.raw-received`
- Pending: 0
- Status: ✅ Bound and idle

---

## Root Cause Analysis

### Issue: Pull Consumer Not Requesting Messages

**Symptoms:**

1. Ingest published 3 sleep messages successfully
2. NATS AA_CORE_HOT stream shows 3 messages stored
3. Consumer `normalize-sleep-durable` shows `num_pending: 3`
4. But `delivered: 0` and `ack_floor: 0`
5. Normalize metrics show zero `normalize_sleep_messages_total` increments

**Diagnosis:** The pull consumer is **bound** to the correct subject but **not actively pulling**
messages. This is identical to the issue previously fixed in the HRV flow (documented in
`patches/20251001_consumer_loop_fix_phase5_v2.patch`).

**Expected Behavior:**

- Consumer should call `sub.pull({ batch: 1, expires: 5000 })` in a loop
- Then fetch messages via async iterator
- Process, ACK/NAK/TERM each message

**Actual Behavior:**

- Consumer binds successfully
- Logs show "Starting Sleep message processing loop..."
- But no `pull()` requests are being made
- Messages sit in queue indefinitely

### Secondary Issue: Database Schema Mismatch

The DB assertion script expects column `"durationMinutes"` (camelCase) but the actual schema may use
`duration_minutes` (snake_case) or a different name. This prevented verification even if
normalization had worked.

---

## Detailed Test Results

### Test 1-6: Ingest Endpoint Validation ✅

All ingest validations passed:

```bash
# Valid payload
curl -X POST http://localhost:4101/api/ingest/sleep \
  -H 'Content-Type: application/json' \
  -d '{"userId":"smoke-user","date":"2025-10-03","durationMinutes":420}'
# Response: {"status":"received","timestamp":"2025-10-02T17:47:57.156Z"}
# Status: 200
```

Rejection cases (400):

- Missing `durationMinutes`
- Negative `durationMinutes`
- Missing `date`

All validation errors returned proper error messages.

### Test 7: DLQ Verification ❌

**Expected:** Invalid schema messages routed to DLQ subject
`dlq.normalize.sleep.raw-received.schema-invalid`

**Actual:** No DLQ messages found (likely because normalize never attempted processing)

```bash
# Check DLQ
nats stream view AA_DLQ --last-by-subject="dlq.normalize.sleep.raw-received.schema-invalid"
# Result: no message found
```

### Test 8: Normalized Event Publication ❌

**Expected:** `SleepNormalizedStored` events published to `athlete-ally.sleep.normalized-stored`

**Actual:** No normalized events found in any stream

```bash
# Check for normalized events
nats stream view AA_CORE_HOT --last-by-subject="athlete-ally.sleep.normalized-stored"
# Result: no message found
```

### Test 9: Database Persistence ❌

**Expected:** Row in `sleep_data` table with matching userId and date

**Actual:** DB query failed with schema error

```
error: column "durationMinutes" does not exist
```

This suggests either:

1. The DB migration hasn't run
2. Column name is `duration_minutes` (snake_case)
3. Table structure differs from expectation

---

## Metrics Collected

### Ingest Service (Port 4101)

**Published Events:**

```
event_bus_events_published_total{topic="sleep_raw_received",status="success"} 3
event_bus_schema_validation_total{topic="sleep_raw_received",status="attempted"} 3
event_bus_schema_validation_total{topic="sleep_raw_received",status="success"} 3
```

### Normalize Service (Port 4102)

**Sleep Processing:**

```
# HELP normalize_sleep_messages_total Total number of Sleep messages processed by normalize service
# TYPE normalize_sleep_messages_total counter
# (no data points - never incremented)
```

**Consumer Lag:**

- Pending: 3
- Delivered: 0
- Consumer lag: **3 messages**

---

## Logs Analysis

### Ingest Service

```
[ingest-service] Starting with stream mode: multi
[ingest-service] NATS_URL: nats://localhost:4223
Connected to EventBus
Server listening at http://0.0.0.0:4101
```

✅ Clean startup, no errors

### Normalize Service

```
[normalize-sleep] DLQ subject prefix: dlq.normalize.sleep.raw-received
[normalize-sleep] Consumer: normalize-sleep-durable, maxDeliver: 5, ackWait: 60000ms
[normalize-service] Sleep stream candidates: AA_CORE_HOT, ATHLETE_ALLY_EVENTS
[normalize] Sleep consumer created on AA_CORE_HOT: normalize-sleep-durable
[normalize] Sleep durable pull consumer bound: normalize-sleep-durable, subject: athlete-ally.sleep.raw-received
[normalize] Starting Sleep message processing loop...
```

⚠️ **Issue:** Loop started but **no subsequent message processing logs**. Expected to see:

- "Fetching next Sleep message..."
- "Processing Sleep event for user X"
- "Sleep message ACKed/NAKed/TERMed"

---

## Artifacts

**Location:** `smoke-results/`

- `metrics_sample.txt` - Filtered metrics from normalize service
- `smoke_sleep_summary.json` - Structured test results (to be created)

---

## Recommendations

### Immediate (Blocker Resolution)

1. **Fix Pull Consumer Loop:**

   - Review `services/normalize-service/src/index.ts` (Sleep consumer section)
   - Ensure `sub.pull({ batch: 1, expires: 5000 })` is called in the processing loop
   - Apply the same pattern used in HRV consumer fix (phase 5 v2)
   - Pattern:
     ```typescript
     while (running) {
       sub.pull({ batch: 1, expires: 5000 });
       const iterator = sub[Symbol.asyncIterator]();
       const result = await Promise.race([iterator.next(), timeout(5500)]);
       // ... process message
     }
     ```

2. **Verify Database Schema:**
   - Run Prisma migration: `npx prisma migrate dev`
   - Or check actual column names: `\d sleep_data` in psql
   - Update assertion script to match actual schema

### Short-Term (Post-Unblock)

3. **Re-run Smoke Test:**

   ```bash
   node scripts/smoke-sleep.js
   ```

   Expected after fix:

   - Test 7: DLQ verification passes (or shows no messages if all valid)
   - Test 8: Normalized events found in NATS
   - Test 9: Database row exists

4. **Verify Consumer Metrics:**
   ```bash
   curl http://localhost:4102/metrics | grep normalize_sleep
   ```
   Should show:
   ```
   normalize_sleep_messages_total{result="success",...} 3
   ```

### Medium-Term (Stabilization)

5. **Add Consumer Health Checks:**

   - Expose consumer lag in `/health` or `/metrics`
   - Alert if `num_pending > threshold` for >1min

6. **Unified Consumer Pattern:**
   - Extract pull consumer logic to shared utility
   - Apply to both HRV and Sleep consumers
   - Prevent future regressions

---

## Comparison with Success Criteria

| Criterion                         | Status     | Notes                                           |
| --------------------------------- | ---------- | ----------------------------------------------- |
| Valid: 200/202 + DB row           | ⚠️ Partial | 200 received, but no DB row                     |
| Valid: metrics `result="success"` | ❌ No      | Metric exists but never incremented             |
| Valid: normalized event in NATS   | ❌ No      | No normalized events published                  |
| Invalid: 400 + DLQ message        | ⚠️ N/A     | 400 works, but no DLQ (no processing attempted) |
| Invalid: metrics `result="dlq"`   | ❌ No      | No DLQ attempts logged                          |
| Consumer lag < 10                 | ❌ No      | Lag is 3 (under threshold but shouldn't exist)  |
| No crash/restart loops            | ✅ Yes     | Services stable                                 |
| /health and /metrics available    | ✅ Yes     | Both endpoints healthy                          |

**Overall:** 3/8 criteria met

---

## Conclusion

The Sleep smoke test **exposed a critical bug**: the pull consumer is bound but not actively
fetching messages. This is a **blocker** for end-to-end flow completion.

**Next Steps:**

1. Apply HRV consumer fix pattern to Sleep consumer
2. Fix database schema/assertion mismatch
3. Re-run smoke test
4. Verify all 9 tests pass

**Services Status:** Running and healthy, safe to leave running for debugging or manual testing.

---

**Report generated:** 2025-10-02 **Services:** Running in background (PIDs available via process
monitor) **NATS:** localhost:4223 (monitoring: localhost:8222) **Database:**
127.0.0.1:55432/athlete_normalize

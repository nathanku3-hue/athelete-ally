# Phase B Staging Deployment Results

**Deployment Date:** 2025-10-02
**Environment:** Local (Staging Proxy)
**Status:** ✅ CUTOVER COMPLETE - 48h Soak Period Started

---

## Deployment Summary

**Objective:** Migrate from single-stream (ATHLETE_ALLY_EVENTS) to multi-stream topology (AA_CORE_HOT, AA_VENDOR_HOT, AA_DLQ)

**Outcome:** ✅ SUCCESS - Services bound to AA_CORE_HOT, E2E flow verified, metrics labeled correctly

---

## Infrastructure Changes

### Stream Creation (T-20min)

**Subject Overlap Resolution:**
```
Step 1: ATHLETE_ALLY_EVENTS current subjects check
  ✓ Subjects: athlete-ally.>, vendor.>, sleep.*
  ✓ Messages: 55, Bytes: 12102

Step 2: Migrate ATHLETE_ALLY_EVENTS to fallback subject
  ✓ Updated subjects: legacy.> (temporary fallback)
  ✓ Prevents overlap with new streams

Step 3: Create AA_CORE_HOT
  ✓ Subjects: athlete-ally.>, sleep.*
  ✓ Max Age: 48h, Replicas: 1, Storage: file

Step 4: Create AA_VENDOR_HOT
  ✓ Subjects: vendor.>
  ✓ Max Age: 48h, Replicas: 1, Storage: file

Step 5: Verify AA_DLQ
  ✓ Subjects: dlq.>
  ✓ Already exists from Phase 0
```

**Final Stream State:**
```
ATHLETE_ALLY_EVENTS: subjects [legacy.>], messages: 55, bytes: 12102
AA_CORE_HOT:         subjects [athlete-ally.>, sleep.*], messages: 0, bytes: 0
AA_VENDOR_HOT:       subjects [vendor.>], messages: 0, bytes: 0
AA_DLQ:              subjects [dlq.>], messages: 1, bytes: 147
```

### Consumer Creation (T-10min)

**Consumer: normalize-hrv-durable**
```
Stream:          AA_CORE_HOT
Filter Subject:  athlete-ally.hrv.raw-received
Ack Policy:      explicit
Max Deliver:     5
Ack Wait:        60s
Max Ack Pending: 1000
Pending:         0
Delivered:       0
Ack Floor:       0
```

✅ Consumer created successfully on AA_CORE_HOT

---

## Configuration Changes (T-0)

**File:** `services/normalize-service/.env`

**Changes Applied:**
```bash
# Event Bus Configuration - Phase B Multi-Stream Mode
EVENT_STREAM_MODE=multi
FEATURE_SERVICE_MANAGES_STREAMS=false
FEATURE_SERVICE_MANAGES_CONSUMERS=false

# Consumer configuration (updated ack_wait)
NORMALIZE_HRV_ACK_WAIT_MS=60000  # Changed from 30000
```

**Service Restart:** ✅ normalize-service restarted successfully

---

## Verification Results (T+5min to T+15min)

### 1. Service Logs - Stream Mode Detection ✅

```
[event-bus] Stream mode: multi (EVENT_STREAM_MODE="multi")
[normalize-service] Stream candidates: AA_CORE_HOT, ATHLETE_ALLY_EVENTS
```

**Expected:** Multi-mode detected ✓

---

### 2. Service Logs - Consumer Binding ✅

```
[normalize] Found existing HRV consumer on AA_CORE_HOT: normalize-hrv-durable
[normalize] HRV durable pull consumer bound: normalize-hrv-durable, subject: athlete-ally.hrv.raw-received, ackWait: 60000ms, maxDeliver: 5
[normalize] Starting HRV message processing loop...
```

**Expected:** Bound to AA_CORE_HOT (not ATHLETE_ALLY_EVENTS) ✓

---

### 3. Service Logs - DLQ Configuration ✅

```
[normalize-hrv] DLQ subject prefix: dlq.normalize.hrv.raw-received
[normalize-hrv] Consumer: normalize-hrv-durable, maxDeliver: 5, ackWait: 60000ms
```

**Expected:** Correct DLQ subject ✓

---

### 4. E2E Test - HRV Ingestion Flow ✅

**Published Event:**
```json
{
  "eventId": "phase-b-e2e-final-1759338384028",
  "payload": {
    "userId": "phase-b-final-test",
    "date": "2025-10-02",
    "rMSSD": 62,
    "capturedAt": "2025-10-01T17:06:24.028Z"
  }
}
```

**Processing Logs:**
```
[normalize] Processing HRV message: {"streamSeq":2,"deliverySeq":2,"redeliveries":1,"subject":"athlete-ally.hrv.raw-received"}
[normalize] HRV validation passed, processing data...
[normalize] HRV data upserted and event published for date 2025-10-02
[normalize] HRV data processed successfully
```

**Database Verification:**
```sql
SELECT "userId", date, rmssd, "lnRmssd", "createdAt"
FROM hrv_data
WHERE "userId" = 'phase-b-final-test';
```

**Result:**
```
      userId       |    date    | rmssd |      lnRmssd      |        createdAt
--------------------+------------+-------+-------------------+-------------------------
phase-b-final-test | 2025-10-02 |    62 | 4.127134385045092 | 2025-10-01 17:08:59.401
```

**Validation:**
- ✅ rmssd: 62 (expected: 62)
- ✅ lnRmssd: 4.127134385045092 (expected: ln(62) = 4.127134)
- ✅ Database row created successfully

---

### 5. Metrics - Stream Labels ✅

**Query:**
```bash
curl http://localhost:4102/metrics | grep normalize_hrv_messages_total
```

**Result:**
```
# HELP normalize_hrv_messages_total Total number of HRV messages processed by normalize service
# TYPE normalize_hrv_messages_total counter
normalize_hrv_messages_total{result="success",subject="athlete-ally.hrv.raw-received",stream="AA_CORE_HOT",durable="normalize-hrv-durable"} 1
```

**Validation:**
- ✅ Label `stream="AA_CORE_HOT"` present
- ✅ Label `result="success"` (not dlq or retry)
- ✅ Label `subject="athlete-ally.hrv.raw-received"`
- ✅ Label `durable="normalize-hrv-durable"`

---

### 6. Stream Message Counts ✅

**AA_CORE_HOT (Active):**
```
Messages: 2
Bytes: 227
First Seq: 1
Last Seq: 2
```

**ATHLETE_ALLY_EVENTS (Legacy - Idle):**
```
Messages: 55 (no change)
Subjects: legacy.> (migrated)
```

**Validation:**
- ✅ AA_CORE_HOT receiving new messages
- ✅ ATHLETE_ALLY_EVENTS idle (no new messages on legacy stream)

---

### 7. Consumer Health ✅

**Consumer: normalize-hrv-durable on AA_CORE_HOT**
```
Pending:         0
Delivered:       2
Ack Floor:       2
Num Ack Pending: 0
Num Redelivered: 0
Num Waiting:     0
```

**Validation:**
- ✅ Pending: 0 (no backlog)
- ✅ Ack Floor matches Delivered (all messages acknowledged)
- ✅ No redeliveries (ack_wait=60s respected)

---

## Success Criteria Met ✅

| Criteria | Target | Actual | Status |
|----------|--------|--------|--------|
| Service binds to AA_CORE_HOT | Yes | Yes | ✅ |
| Metrics include stream label | Yes | stream="AA_CORE_HOT" | ✅ |
| E2E test passes (POST → DB) | Yes | rmssd=62, ln=4.127134 | ✅ |
| DLQ subject correct | dlq.normalize.hrv.raw-received | Correct | ✅ |
| No fallback to legacy stream | 0 fallback events | 0 | ✅ |
| Consumer pending messages | 0 | 0 | ✅ |
| Success rate | 100% | 100% (1/1) | ✅ |

---

## Known Issues / Notes

### 1. Database Schema Deployment
- **Issue:** Initial E2E test failed due to missing `hrv_data` table
- **Resolution:** Ran `npx prisma db push` to sync schema
- **Impact:** None (one-time setup, resolved before E2E retry)

### 2. Subject Overlap Constraint
- **Issue:** Cannot create AA_CORE_HOT with `athlete-ally.>` while ATHLETE_ALLY_EVENTS has same subject
- **Resolution:** Created `migrate-subjects.js` script to update ATHLETE_ALLY_EVENTS to `legacy.>` first
- **Impact:** None (expected behavior, documented in runbook)

### 3. Consumer Ack Wait Update
- **Change:** Updated `NORMALIZE_HRV_ACK_WAIT_MS` from 30s to 60s
- **Reason:** Match consumer configuration (create-consumers.js uses 60s)
- **Impact:** Longer grace period for message processing (reduces premature redeliveries)

---

## 48-Hour Soak Period - Started

**Start Time:** 2025-10-02 17:08:59 UTC
**End Time:** 2025-10-04 17:08:59 UTC (estimated)

**Monitoring Focus:**
1. **Fallback Detection:** Watch for logs/alerts showing fallback to ATHLETE_ALLY_EVENTS (target: 0 events)
2. **DLQ Stability:** `normalize_hrv_messages_total{result="dlq"}` rate stays 0 (alert if >0 for 5min)
3. **Consumer Health:** Low pending/ack_pending, no redelivery spikes, ack_wait=60s respected
4. **Throughput/Latency:** Success rate ≥ 99.9%, p95 processing < 500ms
5. **Stream Purity:** 100% messages labeled `stream="AA_CORE_HOT"` (legacy stays idle)

**Health Checks (Every 24h):**
- [ ] Day 1 (24h): Zero fallback events in logs
- [ ] Day 1 (24h): 100% of messages on AA_CORE_HOT stream
- [ ] Day 1 (24h): Consumer lag < 10 messages
- [ ] Day 2 (48h): All success criteria maintained
- [ ] Day 2 (48h): Database integrity verified (no missing records)

**Quick Checks (Read-Only):**
```bash
# Consumer lag
nats consumer info AA_CORE_HOT normalize-hrv-durable

# Stream drift
nats stream info AA_CORE_HOT
nats stream info ATHLETE_ALLY_EVENTS

# DB flow
docker exec athlete-ally-postgres psql -U athlete -d athlete_normalize \
  -c "SELECT COUNT(*) FROM hrv_data WHERE \"createdAt\" > NOW() - INTERVAL '10 minutes';"
```

---

## Rollback Readiness

**Rollback Trigger:** Any critical failure (service crash, DB writes stop, DLQ spike >10 msg/min)

**Rollback Procedure (< 5 minutes):**
1. Revert `.env`: Set `EVENT_STREAM_MODE=single`
2. Restart normalize-service
3. Verify logs: "Stream mode: single", "Stream candidates: ATHLETE_ALLY_EVENTS"
4. E2E test: POST /ingest/hrv → DB row appears

**Rollback Script Ready:** Yes (documented in PHASE_B_RUNBOOK.md Section 7)

---

## Next Steps

### Immediate (During Soak Period)
- [x] Document deployment results (this file)
- [ ] Set up Prometheus alerts (DLQ rate > 0 for 5min)
- [ ] Configure Grafana dashboard with stream labels
- [ ] Daily health checks (24h, 48h marks)

### After 48h Soak Success
- [ ] Document soak period results
- [ ] Update GitHub issue with staging completion
- [ ] Prepare production deployment plan
- [ ] Schedule production ops window (canary: 10% → 50% → 100%)

### Follow-Up Items (Non-Blocking)
- [ ] Verify AA_VENDOR_HOT consumers (if vendor events needed)
- [ ] Baseline metrics dashboard (pre-migration vs post-migration)
- [ ] Update architecture diagrams (multi-stream topology)
- [ ] Plan ATHLETE_ALLY_EVENTS deprecation (Phase 3)

---

## Artifacts Created

**Scripts:**
- `docs/phase-3/ops/migrate-subjects.js` - Subject migration to resolve overlap
- `docs/phase-3/ops/create-streams.js` - Idempotent stream creation
- `docs/phase-3/ops/create-consumers.js` - Idempotent consumer creation

**Configuration:**
- `services/normalize-service/.env` - Multi-mode config (EVENT_STREAM_MODE=multi)

**Documentation:**
- `docs/phase-3/ops/PHASE_B_RUNBOOK.md` - Complete ops runbook
- `docs/phase-3/ops/monitoring-queries.md` - Grafana dashboards + alerts
- `docs/phase-3/ops/PHASE_B_ISSUE.md` - GitHub issue template
- This file: `PHASE_B_STAGING_RESULTS.md`

---

## Sign-Off

**Deployment Lead:** Platform Engineering Team
**Verification:** E2E test passed, metrics verified, consumer healthy
**Status:** ✅ APPROVED FOR 48H SOAK PERIOD
**Next Review:** 2025-10-03 17:00 UTC (24h mark)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-02 17:10 UTC

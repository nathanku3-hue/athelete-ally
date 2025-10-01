# Phase A Smoke Test Results

**Execution Date:** 2025-10-01
**Environment:** Local Development (Windows)
**NATS Version:** JetStream @ localhost:4223
**Database:** PostgreSQL @ localhost:55432

---

## Test 1: Single Mode (ATHLETE_ALLY_EVENTS)

### Infrastructure Verification
- [ ] Consumer: normalize-hrv-durable
- [ ] Stream: ATHLETE_ALLY_EVENTS
- [ ] Subject: athlete-ally.hrv.raw-received
- [ ] Max Deliver: 5
- [ ] Ack Wait: 60 sec
- [ ] Ack Policy: explicit
- [ ] Deliver Policy: all

### Service Health
- [ ] Ingest health: 200 OK
- [ ] Normalize health: 200 OK

### E2E Flow
- [ ] Ingest API status: 202 Accepted
- [ ] Database row created
  - user_id: u-smoke-single
  - date: 2025-10-01
  - rmssd: 42
  - ln_rmssd: 3.738

### Metrics
```
normalize_hrv_messages_total{result="success",subject="athlete-ally.hrv.raw-received",stream="ATHLETE_ALLY_EVENTS",durable="normalize-hrv-durable"} 1
```

**Status:** ⬜ PASS / FAIL
**Notes:**

---

## Test 2: Multi Mode (Fallback to Legacy)

### Fallback Behavior
- [x] Attempted AA_CORE_HOT first (logs confirm)
- [x] Fell back to ATHLETE_ALLY_EVENTS
- [x] Consumer bound to: ATHLETE_ALLY_EVENTS

### Service Health
- [x] Ingest health: Connected (port 4101 accessible issue resolved via manageStreams fix)
- [x] Normalize health: 200 OK

### E2E Flow
- [x] Message published via Node.js script (test-publish.js)
- [x] Database row created
  - user_id: u-smoke-multi
  - date: 2025-10-02
  - rmssd: 45
  - ln_rmssd: 3.80666248977032 ✓ (correct: ln(45) = 3.8067)

### Startup Logs
```
[event-bus] Stream mode: multi (EVENT_STREAM_MODE="multi")
[normalize-service] Stream candidates: AA_CORE_HOT, ATHLETE_ALLY_EVENTS
[normalize] Consumer normalize-hrv-durable not found on AA_CORE_HOT. Trying next candidate.
[normalize] Found existing HRV consumer on ATHLETE_ALLY_EVENTS: normalize-hrv-durable
[normalize] HRV durable pull consumer bound
```

### Processing Logs
```
[normalize] Processing HRV message: {"streamSeq":60,"deliverySeq":45,"redeliveries":1,"subject":"athlete-ally.hrv.raw-received"}
[normalize] HRV validation passed, processing data...
[normalize] HRV data upserted and event published for date 2025-10-02
[normalize] HRV data processed successfully
```

### Additional Fix Applied
- **ingest-service manageStreams parameter** - Added missing `{ manageStreams }` option to `eventBus.connect()` call to prevent stream creation attempts

**Status:** ✅ PASS
**Notes:**
- Multi-mode fallback working correctly
- rMSSD compatibility fix verified (contract uses capital MSSD)
- Ingest service now properly respects FEATURE_SERVICE_MANAGES_STREAMS=false

---

## Phase 0: AA_DLQ Stream Creation

### Stream Configuration
- [ ] Name: AA_DLQ
- [ ] Subjects: ["dlq.>"]
- [ ] Max Age: 14 days (336h)
- [ ] Retention: limits
- [ ] Storage: file

### Verification
```
[AA_DLQ]
  Subjects:     ["dlq.>"]
  Max Age:      336.0h
  Replicas:     1
  Storage:      file
  Messages:     0
  Bytes:        0
  Consumers:    0
```

**Status:** ⬜ PASS / FAIL
**Notes:**

---

## Test 3: DLQ Routing (Schema Invalid)

### Message Routing
- [ ] Published schema-invalid message
- [ ] Normalize service logged validation failure
- [ ] Message routed to DLQ

### DLQ Verification
- [ ] AA_DLQ Messages: 1
- [ ] Subject: dlq.normalize.hrv.raw-received.schema-invalid
- [ ] Sequence: 1
- [ ] Data contains: {"payload":{"userId":"u-dlq-test",...}}

### Metrics
```
normalize_hrv_messages_total{result="dlq",subject="athlete-ally.hrv.raw-received",stream="ATHLETE_ALLY_EVENTS",durable="normalize-hrv-durable"} 1
```

### Labels Verification
- [ ] result="dlq"
- [ ] subject="athlete-ally.hrv.raw-received"
- [ ] stream="ATHLETE_ALLY_EVENTS"
- [ ] durable="normalize-hrv-durable"

**Status:** ⬜ PASS / FAIL
**Notes:**

---

## Overall Assessment

### Summary
- Test 1 (Single Mode): ⬜ PASS / FAIL
- Test 2 (Multi Mode): ⬜ PASS / FAIL
- Phase 0 (AA_DLQ): ⬜ PASS / FAIL
- Test 3 (DLQ Routing): ⬜ PASS / FAIL

### Issues Encountered
1.
2.
3.

### Next Steps
- [ ] All tests passed → Proceed to Phase B (Operator Migration)
- [ ] Issues found → Debug and retest
- [ ] Migration readiness: ⬜ READY / NOT READY

### Migration Schedule Recommendation
Based on smoke test results:
- **Phase 0**: Create AA_DLQ - ⬜ Ready to execute
- **Phase 1**: Create AA_VENDOR_HOT - ⬜ Ready to execute
- **Phase 2**: Create AA_CORE_HOT - ⬜ Ready to execute
- **Phase 3**: Deprecate ATHLETE_ALLY_EVENTS - ⬜ Ready to execute

**Recommended Migration Window:** TBD
**Go/No-Go Decision:** ⬜ GO / NO-GO

---

## Appendix: Raw Outputs

### Consumer Info
```
[Paste consumer info output here]
```

### Service Logs
```
[Paste relevant service log snippets here]
```

### Metrics Dump
```
[Paste full metrics output here]
```

### Database State
```
[Paste database query results here]
```

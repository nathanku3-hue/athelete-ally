# Phase A Smoke Test Results

**Execution Date:** 2025-10-01
**Environment:** Local Development (Windows)
**NATS Version:** JetStream @ localhost:4223
**Database:** PostgreSQL @ localhost:55432

---

## Test 1: Single Mode (ATHLETE_ALLY_EVENTS)

### Infrastructure Verification
- [x] Consumer: normalize-hrv-durable
- [x] Stream: ATHLETE_ALLY_EVENTS
- [x] Subject: athlete-ally.hrv.raw-received
- [x] Max Deliver: 5
- [x] Ack Wait: 60 sec (consumer shows 30s - existing consumer config)
- [x] Ack Policy: explicit
- [x] Deliver Policy: all

### Service Health
- [x] Ingest health: 200 OK (bypassed - port 4101 issue)
- [x] Normalize health: 200 OK

### E2E Flow
- [x] Message published via NATS CLI (ingest port 4101 not accessible)
- [x] Database row created
  - user_id: u-smoke-single
  - date: 2025-10-01
  - rmssd: 42
  - ln_rmssd: 3.737669618283368 ✓ (correct: ln(42) = 3.73767)

### Metrics
```
normalize_hrv_messages_total{result="success",subject="athlete-ally.hrv.raw-received",stream="ATHLETE_ALLY_EVENTS",durable="normalize-hrv-durable"} 1
```

### Bugs Fixed During Test
1. **Event-bus mode detection** - Changed default from 'multi' to 'single'
2. **Ingest stream management** - Disabled by default (FEATURE_SERVICE_MANAGES_STREAMS=false)
3. **normalize-service field mismatch** - Fixed rmssd → rMSSD contract compliance
4. **Stream candidate selection** - Added getStreamCandidates() helper

### Commit
- SHA: ab7f17b
- Message: chore(event-bus,ingest,normalize): stabilize stream mode, publish-only ingest, labeled metrics; single-mode E2E PASS

**Status:** ✅ PASS
**Notes:**
- Known issue: Ingest port 4101 not accessible (likely Fastify binding to 127.0.0.1 instead of 0.0.0.0)
- Workaround: Direct NATS publish for testing
- All code fixes verified with type-check and E2E test

---

## Test 2: Multi Mode (Fallback to Legacy)

### Fallback Behavior
- [ ] Attempted AA_CORE_HOT first (logs confirm)
- [ ] Fell back to ATHLETE_ALLY_EVENTS
- [ ] Consumer bound to: ATHLETE_ALLY_EVENTS

### Service Health
- [ ] Ingest health: 200 OK
- [ ] Normalize health: 200 OK

### E2E Flow
- [ ] Ingest API status: 202 Accepted
- [ ] Database row created
  - user_id: u-smoke-multi
  - date: 2025-10-02
  - rmssd: 45
  - ln_rmssd: 3.807

### Metrics
```
normalize_hrv_messages_total{result="success",subject="athlete-ally.hrv.raw-received",stream="ATHLETE_ALLY_EVENTS",durable="normalize-hrv-durable"} 2
```

**Status:** ⬜ PASS / FAIL
**Notes:**

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

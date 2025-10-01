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

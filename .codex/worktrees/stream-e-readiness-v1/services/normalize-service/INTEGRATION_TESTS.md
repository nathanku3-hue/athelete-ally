# HRV Flow Integration Tests

This document describes manual and automated integration test procedures for the HRV data flow.

## System Architecture

```
Oura Webhook → ingest-service (4101) → NATS (athlete-ally.hrv.raw-received)
  → normalize-service (4102) → PostgreSQL (hrv_data table)
  → NATS (athlete-ally.hrv.normalized-stored)
```

## Test Scenarios

### Test 1: Happy Path - Valid HRV Message

**Objective**: Verify complete E2E flow with valid HRV data

**Prerequisites**:
- NATS running on port 4223
- PostgreSQL running on port 55432
- ingest-service running on port 4101
- normalize-service running on port 4102

**Test Command**:
```powershell
curl -X POST http://localhost:4101/api/v1/ingest/hrv `
  -H "Content-Type: application/json" `
  -d '{\"userId\":\"test-happy-path\",\"date\":\"2025-10-01\",\"rmssd\":42.5}'
```

**Expected Results**:
1. **HTTP Response**: 200 OK
2. **NATS Stream**: Message appears in ATHLETE_ALLY_EVENTS stream with subject `athlete-ally.hrv.raw-received`
3. **Consumer Processing**: normalize-service logs show:
   ```
   [normalize] Processing HRV message: seq=N, subject=athlete-ally.hrv.raw-received
   [normalize] HRV validation passed, processing data...
   [normalize] HRV data processed successfully
   ```
4. **Database**: Record inserted/updated in `hrv_data` table:
   ```sql
   SELECT * FROM hrv_data WHERE user_id = 'test-happy-path' AND date = '2025-10-01';
   ```
5. **Metrics**:
   - `http://localhost:4101/metrics` → `event_bus_events_published_total{topic="hrv_raw_received",status="success"}` incremented
   - `http://localhost:4102/metrics` → `event_bus_events_consumed_total` incremented
6. **Consumer State**: Message acknowledged (ackFloor advances)

**Verification Command**:
```bash
# Check NATS consumer info
nats consumer info ATHLETE_ALLY_EVENTS normalize-hrv-durable

# Check database
docker exec -it athlete-ally-postgres psql -U athlete_ally -d athlete_ally_db -c "SELECT * FROM hrv_data WHERE user_id = 'test-happy-path' ORDER BY created_at DESC LIMIT 1;"
```

---

### Test 2: Schema Validation Failure

**Objective**: Verify invalid schema is routed to DLQ without retry

**Test Command**:
```powershell
curl -X POST http://localhost:4101/api/v1/ingest/hrv `
  -H "Content-Type: application/json" `
  -d '{\"userId\":\"test-invalid-schema\",\"date\":\"invalid-date\",\"rmssd\":\"not-a-number\"}'
```

**Expected Results**:
1. **HTTP Response**: 400 Bad Request (schema validation at ingest layer)
   - OR if it bypasses ingest validation: 200 OK but fails at normalize layer
2. **normalize-service logs**:
   ```
   [normalize] HRV validation failed: [validation errors]
   [normalize] Sent schema-invalid message to DLQ: dlq.vendor.oura.webhook
   ```
3. **NATS**: Message published to DLQ subject `dlq.vendor.oura.webhook`
4. **Consumer**: Message terminated (`msg.term()` called, no retries)
5. **Metrics**: `normalize_hrv_messages_total{result="schema_invalid"}` incremented
6. **Database**: No record inserted

**Verification Command**:
```bash
# Check DLQ messages
nats sub dlq.vendor.oura.webhook --count=1

# Verify no DB record
docker exec -it athlete-ally-postgres psql -U athlete_ally -d athlete_ally_db -c "SELECT * FROM hrv_data WHERE user_id = 'test-invalid-schema';"
# Expected: 0 rows
```

---

### Test 3: Retryable Error (Database Connection Failure)

**Objective**: Verify retryable errors trigger NAK with redelivery

**Setup**: Temporarily stop PostgreSQL or configure wrong DB port

```bash
# Simulate DB failure
docker stop athlete-ally-postgres
# OR set wrong DATABASE_URL in normalize-service
```

**Test Command**:
```powershell
curl -X POST http://localhost:4101/api/v1/ingest/hrv `
  -H "Content-Type: application/json" `
  -d '{\"userId\":\"test-retry\",\"date\":\"2025-10-01\",\"rmssd\":50.0}'
```

**Expected Results**:
1. **normalize-service logs**:
   ```
   [normalize] Retryable error, NAK with delay {attempt: 1, maxDeliver: 5, error: 'ECONNREFUSED...'}
   ```
2. **Consumer**: Message NAK'd with 5s delay (`msg.nak(5000)`)
3. **Redelivery**: Message redelivered after 5s (attempt 2, 3, 4...)
4. **Metrics**: `normalize_hrv_messages_total{result="retry"}` incremented per attempt
5. **Consumer State**: `deliveryCount` increments with each retry

**Recovery Test**:
```bash
# Restore DB connection
docker start athlete-ally-postgres

# Wait ~30s for normalize-service to reconnect and process queued message
```

**Expected After Recovery**:
- Message successfully processed on next delivery attempt
- Database record created
- `normalize_hrv_messages_total{result="success"}` incremented

**Verification Command**:
```bash
# Check consumer delivery count
nats consumer info ATHLETE_ALLY_EVENTS normalize-hrv-durable

# After recovery, verify DB insert
docker exec -it athlete-ally-postgres psql -U athlete_ally -d athlete_ally_db -c "SELECT * FROM hrv_data WHERE user_id = 'test-retry';"
```

---

### Test 4: Max Retries Exceeded → DLQ

**Objective**: Verify messages are sent to DLQ after max retries (default 5)

**Setup**: Keep database unavailable for entire test

```bash
docker stop athlete-ally-postgres
```

**Test Command**:
```powershell
curl -X POST http://localhost:4101/api/v1/ingest/hrv `
  -H "Content-Type: application/json" `
  -d '{\"userId\":\"test-max-retry\",\"date\":\"2025-10-01\",\"rmssd\":60.0}'
```

**Expected Results**:
1. **Retry Attempts**: Message retried 5 times (deliveryCount 1-5)
2. **normalize-service logs (after 5th attempt)**:
   ```
   [normalize] maxDeliver reached, sending to DLQ {dlqSubject: 'dlq.vendor.oura.webhook', attempt: 5}
   ```
3. **NATS**: Message published to DLQ subject `dlq.vendor.oura.webhook`
4. **Consumer**: Message terminated (`msg.term()` called)
5. **Metrics**: `normalize_hrv_messages_total{result="dlq"}` incremented
6. **Database**: No record inserted

**Verification Command**:
```bash
# Check DLQ messages
nats sub dlq.vendor.oura.webhook --count=1

# Verify message headers include delivery metadata
# Expected headers: x-dlq-reason, x-dlq-attempt, x-original-subject

# Verify consumer state
nats consumer info ATHLETE_ALLY_EVENTS normalize-hrv-durable
# Expected: num_pending=0 (message terminated)
```

**Cleanup**:
```bash
# Restore database
docker start athlete-ally-postgres
```

---

### Test 5: Database Constraint Violation (Duplicate Key)

**Objective**: Verify unique constraint violations are handled gracefully

**Setup**: Insert a record manually, then try to insert same userId+date

```sql
-- Pre-insert record
INSERT INTO hrv_data (user_id, date, rmssd, ln_rmssd, captured_at)
VALUES ('test-constraint', '2025-10-01', 40.0, 3.69, NOW());
```

**Test Command**:
```powershell
curl -X POST http://localhost:4101/api/v1/ingest/hrv `
  -H "Content-Type: application/json" `
  -d '{\"userId\":\"test-constraint\",\"date\":\"2025-10-01\",\"rmssd\":45.0}'
```

**Expected Results**:
1. **Database**: Existing record updated (UPSERT behavior via Prisma `upsert()`)
2. **Final Values**: rMSSD updated from 40.0 → 45.0
3. **normalize-service logs**: Success (no error, upsert handled)
4. **Metrics**: `normalize_hrv_messages_total{result="success"}` incremented

**Verification Command**:
```sql
SELECT * FROM hrv_data WHERE user_id = 'test-constraint' AND date = '2025-10-01';
-- Expected: rmssd = 45.0 (updated value)
```

---

## Automated Test Coverage

### Unit Tests

**File**: `services/normalize-service/src/__tests__/dlq.test.ts`

Tests the `decideAckAction()` function logic:
- ✅ Valid messages → ACK immediately
- ✅ Invalid messages → NAK up to 4 times
- ✅ 5th delivery → DLQ routing

**Run**: `npm test` in normalize-service directory

### Existing Tests Status

**ingest-service**: ✅ All tests passing (7 tests)
- OAuth flow tests
- Oura webhook tests
- General ingest tests

**normalize-service**: ✅ All tests passing (6 tests)
- DLQ policy tests
- Event structure validation tests

---

## Observability Verification

### Metrics Endpoints

**ingest-service** (port 4101):
```bash
curl http://localhost:4101/metrics | grep event_bus
```

**normalize-service** (port 4102):
```bash
curl http://localhost:4102/metrics | grep -E "(event_bus|normalize_hrv)"
```

**OpenTelemetry Prometheus Exporter** (port 9464):
```bash
curl http://localhost:9464/metrics | grep normalize_hrv_messages_total
```

### Key Metrics to Monitor

| Metric | Labels | Description |
|--------|--------|-------------|
| `event_bus_events_published_total` | topic, status | Events published by ingest-service |
| `event_bus_events_consumed_total` | topic | Events consumed by normalize-service |
| `normalize_hrv_messages_total` | result, subject | HRV processing outcomes (success/retry/dlq/schema_invalid) |
| `http_requests_total` | method, route, status | HTTP endpoint usage |
| `http_request_duration_seconds` | method, route, status | Request latency |

---

## Test Execution Checklist

- [ ] Test 1: Happy Path - Valid HRV Message
- [ ] Test 2: Schema Validation Failure
- [ ] Test 3: Retryable Error (Database Connection Failure)
- [ ] Test 4: Max Retries Exceeded → DLQ
- [ ] Test 5: Database Constraint Violation (Duplicate Key)
- [ ] Verify metrics increments correctly
- [ ] Verify OpenTelemetry traces include JetStream metadata
- [ ] Verify consumer graceful shutdown (SIGTERM/SIGINT)
- [ ] Run `npm test` in both ingest-service and normalize-service

---

## CI/CD Integration

### Automated Test Commands

```bash
# Type-check
npm run type-check --workspaces

# Lint
npm run lint --workspace=@athlete-ally/ingest-service
npm run lint --workspace=@athlete-ally/normalize-service

# Unit Tests
npm test --workspace=@athlete-ally/ingest-service
npm test --workspace=@athlete-ally/normalize-service

# Integration Tests (manual for now)
# TODO: Automate with Docker Compose + test script
```

### Future Enhancements

1. **Dockerized Integration Tests**: Create `docker-compose.test.yml` with NATS, PostgreSQL, and services
2. **Automated E2E Script**: Shell script that runs all test scenarios and validates outcomes
3. **Jest Integration Tests**: Mock NATS and PostgreSQL for deterministic testing
4. **Performance Tests**: Load testing with 100+ concurrent HRV messages
5. **Chaos Engineering**: Random DB/NATS failures to verify resilience

---

**Last Updated**: 2025-10-01
**Maintainer**: Autonomous Collaboration Framework V2.3

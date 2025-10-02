# Normalize Service

Consumes raw health events from NATS JetStream, normalizes data, persists to PostgreSQL, and publishes normalized events.

## Overview

The Normalize Service subscribes to raw health event streams (HRV, Sleep), validates schemas, transforms/normalizes data, stores to PostgreSQL, and publishes typed normalized events for downstream consumption (planning, analytics).

**Responsibilities**:
- Subscribe to raw event streams via durable pull consumers
- Schema validation via `@athlete-ally/event-bus` validator
- Data normalization (vendor field extraction, quality score clamping, calculated fields)
- Database persistence with upsert (unique: userId + date)
- Publish normalized events to JetStream
- DLQ routing for failed messages (schema-invalid, max-deliver, non-retryable)
- Prometheus metrics and OpenTelemetry tracing

**Does NOT**:
- Create/manage JetStream streams (respects `FEATURE_SERVICE_MANAGES_STREAMS` flag)
- Expose HTTP endpoints (consumer-only service, health/metrics only)

---

## Consumers

### Sleep Consumer: `normalize-sleep-durable`

Processes raw Sleep events, persists to `sleep_data` table, publishes normalized events.

**Configuration**:
```bash
# Consumer settings
NORMALIZE_SLEEP_DURABLE=normalize-sleep-durable
NORMALIZE_SLEEP_MAX_DELIVER=5
NORMALIZE_SLEEP_DLQ_SUBJECT=dlq.normalize.sleep.raw-received
NORMALIZE_SLEEP_ACK_WAIT_MS=60000  # 60 seconds

# Feature flags
FEATURE_SERVICE_MANAGES_CONSUMERS=true  # Set to 'false' in CI/prod to bind to existing consumers
```

**Stream Binding**:
- Mode-aware: Prefers `AA_CORE_HOT`, falls back to legacy streams via `getStreamCandidates()`
- Subject filter: `athlete-ally.sleep.raw-received`
- ACK policy: explicit (manual ack/nak/term)
- Deliver policy: all (process all messages from beginning)
- Batch processing: `fetch({ max: 10, expires: 5s })`
- Heartbeat: `m.working()` called every 3 messages

**Processing Flow**:
```
1. Fetch batch from consumer (max 10 messages, 5s timeout)
2. For each message:
   a. Extract OpenTelemetry trace context from headers
   b. Create span: normalize.sleep.consume
   c. Validate schema via eventValidator.validateEvent('sleep_raw_received')
      ↓ invalid → DLQ .schema-invalid + TERM
   d. Call processSleepData(payload):
      - Extract vendor from raw.source (fallback: 'unknown')
      - Clamp qualityScore to 0-100 (null if missing)
      - Upsert sleep_data table (unique: userId + date)
      - Publish athlete-ally.sleep.normalized-stored
   e. ACK on success
   f. On error:
      - Retryable (ECONNREFUSED, timeout, etc.) → NAK(5s) + retry counter
      - Attempt >= 5 → DLQ .max-deliver + TERM
      - Non-retryable (business logic) → DLQ .non-retryable + TERM
3. Record Prometheus metrics: normalize_sleep_messages_total{result, subject, stream, durable}
```

**DLQ Subjects**:
- `dlq.normalize.sleep.raw-received.schema-invalid`: Schema validation failures (non-retryable)
- `dlq.normalize.sleep.raw-received.max-deliver`: Retry exhaustion after 5 attempts
- `dlq.normalize.sleep.raw-received.non-retryable`: Business logic errors (permanent failures)

**Metrics**:
- `normalize_sleep_messages_total{result, subject, stream, durable}`
  - `result`: `success` | `schema_invalid` | `retry` | `dlq`
  - `subject`: `athlete-ally.sleep.raw-received`
  - `stream`: `AA_CORE_HOT` (or fallback stream name)
  - `durable`: `normalize-sleep-durable`

**Database Schema**:
```sql
CREATE TABLE sleep_data (
  id VARCHAR PRIMARY KEY DEFAULT cuid(),
  "userId" VARCHAR NOT NULL,
  date DATE NOT NULL,
  "durationMinutes" INT NOT NULL,
  "qualityScore" INT,                -- 0-100 (clamped), NULL if not provided
  vendor VARCHAR NOT NULL,            -- 'oura' | 'whoop' | 'unknown'
  "capturedAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", date)
);
```

**Prisma Schema** (`services/normalize-service/prisma/schema.prisma`):
```prisma
model SleepData {
  id               String   @id @default(cuid())
  userId           String
  date             DateTime @db.Date
  durationMinutes  Int
  qualityScore     Int?
  vendor           String
  capturedAt       DateTime
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([userId, date])
  @@map("sleep_data")
}
```

---

### HRV Consumer: `normalize-hrv-durable`

Processes raw HRV events, persists to `hrv_data` table, publishes normalized events.

**Configuration**:
```bash
NORMALIZE_HRV_DURABLE=normalize-hrv-durable
NORMALIZE_HRV_MAX_DELIVER=5
NORMALIZE_HRV_DLQ_SUBJECT=dlq.normalize.hrv.raw-received
NORMALIZE_HRV_ACK_WAIT_MS=60000
```

*(Processing flow similar to Sleep consumer)*

---

## Configuration

**Environment Variables**:
```bash
# NATS
NATS_URL=nats://localhost:4223

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/athlete_ally

# Service
PORT=4112                       # HTTP port for health/metrics only
PROMETHEUS_PORT=9464           # Prometheus metrics port
PROMETHEUS_ENDPOINT=/metrics

# Feature Flags
FEATURE_SERVICE_MANAGES_STREAMS=true      # Publish-only when false (no stream creation)
FEATURE_SERVICE_MANAGES_CONSUMERS=true    # Bind to existing consumers when false

# Sleep Consumer
NORMALIZE_SLEEP_DURABLE=normalize-sleep-durable
NORMALIZE_SLEEP_MAX_DELIVER=5
NORMALIZE_SLEEP_DLQ_SUBJECT=dlq.normalize.sleep.raw-received
NORMALIZE_SLEEP_ACK_WAIT_MS=60000

# HRV Consumer
NORMALIZE_HRV_DURABLE=normalize-hrv-durable
NORMALIZE_HRV_MAX_DELIVER=5
NORMALIZE_HRV_DLQ_SUBJECT=dlq.normalize.hrv.raw-received
NORMALIZE_HRV_ACK_WAIT_MS=60000
```

**Stream Mode**:
- **Multi-stream mode** (default): Separate streams per domain (`AA_CORE_HOT`, `AA_DLQ`)
- **Legacy mode**: Single stream `ATHLETE_ALLY_EVENTS` with subject prefixes
- Controlled via `STREAM_MODE` env var in `@athlete-ally/event-bus`

---

## Running Locally

**Prerequisites**:
- Node.js 18+
- PostgreSQL 14+ running
- NATS JetStream server running
- Streams and consumers created (or `FEATURE_SERVICE_MANAGES_CONSUMERS=true`)

**Database Setup**:
```bash
cd services/normalize-service
npm install
npx prisma migrate dev  # Apply migrations
npx prisma generate     # Generate Prisma client
```

**Start Service**:
```bash
npm run dev  # Development mode
# OR
npm run build && npm start  # Production mode
```

**Health Check**:
```bash
curl http://localhost:4112/health
# Expected: {"status":"healthy","services":{"database":"connected","nats":"connected"}}
```

**Metrics**:
```bash
curl http://localhost:4112/metrics
# Prometheus format metrics
```

---

## Testing

**Unit Tests**:
```bash
npm test
# Includes:
# - sleep-consumer.test.ts (retry logic, DLQ routing, config)
# - hrv-consumer.test.ts
# - normalize.test.ts
# - dlq.test.ts
```

**Database Assertion** (for E2E tests):
```bash
DATABASE_URL=postgresql://... \
E2E_USER=smoke-user \
E2E_DATE=2025-10-02 \
node scripts/ci/assert-normalized-sleep.js
# Expected output: ✅ Normalized Sleep row OK: {...}
```

**Smoke Test** (requires full stack):
```bash
# Ensure NATS, PostgreSQL, ingest-service, normalize-service running
node scripts/smoke-sleep.js
```

---

## Observability

### Metrics

**Prometheus** (via `prom-client` and `@athlete-ally/telemetry-bootstrap`):
- `normalize_sleep_messages_total{result, subject, stream, durable}`: Message processing counter
- `normalize_hrv_messages_total{result, subject, stream, durable}`: HRV processing counter
- Default Node.js metrics: CPU, memory, event loop lag

**OpenTelemetry** (via `@athlete-ally/telemetry-bootstrap`):
- `normalize_sleep_messages_total`: OTel counter (same labels)
- `normalize_hrv_messages_total`: OTel counter (same labels)

### Tracing

**Spans**:
- `normalize.sleep.consume`: Sleep message processing span
  - Attributes:
    - `messaging.system`: "nats"
    - `messaging.destination`: "athlete-ally.sleep.raw-received"
    - `messaging.operation`: "process"
    - `messaging.nats.stream`: Stream name (e.g., "AA_CORE_HOT")
    - `messaging.nats.stream_sequence`: JetStream sequence number
    - `messaging.nats.delivery_sequence`: Delivery attempt sequence
    - `messaging.redelivery_count`: Number of redeliveries (deliveryCount - 1)
- `normalize.hrv.consume`: HRV message processing span (similar attributes)

**Trace Propagation**:
- Extracts trace context from NATS message headers (W3C Trace Context format)
- Creates child span for normalization processing
- Trace ID propagated from ingest → normalize → downstream consumers

### Logs

**Structured JSON logs** (via Fastify logger):
- `[normalize] Processing Sleep message: {streamSeq, deliverySeq, redeliveries}`
- `[normalize] Sleep validation passed, processing data...`
- `[normalize] Sleep data processed successfully`
- `[normalize] Sleep validation failed: {errors}` (DLQ routing)
- `[normalize] Retryable error, NAK with delay: {attempt, error}`
- `[normalize] maxDeliver reached, sending to DLQ: {dlqSubject, attempt}`

**PII Protection**: userId logged as `'present'`, not raw value.

---

## Error Handling

### Retryable Errors
Errors that trigger NAK with 5-second delay (up to 5 attempts):
- `ECONNREFUSED`: Database connection refused
- `ETIMEDOUT`: Connection timeout
- `timeout`: Generic timeout
- `Connection`: Connection errors
- `ENOTFOUND`: Host not found

### Non-Retryable Errors
Errors that go directly to DLQ:
- Schema validation failures → `.schema-invalid`
- Business logic errors (e.g., invalid data after validation) → `.non-retryable`
- Retry exhaustion (5 attempts) → `.max-deliver`

### DLQ Replay
See [Sleep Troubleshooting Runbook](../../docs/runbook/sleep-troubleshooting.md#dlq-replay) for steps to inspect and replay DLQ messages.

---

## Related Documentation

- [Sleep Event Flow Architecture](../../docs/architecture/sleep-event-flow.md)
- [Ingest Service README](../ingest-service/README.md)
- [Sleep Troubleshooting Runbook](../../docs/runbook/sleep-troubleshooting.md)
- [Event Bus Package](../../packages/event-bus/README.md)

---

## Observability: Sleep Pipeline

- Dashboard: monitoring/grafana/normalize-dashboard-sleep.json (import into Grafana; select DS_PROMETHEUS).
- Variables: job (default normalize), stream (AA_CORE_HOT), durable (normalize-sleep-durable).
- Metrics:
  - normalize_sleep_messages_total{result,subject,stream,durable}
  - event_bus_event_processing_duration_seconds_bucket{topic="sleep_raw_received", operation="consume|publish"}

### Tracing Verification (W3C traceparent)
- Ensure event-bus publishes inject headers (traceparent/tracestate) via OpenTelemetry.
- Steps:
  1) Send a Sleep payload (non-PII):
     - curl -X POST http://localhost:4101/ingest/sleep -H "content-type: application/json" -d '{"eventId":"e1","payload":{"userId":"smoke-user","date":"2025-10-01","durationMinutes":420}}'
  2) Observe normalize logs for received message and processing span; headers visible at receive if logged.
  3) Temporary subscriber (Node) to inspect headers live:
```ts
import { connect, headers } from 'nats';
const nc = await connect({ servers: process.env.NATS_URL || 'nats://localhost:4223' });
const js = nc.jetstream();
const sub = await js.pullSubscribe('athlete-ally.sleep.raw-received', { durable: 'tmp-inspect' } as any);
const msgs = await (sub as any).fetch({ max: 1, expires: 1000 });
for (const m of msgs) { console.log('headers:', m.headers?.toString?.()); m.ack(); }
```

### Using The Dashboard
- Sleep Messages by Result: stacked counts (success/retry/dlq). ZH: 結果分佈堆疊。
- DLQ Trend: result=dlq rate. ZH: DLQ 趨勢。
- Processing Duration p95/p99: prefer consume; publish is optional. ZH: 延遲分位。
- Consumer Lag: follow text panel instructions (NATS CLI primary; Soak script fallback). ZH: 延遲以 CLI 或 Soak 腳本檢查。

### Alerts
- File: monitoring/alert_rules.yml (group sleep-pipeline)
- WARN: DLQ rate > 0 for 5m
- WARN: Lag > 100 for 5m (placeholder if exporter missing)
- CRIT: No successes in 5m
- Runbook: docs/runbook/sleep-troubleshooting.md

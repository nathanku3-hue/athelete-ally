# Ingest Service

REST API for ingesting raw health data from vendor webhooks and user-initiated events.

## Overview

The Ingest Service provides HTTP endpoints for accepting raw health metrics (HRV, Sleep) and publishing them to the event bus for downstream processing.

**Responsibilities**:
- Validate incoming request payloads
- Generate event IDs
- Publish typed events to NATS JetStream
- Return synchronous confirmation to clients

**Does NOT**:
- Store data to database (normalization layer's responsibility)
- Process/transform metrics (handled downstream)
- Manage event consumers (publish-only service)

---

## Endpoints

### POST /api/v1/ingest/sleep

Ingests raw Sleep data and publishes to the event bus.

**Request Body**:
```json
{
  "userId": "user-123",
  "date": "2025-10-02",
  "durationMinutes": 420,
  "raw": {
    "source": "oura",
    "qualityScore": 85
  }
}
```

**Fields**:
- `userId` *(required)*: User identifier (non-empty string)
- `date` *(required)*: Sleep date in ISO format `YYYY-MM-DD`
- `durationMinutes` *(required)*: Total sleep duration in minutes (non-negative integer)
- `raw` *(optional)*: Vendor-specific metadata (object)
  - `source`: Vendor name (e.g., "oura", "whoop")
  - `qualityScore`: Sleep quality score (0-100, will be clamped during normalization)

**Response** (200 OK):
```json
{
  "message": "Sleep data ingested successfully",
  "eventId": "evt_abc123..."
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Validation failed",
  "details": [
    "date: Required"
  ]
}
```

**Validation Rules**:
- `userId`: Must be non-empty string
- `date`: Must match `YYYY-MM-DD` format
- `durationMinutes`: Must be >= 0
- If `raw` provided, must be valid JSON object

**Event Published**: `athlete-ally.sleep.raw-received`
```typescript
{
  eventId: string;
  payload: {
    userId: string;
    date: string;
    durationMinutes: number;
    capturedAt?: string; // Auto-generated if not provided
    raw?: Record<string, unknown>;
  };
}
```

---

### POST /api/v1/ingest/hrv

Ingests raw HRV data and publishes to the event bus.

**Request Body**:
```json
{
  "userId": "user-123",
  "date": "2025-10-02",
  "rMSSD": 42.5,
  "raw": {
    "source": "oura"
  }
}
```

**Event Published**: `athlete-ally.sleep.raw-received`

---

## Configuration

**Environment Variables**:
```bash
# Server
PORT=4101                      # HTTP server port
NODE_ENV=production            # Environment (development|production)

# NATS
NATS_URL=nats://localhost:4223 # NATS server URL

# Event Bus (from @athlete-ally/event-bus)
EVENT_STREAM_MODE=multi        # Stream mode: multi (AA_CORE_HOT, AA_DLQ) or legacy (ATHLETE_ALLY_EVENTS)
FEATURE_SERVICE_MANAGES_STREAMS=false  # Set to 'true' to allow service to create streams (dev only)
```

**NATS Configuration**:
- Publishes to JetStream streams (does not create/manage streams in prod)
- Uses typed publishers from `@athlete-ally/event-bus`
- Respects `FEATURE_SERVICE_MANAGES_STREAMS` flag (publish-only when false)
- Multi-stream mode uses `AA_CORE_HOT` for core events, `AA_DLQ` for dead letters

---

## Running Locally

**Prerequisites**:
- Node.js 18+
- NATS JetStream server running
- `@athlete-ally/contracts` and `@athlete-ally/event-bus` packages built

**Start Service**:
```bash
cd services/ingest-service
npm install
npm run dev  # Development mode with hot reload
# OR
npm run build && npm start  # Production mode
```

**Health Check**:
```bash
curl http://localhost:4101/health
# Expected: {"status":"healthy","services":{"nats":"connected"}}
```

---

## Testing

**Unit Tests**:
```bash
npm test
```

**Smoke Test** (requires running services):
```bash
# Start infrastructure
docker-compose up -d nats postgres ingest-service normalize-service

# Run smoke test with default settings
node scripts/smoke-sleep.js
# Or: npm run e2e:sleep

# Or with custom configuration
INGEST_BASE_URL=http://localhost:4101 \
NATS_URL=nats://localhost:4223 \
DATABASE_URL=postgresql://user:password@localhost:5432/athlete_ally \
STREAM_NAME=AA_CORE_HOT \
E2E_USER=smoke-user \
E2E_DATE=$(date +%Y-%m-%d) \
node scripts/smoke-sleep.js

# CI mode (skip if infrastructure unavailable)
CI_SKIP_E2E=1 npm run e2e:sleep

# CI mode (run only when infra available)
CI_E2E=1 npm run e2e:sleep
```

**Manual Test**:
```bash
curl -X POST http://localhost:4101/api/v1/ingest/sleep \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "date": "2025-10-02",
    "durationMinutes": 420,
    "raw": {"source": "oura", "qualityScore": 85}
  }'
```

---

## Observability

**Metrics**:
- Published via `@athlete-ally/event-bus` metrics:
  - `event_bus_events_published_total{topic, status}`
  - `event_bus_schema_validation_total{topic, status}`

**Logs**:
- Structured JSON logs (via Fastify logger)
- Log levels: info, warn, error
- PII protection: userId logged as "present", not raw value

**Tracing**:
- OpenTelemetry spans via `@athlete-ally/telemetry-bootstrap`
- Span name: `ingest.sleep.publish`
- Trace context propagated to NATS headers for distributed tracing

---

## Error Handling

| Error | Status | Description |
|-------|--------|-------------|
| Missing required field | 400 | Zod validation failure (e.g., "date: Required") |
| Invalid date format | 400 | Date must be `YYYY-MM-DD` |
| Negative durationMinutes | 400 | Must be non-negative integer |
| NATS connection error | 500 | Event bus unavailable |
| Schema validation failure | 500 | Event doesn't match contract (internal error) |

---

## Related Documentation

- [Sleep Event Flow Architecture](../../docs/architecture/sleep-event-flow.md)
- [Normalize Service README](../normalize-service/README.md)
- [Sleep Troubleshooting Runbook](../../docs/runbook/sleep-troubleshooting.md)

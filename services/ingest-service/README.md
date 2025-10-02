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
PORT=4101                      # HTTP server port
NATS_URL=nats://localhost:4223 # NATS server URL
NODE_ENV=production            # Environment (development|production)
```

**NATS Configuration**:
- Publishes to JetStream streams (does not create/manage streams)
- Uses typed publishers from `@athlete-ally/event-bus`
- Respects `FEATURE_SERVICE_MANAGES_STREAMS` flag (publish-only when false)

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
# Ensure NATS, ingest-service, normalize-service are running
node scripts/smoke-sleep.js
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

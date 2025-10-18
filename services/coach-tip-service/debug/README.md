# Coach Tip Service - Debug Scripts

This directory contains development and debugging utilities for the coach-tip service. These scripts are **not intended for production use**.

## Available Scripts

### `check-consumer.js`
Inspects the NATS consumer configuration and state.

**Usage:**
```bash
node debug/check-consumer.js
```

**What it does:**
- Connects to NATS JetStream
- Displays stream information (message count, consumers)
- Lists all consumers and their configuration
- Shows pending/delivered message counts

**Environment Variables:**
- `NATS_URL` - NATS server URL (default: `nats://localhost:4223`)

---

### `smoke-test.js`
End-to-end smoke test for the coach-tip service.

**Usage:**
```bash
# Make sure the service is running first
npm start

# In another terminal:
node debug/smoke-test.js
```

**What it does:**
1. Checks service health endpoint
2. Verifies NATS JetStream connectivity
3. Publishes a test `plan_generated` event
4. Waits for tip generation
5. Retrieves the generated tip via API
6. Displays storage statistics

**Environment Variables:**
- `API_URL` - Service API URL (default: `http://localhost:4106`)
- `NATS_URL` - NATS server URL (default: `nats://localhost:4223`)

---

### `test-publish-event.js`
Publishes a single test event to NATS for manual testing.

**Usage:**
```bash
node debug/test-publish-event.js
```

**What it does:**
- Publishes a `plan_generated` event to NATS
- Returns the generated `planId` for API testing
- Prints curl command for manual tip retrieval

**Environment Variables:**
- `NATS_URL` - NATS server URL (default: `nats://localhost:4223`)

**Example Output:**
```
Publishing test plan_generated event: abc-123-def
Event published successfully!
Test planId: abc-123-def

To test via API: curl http://localhost:4106/v1/plans/abc-123-def/coach-tip
```

---

## Prerequisites

All scripts require:
- **Node.js 18+**
- **NATS server** running with JetStream enabled
- **Redis** running (for smoke-test.js)
- **Coach-tip service** running (for smoke-test.js)

## Quick Setup

```bash
# Start infrastructure
docker-compose up -d nats redis

# Start the service
cd services/coach-tip-service
npm start

# Run debug scripts
node debug/smoke-test.js
```

## Notes

- These scripts use hardcoded test data (UUIDs, scores)
- Not suitable for production debugging
- For production issues, use the observability endpoints:
  - `GET /health` - Service health
  - `GET /metrics` - Prometheus metrics
  - `GET /v1/coach-tips/stats` - Storage statistics

## Troubleshooting

**NATS connection errors:**
- Ensure NATS is running: `docker ps | grep nats`
- Check NATS URL: `echo $NATS_URL`

**Service not responding:**
- Check service logs: `npm start`
- Verify port is correct: `4106` (not `4103`)

**Tip not generated:**
- Check subscriber logs for errors
- Verify event schema matches contract
- Check Redis connectivity

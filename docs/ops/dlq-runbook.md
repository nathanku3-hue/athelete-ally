# Dead Letter Queue (DLQ) Operations Runbook

## Overview

This runbook provides operational guidance for handling Dead Letter Queue (DLQ) messages in the normalize-service. DLQ messages indicate processing failures that require investigation and remediation.

## Alert: DLQMessagesDetected

**Alert Name:** `DLQMessagesDetected`
**Severity:** Warning
**Service:** normalize-service
**Threshold:** `sum(rate(dlq_messages_total[5m])) > 0` for 5 minutes
**Alert Definition:** `monitoring/normalize-alerts.yml`

### What This Alert Means

Messages are being routed to the Dead Letter Queue due to:
- Schema validation failures (malformed or invalid data)
- Maximum delivery attempts exceeded (persistent processing errors)
- Non-retryable errors (data corruption, critical failures)

### Affected Consumers

The normalize-service has three message consumers:
1. **HRV Consumer** - Processes `hrv.raw.received` events
2. **Sleep Consumer** - Processes `sleep.raw.received` events
3. **Oura Webhook Consumer** - Processes `vendor.oura.webhook.received` events

## Investigation Steps

### 1. Check DLQ Metrics

Query Prometheus to identify which consumer and failure reason is most prevalent:

```promql
# Total DLQ messages by consumer
sum by (consumer) (rate(dlq_messages_total[5m]))

# Total DLQ messages by reason
sum by (reason) (rate(dlq_messages_total[5m]))

# DLQ messages by consumer and reason
sum by (consumer, reason) (rate(dlq_messages_total[5m]))
```

**Metric Labels:**
- `consumer`: `hrv`, `sleep`, `oura`
- `reason`: `schema_invalid`, `max_deliver`, `non_retryable`
- `subject`: Event subject name (e.g., `hrv.raw.received`)

### 2. Check Service Logs

```bash
# Get recent DLQ-related logs
kubectl logs -n athlete-ally deployment/normalize-service --tail=100 | grep -i dlq

# Or via Docker Compose
docker compose logs normalize-service --tail=100 | grep -i dlq
```

**Log Patterns to Look For:**
- `Sent schema-invalid message to DLQ`
- `maxDeliver reached, sending to DLQ`
- `Non-retryable error, sending to DLQ`
- `Failed to publish to DLQ` (critical - indicates DLQ publishing failure)

### 3. Inspect DLQ Subjects

DLQ messages are published to different subjects based on failure type:

**HRV Consumer DLQ Subjects:**
- `dlq.normalize.hrv.raw-received.schema-invalid`
- `dlq.normalize.hrv.raw-received.max-deliver`
- `dlq.normalize.hrv.raw-received.non-retryable`

**Sleep Consumer DLQ Subjects:**
- `dlq.normalize.sleep.raw-received.schema-invalid`
- `dlq.normalize.sleep.raw-received.max-deliver`
- `dlq.normalize.sleep.raw-received.non-retryable`

**Oura Consumer DLQ Subjects:**
- `dlq.vendor.oura.webhook.schema-invalid`
- `dlq.vendor.oura.webhook.max-deliver`
- `dlq.vendor.oura.webhook.non-retryable`

Use NATS CLI to inspect messages:

```bash
# List DLQ streams
nats stream ls | grep dlq

# View messages in a DLQ subject (example: HRV schema-invalid)
nats consumer next dlq.normalize.hrv.raw-received.schema-invalid --count 10
```

### 4. Analyze Message Content

For each DLQ message, check:
- **Headers:** Look for trace context, retry count, error details
- **Payload:** Validate against expected schema
- **Timestamp:** When was the message originally received?

## Resolution Steps

### Schema Validation Failures (`schema_invalid`)

**Root Cause:** Message payload does not match the expected event schema.

**Resolution:**
1. Review the failed message payload structure
2. Compare against schema definitions in `packages/contracts/src/events`
3. Determine if the issue is:
   - **Invalid upstream data:** Contact data provider (Oura, Whoop, etc.)
   - **Schema drift:** Update schema to accommodate valid but unexpected formats
   - **Integration bug:** Fix the ingest service producing invalid events

**Remediation:**
- For one-off data issues: Discard the message (already in DLQ)
- For schema drift: Update event schemas and re-publish corrected messages
- For integration bugs: Fix the bug, then replay messages from DLQ after fix is deployed

### Max Delivery Failures (`max_deliver`)

**Root Cause:** Message failed processing after maximum retry attempts (default: 5).

**Resolution:**
1. Review error logs to identify the failure reason
2. Common causes:
   - Database connection issues
   - Downstream service unavailable
   - Resource exhaustion (memory, CPU)
3. Fix the underlying issue
4. Consider replaying messages after fix is deployed

**Environment Variables (Tuning):**
- `NORMALIZE_HRV_MAX_DELIVER` (default: 5)
- `NORMALIZE_SLEEP_MAX_DELIVER` (default: 5)
- `NORMALIZE_OURA_MAX_DELIVER` (default: 5)

### Non-Retryable Errors (`non_retryable`)

**Root Cause:** Processing error that cannot be recovered via retry.

**Resolution:**
1. Review the specific error message in logs
2. Non-retryable errors are typically:
   - Data corruption (unparseable JSON)
   - Invalid data types
   - Business logic violations
3. These messages require manual intervention or may need to be discarded

**Code Reference:** See `isRetryable()` function in `services/normalize-service/src/index.ts`

## Message Replay

### When to Replay

Replay DLQ messages after:
- Schema has been updated to accept previously invalid formats
- Downstream service outage has been resolved
- Bug fix has been deployed that resolves the processing error

### How to Replay

**Option 1: Manual Republish via NATS CLI**

```bash
# Subscribe to DLQ subject and republish to original subject
nats consumer next dlq.normalize.hrv.raw-received.schema-invalid --count 10 \
  | nats pub hrv.raw.received
```

**Option 2: Automated Replay Script**

```bash
# Run the DLQ replay utility (to be implemented)
npm run dlq:replay -- --consumer hrv --reason schema_invalid --count 100
```

### Idempotency

The normalize-service uses upsert operations (Prisma `upsert`) with unique constraints:
- HRV: `userId_date` unique constraint
- Sleep: `userId_date` unique constraint

Replaying messages is safe and will not create duplicates.

## Prevention

### Monitoring

- Review DLQ metrics weekly in Grafana dashboard
- Set up alerting thresholds appropriate for your traffic volume
- Track trends over time to identify systemic issues

### Testing

- Validate upstream event schemas in integration tests
- Test error handling paths (schema validation, retries, DLQ routing)
- Load test with malformed data to verify DLQ routing

### Schema Governance

- Coordinate schema changes with upstream data providers
- Version event schemas and maintain backward compatibility
- Document schema evolution in `packages/contracts/CHANGELOG.md`

## Escalation

**SEV-3 (Low):** < 10 messages/hour → Monitor and investigate during business hours
**SEV-2 (Medium):** 10-100 messages/hour → Investigate within 1 hour
**SEV-1 (Critical):** > 100 messages/hour or DLQ publishing failures → Page on-call engineer

## References

- **Metric Implementation:** `services/normalize-service/src/index.ts:82-88`
- **Alert Rule:** `monitoring/normalize-alerts.yml:6-14`
- **Event Schemas:** `packages/contracts/src/events/`
- **DLQ Configuration:** Environment variables in `.env` files
- **NATS JetStream Docs:** https://docs.nats.io/nats-concepts/jetstream

## Related Documentation

- [Phase 3 Ops - Alerts & Runbooks](../phase-3/ops/alerts-runbooks.md)
- [Architecture - Sleep Event Flow](../architecture/sleep-event-flow.md)
- [Contract Backward Compatibility Runbook](../contract-backward-compatibility-runbook.md)

# Sleep Troubleshooting Runbook

Operational guide for diagnosing and resolving Sleep event pipeline issues.

## Quick Reference

| Symptom | Likely Cause | Jump To |
|---------|--------------|---------|
| Ingest returns 400 | Invalid request payload | [Invalid Payload](#invalid-payload) |
| Ingest returns 500 | NATS connection error | [NATS Connection Issues](#nats-connection-issues) |
| Events not in database | Normalize service down or consumer not processing | [No DB Writes](#no-database-writes) |
| Duplicate Sleep rows | Unique constraint not applied | [Duplicate Rows](#duplicate-sleep-rows-in-database) |
| Quality score > 100 or < 0 | Clamping logic not working | [Quality Score Issues](#quality-score-not-clamped) |
| Vendor always 'unknown' | raw.source not provided or incorrect | [Vendor Detection](#vendor-always-unknown) |
| High DLQ backlog | Persistent errors or maxDeliver exhaustion | [DLQ Monitoring](#dlq-monitoring) |

---

## DLQ Operations

### Check DLQ Backlog

**View all DLQ subjects**:
```bash
nats stream subjects AA_DLQ
# Lists all subjects with message counts
```

**Check schema-invalid DLQ**:
```bash
nats stream view AA_DLQ --last-by-subject="dlq.normalize.sleep.raw-received.schema-invalid"
```

**Check max-deliver DLQ** (retry exhaustion):
```bash
nats stream view AA_DLQ --last-by-subject="dlq.normalize.sleep.raw-received.max-deliver"
```

**Check non-retryable DLQ**:
```bash
nats stream view AA_DLQ --last-by-subject="dlq.normalize.sleep.raw-received.non-retryable"
```

---

### Inspect Failed Message

**Get latest message from DLQ**:
```bash
nats stream view AA_DLQ --last-by-subject="dlq.normalize.sleep.raw-received.schema-invalid"
```

**Get specific message by sequence number**:
```bash
nats stream get AA_DLQ 12345
```

**Decode message payload** (if base64 encoded):
```bash
nats stream get AA_DLQ 12345 --json | jq '.data | @base64d | fromjson'
```

**Example output**:
```json
{
  "eventId": "evt_abc123",
  "payload": {
    "userId": "user-456",
    "date": "2025-10-02",
    "durationMinutes": 420,
    "raw": {
      "source": "oura",
      "qualityScore": 85
    }
  }
}
```

---

### Replay from DLQ

**After fixing the root cause**, republish messages to the original subject:

**Single message replay**:
```bash
# Get raw message data
nats stream get AA_DLQ <seq> --raw > /tmp/failed-msg.json

# Republish to original subject
nats pub athlete-ally.sleep.raw-received --file /tmp/failed-msg.json
```

**Bulk replay** (all schema-invalid messages):
```bash
# WARNING: Use with caution - replays all messages
for seq in $(nats stream view AA_DLQ --subject="dlq.normalize.sleep.raw-received.schema-invalid" --json | jq -r '.seq'); do
  nats pub athlete-ally.sleep.raw-received "$(nats stream get AA_DLQ $seq --raw)"
  echo "Replayed seq $seq"
done
```

---

### Purge DLQ (After Manual Resolution)

**Purge specific subject**:
```bash
nats stream purge AA_DLQ --subject="dlq.normalize.sleep.raw-received.schema-invalid" --force
```

**Purge all DLQ messages** (use with extreme caution):
```bash
nats stream purge AA_DLQ --force
```

---

## Common Issues

### No Database Writes

**Symptoms**:
- Ingest returns 200 OK
- `sleep_data` table remains empty
- No errors in ingest-service logs

**Diagnosis**:

1. **Check normalize-service is running**:
   ```bash
   curl http://localhost:4112/health
   # Expected: {"status":"healthy","services":{"database":"connected","nats":"connected"}}
   ```

2. **Check consumer binding**:
   ```bash
   nats consumer info AA_CORE_HOT normalize-sleep-durable
   # Look for: Delivered/Ack'd message counts
   ```

3. **Check normalize-service logs**:
   ```bash
   docker logs normalize-service --tail 100 | grep -i sleep
   # OR
   journalctl -u normalize-service --since "5 minutes ago" | grep -i sleep
   ```

4. **Look for schema validation failures**:
   ```bash
   docker logs normalize-service | grep "Sleep validation failed"
   ```

5. **Check DLQ for schema-invalid messages**:
   ```bash
   nats stream view AA_DLQ --last-by-subject="dlq.normalize.sleep.raw-received.schema-invalid"
   ```

**Common Causes**:

| Cause | Evidence | Fix |
|-------|----------|-----|
| Normalize service not running | Health check fails | Restart service: `docker restart normalize-service` |
| Consumer not created | `nats consumer info` returns 404 | Create consumer (see [Consumer Setup](#consumer-setup)) |
| Schema mismatch | DLQ `.schema-invalid` has messages | Fix event payload to match `SleepRawReceivedEvent` contract |
| Database connection failure | Logs show `ECONNREFUSED` | Check PostgreSQL: `psql $DATABASE_URL -c "SELECT 1"` |
| Wrong stream | Consumer bound to wrong stream | Verify `STREAM_MODE` env var, check stream config |

---

### Duplicate Sleep Rows in Database

**Symptoms**:
- Multiple rows in `sleep_data` for same `userId + date`
- Expected: Single row (upsert behavior)

**Diagnosis**:

1. **Check for duplicate rows**:
   ```sql
   SELECT "userId", date, COUNT(*) as count
   FROM sleep_data
   GROUP BY "userId", date
   HAVING COUNT(*) > 1;
   ```

2. **Check Prisma schema for unique constraint**:
   ```bash
   cd services/normalize-service
   cat prisma/schema.prisma | grep -A 5 "model SleepData"
   # Expected: @@unique([userId, date])
   ```

3. **Check if migration applied**:
   ```sql
   SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;
   ```

**Fix**:

**Option 1: Apply migration** (if constraint missing):
```bash
cd services/normalize-service
npx prisma migrate deploy
```

**Option 2: Manually create constraint**:
```sql
ALTER TABLE sleep_data ADD CONSTRAINT sleep_data_userId_date_key UNIQUE ("userId", date);
```

**Option 3: Clean up duplicates** (keep latest row):
```sql
WITH ranked_rows AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "userId", date ORDER BY "createdAt" DESC) as rn
  FROM sleep_data
)
DELETE FROM sleep_data
WHERE id IN (SELECT id FROM ranked_rows WHERE rn > 1);
```

**Root Causes**:
- Migration not applied (Prisma schema has constraint, but DB doesn't)
- Race condition (unlikely with userId+date upsert, but check `max_ack_pending` setting)
- Manual SQL inserts bypassing upsert logic

---

### Quality Score Not Clamped

**Symptoms**:
- Database has `qualityScore > 100` or `qualityScore < 0`
- Expected: Values clamped to 0-100 range

**Diagnosis**:

1. **Check for out-of-range values**:
   ```sql
   SELECT id, "userId", date, "qualityScore"
   FROM sleep_data
   WHERE "qualityScore" > 100 OR "qualityScore" < 0;
   ```

2. **Check `processSleepData()` clamping logic**:
   ```bash
   cd services/normalize-service
   grep -A 3 "qualityScore" src/index.ts | grep -A 1 "Math.min"
   # Expected: Math.min(100, Math.max(0, raw.qualityScore))
   ```

**Fix**:

**Option 1: Clamp existing rows**:
```sql
UPDATE sleep_data
SET "qualityScore" = LEAST(100, GREATEST(0, "qualityScore"))
WHERE "qualityScore" > 100 OR "qualityScore" < 0;
```

**Option 2: Fix code** (if clamping logic missing):
```typescript
// In services/normalize-service/src/index.ts, processSleepData()
const qualityScore = (raw && typeof raw === 'object' && 'qualityScore' in raw && typeof raw.qualityScore === 'number')
  ? Math.min(100, Math.max(0, raw.qualityScore))  // Clamp to 0-100
  : null;
```

**Root Causes**:
- Clamping logic not implemented
- Code deployed before PR-3 merged (no clamping in earlier versions)
- Manual database updates bypassing normalize logic

---

### Vendor Always 'Unknown'

**Symptoms**:
- `vendor` column always shows `'unknown'`
- Expected: `'oura'`, `'whoop'`, or vendor name from `raw.source`

**Diagnosis**:

1. **Check raw events**:
   ```bash
   nats stream view AA_CORE_HOT --last-by-subject="athlete-ally.sleep.raw-received" --json | jq '.data | @base64d | fromjson | .payload.raw'
   # Check if raw.source is present
   ```

2. **Check vendor extraction logic**:
   ```bash
   cd services/normalize-service
   grep -A 5 "vendor =" src/index.ts | head -10
   # Expected: const vendor = (raw && 'source' in raw && typeof raw.source === 'string') ? raw.source : 'unknown';
   ```

3. **Check database values**:
   ```sql
   SELECT vendor, COUNT(*) as count
   FROM sleep_data
   GROUP BY vendor;
   ```

**Fix**:

**Option 1: Ensure ingest sends `raw.source`**:
```bash
# Test with curl
curl -X POST http://localhost:4101/api/v1/ingest/sleep \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "date": "2025-10-02",
    "durationMinutes": 420,
    "raw": {"source": "oura"}
  }'
```

**Option 2: Fix vendor extraction** (if logic incorrect):
```typescript
// In services/normalize-service/src/index.ts, processSleepData()
const vendor = (raw && typeof raw === 'object' && 'source' in raw && typeof raw.source === 'string')
  ? raw.source
  : 'unknown';
```

**Option 3: Update existing rows** (if vendor webhook provides source):
```sql
-- This requires raw data to be re-ingested or manually mapped
UPDATE sleep_data SET vendor = 'oura' WHERE vendor = 'unknown' AND ...;
```

**Root Causes**:
- Vendor webhook doesn't send `raw.source` field
- Ingest service not passing through `raw` object
- Vendor extraction logic has typo (e.g., checking wrong field name)

---

### Schema Validation Failures (DLQ)

**Symptoms**:
- DLQ `.schema-invalid` subject has messages
- Metrics show `normalize_sleep_messages_total{result="schema_invalid"}` increasing

**Diagnosis**:

1. **View failed message**:
   ```bash
   nats stream view AA_DLQ --last-by-subject="dlq.normalize.sleep.raw-received.schema-invalid" --json | jq '.data | @base64d | fromjson'
   ```

2. **Check validation errors** (from normalize logs):
   ```bash
   docker logs normalize-service | grep "Sleep validation failed"
   # Look for specific error messages
   ```

3. **Compare against contract**:
   ```bash
   cd packages/contracts
   cat src/events/sleep.ts
   # Review SleepRawReceivedEvent schema
   ```

**Common Validation Errors**:

| Error | Cause | Fix |
|-------|-------|-----|
| `date: Required` | Missing `date` field | Ensure ingest sends date |
| `date: Invalid date format` | Date not in `YYYY-MM-DD` format | Fix date formatting in webhook/ingest |
| `durationMinutes: Expected number, received string` | Type mismatch | Convert to number before ingesting |
| `durationMinutes: Number must be greater than or equal to 0` | Negative duration | Validate at ingest layer |

**Fix**:
1. Identify root cause from error message
2. Fix publisher (ingest service or webhook adapter)
3. Replay failed messages from DLQ (see [Replay from DLQ](#replay-from-dlq))

---

### Max-Deliver Exhaustion (DLQ)

**Symptoms**:
- DLQ `.max-deliver` subject has messages
- Metrics show `normalize_sleep_messages_total{result="dlq"}` increasing
- Consumer attempted 5 retries without success

**Diagnosis**:

1. **View failed message**:
   ```bash
   nats stream view AA_DLQ --last-by-subject="dlq.normalize.sleep.raw-received.max-deliver"
   ```

2. **Check normalize logs for repeated errors**:
   ```bash
   docker logs normalize-service --since 10m | grep -A 5 "Retryable error, NAK with delay"
   # Look for patterns: ECONNREFUSED (DB down), timeout (slow query)
   ```

3. **Check database health**:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"  # Test connection
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM sleep_data"  # Test query
   ```

4. **Check consumer redelivery count**:
   ```bash
   nats consumer info AA_CORE_HOT normalize-sleep-durable
   # Look for: Redelivered count (high = retries happening)
   ```

**Common Causes**:

| Cause | Evidence | Fix |
|-------|----------|-----|
| Database connection failures | Logs show `ECONNREFUSED` | Restart PostgreSQL, check network |
| Slow queries (timeout) | Logs show `ETIMEDOUT` | Optimize queries, increase `ack_wait` |
| NATS connection issues | Logs show `Connection` errors | Check NATS server health |
| Transient errors (flapping service) | Errors occur intermittently | Investigate service stability |

**Fix**:
1. Resolve root cause (e.g., restart database, fix network)
2. Verify system health: `curl http://localhost:4112/health`
3. Replay messages from DLQ: See [Replay from DLQ](#replay-from-dlq)

---

## Consumer Setup

### Verify Consumer Exists

```bash
nats consumer info AA_CORE_HOT normalize-sleep-durable
```

**Expected output**:
```
Information for Consumer AA_CORE_HOT > normalize-sleep-durable
...
Configuration:
  Durable Name: normalize-sleep-durable
  Filter Subject: athlete-ally.sleep.raw-received
  Ack Policy: explicit
  Ack Wait: 1m0s
  Max Deliver: 5
  ...
```

### Create Consumer Manually (if missing)

**Note**: Normalize service creates consumers automatically when `FEATURE_SERVICE_MANAGES_CONSUMERS=true` (default). Use manual creation only if you've disabled service-managed consumers.

```bash
nats consumer add AA_CORE_HOT normalize-sleep-durable \
  --filter athlete-ally.sleep.raw-received \
  --ack explicit \
  --pull \
  --deliver all \
  --max-deliver 5 \
  --ack-wait 60s \
  --max-ack-pending 1000
```

### Delete and Recreate Consumer (Reset State)

**Warning**: Deleting a consumer resets its state. Unprocessed messages will be redelivered from the beginning.

```bash
# Delete consumer
nats consumer rm AA_CORE_HOT normalize-sleep-durable --force

# Recreate (service will auto-create on next restart if FEATURE_SERVICE_MANAGES_CONSUMERS=true)
docker restart normalize-service
```

---

## Manual DLQ Simulation (Testing)

For testing DLQ routing, you can temporarily modify the normalize service to force errors.

### Force Schema-Invalid DLQ

**Edit `services/normalize-service/src/index.ts`**:
```typescript
// In handleSleepMessage(), before schema validation:
if (process.env.FORCE_SCHEMA_INVALID === '1') {
  const validation = { valid: false, errors: ['Forced schema invalid for testing'] };
  // ... rest of schema-invalid handling
}
```

**Run**:
```bash
FORCE_SCHEMA_INVALID=1 npm run dev
# Send test event → will go to .schema-invalid DLQ
```

---

### Force Max-Deliver DLQ

**Edit `services/normalize-service/src/index.ts`**:
```typescript
// In handleSleepMessage(), after schema validation:
if (process.env.FORCE_RETRYABLE_ERROR === '1') {
  throw new Error('ECONNREFUSED - Forced for testing');
}
```

**Run**:
```bash
FORCE_RETRYABLE_ERROR=1 npm run dev
# Send test event → will NAK 5 times → .max-deliver DLQ
```

---

### Force Non-Retryable DLQ

**Edit `services/normalize-service/src/index.ts`**:
```typescript
// In processSleepData():
if (process.env.FORCE_NON_RETRYABLE === '1') {
  throw new Error('Business logic error - Forced for testing');
}
```

**Run**:
```bash
FORCE_NON_RETRYABLE=1 npm run dev
# Send test event → will go to .non-retryable DLQ immediately
```

**Important**: Remove these flags after testing. Do NOT commit force-error code to main branch.

---

## Monitoring & Alerts

### Key Metrics to Monitor

**Prometheus Queries**:

```promql
# Schema validation failure rate (> 5% = alert)
rate(normalize_sleep_messages_total{result="schema_invalid"}[5m]) /
rate(normalize_sleep_messages_total[5m]) > 0.05

# DLQ backlog (> 100 messages = alert)
sum(nats_stream_messages{stream="AA_DLQ", subject=~"dlq.normalize.sleep.*"}) > 100

# Consumer lag (> 1000 messages = alert)
nats_consumer_num_pending{stream="AA_CORE_HOT", consumer="normalize-sleep-durable"} > 1000

# Retry rate (> 10% = investigate)
rate(normalize_sleep_messages_total{result="retry"}[5m]) /
rate(normalize_sleep_messages_total[5m]) > 0.10
```

**Grafana Dashboard Panels**:
- Sleep Messages Processed (success/retry/dlq) - stacked area chart
- DLQ Backlog by Subject - bar chart
- Consumer Lag - line chart
- P95 Processing Latency - heatmap

---

## Alert Silencing and Threshold Tuning

- **Silencing (mute)**:
  - Create a silence for rules in group sleep-pipeline via your Alertmanager UI.
  - Scope by labels: service=normalize-service, stream=AA_CORE_HOT, durable=normalize-sleep-durable, subject=athlete-ally.sleep.raw-received.
  - Suggested duration: 15–60m during maintenance; remove after validation.
- **Threshold tuning**:
  - DLQ rate (warn): adjust rate() window or comparator if transient spikes cause noise.
  - No successes (crit): extend for: from 5m to 10m only if known backfills or scheduled maintenance.
  - Use `promtool check rules monitoring/alert_rules.yml` after edits.

## Soak JSON Schema (sleep)

- **Fields**:
  - generated_at: string ISO8601
  - window_minutes: integer
  - job, stream, durable, subject: strings
  - success_count, dlq_count, retry_count: integers
  - success_rate, dlq_rate, retry_rate: numbers 0..1
  - pending_current, pending_max: integers
  - fallback_count: integer
  - notes: optional string
- **Example**: docs/examples/soak_sleep_summary.example.json
- **Soak script output**: ./soak_sleep_summary.json generated by docs/phase-3/ops/48h-soak-health-check.sh

---

## Related Documentation

- [Sleep Event Flow Architecture](../architecture/sleep-event-flow.md)
- [Ingest Service README](../../services/ingest-service/README.md)
- [Normalize Service README](../../services/normalize-service/README.md)
- [NATS JetStream Documentation](https://docs.nats.io/nats-concepts/jetstream)

## Validation & Troubleshooting (A2 Sleep Observability)

This section documents the daily validation for the "Sleep Normalize Pipeline" dashboard (uid=aa-sleep-norm) on Grafana Cloud and how to troubleshoot failures.

- What runs:
  - Prometheus rule validation via promtool for `monitoring/alert_rules.yml` and `monitoring/normalize-alerts.yml`.
  - Grafana API validation ensuring the dashboard exists, required variables are present (`job`, `stream`, `durable`, `subject`), and a representative panel renders with variables applied.
- Where it runs:
  - GitHub Actions workflow: `.github/workflows/a2-validate-grafana.yml` (daily at 09:00 UTC and on-demand via `workflow_dispatch`).
- Secrets required (Actions): `GRAFANA_URL`, `GRAFANA_TOKEN` (scopes: `dashboards:write`, `folders:read|write`, `datasources:read`). If secrets are absent, the workflow logs a SKIP note and exits successfully to avoid CI noise.

### Manual Run

To run locally (Node 20+):

```bash
# Use staging Grafana; token must have at least dashboards:read
export GRAFANA_URL="https://nkgss.grafana.net"
export GRAFANA_TOKEN="<token>"
node scripts/ops/grafana-validate.mjs
```

Optional move to the `Observability` folder (requires folders:read|write):

```bash
export MOVE_TO_OBSERVABILITY=true
node scripts/ops/grafana-validate.mjs
```

### Common Failures

- 404 dashboard not found: The dashboard UID (`aa-sleep-norm`) is missing. Re-import the dashboard and re-run.
- Missing variables: One or more required variables are absent. Open the dashboard JSON and ensure variables `job`, `stream`, `durable`, `subject` exist under `templating.list`.
- 403 folder permissions: The token lacks folder permissions; the move step is skipped and the dashboard remains in `General`.
- Render errors: If `/render/d-solo/...` returns non-200, verify the dashboard `slug` matches and at least one panel is present. The validator prints the panel id it attempted.
- Promtool failures: The validator prints the exact rule and line number. Fix the YAML and re-run `promtool check rules` locally to confirm.

### Attach Evidence To PR

When updating PR threads (e.g., PR #38), attach:
- Variables panel screenshot (UI capture),
- DLQ and Overview panels (last 6h),
- Alerts UI detail (if provisioned) or `promtool` OK output.

If UI uploads are blocked, temporarily host images in a docs-only branch and link them in the PR comment; remove the branch afterwards to keep the repo slim.

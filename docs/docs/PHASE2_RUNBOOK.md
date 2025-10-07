# Phase 2 Migration: Operator Runbook

**Status**: Operational Procedure
**Version**: 1.0
**Date**: 2025-10-01

---

## Overview

This runbook provides step-by-step instructions for migrating from single-stream to 3-stream topology with zero downtime and instant rollback capability.

**Estimated Duration**: 4-6 hours (including verification pauses)

**Operator Requirements**:
- Access to production NATS cluster
- Access to production Kubernetes/Docker environment
- Grafana/Prometheus access for metrics validation
- Database read access for data verification

---

## Pre-Migration Checklist

### T-24h: Preparation

- [ ] Review all Phase 2 documentation (MIGRATION_PREP, CODE_SNIPPETS, ENV_VARIABLES)
- [ ] Verify staging environment passes all tests (30/30)
- [ ] Confirm CI pipeline green on `release/phase2-migration` branch
- [ ] Schedule maintenance window (recommend off-hours, low-traffic period)
- [ ] Notify team in #engineering and #on-call channels
- [ ] Prepare rollback plan review with team lead

### T-1h: Final Checks

- [ ] Verify current system health:
  ```bash
  # All services healthy
  curl http://prod-ingest:4101/health | jq
  curl http://prod-normalize:4102/health | jq

  # No pending messages (or acceptable backlog < 100)
  nats consumer info ATHLETE_ALLY_EVENTS normalize-hrv-durable | grep num_pending

  # Database responsive
  psql $DATABASE_URL -c "SELECT COUNT(*) FROM hrv_data;"
  ```

- [ ] Verify NATS cluster health:
  ```bash
  nats server list
  # All 3 nodes should be UP

  nats stream info ATHLETE_ALLY_EVENTS
  # Should show current state
  ```

- [ ] Confirm backup/snapshot exists:
  ```bash
  # Database backup timestamp
  aws rds describe-db-snapshots --db-instance-identifier prod-athlete-db \
    --query 'DBSnapshots[0].SnapshotCreateTime'

  # Should be < 6 hours old
  ```

- [ ] Deploy code to staging and verify:
  ```bash
  kubectl set image deployment/normalize-service normalize=athlete-ally/normalize:phase2-migration -n staging
  kubectl rollout status deployment/normalize-service -n staging

  # Verify staging binds to AA_CORE_HOT
  kubectl logs -n staging deployment/normalize-service | grep "bound to"
  # Expected: "bound to AA_CORE_HOT"
  ```

---

## Phase 0: Create DLQ Stream (15 minutes)

### Step 0.1: Create AA_DLQ Stream

```bash
# Connect to production NATS
export NATS_URL=nats://nats1.prod:4223,nats2.prod:4223,nats3.prod:4223

# Create DLQ stream
nats stream add AA_DLQ \
  --subjects "dlq.>" \
  --storage file \
  --retention limits \
  --max-age 14d \
  --max-msgs=-1 \
  --max-bytes=-1 \
  --replicas 3 \
  --discard old \
  --dupe-window 2m \
  --compression
```

**Expected output**:
```
Stream AA_DLQ was created
```

### Step 0.2: Verify DLQ Stream

```bash
nats stream info AA_DLQ
```

**Checklist**:
- [ ] Subjects: `dlq.>`
- [ ] Max age: `1209600s` (14 days)
- [ ] Replicas: 3
- [ ] Storage: file
- [ ] State: messages=0

### Step 0.3: Update Services with DLQ Config

```bash
# No deployment needed - services already reference DLQ subjects
# Verify config:
grep -r "dlq\." services/*/src/ | grep -i subject
```

**Expected**: DLQ subjects already configured in normalize-service

### Step 0.4: Test DLQ

```bash
# Publish test message to DLQ
nats pub dlq.test.phase0 '{"test":"dlq-verification","phase":0}'

# Verify received
nats stream info AA_DLQ | grep messages:
# Should show: messages: 1

# Clean up test message
nats stream purge AA_DLQ --force
```

**Rollback (if needed)**:
```bash
nats stream delete AA_DLQ --force
```

**Pause**: 15 minutes - Monitor for any alerts

---

## Phase 1: Migrate Vendor Subjects (45 minutes)

### Step 1.1: Create AA_VENDOR_HOT Stream

```bash
nats stream add AA_VENDOR_HOT \
  --subjects "vendor.>" \
  --storage file \
  --retention limits \
  --max-age 48h \
  --max-msgs=-1 \
  --max-bytes=-1 \
  --replicas 3 \
  --discard old \
  --dupe-window 2m \
  --compression
```

### Step 1.2: Create Vendor Consumer on New Stream

```bash
nats consumer add AA_VENDOR_HOT normalize-oura \
  --filter-subject vendor.oura.webhook.received \
  --ack explicit \
  --max-deliver 5 \
  --ack-wait 15s \
  --deliver all \
  --replay instant
```

**Expected output**:
```
Consumer normalize-oura was created
```

### Step 1.3: Verify Consumer Exists

```bash
nats consumer info AA_VENDOR_HOT normalize-oura
```

**Checklist**:
- [ ] Durable name: `normalize-oura`
- [ ] Filter subject: `vendor.oura.webhook.received`
- [ ] ACK policy: explicit
- [ ] Max deliver: 5
- [ ] State: num_pending=0 (new consumer)

### Step 1.4: Deploy Services (No Code Change Needed)

Services already have fallback logic, but let's ensure they're on latest:

```bash
# Production deployment (Kubernetes example)
kubectl set image deployment/normalize-service \
  normalize=athlete-ally/normalize:phase2-migration \
  -n production

# Wait for rollout
kubectl rollout status deployment/normalize-service -n production

# Check logs for binding
kubectl logs -n production deployment/normalize-service --tail=50 | grep "vendor"
```

**Expected log**: Service will still bind to ATHLETE_ALLY_EVENTS (vendor.> not removed yet)

### Step 1.5: Verify Dual Processing

```bash
# Send test vendor webhook
curl -X POST https://prod.athleteally.com/api/v1/webhook/oura \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "phase1-test-user",
    "event_type": "daily_activity",
    "data": {"test": "phase1-migration"}
  }'

# Check old stream (should receive)
nats consumer info ATHLETE_ALLY_EVENTS normalize-oura | grep delivered
# delivered.consumer_seq should increment

# Check new stream (should not receive yet - vendor.> not routed)
nats consumer info AA_VENDOR_HOT normalize-oura | grep delivered
# delivered.consumer_seq should be 0
```

### Step 1.6: Update ATHLETE_ALLY_EVENTS to Exclude vendor.>

**CRITICAL STEP** - This redirects vendor traffic to new stream

```bash
# Current subjects
nats stream info ATHLETE_ALLY_EVENTS | grep subjects:
# Expected: ["athlete-ally.>", "vendor.>", "sleep.*"]

# Update to remove vendor.>
nats stream update ATHLETE_ALLY_EVENTS \
  --subjects "athlete-ally.>,sleep.*"

# Verify
nats stream info ATHLETE_ALLY_EVENTS | grep subjects:
# Expected: ["athlete-ally.>", "sleep.*"]
```

### Step 1.7: Verify Vendor Messages Flow to New Stream

```bash
# Send another test webhook
curl -X POST https://prod.athleteally.com/api/v1/webhook/oura \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "phase1-test-user-2",
    "event_type": "daily_sleep",
    "data": {"test": "phase1-verification"}
  }'

# Check NEW stream (should receive now)
nats consumer info AA_VENDOR_HOT normalize-oura | grep delivered
# delivered.consumer_seq should be 1

# Check OLD stream (should NOT receive)
nats consumer info ATHLETE_ALLY_EVENTS normalize-oura 2>&1 | grep "not found"
# Expected: consumer not found (correct - it's on new stream now)
```

### Step 1.8: Monitor Metrics

```bash
# Check Prometheus metrics
curl http://prod-normalize:9464/metrics | grep normalize_messages_total

# Should show:
# normalize_messages_total{result="processed",subject="vendor.oura.webhook.received",stream="AA_VENDOR_HOT"}
```

**Pause**: 30 minutes - Monitor Grafana dashboards for errors

**Rollback (if needed)**:
```bash
# Add vendor.> back to old stream
nats stream update ATHLETE_ALLY_EVENTS --subjects "athlete-ally.>,vendor.>,sleep.*"

# Delete new consumer
nats consumer delete AA_VENDOR_HOT normalize-oura --force

# Restart services (will rebind to old stream)
kubectl rollout restart deployment/normalize-service -n production
```

---

## Phase 2: Migrate Core Subjects (90 minutes)

### Step 2.1: Create AA_CORE_HOT Stream

```bash
nats stream add AA_CORE_HOT \
  --subjects "athlete-ally.>,sleep.*" \
  --storage file \
  --retention limits \
  --max-age 48h \
  --max-msgs=-1 \
  --max-bytes=-1 \
  --replicas 3 \
  --discard old \
  --dupe-window 2m \
  --compression
```

### Step 2.2: Create HRV Consumer on New Stream

```bash
nats consumer add AA_CORE_HOT normalize-hrv-durable \
  --filter-subject athlete-ally.hrv.raw-received \
  --ack explicit \
  --max-deliver 5 \
  --ack-wait 60s \
  --deliver all \
  --replay instant \
  --max-ack-pending 1000
```

**Expected output**:
```
Consumer normalize-hrv-durable was created
```

### Step 2.3: Verify Consumer Configuration

```bash
nats consumer info AA_CORE_HOT normalize-hrv-durable
```

**Checklist**:
- [ ] Durable name: `normalize-hrv-durable`
- [ ] Filter subject: `athlete-ally.hrv.raw-received`
- [ ] ACK policy: explicit
- [ ] Max deliver: 5
- [ ] ACK wait: 60s
- [ ] Max ACK pending: 1000

### Step 2.4: Deploy Services with Multi-Stream Mode

**Option A: Environment Variable Update (Recommended)**

```bash
# Update ConfigMap/Secret
kubectl set env deployment/normalize-service \
  EVENT_STREAM_MODE=multi \
  AA_STREAM_CANDIDATES=AA_CORE_HOT,ATHLETE_ALLY_EVENTS \
  -n production

# Rolling restart
kubectl rollout restart deployment/normalize-service -n production
kubectl rollout status deployment/normalize-service -n production
```

**Option B: New Deployment (Blue-Green)**

```bash
# Scale up green deployment (new topology)
kubectl scale deployment/normalize-service-green --replicas=2 -n production

# Verify green binds to AA_CORE_HOT
kubectl logs -n production deployment/normalize-service-green --tail=20 | grep "bound to"
# Expected: "bound to AA_CORE_HOT"
```

### Step 2.5: Verify Dual Processing (Before Subject Removal)

```bash
# Send test HRV message
curl -X POST https://prod.athleteally.com/api/v1/ingest/hrv \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "phase2-test-user",
    "date": "2025-10-01",
    "rmssd": 42.5
  }'

# Check new stream consumer
nats consumer info AA_CORE_HOT normalize-hrv-durable | grep -E "num_pending|delivered"
# Should show delivered incrementing

# Check old stream consumer (still exists)
nats consumer info ATHLETE_ALLY_EVENTS normalize-hrv-durable | grep -E "num_pending|delivered"
# Should also show delivered incrementing (both processing same messages)
```

### Step 2.6: Verify Database Insert

```bash
psql $DATABASE_URL -c "
  SELECT user_id, date, rmssd, ln_rmssd, captured_at
  FROM hrv_data
  WHERE user_id = 'phase2-test-user'
  ORDER BY captured_at DESC
  LIMIT 1;
"
```

**Expected**: Row exists with rmssd=42.5

### Step 2.7: Remove Core Subjects from ATHLETE_ALLY_EVENTS

**CRITICAL STEP** - This completes the migration

```bash
# Drain pending messages from old consumer first
OLD_PENDING=$(nats consumer info ATHLETE_ALLY_EVENTS normalize-hrv-durable -j | jq '.num_pending')
echo "Draining $OLD_PENDING pending messages from old consumer..."

# Wait for old consumer to catch up (num_pending should reach 0)
while [ $(nats consumer info ATHLETE_ALLY_EVENTS normalize-hrv-durable -j | jq '.num_pending') -gt 0 ]; do
  echo "Waiting for old consumer to drain... ($(nats consumer info ATHLETE_ALLY_EVENTS normalize-hrv-durable -j | jq '.num_pending') pending)"
  sleep 5
done

echo "✅ Old consumer drained"

# Now remove subjects from old stream
nats stream update ATHLETE_ALLY_EVENTS --subjects ""
# This empties the subjects list
```

### Step 2.8: Verify New Stream Processing

```bash
# Send another test HRV message
curl -X POST https://prod.athleteally.com/api/v1/ingest/hrv \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "phase2-verification-user",
    "date": "2025-10-01",
    "rmssd": 48.3
  }'

# Check NEW stream (should receive)
nats consumer info AA_CORE_HOT normalize-hrv-durable | grep delivered
# delivered.consumer_seq should increment

# Check OLD stream (should have 0 messages)
nats stream info ATHLETE_ALLY_EVENTS | grep "messages:"
# Expected: messages: 0
```

### Step 2.9: Verify End-to-End Flow

```bash
# Send real HRV data
curl -X POST https://prod.athleteally.com/api/v1/ingest/hrv \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "real-user-123",
    "date": "2025-10-01",
    "rmssd": 55.2
  }'

# Wait 5 seconds for processing
sleep 5

# Verify in database
psql $DATABASE_URL -c "
  SELECT user_id, date, rmssd, ln_rmssd
  FROM hrv_data
  WHERE user_id = 'real-user-123' AND date = '2025-10-01';
"

# Verify metrics
curl http://prod-normalize:9464/metrics | grep 'normalize_hrv_messages_total.*success.*AA_CORE_HOT'
# Should show count > 0
```

### Step 2.10: Scale Down Blue (Optional)

If using blue-green deployment:

```bash
# Scale down old deployment
kubectl scale deployment/normalize-service-blue --replicas=0 -n production

# Keep for 24h before deletion (rollback capability)
```

**Pause**: 60 minutes - Intensive monitoring

**Rollback (if needed)**:
```bash
# Add core subjects back to old stream
nats stream update ATHLETE_ALLY_EVENTS --subjects "athlete-ally.>,sleep.*"

# Update services to use single mode
kubectl set env deployment/normalize-service \
  EVENT_STREAM_MODE=single \
  -n production

# Restart services
kubectl rollout restart deployment/normalize-service -n production

# Monitor logs
kubectl logs -n production deployment/normalize-service --tail=50 | grep "bound to"
# Expected: "bound to ATHLETE_ALLY_EVENTS"
```

---

## Phase 3: Legacy Stream Cleanup (14 days)

### Day 1-14: Monitoring Period

```bash
# Daily check: verify no messages in legacy stream
nats stream info ATHLETE_ALLY_EVENTS | grep messages:
# Expected: messages: 0

# Check for unexpected publishes
nats stream info ATHLETE_ALLY_EVENTS --json | jq '.state.first_seq, .state.last_seq'
# Both should remain constant (no new messages)
```

### Day 14: Delete Legacy Stream

```bash
# Final verification
nats stream info ATHLETE_ALLY_EVENTS | grep messages:
# Must be: messages: 0

# Delete stream
nats stream delete ATHLETE_ALLY_EVENTS --force
```

**Expected output**:
```
Stream ATHLETE_ALLY_EVENTS was deleted
```

### Verify Deletion

```bash
nats stream list
# Should show: AA_CORE_HOT, AA_VENDOR_HOT, AA_DLQ
# Should NOT show: ATHLETE_ALLY_EVENTS
```

---

## Post-Migration Validation

### Comprehensive Health Check

```bash
# 1. Stream health
nats stream list
# Expected: 3 streams (CORE, VENDOR, DLQ)

for stream in AA_CORE_HOT AA_VENDOR_HOT AA_DLQ; do
  echo "=== $stream ==="
  nats stream info $stream | grep -E "State:|Replicas:"
done

# 2. Consumer health
nats consumer info AA_CORE_HOT normalize-hrv-durable | grep "num_pending:"
# Expected: 0 or < 10

nats consumer info AA_VENDOR_HOT normalize-oura | grep "num_pending:"
# Expected: 0 or < 5

# 3. Service health
for port in 4101 4102; do
  curl -s http://prod:$port/health | jq '.status, .eventBus'
done
# All should show: "healthy", "connected"

# 4. Database connectivity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM hrv_data WHERE date = CURRENT_DATE;"
# Should show today's HRV records

# 5. Metrics validation
curl -s http://prod-normalize:9464/metrics | grep -E 'normalize_hrv_messages_total.*AA_CORE_HOT'
# Should show non-zero counts
```

---

## Rollback Procedures

### Emergency Rollback (Any Time)

**Scenario**: Critical production issue detected

**Steps**:

1. **Revert to single-stream mode**:
   ```bash
   kubectl set env deployment/normalize-service \
     EVENT_STREAM_MODE=single \
     AA_STREAM_CANDIDATES=ATHLETE_ALLY_EVENTS \
     -n production

   kubectl rollout restart deployment/normalize-service -n production
   ```

2. **Restore subjects to legacy stream** (if removed):
   ```bash
   nats stream update ATHLETE_ALLY_EVENTS \
     --subjects "athlete-ally.>,vendor.>,sleep.*"
   ```

3. **Verify services bound to legacy stream**:
   ```bash
   kubectl logs -n production deployment/normalize-service --tail=20 | grep "bound to"
   # Expected: "bound to ATHLETE_ALLY_EVENTS"
   ```

4. **Delete new consumers** (optional, can keep for retry):
   ```bash
   nats consumer delete AA_CORE_HOT normalize-hrv-durable
   nats consumer delete AA_VENDOR_HOT normalize-oura
   ```

5. **Monitor recovery**:
   ```bash
   nats consumer info ATHLETE_ALLY_EVENTS normalize-hrv-durable | grep num_pending
   # Should show pending messages decreasing
   ```

**Recovery Time**: 5-10 minutes

---

## Monitoring and Alerts

### Key Metrics to Watch

**Grafana Dashboard**: "NATS JetStream - Phase 2 Migration"

1. **Message Processing Rate**:
   ```promql
   sum(rate(normalize_hrv_messages_total{result="success"}[5m])) by (stream)
   ```
   - Alert if drops below 1/min for > 5 minutes

2. **Consumer Lag**:
   ```promql
   nats_consumer_num_pending{consumer="normalize-hrv-durable"}
   ```
   - Alert if > 100 for > 10 minutes

3. **Error Rate**:
   ```promql
   sum(rate(normalize_hrv_messages_total{result=~"dlq|retry"}[5m]))
   ```
   - Alert if > 0.1/min (10% error rate)

4. **Database Insert Rate**:
   ```sql
   SELECT COUNT(*) FROM hrv_data WHERE captured_at > NOW() - INTERVAL '5 minutes';
   ```
   - Alert if 0 for > 10 minutes

### Alert Conditions

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| Stream down | No messages for 10m | P1 | Immediate rollback |
| Consumer lag | num_pending > 100 | P2 | Investigate, scale up |
| High error rate | Errors > 10% | P2 | Check logs, DLQ |
| DB disconnect | Inserts = 0 for 10m | P1 | Check DB, rollback |

---

## Troubleshooting

### Issue: Consumer Not Binding to New Stream

**Symptoms**:
- Logs show "Failed to bind to AA_CORE_HOT"
- Falls back to ATHLETE_ALLY_EVENTS

**Diagnosis**:
```bash
# Check stream exists
nats stream info AA_CORE_HOT

# Check consumer exists
nats consumer info AA_CORE_HOT normalize-hrv-durable
```

**Fix**:
- If stream missing: Re-run Phase 2 Step 2.1
- If consumer missing: Re-run Phase 2 Step 2.2

---

### Issue: Messages Stuck in Old Stream

**Symptoms**:
- Old stream shows num_pending > 0
- New stream not receiving messages

**Diagnosis**:
```bash
# Check subject routing
nats stream info ATHLETE_ALLY_EVENTS | grep subjects:
nats stream info AA_CORE_HOT | grep subjects:
```

**Fix**:
- Ensure subjects removed from old stream (Phase 2 Step 2.7)
- Verify publisher (ingest-service) connected to NATS

---

### Issue: Database Connection Errors

**Symptoms**:
- Logs show "ECONNREFUSED" or "timeout"
- Messages being NAK'd

**Diagnosis**:
```bash
# Test DB connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Check metrics
curl http://prod-normalize:9464/metrics | grep normalize_hrv_messages_total.*retry
```

**Fix**:
- Verify DATABASE_URL correct
- Check database firewall rules
- Increase ACK_WAIT_MS if timeouts

---

## Success Criteria

### Phase 0 Success:
- [ ] AA_DLQ stream created
- [ ] Test message published and visible
- [ ] No errors in service logs

### Phase 1 Success:
- [ ] AA_VENDOR_HOT stream created with consumer
- [ ] Vendor webhooks processed on new stream
- [ ] Metrics show stream="AA_VENDOR_HOT"
- [ ] Old stream no longer has vendor.> subject

### Phase 2 Success:
- [ ] AA_CORE_HOT stream created with consumer
- [ ] HRV messages processed on new stream
- [ ] Database inserts succeed
- [ ] Metrics show stream="AA_CORE_HOT"
- [ ] Old stream has no subjects
- [ ] All 30 integration tests passing

### Phase 3 Success:
- [ ] Legacy stream deleted
- [ ] No regression in processing rate
- [ ] Error rate < 1%
- [ ] Documentation updated

---

## Communication Templates

### Pre-Migration Announcement

```
Subject: [MAINTENANCE] NATS Stream Topology Migration - [DATE] [TIME]

Team,

We will be performing a low-risk infrastructure migration on [DATE] at [TIME].

What: Migrating from single NATS stream to 3-stream topology
Impact: None expected - zero downtime migration
Duration: 4-6 hours (including verification)
Rollback: Instant (< 5 minutes)

During migration:
- All services remain operational
- HRV and vendor data processing continues
- Database writes unaffected

We will send updates every 30 minutes.

Questions? Reply here or ping #engineering.

- Platform Team
```

### Status Update Template

```
[UPDATE] Migration Phase X/3 - [STATUS]

Phase [X]: [PHASE_NAME]
Status: ✅ Complete | 🔄 In Progress | ⚠️ Issue Detected
Duration: [X] minutes
Next: Phase [Y] in [Z] minutes

Metrics:
- Message processing: [RATE] msg/min
- Consumer lag: [NUM] pending
- Error rate: [PCT]%
- Database writes: [RATE] writes/min

[Any issues or notes]
```

---

## Appendix

### Useful NATS CLI Commands

```bash
# List all streams
nats stream list

# Stream details
nats stream info <stream> --json | jq

# Consumer details
nats consumer info <stream> <consumer> --json | jq

# Purge stream (dangerous!)
nats stream purge <stream> --force

# Delete consumer
nats consumer delete <stream> <consumer> --force

# Publish test message
nats pub <subject> '{"test":"data"}'

# Subscribe to subject
nats sub <subject>
```

### Environment Variable Quick Reference

```bash
# Multi-stream mode (default)
export EVENT_STREAM_MODE=multi
export AA_STREAM_CANDIDATES=AA_CORE_HOT,ATHLETE_ALLY_EVENTS

# Single-stream mode (rollback)
export EVENT_STREAM_MODE=single
export AA_STREAM_CANDIDATES=ATHLETE_ALLY_EVENTS
```

---

**Document Version**: 1.0
**Last Updated**: 2025-10-01
**Maintained by**: Platform Team
**On-Call**: #on-call-platform (Slack)

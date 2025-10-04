# Phase B: Multi-Stream Migration - Operations Runbook

**Version:** 1.0
**Last Updated:** 2025-10-02
**Owner:** Platform Engineering Team
**Status:** Ready for Staging Deployment

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Pre-Deployment](#pre-deployment)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring](#monitoring)
7. [Rollback Procedure](#rollback-procedure)
8. [Troubleshooting](#troubleshooting)

---

## Overview

**Goal**: Migrate staging environment from single-stream (`ATHLETE_ALLY_EVENTS`) to multi-stream topology (`AA_CORE_HOT`, `AA_VENDOR_HOT`, `AA_DLQ`).

**Impact**:
- Improved stream isolation (core vs vendor events)
- Dedicated DLQ for failed messages
- Better observability with stream-level metrics
- Foundation for production migration

**Duration**: 2-4 hours (including monitoring period)

**Rollback Time**: < 5 minutes

---

## Prerequisites

### Phase A Completion ✅
- [x] Code supports both single/multi modes
- [x] Fallback mechanism tested and working
- [x] DLQ routing verified
- [x] Metrics export working
- [x] Local smoke tests passed

### Infrastructure Access
- [ ] Access to staging NATS cluster (`staging-nats:4222`)
- [ ] Access to staging Kubernetes cluster
- [ ] Access to staging database
- [ ] Access to monitoring dashboards (Grafana/Prometheus)

### Tools Required
- [ ] `kubectl` configured for staging cluster
- [ ] Node.js v18+ (for ops scripts)
- [ ] `nats` CLI (optional, for stream verification)
- [ ] PostgreSQL client (for database verification)

---

## Pre-Deployment

### Step 1: Backup Current State (T-30min)

```bash
# Backup database
pg_dump -h staging-db -U athlete -d athlete_normalize > backup-$(date +%Y%m%d-%H%M%S).sql

# Document current stream state
nats stream info ATHLETE_ALLY_EVENTS > stream-state-before.txt

# Document current consumer state
nats consumer info ATHLETE_ALLY_EVENTS normalize-hrv-durable > consumer-state-before.txt
```

### Step 2: Create Streams (T-20min)

Run the idempotent stream creation script:

```bash
cd docs/phase-3/ops

# Install dependencies (if not already installed)
npm install nats

# Create streams (staging: 1 replica)
NATS_URL=nats://staging-nats:4222 \
REPLICAS=1 \
NODE_ENV=staging \
node create-streams.js
```

**Expected Output:**
```
============================================================
NATS JetStream - Stream Creation (Idempotent)
============================================================
Environment:  staging
NATS URL:     nats://staging-nats:4222
Replicas:     1
Dry Run:      NO
============================================================

✅ Connected to NATS

Processing stream: AA_CORE_HOT
  Description: Core application events (HRV, sleep, onboarding, plan generation)
➕ Stream AA_CORE_HOT does not exist
   Creating with: subjects=athlete-ally.>,sleep.*, replicas=1, maxAge=48h
✅ Stream AA_CORE_HOT created successfully

Processing stream: AA_VENDOR_HOT
  Description: Vendor webhook events (Oura, etc.)
➕ Stream AA_VENDOR_HOT does not exist
   Creating with: subjects=vendor.>, replicas=1, maxAge=48h
✅ Stream AA_VENDOR_HOT created successfully

Processing stream: AA_DLQ
  Description: Dead letter queue for failed messages
✓  Stream AA_DLQ exists with correct config

============================================================
✅ All streams processed successfully
============================================================
```

**Verification:**
```bash
# Verify streams exist
nats stream ls
# Should show: AA_CORE_HOT, AA_VENDOR_HOT, AA_DLQ, ATHLETE_ALLY_EVENTS

# Check stream details
nats stream info AA_CORE_HOT
nats stream info AA_VENDOR_HOT
```

### Step 3: Create Consumers (T-10min)

Run the idempotent consumer creation script:

```bash
NATS_URL=nats://staging-nats:4222 \
STREAM_NAME=AA_CORE_HOT \
node create-consumers.js
```

**Expected Output:**
```
============================================================
NATS JetStream - Consumer Creation (Idempotent)
============================================================
NATS URL:     nats://staging-nats:4222
Stream:       AA_CORE_HOT
Dry Run:      NO
============================================================

✅ Connected to NATS

✓  Stream AA_CORE_HOT exists
   Subjects: athlete-ally.>, sleep.*
   Messages: 0

Processing consumer: normalize-hrv-durable
  Description: HRV normalization consumer - processes raw HRV events
➕ Consumer normalize-hrv-durable does not exist
   Creating on stream: AA_CORE_HOT
   Filter subject: athlete-ally.hrv.raw-received
   Max deliver: 5, Ack wait: 60s
✅ Consumer normalize-hrv-durable created successfully

============================================================
✅ All consumers processed successfully
============================================================
```

**Verification:**
```bash
# Verify consumer exists
nats consumer info AA_CORE_HOT normalize-hrv-durable

# Check consumer configuration
# Expected:
#   Filter Subject: athlete-ally.hrv.raw-received
#   Ack Policy: explicit
#   Max Deliver: 5
#   Ack Wait: 60s
```

---

## Deployment Steps

### Step 1: Update Kubernetes ConfigMaps (T-0)

Apply the staging configuration:

```bash
cd docs/phase-3/ops

# Option A: Update ConfigMap directly
kubectl create configmap event-bus-config \
  --from-env-file=staging.env.example \
  --namespace=staging \
  --dry-run=client -o yaml | kubectl apply -f -

# Option B: Patch existing ConfigMap
kubectl patch configmap event-bus-config \
  --namespace=staging \
  --patch='{"data":{"EVENT_STREAM_MODE":"multi","FEATURE_SERVICE_MANAGES_STREAMS":"false","FEATURE_SERVICE_MANAGES_CONSUMERS":"false"}}'
```

### Step 2: Rolling Restart Services

Restart services to pick up new configuration:

```bash
# Restart normalize-service first (consumer)
kubectl rollout restart deployment/normalize-service -n staging

# Wait for normalize-service to be ready
kubectl rollout status deployment/normalize-service -n staging

# Restart ingest-service (producer)
kubectl rollout restart deployment/ingest-service -n staging

# Wait for ingest-service to be ready
kubectl rollout status deployment/ingest-service -n staging
```

---

## Post-Deployment Verification

### Immediate Checks (T+5min)

**1. Service Logs - Stream Mode Detection**

```bash
# Check normalize-service logs
kubectl logs -l app=normalize-service -n staging --tail=100 | grep -E "(Stream mode|Stream candidates)"

# Expected output:
# [event-bus] Stream mode: multi (EVENT_STREAM_MODE="multi")
# [normalize-service] Stream candidates: AA_CORE_HOT, ATHLETE_ALLY_EVENTS
```

**2. Service Logs - Consumer Binding**

```bash
# Check normalize-service consumer binding
kubectl logs -l app=normalize-service -n staging --tail=100 | grep -E "(Found existing HRV consumer|HRV durable pull consumer bound)"

# Expected output:
# [normalize] Found existing HRV consumer on AA_CORE_HOT: normalize-hrv-durable
# [normalize] HRV durable pull consumer bound: normalize-hrv-durable, subject: athlete-ally.hrv.raw-received
```

**3. Service Logs - DLQ Configuration**

```bash
# Check DLQ subject logging
kubectl logs -l app=normalize-service -n staging --tail=100 | grep "DLQ subject prefix"

# Expected output:
# [normalize-hrv] DLQ subject prefix: dlq.normalize.hrv.raw-received
```

**4. Health Endpoints**

```bash
# Check service health
curl http://ingest-service.staging:4101/health
# Expected: {"status":"healthy","service":"ingest","eventBus":"connected"}

curl http://normalize-service.staging:4102/health
# Expected: {"status":"healthy","timestamp":"...","services":{"database":"connected","nats":"connected"}}
```

### Functional Testing (T+10min)

**E2E Test: HRV Ingestion Flow**

```bash
# Publish test HRV event
curl -X POST http://ingest-service.staging:4101/ingest/hrv \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "staging-e2e-test",
    "date": "2025-10-02",
    "rmssd": 55,
    "capturedAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'

# Expected: {"status":"received","timestamp":"..."}

# Verify database insert (wait 2-3 seconds for processing)
psql -h staging-db -U athlete -d athlete_normalize -c \
  "SELECT user_id, date, rmssd, ln_rmssd, created_at FROM hrv_data WHERE user_id = 'staging-e2e-test' ORDER BY created_at DESC LIMIT 1;"

# Expected: Row with rmssd=55, ln_rmssd≈4.007 (ln(55))
```

### Metrics Verification (T+15min)

**1. Prometheus Metrics**

```bash
# Check prom-client metrics
curl http://normalize-service.staging:4102/metrics | grep normalize_hrv_messages_total

# Expected output (with labels):
# normalize_hrv_messages_total{result="success",subject="athlete-ally.hrv.raw-received",stream="AA_CORE_HOT",durable="normalize-hrv-durable"} 1
```

**2. Stream Message Counts**

```bash
# AA_CORE_HOT should be receiving messages
nats stream info AA_CORE_HOT --json | jq '.state.messages'
# Should increment over time

# ATHLETE_ALLY_EVENTS should be idle (legacy)
nats stream info ATHLETE_ALLY_EVENTS --json | jq '.state.messages'
# Should NOT increment (messages going to AA_CORE_HOT now)
```

**3. DLQ Monitoring**

```bash
# DLQ should remain at baseline (no new failures from migration)
nats stream info AA_DLQ --json | jq '.state.messages'
# Should be stable (not spiking)
```

### Extended Monitoring (T+30min to T+2hr)

**Dashboard Checks:**
- [ ] Grafana: "Event Bus - Multi-Stream Overview" dashboard shows AA_CORE_HOT traffic
- [ ] Grafana: HRV ingestion rate matches pre-migration baseline
- [ ] Grafana: DLQ message rate remains at 0 or baseline
- [ ] Prometheus: No increase in service error rates
- [ ] Prometheus: Service memory/CPU usage stable

**Database Integrity:**
```sql
-- Check recent HRV data flow (last 30 minutes)
SELECT
  DATE_TRUNC('minute', created_at) AS minute,
  COUNT(*) AS row_count
FROM hrv_data
WHERE created_at > NOW() - INTERVAL '30 minutes'
GROUP BY minute
ORDER BY minute DESC
LIMIT 30;

-- Expected: Consistent row counts per minute (no gaps)
```

---

## Monitoring

### Key Metrics to Watch

**Success Indicators (Green):**
- ✅ `normalize_hrv_messages_total{result="success",stream="AA_CORE_HOT"}` incrementing
- ✅ `event_bus_events_published_total{topic="hrv_raw_received",status="success"}` incrementing
- ✅ Database `hrv_data` table receiving new rows
- ✅ Service logs show no errors
- ✅ Service health endpoints return 200 OK

**Warning Indicators (Yellow):**
- ⚠️ Logs show fallback: "Consumer not found on AA_CORE_HOT. Trying next candidate."
  - **Action**: Verify consumer exists with `nats consumer info AA_CORE_HOT normalize-hrv-durable`
  - **Threshold**: If persists > 5 minutes, investigate or rollback
- ⚠️ Metrics show mixed streams (some AA_CORE_HOT, some ATHLETE_ALLY_EVENTS)
  - **Action**: Check for partial pod rollout or restart issues
  - **Threshold**: If instability > 10 minutes, rollback

**Failure Indicators (Red - Immediate Rollback):**
- 🔴 Service crash loops (`kubectl get pods` shows `CrashLoopBackOff`)
- 🔴 Error logs: "Failed to find HRV consumer on any available stream"
- 🔴 Database writes stop (no new `hrv_data` rows > 2 minutes)
- 🔴 DLQ message spike (> 10 messages/minute sustained)
- 🔴 5xx errors on `/ingest/hrv` endpoint

### Prometheus Alert Rules

See `monitoring-queries.md` for PromQL alert definitions.

---

## Rollback Procedure

**Trigger Conditions:**
- Any 🔴 failure indicator
- User-requested rollback
- Extended 🟡 warning state (> 10 minutes)

### Rollback Steps (< 5 minutes)

**Step 1: Revert Configuration**

```bash
# Patch ConfigMap back to single mode
kubectl patch configmap event-bus-config \
  --namespace=staging \
  --patch='{"data":{"EVENT_STREAM_MODE":"single"}}'
```

**Step 2: Restart Services**

```bash
# Restart normalize-service
kubectl rollout restart deployment/normalize-service -n staging
kubectl rollout status deployment/normalize-service -n staging

# Restart ingest-service
kubectl rollout restart deployment/ingest-service -n staging
kubectl rollout status deployment/ingest-service -n staging
```

**Step 3: Verify Rollback**

```bash
# Services should bind to ATHLETE_ALLY_EVENTS
kubectl logs -l app=normalize-service -n staging --tail=50 | grep "Stream mode:"
# Expected: [event-bus] Stream mode: single

kubectl logs -l app=normalize-service -n staging --tail=50 | grep "Stream candidates"
# Expected: Stream candidates: ATHLETE_ALLY_EVENTS

kubectl logs -l app=normalize-service -n staging --tail=50 | grep "Found existing HRV consumer"
# Expected: Found existing HRV consumer on ATHLETE_ALLY_EVENTS: normalize-hrv-durable
```

**Step 4: Health Check**

```bash
# Run E2E test to verify data flow
curl -X POST http://ingest-service.staging:4101/ingest/hrv \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "rollback-verification-test",
    "date": "2025-10-02",
    "rmssd": 60
  }'

# Verify database insert
psql -h staging-db -U athlete -d athlete_normalize -c \
  "SELECT * FROM hrv_data WHERE user_id = 'rollback-verification-test' ORDER BY created_at DESC LIMIT 1;"
```

**Step 5: Post-Rollback Actions**

- [ ] Document failure reason in incident report
- [ ] Review service logs for root cause analysis
- [ ] Update Phase B plan with lessons learned
- [ ] Schedule retry after fixes applied

---

## Troubleshooting

### Issue: Consumer not found on AA_CORE_HOT

**Symptoms:**
```
[normalize] Consumer normalize-hrv-durable not found on AA_CORE_HOT. Trying next candidate.
[normalize] Found existing HRV consumer on ATHLETE_ALLY_EVENTS: normalize-hrv-durable
```

**Diagnosis:**
```bash
# Check if consumer exists
nats consumer info AA_CORE_HOT normalize-hrv-durable
```

**Fix:**
```bash
# Re-run consumer creation script
cd docs/phase-3/ops
NATS_URL=nats://staging-nats:4222 STREAM_NAME=AA_CORE_HOT node create-consumers.js
```

---

### Issue: DLQ Message Spike

**Symptoms:**
```bash
nats stream info AA_DLQ --json | jq '.state.messages'
# Returns high count (> 10 messages/minute)
```

**Diagnosis:**
```bash
# Inspect DLQ messages
nats stream get AA_DLQ 1  # Get first message
nats stream get AA_DLQ 2  # Get second message
# Check subject patterns: dlq.normalize.hrv.raw-received.* or dlq.vendor.*
```

**Common Causes:**
- Schema validation failures (check event schemas)
- Database connection issues (check `DATABASE_URL`)
- Max deliver reached (check consumer `max_deliver` setting)

**Fix:**
- Review service logs for error patterns
- Fix underlying issue (schema, DB, etc.)
- Consider reprocessing DLQ messages if data is valid

---

### Issue: Services Crash Loop

**Symptoms:**
```bash
kubectl get pods -n staging
# normalize-service-xxx    0/1     CrashLoopBackOff
```

**Diagnosis:**
```bash
# Check pod logs
kubectl logs -l app=normalize-service -n staging --previous

# Check events
kubectl describe pod <pod-name> -n staging
```

**Common Causes:**
- Missing environment variables
- Invalid `NATS_URL` (cannot connect)
- Stream/consumer not found (check pre-deployment steps)

**Fix:**
- Verify ConfigMap is correctly applied
- Verify streams and consumers exist in NATS
- **If cannot resolve quickly**: Execute rollback procedure

---

## Success Criteria

### Staging Deployment Success ✅

- [ ] Multi-mode runs for 48 hours without fallback to `ATHLETE_ALLY_EVENTS`
- [ ] Zero DLQ message spikes related to stream migration
- [ ] Metrics show 100% of messages on `AA_CORE_HOT` (stream label)
- [ ] E2E tests pass consistently (10 consecutive runs over 24 hours)
- [ ] Database data integrity verified (no missing HRV records)
- [ ] No service restarts or crashes during 48-hour soak period

### Production Readiness Criteria

- [ ] All staging success criteria met
- [ ] Rollback procedure tested and documented
- [ ] On-call engineer briefed on rollback process
- [ ] Monitoring dashboards updated with stream labels
- [ ] Incident response runbook finalized
- [ ] Stakeholder sign-off obtained

---

## Appendix

### Useful Commands

```bash
# Stream Management
nats stream ls                                    # List all streams
nats stream info <STREAM_NAME>                    # Stream details
nats stream view <STREAM_NAME>                    # View messages

# Consumer Management
nats consumer ls <STREAM_NAME>                    # List consumers
nats consumer info <STREAM_NAME> <CONSUMER_NAME>  # Consumer details
nats consumer next <STREAM_NAME> <CONSUMER_NAME>  # Pull next message

# Service Logs
kubectl logs -l app=normalize-service -n staging --tail=100 --follow
kubectl logs -l app=ingest-service -n staging --tail=100 --follow

# Service Metrics
curl http://normalize-service.staging:4102/metrics | grep normalize_hrv
curl http://ingest-service.staging:4101/metrics | grep event_bus

# Database Queries
psql -h staging-db -U athlete -d athlete_normalize
# \dt                 -- List tables
# SELECT COUNT(*) FROM hrv_data WHERE created_at > NOW() - INTERVAL '1 hour';
```

### Contact Information

**Primary On-Call:** Platform Engineering Team
**Secondary Escalation:** Engineering Manager
**Slack Channel:** `#platform-ops`
**PagerDuty:** Platform Services rotation

---

**Document Control:**
- Version: 1.0
- Last Reviewed: 2025-10-02
- Next Review: After staging deployment
- Approval: Pending

# Phase B: Multi-Stream Migration (Staging → Production)

**Labels:** `phase-b`, `migration`, `ops`, `nats`, `jetstream`, `staging`, `production`
**Assignees:** `platform-eng`, `ops-oncall`
**Milestone:** Phase 3 Foundation

---

## Summary

Migrate from single-stream (`ATHLETE_ALLY_EVENTS`) to multi-stream topology (`AA_CORE_HOT`, `AA_VENDOR_HOT`, `AA_DLQ`) with publish-only services and ops-managed topology.

**Scope:** Staging first (48h soak), then production. No destructive updates; fallback to legacy allowed.

---

## Configuration

**Feature Flags:**
- `EVENT_STREAM_MODE=multi`
- `FEATURE_SERVICE_MANAGES_STREAMS=false`
- `FEATURE_SERVICE_MANAGES_CONSUMERS=false`

**Streams/Consumers:**

**Streams:**
- `AA_CORE_HOT`: subjects `['athlete-ally.>', 'sleep.*']`, maxAge 48h, replicas 1 (staging) / 3 (prod)
- `AA_VENDOR_HOT`: subjects `['vendor.>']`, maxAge 48h, replicas 1 (staging) / 3 (prod)
- `AA_DLQ`: subjects `['dlq.>']`, maxAge 14 days, replicas 1 (staging) / 3 (prod)

**Consumer:**
- `normalize-hrv-durable` on `AA_CORE_HOT`
  - Filter: `athlete-ally.hrv.raw-received`
  - Ack policy: explicit
  - Deliver policy: all
  - Max deliver: 5
  - Ack wait: 60s
  - Max ack pending: 1000

---

## Artifacts

- **Scripts:**
  - `docs/phase-3/ops/create-streams.js` (idempotent stream creation)
  - `docs/phase-3/ops/create-consumers.js` (idempotent consumer creation)
- **Runbook:** `docs/phase-3/ops/PHASE_B_RUNBOOK.md`
- **Staging Config:** `docs/phase-3/ops/staging.env.example`
- **Monitoring:** `docs/phase-3/ops/monitoring-queries.md` (8 panels, 5 alerts)

---

## Pre-requisites (Completed ✅)

- [x] Single/Multi fallback mechanism tested and PASSED
- [x] DLQ routing verified and PASSED
- [x] Metrics export working (prom-client + labels)
- [x] `AA_DLQ` stream exists in staging/production
- [x] Phase A smoke tests completed
- [x] Scripts tested in dry-run mode against local NATS

---

## Deployment Plan

### 1. Staging Ops Window: Create Streams/Consumers

**Pre-Deployment (T-30min):**
```bash
# Backup database
pg_dump -h staging-db -U athlete -d athlete_normalize > backup-$(date +%Y%m%d-%H%M%S).sql

# Create streams
cd docs/phase-3/ops
npm install nats
NATS_URL=nats://staging-nats:4222 REPLICAS=1 NODE_ENV=staging node create-streams.js

# Create consumers
NATS_URL=nats://staging-nats:4222 STREAM_NAME=AA_CORE_HOT node create-consumers.js

# Verify
nats stream info AA_CORE_HOT
nats stream info AA_VENDOR_HOT
nats consumer info AA_CORE_HOT normalize-hrv-durable
```

**Expected Output:**
- ✅ AA_CORE_HOT created with subjects: athlete-ally.>, sleep.*
- ✅ AA_VENDOR_HOT created with subjects: vendor.>
- ✅ AA_DLQ verified (should already exist from Phase 0)
- ✅ normalize-hrv-durable consumer created on AA_CORE_HOT

---

### 2. Config PR (Staging): Enable Multi-Stream Mode

**Apply Configuration (T-0):**
```bash
# Update ConfigMap
kubectl patch configmap event-bus-config -n staging \
  --patch='{"data":{"EVENT_STREAM_MODE":"multi","FEATURE_SERVICE_MANAGES_STREAMS":"false","FEATURE_SERVICE_MANAGES_CONSUMERS":"false"}}'

# Rolling restart services
kubectl rollout restart deployment/normalize-service -n staging
kubectl rollout status deployment/normalize-service -n staging

kubectl rollout restart deployment/ingest-service -n staging
kubectl rollout status deployment/ingest-service -n staging
```

---

### 3. Verification (T+5min to T+30min)

**Immediate Checks (T+5min):**
```bash
# Check stream mode detection
kubectl logs -l app=normalize-service -n staging --tail=100 | grep "Stream mode:"
# Expected: [event-bus] Stream mode: multi

# Check consumer binding
kubectl logs -l app=normalize-service -n staging --tail=100 | grep "Found existing HRV consumer"
# Expected: Found existing HRV consumer on AA_CORE_HOT: normalize-hrv-durable

# Check DLQ configuration
kubectl logs -l app=normalize-service -n staging --tail=100 | grep "DLQ subject prefix"
# Expected: [normalize-hrv] DLQ subject prefix: dlq.normalize.hrv.raw-received
```

**E2E Test (T+10min):**
```bash
# Publish test HRV event
curl -X POST http://ingest-service.staging:4101/ingest/hrv \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "staging-phase-b-test",
    "date": "2025-10-02",
    "rmssd": 55,
    "capturedAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'

# Verify database insert (wait 2-3 seconds)
psql -h staging-db -U athlete -d athlete_normalize -c \
  "SELECT user_id, date, rmssd, ln_rmssd, created_at FROM hrv_data WHERE user_id = 'staging-phase-b-test' ORDER BY created_at DESC LIMIT 1;"
# Expected: Row with rmssd=55, ln_rmssd≈4.007
```

**Metrics Check (T+15min):**
```bash
# Verify prom-client metrics with stream label
curl http://normalize-service.staging:4102/metrics | grep normalize_hrv_messages_total
# Expected: normalize_hrv_messages_total{result="success",subject="athlete-ally.hrv.raw-received",stream="AA_CORE_HOT",durable="normalize-hrv-durable"} 1

# Check stream message counts
nats stream info AA_CORE_HOT --json | jq '.state.messages'
# Should increment as messages flow

nats stream info ATHLETE_ALLY_EVENTS --json | jq '.state.messages'
# Should NOT increment (legacy stream idle)
```

---

### 4. 48-Hour Soak Period (T+30min to T+48hr)

**Monitoring Dashboard Checks:**
- [ ] Grafana: "Event Bus - Multi-Stream Overview" shows AA_CORE_HOT traffic
- [ ] HRV ingestion rate matches pre-migration baseline
- [ ] DLQ message rate remains at 0 or baseline
- [ ] No service error rate increase
- [ ] Service memory/CPU usage stable

**Daily Health Checks:**
```bash
# Day 1 (24h mark)
# Check for fallback events
kubectl logs -l app=normalize-service -n staging --since=24h | grep "Trying next candidate"
# Expected: No results (0 fallback events)

# Check metrics distribution
curl http://normalize-service.staging:4102/metrics | grep 'normalize_hrv_messages_total{result="success",.*stream="AA_CORE_HOT"'
# Should show 100% of success messages on AA_CORE_HOT

# Day 2 (48h mark)
# Verify database integrity
psql -h staging-db -U athlete -d athlete_normalize -c \
  "SELECT COUNT(*) FROM hrv_data WHERE created_at > NOW() - INTERVAL '48 hours';"
# Compare count with expected baseline throughput
```

**Soak Period Success Criteria:**
- [ ] Zero fallback to ATHLETE_ALLY_EVENTS (no "Trying next candidate" logs)
- [ ] 100% of messages processed on AA_CORE_HOT stream
- [ ] DLQ message count stable (no spikes)
- [ ] 10/10 E2E tests pass (run every 4 hours)
- [ ] Database integrity holds (no missing HRV records)
- [ ] No service restarts or crashes

---

### 5. Production Cutover (Canary Strategy)

**Pre-Production Checklist:**
- [ ] Staging soak completed successfully (48 hours)
- [ ] All success criteria met
- [ ] Rollback procedure tested in staging
- [ ] Production streams created (REPLICAS=3)
- [ ] Production consumers created
- [ ] On-call engineer briefed
- [ ] Stakeholder approval obtained

**Canary Deployment (Production):**

**Phase 5a: 10% Canary (T-0 to T+1hr)**
```bash
# Scale normalize-service to 10 pods (1 with multi-mode, 9 with single-mode)
kubectl scale deployment/normalize-service -n production --replicas=10

# Update 1 pod to multi-mode
kubectl set env deployment/normalize-service -n production \
  EVENT_STREAM_MODE=multi \
  --dry-run=client -o yaml > /tmp/multi-mode-patch.yaml

# Apply to 10% of pods (use label selector or pod name)
# Monitor for 1 hour
```

**Phase 5b: 50% Canary (T+1hr to T+2hr)**
```bash
# Scale to 50% multi-mode if 10% canary successful
# Monitor metrics for mixed stream distribution
```

**Phase 5c: 100% Rollout (T+2hr)**
```bash
# Full rollout if 50% canary successful
kubectl set env deployment/normalize-service -n production EVENT_STREAM_MODE=multi
kubectl rollout restart deployment/normalize-service -n production
kubectl rollout restart deployment/ingest-service -n production
```

---

## Success Criteria

### Staging Success ✅

- [ ] 48-hour soak period completed without fallback
- [ ] `normalize_hrv_messages_total` shows `stream="AA_CORE_HOT"` at 100%
- [ ] No DLQ message spikes related to migration
- [ ] 10/10 consecutive E2E tests pass over 48 hours
- [ ] Database integrity verified (no missing HRV records)
- [ ] Zero service restarts or crashes

### Production Success ✅

- [ ] All staging success criteria met
- [ ] Canary phases completed (10% → 50% → 100%)
- [ ] Production runs for 7 days without fallback
- [ ] Metrics match pre-migration baseline
- [ ] SLO targets met (99.9% success rate, p95 < 500ms)
- [ ] No customer-impacting incidents

---

## Rollback Procedure

**Trigger Conditions:**
- Service crash loops (`CrashLoopBackOff`)
- Error logs: "Failed to find HRV consumer on any available stream"
- Database writes stop (no new rows > 2 minutes)
- DLQ message spike (> 10 messages/minute sustained)
- 5xx errors on `/ingest/hrv` endpoint

**Rollback Steps (< 5 minutes):**

```bash
# Step 1: Revert configuration
kubectl patch configmap event-bus-config -n staging \
  --patch='{"data":{"EVENT_STREAM_MODE":"single"}}'

# Step 2: Restart services
kubectl rollout restart deployment/normalize-service -n staging
kubectl rollout status deployment/normalize-service -n staging
kubectl rollout restart deployment/ingest-service -n staging
kubectl rollout status deployment/ingest-service -n staging

# Step 3: Verify rollback
kubectl logs -l app=normalize-service -n staging --tail=50 | grep "Stream mode:"
# Expected: [event-bus] Stream mode: single

kubectl logs -l app=normalize-service -n staging --tail=50 | grep "Found existing HRV consumer"
# Expected: Found existing HRV consumer on ATHLETE_ALLY_EVENTS

# Step 4: E2E verification
curl -X POST http://ingest-service.staging:4101/ingest/hrv \
  -H "Content-Type: application/json" \
  -d '{"userId":"rollback-test","date":"2025-10-02","rmssd":60}'

psql -h staging-db -U athlete -d athlete_normalize -c \
  "SELECT * FROM hrv_data WHERE user_id = 'rollback-test' ORDER BY created_at DESC LIMIT 1;"
```

**Post-Rollback Actions:**
- [ ] Document failure reason in incident report
- [ ] Review service logs for root cause
- [ ] Update Phase B plan with lessons learned
- [ ] Schedule retry after fixes applied

**Detailed Rollback Documentation:** See `docs/phase-3/ops/PHASE_B_RUNBOOK.md` Section 7

---

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Subject overlap across streams (NATS constraint) | Duplicate message delivery | Low | Pre-deployment validation; ops-managed topology |
| Infrastructure drift (streams/consumers out of sync) | Service fallback to legacy stream | Medium | Idempotent scripts; verify before deployment |
| DLQ message spikes | Data loss or delayed processing | Low | Alert rules (DLQ > 0 for 5 min); runbook troubleshooting |
| Consumer not found on AA_CORE_HOT | Fallback to ATHLETE_ALLY_EVENTS | Medium | Pre-create consumers; verify with `nats consumer info` |
| Service crash loops | Service downtime | Low | Health checks; rollback procedure (< 5 min) |

---

## Checklist

### Pre-Deployment

- [ ] **Ops:** Review Phase B runbook (`docs/phase-3/ops/PHASE_B_RUNBOOK.md`)
- [ ] **Ops:** Install dependencies (`npm install nats` in docs/phase-3/ops)
- [ ] **Ops:** Test scripts in dry-run mode (`DRY_RUN=true node create-streams.js`)
- [ ] **Engineering:** Review monitoring queries and alert rules
- [ ] **Engineering:** Set up Grafana dashboards (8 panels from `monitoring-queries.md`)
- [ ] **Engineering:** Configure Prometheus alerts (5 rules)
- [ ] **On-Call:** Brief on rollback procedure

### Staging Deployment

- [ ] **T-30min:** Backup staging database
- [ ] **T-20min:** Run `create-streams.js` (staging) with `REPLICAS=1`
- [ ] **T-10min:** Run `create-consumers.js` (staging) for `normalize-hrv-durable`
- [ ] **T-5min:** Verify streams and consumers exist
- [ ] **T-0:** Config PR (staging): `EVENT_STREAM_MODE=multi`; rolling restart
- [ ] **T+5min:** Verify logs: AA_CORE_HOT bind confirmed
- [ ] **T+5min:** Verify no fallback logs ("Trying next candidate")
- [ ] **T+10min:** E2E test: POST `/ingest/hrv` → DB row appears
- [ ] **T+15min:** Metrics check: `normalize_hrv_messages_total` includes `{result,subject,stream,durable}`
- [ ] **T+15min:** Metrics check: `stream="AA_CORE_HOT"` label present
- [ ] **T+30min:** Dashboard review: HRV rate matches baseline
- [ ] **T+1hr:** DLQ check: message count stable (no spikes)

### 48-Hour Soak Period

- [ ] **Day 1 (24h mark):** Check logs for fallback events (expected: 0)
- [ ] **Day 1 (24h mark):** Verify metrics show 100% on AA_CORE_HOT
- [ ] **Day 1 (24h mark):** Run E2E test (5/5 consecutive passes)
- [ ] **Day 2 (36h mark):** Database integrity check (no missing records)
- [ ] **Day 2 (48h mark):** Final verification (all success criteria met)
- [ ] **Day 2 (48h mark):** Document soak results (attach to issue)

### Production Deployment

- [ ] **Pre-Prod:** Staging soak results reviewed and approved
- [ ] **Pre-Prod:** Production ops window scheduled
- [ ] **Pre-Prod:** Canary plan approved (10% → 50% → 100%)
- [ ] **Pre-Prod:** Run `create-streams.js` (production) with `REPLICAS=3`
- [ ] **Pre-Prod:** Run `create-consumers.js` (production)
- [ ] **Canary 10%:** Deploy multi-mode to 10% of normalize pods
- [ ] **Canary 10%:** Monitor for 1 hour (no errors, metrics stable)
- [ ] **Canary 50%:** Scale to 50% multi-mode
- [ ] **Canary 50%:** Monitor for 1 hour (mixed stream distribution)
- [ ] **Full Rollout:** 100% multi-mode deployment
- [ ] **Post-Prod:** Monitor for 4 hours (extended monitoring)
- [ ] **Post-Prod:** 7-day soak period (daily health checks)

### Post-Migration

- [ ] **Production cutover complete:** All services on AA_CORE_HOT
- [ ] **Rollback tested in staging:** Procedure validated (< 5 min)
- [ ] **Monitoring dashboards:** Updated with stream labels
- [ ] **Alert rules:** Active and tested (send test alert)
- [ ] **Runbook:** Updated with lessons learned
- [ ] **Stakeholder signoff:** Engineering Manager approval
- [ ] **Documentation:** Update architecture diagrams
- [ ] **Post-mortem:** Document findings and improvements

---

## Monitoring and Alerts

### Key Metrics

**Success Indicators (Green):**
- ✅ `normalize_hrv_messages_total{result="success",stream="AA_CORE_HOT"}` incrementing
- ✅ `event_bus_events_published_total{topic="hrv_raw_received",status="success"}` incrementing
- ✅ Database `hrv_data` table receiving new rows
- ✅ Service health endpoints return 200 OK

**Warning Indicators (Yellow):**
- ⚠️ Logs show fallback: "Consumer not found on AA_CORE_HOT. Trying next candidate."
  - **Action:** Verify consumer exists; check for partial rollout
  - **Threshold:** If persists > 5 minutes, investigate or rollback
- ⚠️ Metrics show mixed streams (some AA_CORE_HOT, some ATHLETE_ALLY_EVENTS)
  - **Action:** Check for pod restarts; verify ConfigMap applied
  - **Threshold:** If instability > 10 minutes, rollback

**Failure Indicators (Red - Immediate Rollback):**
- 🔴 Service crash loops (`CrashLoopBackOff`)
- 🔴 Error logs: "Failed to find HRV consumer on any available stream"
- 🔴 Database writes stop (no new rows > 2 minutes)
- 🔴 DLQ message spike (> 10 messages/minute sustained)
- 🔴 5xx errors on `/ingest/hrv` endpoint

### Alert Rules

**Primary Alert - DLQ Message Spike:**
```yaml
alert: HRVDLQMessagesDetected
expr: sum(rate(normalize_hrv_messages_total{result="dlq"}[5m])) > 0
for: 5m
severity: warning
```

**Full Alert Definitions:** See `docs/phase-3/ops/monitoring-queries.md` Section 3

---

## References

- **Phase A Smoke Test Results:** `SMOKE_TEST_RESULTS.md`
- **Operations Runbook:** `docs/phase-3/ops/PHASE_B_RUNBOOK.md`
- **Stream Creation Script:** `docs/phase-3/ops/create-streams.js`
- **Consumer Creation Script:** `docs/phase-3/ops/create-consumers.js`
- **Staging Config Sample:** `docs/phase-3/ops/staging.env.example`
- **Monitoring Queries:** `docs/phase-3/ops/monitoring-queries.md`
- **Architecture Documentation:** `docs/phase-3/architecture/`

---

## Contact Information

**Primary On-Call:** Platform Engineering Team
**Secondary Escalation:** Engineering Manager
**Slack Channel:** `#platform-ops`
**PagerDuty:** Platform Services rotation

---

**Issue Created:** 2025-10-02
**Status:** Ready for Staging Deployment
**Next Review:** After staging soak completion

# Phase B: Project Board Update

**Purpose:** Instructions for adding Phase B deployment tracking card to project board.

**Board:** Athlete Ally - Phase 3 Foundation
**Lane:** Ops/Migrations
**Status:** In Progress

---

## Card Details

**Title:** Phase B: Multi-Stream Migration

**Description:**
```
Migrate from single-stream (ATHLETE_ALLY_EVENTS) to multi-stream topology
(AA_CORE_HOT, AA_VENDOR_HOT, AA_DLQ) with ops-managed streams/consumers.

Scope: Staging first (48h soak), then production canary (10%→50%→100%)

Current Status: Ready for staging deployment
```

---

## Checklist Items

### Pre-Deployment Setup

- [ ] **Review runbook:** `docs/phase-3/ops/PHASE_B_RUNBOOK.md`
- [ ] **Test scripts in dry-run:** `DRY_RUN=true node create-streams.js`
- [ ] **Set up Grafana dashboards:** 8 panels from `monitoring-queries.md`
- [ ] **Configure Prometheus alerts:** 5 alert rules
- [ ] **Brief on-call engineer:** Rollback procedure (< 5 min)

### Staging: Stream/Consumer Creation

- [ ] **Backup staging database:** `pg_dump` before changes
- [ ] **Create streams (T-20min):** Run `create-streams.js` with `REPLICAS=1`
- [ ] **Create consumers (T-10min):** Run `create-consumers.js` for `normalize-hrv-durable`
- [ ] **Verify streams:** `nats stream info AA_CORE_HOT`, `nats stream info AA_VENDOR_HOT`
- [ ] **Verify consumers:** `nats consumer info AA_CORE_HOT normalize-hrv-durable`

### Staging: Deployment

- [ ] **Apply ConfigMap (T-0):** `kubectl patch configmap event-bus-config` with `EVENT_STREAM_MODE=multi`
- [ ] **Rolling restart:** `kubectl rollout restart deployment/{normalize,ingest}-service`
- [ ] **Verify logs (T+5min):** Services bind to AA_CORE_HOT (not ATHLETE_ALLY_EVENTS)
- [ ] **Check DLQ config:** Logs show `dlq.normalize.hrv.raw-received` prefix
- [ ] **E2E test (T+10min):** POST `/ingest/hrv` → DB row with correct `ln_rmssd`
- [ ] **Metrics check (T+15min):** `normalize_hrv_messages_total{stream="AA_CORE_HOT"}` present
- [ ] **Dashboard review (T+30min):** HRV rate matches baseline; no DLQ spikes

### Staging: 48-Hour Soak

- [ ] **Day 1 (24h mark):** Zero fallback events in logs
- [ ] **Day 1 (24h mark):** 100% of messages on AA_CORE_HOT stream
- [ ] **Day 1 (24h mark):** 5/5 consecutive E2E tests pass
- [ ] **Day 2 (36h mark):** Database integrity check (no missing records)
- [ ] **Day 2 (48h mark):** All success criteria met
- [ ] **Day 2 (48h mark):** Document soak results (attach to GitHub issue)

### Production: Pre-Deployment

- [ ] **Staging results approved:** 48h soak completed successfully
- [ ] **Schedule ops window:** Production deployment time confirmed
- [ ] **Canary plan approved:** 10% → 50% → 100% rollout
- [ ] **Create prod streams:** Run `create-streams.js` with `REPLICAS=3`
- [ ] **Create prod consumers:** Run `create-consumers.js` on production NATS
- [ ] **Stakeholder signoff:** Engineering Manager approval

### Production: Canary Deployment

- [ ] **Canary 10% (T-0 to T+1hr):** Deploy multi-mode to 10% of pods
- [ ] **Monitor canary 10%:** Metrics stable; no errors for 1 hour
- [ ] **Canary 50% (T+1hr to T+2hr):** Scale to 50% multi-mode
- [ ] **Monitor canary 50%:** Mixed stream distribution as expected
- [ ] **Full rollout (T+2hr):** 100% multi-mode deployment
- [ ] **Extended monitoring (T+2hr to T+6hr):** No fallback events; metrics stable

### Production: 7-Day Soak

- [ ] **Daily health checks:** Verify AA_CORE_HOT processing (days 1-7)
- [ ] **Weekly metrics review:** Success rate ≥ 99.9%; p95 latency < 500ms
- [ ] **Zero incidents:** No customer-impacting issues
- [ ] **Legacy stream idle:** ATHLETE_ALLY_EVENTS message count stable

### Post-Migration Cleanup

- [ ] **Update architecture docs:** Document multi-stream topology
- [ ] **Update monitoring dashboards:** Add stream labels to all panels
- [ ] **Test rollback procedure:** Validate in staging (< 5 min)
- [ ] **Post-mortem:** Document findings and lessons learned
- [ ] **Deprecation plan:** Schedule ATHLETE_ALLY_EVENTS stream decommission (Phase 3)

---

## Linked Resources

### Documentation

- [Phase B Runbook](../PHASE_B_RUNBOOK.md) - Complete deployment guide with 60+ commands
- [Monitoring Queries](../monitoring-queries.md) - 8 Grafana panels, 5 alert rules, SLI/SLO definitions
- [Staging Config Sample](../staging.env.example) - Environment variables for staging

### Scripts

- [create-streams.js](../create-streams.js) - Idempotent stream creation (AA_CORE_HOT, AA_VENDOR_HOT, AA_DLQ)
- [create-consumers.js](../create-consumers.js) - Idempotent consumer creation (normalize-hrv-durable)

### Related Issues/PRs

- GitHub Issue: Phase B Deployment Tracking (created via `create-github-issue.sh`)
- PR #XXX: Stream mode fixes (merged)
- PR #XXX: Normalize-service metrics and DLQ logging (merged)
- PR #XXX: Staging config update (pending)

### Test Results

- [Smoke Test Results](../../../../SMOKE_TEST_RESULTS.md) - Phase A verification (single/multi mode, DLQ routing)

---

## Key Metrics to Monitor

### Success Indicators ✅

| Metric | Target | Current |
|--------|--------|---------|
| Messages on AA_CORE_HOT | 100% | TBD |
| DLQ message rate | 0 msg/sec | TBD |
| Success rate | ≥ 99.9% | TBD |
| P95 latency | < 500ms | TBD |
| Fallback events | 0 | TBD |

### Alert Rules

1. **HRVDLQMessagesDetected** - Warning if DLQ rate > 0 for 5 minutes
2. **StreamFallbackDetected** - Warning if messages on ATHLETE_ALLY_EVENTS after migration
3. **SchemaValidationFailuresHigh** - Warning if validation failures > 0.1/sec
4. **HRVProcessingStopped** - Critical if no success messages for 5 minutes
5. **HRVProcessingLatencyHigh** - Warning if p95 > 1 second

---

## Rollback Trigger Conditions 🚨

**Immediate Rollback if:**
- Service crash loops (`CrashLoopBackOff`)
- Error logs: "Failed to find HRV consumer on any available stream"
- Database writes stop (no new rows > 2 minutes)
- DLQ message spike (> 10 messages/minute sustained)
- 5xx errors on `/ingest/hrv` endpoint

**Rollback Procedure:** See `PHASE_B_RUNBOOK.md` Section 7 (< 5 minutes)

---

## Contact Information

**Primary On-Call:** Platform Engineering Team
**Secondary Escalation:** Engineering Manager
**Slack Channels:**
  - `#platform-ops` - Deployment coordination
  - `#data-quality` - Schema validation alerts
  - `#incident-response` - Emergency escalation

**PagerDuty:** Platform Services rotation

---

## Instructions for Adding to Project Board

### Option 1: GitHub Web UI

1. Navigate to project board: `https://github.com/your-org/athlete-ally/projects/X`
2. Click "Add card" in the "Ops/Migrations" lane
3. Select the Phase B issue created via `create-github-issue.sh`
4. Set status to "In Progress"
5. Copy checklist items from this document into card description
6. Add links to runbook and scripts (see "Linked Resources" above)

### Option 2: GitHub CLI

```bash
# Get project and issue IDs
PROJECT_ID=$(gh project list --format json | jq '.projects[] | select(.title | contains("Phase 3 Foundation")) | .id' -r)
ISSUE_NUMBER=$(gh issue list --search "Phase B: Multi-Stream Migration" --json number --jq '.[0].number')

# Add issue to project
gh project item-add $PROJECT_ID --owner your-org --url https://github.com/your-org/athlete-ally/issues/$ISSUE_NUMBER

# Update status to "In Progress"
gh project item-edit --id <ITEM_ID> --field-id <STATUS_FIELD_ID> --project-id $PROJECT_ID --text "In Progress"
```

### Option 3: Manual Card Creation

If the issue isn't created yet, you can create a card manually:

1. Go to project board → Ops/Migrations lane
2. Click "Add card" → "Create note"
3. Paste card title and description from above
4. Manually check off items as they complete
5. Convert to issue later via "Convert to issue" button

---

## Status Updates

**Update Frequency:**
- During deployment: Every 30 minutes
- During soak period: Daily (24h and 48h marks)
- Production canary: Every phase transition (10% → 50% → 100%)
- Post-deployment: Weekly for 4 weeks

**Update Template:**
```
**Status Update:** [Date/Time]
**Phase:** [Staging/Production] [Pre-Deployment/Deployment/Soak/Canary]
**Current Step:** [Checklist item in progress]

✅ Completed:
- [List completed checklist items]

⚠️ Issues:
- [Any warnings or concerns]

🔴 Blockers:
- [Any blocking issues requiring escalation]

📊 Metrics:
- Messages on AA_CORE_HOT: [percentage]
- DLQ rate: [msg/sec]
- Success rate: [percentage]
- Fallback events: [count]

Next Steps:
- [Next checklist items]
```

---

**Document Created:** 2025-10-02
**Last Updated:** 2025-10-02
**Next Review:** After staging deployment

# Phase 2 Migration: Risk Assessment & Go/No-Go Checklist

**Status**: Decision Framework
**Version**: 1.0
**Date**: 2025-10-01

---

## Overview

This document provides a comprehensive risk assessment framework and go/no-go decision checklist for the Phase 2 migration to 3-stream topology.

**Purpose**: Ensure migration proceeds only when all preconditions are met and risks are acceptably mitigated.

---

## Risk Matrix

### Risk Levels

| Level | Probability | Impact | Examples |
|-------|-------------|--------|----------|
| 🔴 **CRITICAL** | High | High | Data loss, extended outage (>1h) |
| 🟠 **HIGH** | Medium | High | Processing停止, requires rollback |
| 🟡 **MEDIUM** | Low | Medium | Temporary slowdown, manual intervention |
| 🟢 **LOW** | Low | Low | Logging noise, minor config drift |

---

## Phase-by-Phase Risk Assessment

### Phase 0: Create DLQ Stream

**Overall Risk**: 🟢 LOW

| Risk | Probability | Impact | Mitigation | Residual Risk |
|------|-------------|--------|------------|---------------|
| Stream creation fails | Low | Low | Retry with adjusted config | 🟢 LOW |
| Wrong subjects configured | Low | Low | Verification script pre-check | 🟢 LOW |
| Insufficient disk space | Low | Medium | Monitor cluster capacity | 🟢 LOW |

**Go/No-Go Criteria**:
- [ ] NATS cluster healthy (all 3 nodes UP)
- [ ] Disk space > 20GB available per node
- [ ] No active alerts on NATS cluster
- [ ] JetStream enabled and operational

**Rollback Complexity**: ✅ Trivial (delete stream)

---

### Phase 1: Migrate Vendor Subjects

**Overall Risk**: 🟡 MEDIUM

| Risk | Probability | Impact | Mitigation | Residual Risk |
|------|-------------|--------|------------|---------------|
| Vendor webhooks fail after subject removal | Medium | High | Test webhook before removal; fallback binding in code | 🟡 MEDIUM |
| Consumer binding to wrong stream | Low | Medium | Explicit binding check in logs | 🟢 LOW |
| Message loss during subject migration | Low | High | Drain old consumer before subject removal | 🟢 LOW |
| Oura webhook volume spike | Low | Medium | Consumer has max_deliver=5, DLQ catches failures | 🟢 LOW |

**Go/No-Go Criteria**:
- [ ] Phase 0 completed successfully
- [ ] AA_VENDOR_HOT stream created
- [ ] normalize-oura consumer exists on new stream
- [ ] Test webhook succeeds on new stream
- [ ] Old consumer has num_pending < 10
- [ ] Staging environment verified (vendor flow works)

**Rollback Complexity**: 🟡 Simple (add subjects back, ~2 minutes)

---

### Phase 2: Migrate Core Subjects

**Overall Risk**: 🟠 HIGH

| Risk | Probability | Impact | Mitigation | Residual Risk |
|------|-------------|--------|------------|---------------|
| HRV processing stops | Medium | High | Consumer fallback binding; blue-green deployment | 🟡 MEDIUM |
| Database connection failures | Low | High | Pre-check DB connectivity; increase ACK wait time | 🟢 LOW |
| Message loss during subject migration | Low | Critical | Drain old consumer first; verify message counts | 🟢 LOW |
| Consumer state corruption | Low | High | Keep durable name unchanged; bind (not recreate) | 🟢 LOW |
| Unexpected traffic spike | Low | Medium | Batch size tuning; consumer has max_ack_pending=1000 | 🟢 LOW |
| Rollback during high load | Low | High | Rollback tested in staging; documented procedure | 🟡 MEDIUM |

**Go/No-Go Criteria**:
- [ ] Phase 1 completed and stable for 24h
- [ ] AA_CORE_HOT stream created
- [ ] normalize-hrv-durable consumer exists on new stream
- [ ] Test HRV message flow succeeds (webhook → NATS → DB)
- [ ] Old consumer has num_pending = 0 (fully drained)
- [ ] Database responsive (ping < 50ms)
- [ ] All 30 integration tests passing
- [ ] Staging environment verified (HRV flow works)
- [ ] Blue-green deployment plan approved (if used)
- [ ] On-call engineer available for 4-hour window

**Rollback Complexity**: 🟠 Moderate (add subjects back + redeploy, ~5 minutes)

---

### Phase 3: Deprecate Legacy Stream

**Overall Risk**: 🟢 LOW

| Risk | Probability | Impact | Mitigation | Residual Risk |
|------|-------------|--------|------------|---------------|
| Accidental deletion with messages | Low | High | 14-day monitoring period; verify messages=0 | 🟢 LOW |
| Service hardcoded to legacy stream | Low | Low | Grep codebase for hardcoded stream names | 🟢 LOW |

**Go/No-Go Criteria**:
- [ ] Phase 2 stable for 14 days
- [ ] ATHLETE_ALLY_EVENTS has messages=0 for 7 consecutive days
- [ ] No new messages published to legacy stream (verified via monitoring)
- [ ] All services bound to new streams (verified in logs)
- [ ] No hardcoded references to ATHLETE_ALLY_EVENTS (grep verified)

**Rollback Complexity**: 🟡 Simple (recreate stream, ~5 minutes)

---

## Pre-Migration Checklist

### Infrastructure Readiness

**NATS Cluster**:
- [ ] All NATS nodes healthy (`nats server list` shows 3 UP)
- [ ] JetStream enabled (`nats account info` shows JetStream: true)
- [ ] Cluster disk space > 20GB free per node
- [ ] Cluster memory > 2GB free per node
- [ ] Network latency between nodes < 10ms
- [ ] No active NATS alerts in monitoring system

**Database**:
- [ ] PostgreSQL responsive (ping < 50ms)
- [ ] Connection pool not saturated (< 80% utilization)
- [ ] Database backup exists (< 6 hours old)
- [ ] Disk space > 10GB free
- [ ] No active database alerts

**Services**:
- [ ] ingest-service healthy (HTTP 200 on /health)
- [ ] normalize-service healthy (HTTP 200 on /health)
- [ ] All services on latest stable version
- [ ] No service restarts in last 24h (except planned)
- [ ] Service logs show no errors in last 1h

---

### Code Readiness

**Tests**:
- [ ] All unit tests passing (17/17 in normalize-service)
- [ ] All integration tests passing (30/30 total)
- [ ] Type-check clean (0 errors)
- [ ] Lint clean (0 warnings)
- [ ] Build successful (no errors)

**Code Review**:
- [ ] PR approved by 2+ reviewers
- [ ] Platform team reviewed infrastructure changes
- [ ] Backend team reviewed service modifications
- [ ] Security team reviewed (if sensitive changes)

**Staging**:
- [ ] Code deployed to staging environment
- [ ] Phase 0-2 executed successfully in staging
- [ ] All staging tests passing
- [ ] No regressions detected in staging
- [ ] Rollback tested in staging (verified working)

---

### Operational Readiness

**Documentation**:
- [ ] PHASE2_MIGRATION_PREP.md reviewed by team
- [ ] PHASE2_RUNBOOK.md reviewed by on-call engineer
- [ ] Rollback procedures documented and tested
- [ ] Communication templates prepared

**Team**:
- [ ] Migration scheduled (off-hours, low traffic)
- [ ] On-call engineer assigned and available
- [ ] Team notified in #engineering (24h advance notice)
- [ ] #on-call channel aware of maintenance window
- [ ] Escalation path defined (primary → secondary → manager)

**Monitoring**:
- [ ] Grafana dashboards accessible
- [ ] Prometheus scraping all services
- [ ] NATS metrics exporter running
- [ ] Alert rules configured (consumer lag, error rate)
- [ ] PagerDuty/Opsgenie integration tested

**Backup & Recovery**:
- [ ] Database backup confirmed (timestamp < 6h)
- [ ] NATS snapshot created (optional, for large deployments)
- [ ] Rollback plan tested in staging
- [ ] Recovery Time Objective (RTO) understood: 5 minutes
- [ ] Recovery Point Objective (RPO) understood: 0 (no message loss)

---

## Go/No-Go Decision Framework

### Phase 0 Go/No-Go

**Decision Point**: Before creating AA_DLQ stream

**Go Criteria** (all must be ✅):
- [ ] NATS cluster healthy
- [ ] Disk space sufficient (>20GB)
- [ ] No active alerts
- [ ] Team notified

**No-Go Conditions** (any triggers delay):
- ❌ NATS cluster degraded (any node down)
- ❌ Active incidents in production
- ❌ High traffic period (avoid business hours)
- ❌ Recent deployment (<24h ago)

**Decision**: Go ✅ / No-Go ❌ / Defer 🔄

**Approval**: Platform Team Lead

---

### Phase 1 Go/No-Go

**Decision Point**: Before removing vendor.> from ATHLETE_ALLY_EVENTS

**Go Criteria** (all must be ✅):
- [ ] Phase 0 stable for 24h
- [ ] AA_VENDOR_HOT stream created
- [ ] normalize-oura consumer exists
- [ ] Test vendor webhook succeeds
- [ ] Old consumer drained (num_pending < 10)
- [ ] Staging verified

**No-Go Conditions**:
- ❌ Phase 0 unstable (alerts or errors)
- ❌ Vendor webhook test fails
- ❌ Old consumer has backlog (>100 pending)
- ❌ Database connectivity issues

**Decision**: Go ✅ / No-Go ❌ / Defer 🔄

**Approval**: Platform Team Lead + Backend Team Lead

---

### Phase 2 Go/No-Go

**Decision Point**: Before removing core subjects from ATHLETE_ALLY_EVENTS

**Go Criteria** (all must be ✅):
- [ ] Phase 1 stable for 24h
- [ ] AA_CORE_HOT stream created
- [ ] normalize-hrv-durable consumer exists
- [ ] Test HRV flow succeeds (webhook → DB)
- [ ] Old consumer drained (num_pending = 0)
- [ ] Database responsive (<50ms)
- [ ] All 30 tests passing
- [ ] Staging verified
- [ ] On-call engineer available

**No-Go Conditions**:
- ❌ Phase 1 unstable
- ❌ HRV test flow fails
- ❌ Old consumer has ANY pending messages
- ❌ Database connection errors
- ❌ Any integration test fails
- ❌ High traffic period (>100 msg/min)
- ❌ Recent incident (<48h ago)
- ❌ Holiday or weekend (prefer weekday)

**Decision**: Go ✅ / No-Go ❌ / Defer 🔄

**Approval**: Platform Team Lead + Backend Team Lead + On-Call Engineer

---

### Phase 3 Go/No-Go

**Decision Point**: Before deleting ATHLETE_ALLY_EVENTS

**Go Criteria** (all must be ✅):
- [ ] Phase 2 stable for 14 days
- [ ] Legacy stream messages=0 for 7 consecutive days
- [ ] No new publishes to legacy stream (monitoring confirms)
- [ ] All services bound to new streams
- [ ] No hardcoded references found (grep clean)

**No-Go Conditions**:
- ❌ Any messages in legacy stream
- ❌ Monitoring shows recent publishes
- ❌ Service logs show legacy stream references
- ❌ Hardcoded stream names found in code

**Decision**: Go ✅ / No-Go ❌ / Defer 🔄

**Approval**: Platform Team Lead

---

## Risk Mitigation Strategies

### Strategy 1: Blue-Green Deployment (Phase 2)

**Approach**: Run both old and new consumers simultaneously

**Implementation**:
```bash
# Blue (legacy) - bind to ATHLETE_ALLY_EVENTS
kubectl scale deployment/normalize-service-blue --replicas=1

# Green (new) - bind to AA_CORE_HOT
kubectl scale deployment/normalize-service-green --replicas=1
```

**Benefits**:
- Zero downtime
- Instant failover
- A/B testing capability

**Drawbacks**:
- Duplicate processing (both process same messages)
- Higher resource usage

**Recommendation**: Use for Phase 2 only (highest risk)

---

### Strategy 2: Gradual Traffic Shift (Future Enhancement)

**Approach**: Route percentage of traffic to new topology

**Implementation**:
```typescript
// In ingest-service
const useNewTopology = Math.random() < parseFloat(process.env.NEW_TOPOLOGY_PERCENTAGE || '0');
const stream = useNewTopology ? 'AA_CORE_HOT' : 'ATHLETE_ALLY_EVENTS';
```

**Schedule**:
- Hour 0: 10% → new topology
- Hour 1: 50% → new topology
- Hour 2: 100% → new topology

**Recommendation**: Implement in follow-up PR (not required for Phase 2)

---

### Strategy 3: Consumer Draining (Phase 2)

**Approach**: Ensure old consumer finishes all pending messages before subject removal

**Implementation**:
```bash
# Wait for old consumer to drain
while [ $(nats consumer info ATHLETE_ALLY_EVENTS normalize-hrv-durable -j | jq '.num_pending') -gt 0 ]; do
  echo "Draining... ($(nats consumer info ATHLETE_ALLY_EVENTS normalize-hrv-durable -j | jq '.num_pending') pending)"
  sleep 5
done
```

**Benefits**:
- No message loss
- Verified state before migration

**Recommendation**: **MANDATORY** for Phase 2

---

### Strategy 4: Message Continuity Check

**Approach**: Verify message counts before and after migration

**Implementation**:
```bash
# Before
BEFORE_COUNT=$(nats stream info ATHLETE_ALLY_EVENTS -j | jq '.state.messages')

# After
AFTER_COUNT=$(nats stream info AA_CORE_HOT -j | jq '.state.messages')

# Verify
if [ $((BEFORE_COUNT - AFTER_COUNT)) -gt 0 ]; then
  echo "⚠️ Potential message loss detected"
fi
```

**Recommendation**: Use for Phase 2 verification

---

## Monitoring During Migration

### Critical Metrics (Monitor Every 5 Minutes)

**NATS Metrics**:
- `nats_consumer_num_pending` < 100 (consumer lag)
- `nats_stream_messages` (total messages)
- `nats_consumer_delivered` (messages delivered)
- `nats_consumer_ack_floor` (messages acknowledged)

**Service Metrics**:
- `normalize_hrv_messages_total{result="success"}` (success rate)
- `normalize_hrv_messages_total{result="dlq"}` (DLQ rate)
- `http_requests_total{status="200"}` (health check)

**Database Metrics**:
- `pg_stat_activity.count` (active connections)
- `pg_stat_database.xact_commit` (transaction rate)
- `hrv_data.count` (row inserts)

### Alert Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Consumer lag | > 100 for 10 min | Investigate, consider rollback |
| Error rate | > 10% for 5 min | Rollback immediately |
| DB inserts | 0 for 10 min | Rollback immediately |
| Service health | HTTP 500 for 5 min | Rollback immediately |

---

## Post-Migration Validation

### Immediate (T+5 minutes)

- [ ] All services healthy (HTTP 200 on /health)
- [ ] Consumer lag < 10 (num_pending)
- [ ] Error rate < 1%
- [ ] Database inserts succeeding
- [ ] No critical alerts

### Short-term (T+1 hour)

- [ ] No rollback triggered
- [ ] Message processing rate stable (±10% baseline)
- [ ] Consumer lag remains low (<10)
- [ ] No DLQ messages (or < 5 total)
- [ ] Grafana dashboards green

### Medium-term (T+24 hours)

- [ ] No production incidents
- [ ] Consumer lag consistently low
- [ ] Error rate < 0.5%
- [ ] Database performance unchanged
- [ ] Team feedback positive

### Long-term (T+14 days)

- [ ] Legacy stream empty (messages=0)
- [ ] No unexpected behavior
- [ ] Performance metrics match baseline
- [ ] Documentation updated
- [ ] Retrospective completed

---

## Rollback Triggers

### Automatic Rollback (Immediate)

**Conditions** (any triggers immediate rollback):
- 🚨 Error rate > 50% for 5 minutes
- 🚨 Database inserts = 0 for 10 minutes
- 🚨 Service health checks failing (HTTP 500) for 5 minutes
- 🚨 NATS cluster degraded (any node down)

**Action**: Execute emergency rollback procedure (PHASE2_RUNBOOK.md)

---

### Manual Rollback (Judgment Call)

**Conditions** (team decision required):
- ⚠️ Error rate 10-50% for 10 minutes
- ⚠️ Consumer lag > 100 for 30 minutes
- ⚠️ Unexpected DLQ volume (>50 messages)
- ⚠️ Performance degradation (>50% slowdown)
- ⚠️ Team discomfort with migration progress

**Action**: Consult on-call engineer + platform lead → decide Go/Rollback

---

## Sign-Off

### Phase 0 Approval

**Date**: ___________

**Approvals**:
- [ ] Platform Team Lead: ___________________________
- [ ] On-Call Engineer: ___________________________

**Decision**: Go ✅ / No-Go ❌ / Defer 🔄

---

### Phase 1 Approval

**Date**: ___________

**Approvals**:
- [ ] Platform Team Lead: ___________________________
- [ ] Backend Team Lead: ___________________________
- [ ] On-Call Engineer: ___________________________

**Decision**: Go ✅ / No-Go ❌ / Defer 🔄

---

### Phase 2 Approval

**Date**: ___________

**Approvals**:
- [ ] Platform Team Lead: ___________________________
- [ ] Backend Team Lead: ___________________________
- [ ] On-Call Engineer: ___________________________
- [ ] Engineering Manager: ___________________________ (optional, for high-risk)

**Decision**: Go ✅ / No-Go ❌ / Defer 🔄

**Notes**:
________________________________________________________________
________________________________________________________________
________________________________________________________________

---

### Phase 3 Approval

**Date**: ___________

**Approvals**:
- [ ] Platform Team Lead: ___________________________

**Decision**: Go ✅ / No-Go ❌ / Defer 🔄

---

## Lessons Learned (Post-Migration)

**What Went Well**:
________________________________________________________________
________________________________________________________________
________________________________________________________________

**What Could Be Improved**:
________________________________________________________________
________________________________________________________________
________________________________________________________________

**Action Items**:
________________________________________________________________
________________________________________________________________
________________________________________________________________

---

## References

- [PHASE2_MIGRATION_PREP.md](./PHASE2_MIGRATION_PREP.md) - Comprehensive guide
- [PHASE2_RUNBOOK.md](./PHASE2_RUNBOOK.md) - Operator procedures
- [PHASE2_ENV_VARIABLES.md](./PHASE2_ENV_VARIABLES.md) - Configuration reference
- [HANDOFF_REPORT.md](./HANDOFF_REPORT.md) - Phase 1-8 completion

---

**Document Version**: 1.0
**Last Updated**: 2025-10-01
**Maintained by**: Platform Team

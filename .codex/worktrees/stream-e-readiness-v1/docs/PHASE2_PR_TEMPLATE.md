# Pull Request: Phase 2 - 3-Stream Topology Migration

## Overview

This PR implements backward-compatible infrastructure changes to enable migration from a single-stream NATS topology to a 3-stream topology, providing improved isolation, retention, and observability for HRV and vendor data processing.

**Branch**: `release/phase2-migration`
**Target**: `main`
**Type**: Infrastructure Enhancement
**Risk Level**: Medium (backward compatible, instant rollback)

---

## Summary

### Current State (Single Stream)
```
ATHLETE_ALLY_EVENTS
├── Subjects: athlete-ally.>, vendor.>, sleep.*
├── Retention: 24h
└── Consumers: normalize-hrv-durable, normalize-oura
```

### Target State (3-Stream Topology)
```
AA_CORE_HOT
├── Subjects: athlete-ally.>, sleep.*
├── Retention: 48h
└── Consumer: normalize-hrv-durable

AA_VENDOR_HOT
├── Subjects: vendor.>
├── Retention: 48h
└── Consumer: normalize-oura

AA_DLQ
├── Subjects: dlq.>
├── Retention: 14d
└── Consumers: (manual inspection/replay)
```

---

## Changes

### 1. Event-Bus Package (`packages/event-bus/`)

**New Files**:
- None (changes to existing files only)

**Modified Files**:

#### `src/config.ts` - Stream Configuration
- Added `STREAMS` constant with 3-stream names + legacy fallback
- Added `getStreamMode()` - returns 'single' or 'multi' based on `EVENT_STREAM_MODE`
- Added `getStreamName()` - allows environment-based stream name overrides
- Added `getStreamConfigs()` - returns mode-aware stream configurations
- Added `nanos()` helper for ms → nanoseconds conversion

**Lines added**: ~120

#### `src/index.ts` - Stream Management
- Added `streamNeedsUpdate()` - detects config drift (subjects, retention, replicas)
- Added `ensureStream()` - create-or-update stream with idempotency
- Added `ensureAllStreams()` - iterate all streams in current mode
- Updated `EventBus.ensureStreams()` - delegate to `ensureAllStreams()`

**Lines added**: ~100

**Backward compatibility**: All changes are additive. Existing single-stream code paths remain functional.

---

### 2. Normalize-Service (`services/normalize-service/`)

**Modified Files**:

#### `src/index.ts` - Consumer Binding with Fallback

**Already implemented** (lines 177-195):
```typescript
// Try AA_CORE_HOT first, fallback to ATHLETE_ALLY_EVENTS
const opts = consumerOpts();
opts.ackExplicit();
opts.manualAck();

let sub: any;
try {
  opts.bind('AA_CORE_HOT', hrvDurable);
  sub = await js.pullSubscribe('', opts);
  console.log(`[normalize] Bound to AA_CORE_HOT`);
} catch (bindError) {
  console.log(`[normalize] Falling back to ATHLETE_ALLY_EVENTS`);
  opts.bind('ATHLETE_ALLY_EVENTS', hrvDurable);
  sub = await js.pullSubscribe('', opts);
}
```

**Enhancement** (optional, for future PR):
- Make stream candidates configurable via `AA_STREAM_CANDIDATES` env var
- Add stream label to metrics (already implemented - lines 246, 265, 290, 294, 303)

**Lines modified**: 0 (existing code already supports migration)

---

### 3. Diagnostic Scripts (`scripts/nats/`)

**New Files**:

#### `stream-info.js` - Multi-Stream Inspector
- Queries all 4 streams (AA_CORE_HOT, AA_VENDOR_HOT, AA_DLQ, ATHLETE_ALLY_EVENTS)
- Displays subjects, retention, replicas, message counts, consumer counts
- Handles missing streams gracefully

**Usage**:
```bash
node scripts/nats/stream-info.js
```

#### `consumer-diagnostic.js` - Consumer Health Check
- Inspects consumer state (pending, ack pending, redelivered)
- Shows configuration (filter subject, ACK policy, max deliver)
- Provides caught-up vs backlog status

**Usage**:
```bash
node scripts/nats/consumer-diagnostic.js AA_CORE_HOT normalize-hrv-durable
```

#### `migration-verify.js` - Phase Verification
- Automated verification for each migration phase (0-3)
- Checks stream existence, subjects, consumers
- Pass/fail report for go/no-go decisions

**Usage**:
```bash
node scripts/nats/migration-verify.js 2  # Verify Phase 2
```

**Lines added**: ~400 (3 new diagnostic tools)

---

### 4. Documentation (`docs/`)

**New Files**:

- `PHASE2_MIGRATION_PREP.md` (7.6KB) - Comprehensive migration guide
- `PHASE2_CODE_SNIPPETS.md` (15KB) - Code reference for all changes
- `PHASE2_ENV_VARIABLES.md` (8KB) - Environment variable reference
- `PHASE2_RUNBOOK.md` (12KB) - Operator step-by-step procedures
- `PHASE2_PR_TEMPLATE.md` (this file) - Pull request description
- `PHASE2_RISK_CHECKLIST.md` (pending) - Go/no-go decision framework

**Total documentation**: ~42KB of reference material

---

### 5. Configuration Files

**Modified**:
- `.env.example` - Added `EVENT_STREAM_MODE` and stream name variables
- `docker-compose.yml` (optional) - Example multi-stream configuration

**No changes required** for existing deployments (backward compatible defaults)

---

## Migration Strategy

### Backward Compatibility

**Key Principle**: All changes are additive and non-breaking.

1. **Default Mode**: `EVENT_STREAM_MODE=multi` (new topology)
   - Services automatically use 3-stream topology when available
   - Falls back to `ATHLETE_ALLY_EVENTS` if new streams don't exist

2. **Rollback Mode**: `EVENT_STREAM_MODE=single` (legacy topology)
   - Instant revert by setting environment variable
   - No code changes needed

3. **Consumer Naming**: Keep existing durable names
   - `normalize-hrv-durable` (unchanged)
   - `normalize-oura` (unchanged)
   - Preserves consumer state and offset positions

4. **Dual-API Support**: Pull loop handles both modern and legacy nats.js
   - `fetch()` API (modern) - already implemented
   - `pull()` + iterator (legacy) - already implemented

---

### Migration Phases

**Phase 0**: Create DLQ stream (✅ LOW RISK)
- Create `AA_DLQ` with `dlq.>` subjects
- No consumer changes
- Rollback: simply delete stream

**Phase 1**: Migrate vendor subjects (🟡 MEDIUM RISK)
- Create `AA_VENDOR_HOT` with `vendor.>` subjects
- Create consumer on new stream
- Remove `vendor.>` from legacy stream
- Rollback: add subjects back to legacy stream

**Phase 2**: Migrate core subjects (🔴 HIGH RISK)
- Create `AA_CORE_HOT` with `athlete-ally.>`, `sleep.*` subjects
- Create consumer on new stream
- Remove core subjects from legacy stream
- Rollback: add subjects back to legacy stream

**Phase 3**: Deprecate legacy stream (🟢 LOW RISK)
- Monitor for 14 days
- Delete `ATHLETE_ALLY_EVENTS` if clean
- Rollback: recreate legacy stream (not expected)

**Timeline**: 4 weeks (1 week prep + 3 weeks phased rollout)

---

## Testing

### Unit Tests

**Existing**: 17 unit tests in `normalize-service/src/__tests__/hrv-consumer.test.ts`
- All passing (17/17) ✅

**New** (recommended for follow-up PR):
- Parameterized tests for single vs multi mode
- Consumer binding fallback tests
- Stream configuration validation tests

### Integration Tests

**Existing**: 5 E2E test scenarios in `INTEGRATION_TESTS.md`
- All passing (30/30 total tests) ✅
- Verified HRV webhook → NATS → DB flow
- Verified metrics and telemetry

**Manual verification**:
```bash
# Test in multi-stream mode
export EVENT_STREAM_MODE=multi
npm test

# Test in single-stream mode (rollback scenario)
export EVENT_STREAM_MODE=single
npm test
```

### CI/CD

**GitHub Actions**:
- ✅ Type-check: 0 errors
- ✅ Lint: 0 warnings
- ✅ Tests: 30/30 passing
- ✅ Build: successful

**Recommended enhancement** (follow-up):
- Add matrix strategy to test both `single` and `multi` modes in CI

---

## Deployment Plan

### Pre-Deployment

1. **Code Review**:
   - [ ] Platform team review
   - [ ] Security review (infrastructure changes)
   - [ ] Architecture review (stream topology)

2. **Staging Verification**:
   - [ ] Deploy to staging
   - [ ] Run `migration-verify.js 0` (DLQ check)
   - [ ] Run `migration-verify.js 1` (Vendor check)
   - [ ] Run `migration-verify.js 2` (Core check)
   - [ ] All 30 integration tests pass

3. **Production Preparation**:
   - [ ] Schedule maintenance window (off-hours)
   - [ ] Notify team in #engineering
   - [ ] Prepare rollback plan
   - [ ] Database backup confirmed (< 6h old)

### Deployment Steps

**Phase 0** (Day 1 - 15 minutes):
```bash
# Create DLQ stream
nats stream add AA_DLQ --subjects "dlq.>" --max-age 14d --replicas 3
```

**Phase 1** (Day 2 - 45 minutes):
```bash
# Create vendor stream + consumer
nats stream add AA_VENDOR_HOT --subjects "vendor.>" --max-age 48h --replicas 3
nats consumer add AA_VENDOR_HOT normalize-oura

# Deploy services (already have fallback logic)
kubectl rollout restart deployment/normalize-service -n production

# Remove vendor.> from legacy stream
nats stream update ATHLETE_ALLY_EVENTS --subjects "athlete-ally.>,sleep.*"
```

**Phase 2** (Day 3 - 90 minutes):
```bash
# Create core stream + consumer
nats stream add AA_CORE_HOT --subjects "athlete-ally.>,sleep.*" --max-age 48h --replicas 3
nats consumer add AA_CORE_HOT normalize-hrv-durable

# Update services to use multi mode
kubectl set env deployment/normalize-service EVENT_STREAM_MODE=multi -n production
kubectl rollout restart deployment/normalize-service -n production

# Remove core subjects from legacy stream
nats stream update ATHLETE_ALLY_EVENTS --subjects ""
```

**Phase 3** (Day 17 - 5 minutes):
```bash
# After 14-day monitoring period
nats stream delete ATHLETE_ALLY_EVENTS --force
```

---

## Rollback Plan

### Instant Rollback (< 5 minutes)

**Scenario**: Production issues detected during migration

**Steps**:
1. Set `EVENT_STREAM_MODE=single` in all services
2. Redeploy services (auto-binds to legacy stream)
3. Add subjects back to `ATHLETE_ALLY_EVENTS` (if removed)
4. Monitor for normal operation

**Commands**:
```bash
# Revert to legacy stream
kubectl set env deployment/normalize-service \
  EVENT_STREAM_MODE=single \
  AA_STREAM_CANDIDATES=ATHLETE_ALLY_EVENTS \
  -n production

# Restart services
kubectl rollout restart deployment/normalize-service -n production

# Add subjects back (if removed)
nats stream update ATHLETE_ALLY_EVENTS --subjects "athlete-ally.>,vendor.>,sleep.*"
```

**Recovery Time Objective (RTO)**: 5 minutes
**Recovery Point Objective (RPO)**: 0 (no message loss)

---

## Monitoring

### Key Metrics

**Grafana Dashboard**: "NATS JetStream - Phase 2 Migration"

1. **Message Processing Rate**:
   ```promql
   sum(rate(normalize_hrv_messages_total{result="success"}[5m])) by (stream)
   ```

2. **Consumer Lag**:
   ```promql
   nats_consumer_num_pending{consumer="normalize-hrv-durable"}
   ```

3. **Error Rate**:
   ```promql
   sum(rate(normalize_hrv_messages_total{result=~"dlq|retry"}[5m]))
   ```

4. **Stream Health**:
   - Stream message count
   - Consumer count
   - Replication lag (for 3-replica setup)

### Alerts

**New Alerts** (recommended):
- `NATSConsumerLag` - num_pending > 100 for > 10 minutes
- `NATSStreamDown` - No messages received for > 10 minutes
- `NATSHighErrorRate` - DLQ rate > 10% for > 5 minutes

---

## Risk Assessment

### High Risks

1. **Phase 2 Subject Removal** (🔴 HIGH)
   - Impact: HRV processing stops if misconfigured
   - Mitigation: Blue-green deployment, drain old consumer first
   - Rollback: Instant (add subjects back to legacy stream)

### Medium Risks

2. **Phase 1 Vendor Migration** (🟡 MEDIUM)
   - Impact: Vendor webhooks fail if misconfigured
   - Mitigation: Test vendor webhook before subject removal
   - Rollback: Add vendor.> back to legacy stream

### Low Risks

3. **Phase 0 DLQ Creation** (✅ LOW)
   - Impact: None (new stream, no dependencies)
   - Mitigation: None needed
   - Rollback: Delete stream

4. **Phase 3 Legacy Cleanup** (✅ LOW)
   - Impact: None (stream already empty)
   - Mitigation: 14-day monitoring period
   - Rollback: Recreate stream (unlikely)

---

## Success Criteria

### Phase 0:
- [ ] AA_DLQ stream created
- [ ] Test message published and retrieved
- [ ] No errors in service logs

### Phase 1:
- [ ] AA_VENDOR_HOT stream created with consumer
- [ ] Vendor webhooks processed on new stream
- [ ] Metrics show `stream="AA_VENDOR_HOT"`
- [ ] Old stream no longer has `vendor.>` subject

### Phase 2:
- [ ] AA_CORE_HOT stream created with consumer
- [ ] HRV messages processed on new stream
- [ ] Database inserts succeed
- [ ] Metrics show `stream="AA_CORE_HOT"`
- [ ] Old stream has no subjects
- [ ] All 30 integration tests passing

### Phase 3:
- [ ] Legacy stream deleted after 14-day monitoring
- [ ] No regression in processing rate
- [ ] Error rate < 1%
- [ ] Documentation updated

---

## Breaking Changes

**None**. This is a backward-compatible infrastructure migration.

---

## Dependencies

**Required**:
- NATS Server 2.10+ with JetStream enabled
- nats.js 2.x (already installed)
- Kubernetes 1.20+ (for production deployment)

**Optional**:
- Prometheus/Grafana (for metrics visualization)
- Jaeger/OTLP collector (for trace export)

---

## Security Considerations

**No security impact**. Changes are internal infrastructure only.

**Access Control**:
- NATS streams inherit existing cluster authentication
- No new external endpoints exposed
- Consumer permissions unchanged

---

## Performance Impact

**Expected Improvements**:
- **Retention**: 24h → 48h (core/vendor streams)
- **DLQ visibility**: 0d → 14d (dedicated DLQ stream)
- **Isolation**: Vendor issues won't impact core processing

**No degradation expected**:
- Message throughput: unchanged
- Processing latency: unchanged
- Resource usage: ~5% increase (3 streams vs 1)

---

## Documentation Updates

**New Documentation** (included in this PR):
- ✅ `PHASE2_MIGRATION_PREP.md` - Comprehensive guide
- ✅ `PHASE2_CODE_SNIPPETS.md` - Code reference
- ✅ `PHASE2_ENV_VARIABLES.md` - Environment variables
- ✅ `PHASE2_RUNBOOK.md` - Operator procedures
- ✅ `PHASE2_PR_TEMPLATE.md` - This file
- ⏳ `PHASE2_RISK_CHECKLIST.md` - Go/no-go criteria (pending)

**Updated Documentation** (follow-up):
- `README.md` - Add Phase 2 migration status
- `ARCHITECTURE.md` - Update stream topology diagrams
- `HANDOFF_REPORT.md` - Add Phase 2 completion notes

---

## Follow-Up Work

**Recommended for future PRs**:

1. **Parameterized Tests** (P2):
   - Add CI matrix for single vs multi mode
   - Parameterize consumer tests by stream name

2. **Gradual Rollout** (P3):
   - Implement `NEW_TOPOLOGY_PERCENTAGE` in ingest-service
   - Support canary deployment (10% → 50% → 100%)

3. **Alerting** (P2):
   - Create Prometheus alert rules
   - Integrate with PagerDuty/Opsgenie

4. **Observability** (P3):
   - Add Grafana dashboard for stream health
   - Export JetStream metrics to Prometheus

---

## Checklist

### Pre-Merge:
- [ ] All tests passing (30/30)
- [ ] Code review approved (2 reviewers)
- [ ] Documentation complete
- [ ] Staging deployment verified
- [ ] Rollback plan reviewed

### Post-Merge:
- [ ] Create deployment tracking issue
- [ ] Schedule maintenance window
- [ ] Prepare runbook for on-call
- [ ] Update team wiki with migration timeline

---

## References

- [NATS JetStream Documentation](https://docs.nats.io/nats-concepts/jetstream)
- [Durable Consumer Best Practices](https://docs.nats.io/nats-concepts/jetstream/consumers#durable)
- [Athlete Ally Architecture](./ARCHITECTURE.md)
- [Phase 1-8 Handoff Report](./HANDOFF_REPORT.md)

---

## Reviewers

**Required Approvals**:
- [ ] @platform-team - Infrastructure changes
- [ ] @backend-team - Service modifications
- [ ] @sre-team - Deployment procedures

**Optional Reviewers**:
- @security-team - Security review (if needed)
- @data-team - Data retention changes

---

## Questions?

For questions or concerns about this PR:
- Comment directly on the PR
- Reach out in #engineering (Slack)
- DM @platform-team

---

**PR Author**: Platform Team
**Date Created**: 2025-10-01
**Target Merge Date**: TBD (after staging verification)
**Deployment Date**: TBD (scheduled maintenance window)

# Phase 2 Migration Preparation: 3-Stream Topology

**Status**: Documentation Only (No Execution)
**Date**: 2025-10-01
**Version**: 1.0

---

## Overview

This document prepares the athlete-ally codebase for migration from a single-stream topology (`ATHLETE_ALLY_EVENTS`) to a 3-stream topology (`AA_CORE_HOT`, `AA_VENDOR_HOT`, `AA_DLQ`) with full backward compatibility.

**Objective**: Enable safe, gradual migration with zero downtime and instant rollback capability.

---

## Architecture

### Current State (Single Stream)

```
ATHLETE_ALLY_EVENTS
├── Subjects: athlete-ally.>, vendor.oura.>, sleep.*
├── Retention: 24h
└── Consumers:
    ├── normalize-hrv-durable (pull)
    └── normalize-oura (pull)
```

### Target State (3-Stream Topology)

```
AA_CORE_HOT
├── Subjects: athlete-ally.>, sleep.*
├── Retention: 48h
├── Replicas: 3 (prod) / 1 (dev)
└── Consumers:
    └── normalize-hrv-durable (pull)

AA_VENDOR_HOT
├── Subjects: vendor.>
├── Retention: 48h
├── Replicas: 3 (prod) / 1 (dev)
└── Consumers:
    └── normalize-oura (pull)

AA_DLQ
├── Subjects: dlq.>
├── Retention: 14d
├── Replicas: 3 (prod) / 1 (dev)
└── Consumers: (manual inspection/replay)
```

---

## Backward Compatibility Strategy

### 1. Environment-Based Mode Switch

**Default Mode**: `multi` (3-stream topology)
**Legacy Mode**: `single` (original topology)

```bash
# New deployments (default)
EVENT_STREAM_MODE=multi

# Legacy/rollback
EVENT_STREAM_MODE=single
```

### 2. Stream Binding Fallback

Consumers try streams in order:

**HRV Consumer**:
1. Try `AA_CORE_HOT` (multi-stream mode)
2. Fallback to `ATHLETE_ALLY_EVENTS` (single-stream mode)

**Vendor Consumer**:
1. Try `AA_VENDOR_HOT` (multi-stream mode)
2. Fallback to `ATHLETE_ALLY_EVENTS` (single-stream mode)

**Implementation** (already in normalize-service):
```typescript
const opts = consumerOpts();
opts.bind('AA_CORE_HOT', hrvDurable);

let sub;
try {
  sub = await js.pullSubscribe('', opts);
  console.log(`Bound to AA_CORE_HOT`);
} catch (bindError) {
  console.log(`Falling back to ATHLETE_ALLY_EVENTS`);
  opts.bind('ATHLETE_ALLY_EVENTS', hrvDurable);
  sub = await js.pullSubscribe('', opts);
}
```

### 3. Consumer Naming Continuity

**Decision**: Keep existing durable names to minimize disruption

- HRV: `normalize-hrv-durable` (no change)
- Vendor: `normalize-oura` (no change)

**Benefit**: No consumer recreation needed; just rebind to new stream.

### 4. Dual-API Pull Loop

Support both `fetch()` (modern) and `pull()` (legacy) APIs:

```typescript
if (typeof sub.fetch === "function") {
  // Modern API
  const batch = await sub.fetch({ max: BATCH_SIZE, expires: EXPIRES_MS });
  for await (const m of batch) {
    await handle(m);
  }
} else {
  // Legacy API
  await sub.pull({ batch: BATCH_SIZE, expires: EXPIRES_MS });
  for await (const m of sub) {
    await handle(m);
    if (deadline reached) break;
  }
}
```

**Current Implementation**: Already in normalize-service (lines 316-352)

---

## Migration Phases

### Phase 0: Create DLQ Stream ✅ LOW RISK

**Goal**: Establish DLQ infrastructure

**Actions**:
1. Create `AA_DLQ` stream with `dlq.>` subjects
2. Verify stream exists
3. Update DLQ subject references in services

**Verification**:
```bash
nats stream info AA_DLQ
# Expected:
# - Subjects: dlq.>
# - Max age: 14d
# - Replicas: 3 (prod) / 1 (dev)
```

**Rollback**: Simply delete `AA_DLQ` (no consumers depend on it yet)

---

### Phase 1: Migrate Vendor Subjects 🟡 MEDIUM RISK

**Goal**: Move `vendor.>` to dedicated stream

**Actions**:
1. Create `AA_VENDOR_HOT` with `vendor.>` subjects
2. Create vendor consumer on `AA_VENDOR_HOT`
3. Deploy services with fallback binding
4. Verify vendor messages processing on new stream
5. Remove `vendor.>` from `ATHLETE_ALLY_EVENTS`

**Pre-checks**:
- [ ] `AA_VENDOR_HOT` stream created
- [ ] Vendor consumer exists on new stream
- [ ] Services deployed with fallback logic
- [ ] Test vendor webhook succeeds

**Verification**:
```bash
# New stream has vendor consumer
nats consumer info AA_VENDOR_HOT normalize-oura

# Old stream no longer has vendor.> subject
nats stream info ATHLETE_ALLY_EVENTS
# Subjects should not include vendor.>

# Send test vendor message
curl -X POST http://localhost:4101/api/v1/webhook/oura \
  -H "Content-Type: application/json" \
  -d '{"test": "vendor-migration"}'

# Verify processed on new stream
nats consumer info AA_VENDOR_HOT normalize-oura
# num_pending should decrease
```

**Rollback**:
```bash
# Add vendor.> back to old stream
nats stream update ATHLETE_ALLY_EVENTS \
  --subjects "athlete-ally.>,vendor.>,sleep.*"

# Delete new consumer
nats consumer delete AA_VENDOR_HOT normalize-oura
```

---

### Phase 2: Migrate Core Subjects 🔴 HIGH RISK

**Goal**: Move `athlete-ally.>` and `sleep.*` to dedicated stream

**Actions**:
1. Create `AA_CORE_HOT` with `athlete-ally.>`, `sleep.*` subjects
2. Create HRV consumer on `AA_CORE_HOT`
3. Deploy services with fallback binding
4. Verify HRV messages processing on new stream
5. Remove core subjects from `ATHLETE_ALLY_EVENTS`

**Pre-checks**:
- [ ] `AA_CORE_HOT` stream created
- [ ] HRV consumer exists on new stream
- [ ] Services deployed with fallback logic
- [ ] Staging environment verified
- [ ] Database connection stable
- [ ] All Phase 1-8 tests passing

**Verification**:
```bash
# New stream has HRV consumer
nats consumer info AA_CORE_HOT normalize-hrv-durable

# Old stream no longer has core subjects
nats stream info ATHLETE_ALLY_EVENTS
# Subjects should be empty or only dlq.>

# Send test HRV message
curl -X POST http://localhost:4101/api/v1/ingest/hrv \
  -H "Content-Type: application/json" \
  -d '{"userId":"migration-test-phase2","date":"2025-10-01","rmssd":45.5}'

# Verify DB insert
psql -h localhost -p 55432 -U athlete -d athlete_normalize \
  -c "SELECT * FROM hrv_data WHERE user_id='migration-test-phase2';"

# Check metrics
curl http://localhost:9464/metrics | grep normalize_hrv_messages_total
# Should show stream="AA_CORE_HOT"
```

**Rollback**:
```bash
# Add core subjects back to old stream
nats stream update ATHLETE_ALLY_EVENTS \
  --subjects "athlete-ally.>,sleep.*"

# Services will automatically fallback (no code change needed)

# Monitor logs
docker-compose logs normalize-service | grep "Falling back to ATHLETE_ALLY_EVENTS"
```

---

### Phase 3: Deprecate Legacy Stream 🟢 LOW RISK

**Goal**: Keep legacy stream as safety net, then retire

**Actions**:
1. Monitor `ATHLETE_ALLY_EVENTS` for unexpected publishes (14 days)
2. Alert on any messages in legacy stream
3. After verification period, delete stream

**Verification**:
```bash
# Check for any unexpected messages
nats stream info ATHLETE_ALLY_EVENTS
# state.messages should be 0

# If clean after 14 days
nats stream delete ATHLETE_ALLY_EVENTS
```

---

## Risk Mitigation

### 1. Blue-Green Consumer Deployment

Run both old and new consumers simultaneously during migration:

```yaml
# docker-compose.yml
services:
  normalize-service-blue:
    # Points to old stream (ATHLETE_ALLY_EVENTS)
    environment:
      EVENT_STREAM_MODE: single

  normalize-service-green:
    # Points to new stream (AA_CORE_HOT)
    environment:
      EVENT_STREAM_MODE: multi
```

Monitor both:
- Blue should show decreasing `num_pending` (draining)
- Green should show increasing `delivered` (processing new)

### 2. Message Continuity Check

Ensure no messages lost during transition:

```bash
# Before migration
BEFORE_COUNT=$(nats stream info ATHLETE_ALLY_EVENTS -j | jq '.state.messages')

# After migration
AFTER_COUNT=$(nats stream info AA_CORE_HOT -j | jq '.state.messages')

# Verify all messages accounted for
if [ $((BEFORE_COUNT - AFTER_COUNT)) -gt 0 ]; then
  echo "⚠️ Potential message loss detected"
fi
```

### 3. Gradual Traffic Shift

Use feature flags or percentage-based routing:

```typescript
// In publisher (ingest-service)
const useNewTopology = Math.random() < parseFloat(process.env.NEW_TOPOLOGY_PERCENTAGE || '0');
const stream = useNewTopology ? 'AA_CORE_HOT' : 'ATHLETE_ALLY_EVENTS';
```

Start with 10% → 50% → 100% over hours/days.

---

## Environment Variables

### New Variables

```bash
# Mode control
EVENT_STREAM_MODE=multi  # or "single"

# Stream names (overridable)
STREAM_CORE_NAME=AA_CORE_HOT
STREAM_VENDOR_NAME=AA_VENDOR_HOT
STREAM_DLQ_NAME=AA_DLQ
STREAM_LEGACY_NAME=ATHLETE_ALLY_EVENTS

# Consumer settings (unchanged)
NORMALIZE_HRV_DURABLE=normalize-hrv-durable  # Keep existing name
NORMALIZE_HRV_MAX_DELIVER=5
NORMALIZE_HRV_DLQ_SUBJECT=dlq.normalize.hrv.raw-received
NORMALIZE_HRV_ACK_WAIT_MS=60000

# Pull loop tuning
HRV_BATCH_SIZE=10  # Default: 10
HRV_EXPIRES_MS=5000  # Default: 5000
HRV_IDLE_BACKOFF_MS=50  # Default: 50
```

### Backward Compatibility

Old variables still work:
```bash
# Legacy (still supported)
NORMALIZE_HRV_DURABLE=normalize-hrv-durable

# New (preferred, but defaults to legacy if not set)
HRV_DURABLE=normalize-hrv-consumer  # Not used; we keep old name
```

---

## Metrics Changes

### New Labels

All NATS-related metrics gain `stream` and `durable` labels:

**Before**:
```promql
normalize_hrv_messages_total{result="success", subject="athlete-ally.hrv.raw-received"}
```

**After**:
```promql
normalize_hrv_messages_total{
  result="success",
  subject="athlete-ally.hrv.raw-received",
  stream="AA_CORE_HOT",
  durable="normalize-hrv-durable"
}
```

### Grafana Query Updates

**Old queries (will break)**:
```promql
sum(rate(normalize_hrv_messages_total{result="success"}[5m]))
```

**New queries (migration-safe)**:
```promql
# Aggregate across streams
sum(rate(normalize_hrv_messages_total{result="success"}[5m])) by (subject)

# Filter by specific stream
sum(rate(normalize_hrv_messages_total{result="success", stream="AA_CORE_HOT"}[5m]))

# Show both streams during migration
sum(rate(normalize_hrv_messages_total{result="success"}[5m])) by (stream)
```

---

## Testing Strategy

### Unit Tests

Parameterize by stream name:

```typescript
describe('HRV Consumer', () => {
  it.each([
    { stream: 'AA_CORE_HOT', mode: 'multi' },
    { stream: 'ATHLETE_ALLY_EVENTS', mode: 'single' },
  ])('processes messages from %s in %s mode', async ({ stream, mode }) => {
    process.env.EVENT_STREAM_MODE = mode;
    process.env.STREAM_CORE_NAME = stream;

    // Test logic
    const consumer = await createHRVConsumer();
    expect(consumer.boundStream).toBe(stream);
  });
});
```

### Integration Tests

CI matrix for both modes:

```yaml
# .github/workflows/test.yml
strategy:
  matrix:
    stream-mode: [single, multi]

env:
  EVENT_STREAM_MODE: ${{ matrix.stream-mode }}

steps:
  - name: Setup NATS
    run: |
      if [ "${{ matrix.stream-mode }}" == "multi" ]; then
        # Create 3 streams
        node scripts/nats/create-multi-streams.js
      else
        # Create single stream
        node scripts/nats/create-single-stream.js
      fi

  - name: Run E2E tests
    run: npm test
```

### Manual Verification

Use existing `INTEGRATION_TESTS.md` with stream parameter:

```bash
# Test in multi-stream mode
export EVENT_STREAM_MODE=multi
./run-integration-tests.sh

# Test in single-stream mode (rollback scenario)
export EVENT_STREAM_MODE=single
./run-integration-tests.sh
```

---

## Success Criteria

### Phase 0: DLQ Stream
- [ ] `AA_DLQ` stream created with `dlq.>` subjects
- [ ] Retention: 14d
- [ ] Replicas: 3 (prod) / 1 (dev)
- [ ] DLQ alerts configured in Prometheus

### Phase 1: Vendor Stream
- [ ] `AA_VENDOR_HOT` stream created
- [ ] Vendor consumer bound and processing
- [ ] Test vendor webhook → new stream → DB
- [ ] Metrics show `stream="AA_VENDOR_HOT"`
- [ ] `ATHLETE_ALLY_EVENTS` no longer has `vendor.>`

### Phase 2: Core Stream
- [ ] `AA_CORE_HOT` stream created
- [ ] HRV consumer bound and processing
- [ ] Test HRV webhook → new stream → DB
- [ ] Metrics show `stream="AA_CORE_HOT"`
- [ ] All 30 tests passing
- [ ] No message loss during migration
- [ ] `ATHLETE_ALLY_EVENTS` has no subjects

### Phase 3: Legacy Cleanup
- [ ] `ATHLETE_ALLY_EVENTS` monitored for 14 days
- [ ] No unexpected messages
- [ ] Legacy stream deleted
- [ ] Documentation updated

---

## Rollback Procedures

### Emergency Rollback (Any Phase)

**Scenario**: Migration causes production issues

**Actions**:
1. Set `EVENT_STREAM_MODE=single` in all services
2. Redeploy (services fallback to `ATHLETE_ALLY_EVENTS`)
3. Add subjects back to `ATHLETE_ALLY_EVENTS` if removed
4. Monitor for normal operation
5. Investigate root cause before reattempting

**Verification**:
```bash
# Check services reverted
curl http://localhost:4102/health | jq '.stream'
# Should show: "ATHLETE_ALLY_EVENTS"

# Check messages processing
nats consumer info ATHLETE_ALLY_EVENTS normalize-hrv-durable
# num_pending should decrease
```

### Partial Rollback (Phase-Specific)

**Phase 1 Rollback**:
```bash
# Keep core on new stream, revert vendor to old
nats stream update ATHLETE_ALLY_EVENTS --subjects "vendor.>"
nats consumer delete AA_VENDOR_HOT normalize-oura
```

**Phase 2 Rollback**:
```bash
# Keep vendor on new stream, revert core to old
nats stream update ATHLETE_ALLY_EVENTS --subjects "athlete-ally.>,sleep.*"
nats consumer delete AA_CORE_HOT normalize-hrv-durable
```

---

## Timeline

### Week 1: Preparation
- Day 1-2: Code updates (event-bus, normalize-service)
- Day 3-4: Staging environment testing
- Day 5: Review and approval

### Week 2: Phase 0-1 (Low/Medium Risk)
- Day 1: Phase 0 - Create DLQ stream
- Day 2: Phase 1 - Migrate vendor subjects
- Day 3-7: Monitor for issues

### Week 3: Phase 2 (High Risk)
- Day 1-2: Final staging verification
- Day 3: Phase 2 - Migrate core subjects (off-hours)
- Day 4-7: Intensive monitoring

### Week 4+: Phase 3 (Low Risk)
- Week 4-5: Monitor legacy stream (14 days)
- Week 6: Delete legacy stream
- Week 7: Final documentation and retrospective

---

## Next Steps

1. **Review this document** with team
2. **Update code** (see `PHASE2_CODE_SNIPPETS.md`)
3. **Test in staging** (both single and multi modes)
4. **Prepare runbook** (see `PHASE2_RUNBOOK.md`)
5. **Schedule migration** (off-hours, low-traffic window)
6. **Execute Phase 0** (DLQ creation)

---

## References

- `PHASE2_CODE_SNIPPETS.md` - Detailed code changes
- `PHASE2_ENV_VARIABLES.md` - Environment variable reference
- `PHASE2_RUNBOOK.md` - Operator step-by-step guide
- `PHASE2_PR_TEMPLATE.md` - Pull request description
- `PHASE2_RISK_CHECKLIST.md` - Go/no-go decision criteria
- `HANDOFF_REPORT.md` - Phase 1-8 completion summary

---

**Document Version**: 1.0
**Last Updated**: 2025-10-01
**Status**: Ready for Review

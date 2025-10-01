# Multi-Stream Migration Runbook

## Overview

This PR implements multi-stream compatibility for the normalize service, enabling seamless migration from `ATHLETE_ALLY_EVENTS` to `AA_CORE_HOT` stream.

## Changes

### Core Implementation
- **Dual Stream Support**: Service tries `AA_CORE_HOT` first, falls back to `ATHLETE_ALLY_EVENTS`
- **Pull Consumer Pattern**: Implements robust pull consumer with dual API support (fetch vs pull+iterator)
- **Enhanced Error Handling**: Retryable vs non-retryable error classification with DLQ strategy
- **Improved Observability**: Stream/durable labels in metrics, PII-safe logging

### Configuration
- **Default Durable**: `normalize-hrv-durable` (configurable via `NORMALIZE_HRV_DURABLE`)
- **ACK Wait**: 60s (configurable via `NORMALIZE_HRV_ACK_WAIT_MS`)
- **Max ACK Pending**: 1000 (prevents blocking)
- **DLQ Subjects**: `dlq.normalize.hrv.raw-received.{reason}` (dots+hyphens)

### Port Changes
- **Default Port**: 4112 (configurable via `PORT` env var)
- **Rationale**: Avoids conflicts with existing services

## Migration Steps

### Phase 1: Deploy (Current)
1. Deploy this PR - service will use `ATHLETE_ALLY_EVENTS` (fallback mode)
2. Verify consumer `normalize-hrv-durable` processes messages correctly
3. Monitor metrics and DLQ counters

### Phase 2: Stream Migration (Future)
1. Create `AA_CORE_HOT` stream with same subjects
2. Service will automatically bind to `AA_CORE_HOT` (primary mode)
3. Decommission `ATHLETE_ALLY_EVENTS` when ready

## Verification

### Pre-Deploy
- [ ] Type-check passes: `npx tsc --noEmit`
- [ ] Lint passes: `npm run lint`
- [ ] Tests pass: `npm test`

### Post-Deploy
- [ ] Consumer info shows `normalize-hrv-durable` with `Num Pending ~0`
- [ ] `assert-normalized-hrv.js` passes on fresh HRV publish
- [ ] Metrics endpoints scrape successfully
- [ ] DLQ counters increment on synthetic errors

## Rollback Plan

If issues arise:
1. Revert to previous durable name: `NORMALIZE_HRV_DURABLE=normalize-hrv-consumer`
2. Service will continue processing from existing consumer
3. No data loss as messages remain in stream

## Monitoring

### Key Metrics
- `normalize_hrv_messages_total{result,subject,stream,durable}`
- `normalize_hrv_messages_total{result="dlq"}` - DLQ rate
- `normalize_hrv_messages_total{result="retry"}` - Retry rate

### Alerts
- DLQ rate > 5%: Investigate processing errors
- Retry rate > 20%: Check database connectivity
- Pending messages > 100: Consumer may be stuck



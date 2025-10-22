# Stream 5 - Time Crunch Mode Feature Flag Configuration

## Feature Flag Definition

**Flag Key:** `feature.stream5_time_crunch_mode`  
**Surface:** Planning Engine `/api/v1/time-crunch/preview` endpoint  
**Default:** `false` (disabled)  
**Dependencies:** None

## Description

Controls the availability of the Time Crunch Mode preview endpoint. When enabled:
- `/api/v1/time-crunch/preview` endpoint becomes available
- `timeCrunchTargetMinutes` field is processed in plan generation requests
- Frontend Time Crunch Preview Modal is accessible
- Full telemetry tracking is active

## Environment Variable Override

For local development without LaunchDarkly:

```powershell
# Enable Time Crunch Mode
$env:FEATURE_STREAM5_TIME_CRUNCH_MODE="true"

# Start planning-engine
cd services/planning-engine
npm run dev
```

## LaunchDarkly Configuration

### Staging Environment
```yaml
feature.stream5_time_crunch_mode:
  targeting:
    - targeting: ON
      values: true
  fallthrough:
    variation: true
```

### Production Environment (Gradual Rollout)
```yaml
feature.stream5_time_crunch_mode:
  targeting:
    - targeting: ON
      values: true
      percentage: 10  # Start with 10% of users
  fallthrough:
    variation: false
```

## Verification Steps

### 1. Enable Flag Locally
```powershell
$env:FEATURE_STREAM5_TIME_CRUNCH_MODE="true"
echo $env:FEATURE_STREAM5_TIME_CRUNCH_MODE
```

### 2. Test Preview Endpoint
```powershell
curl -X POST http://localhost:4102/api/v1/time-crunch/preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "planId": "<plan-id>",
    "targetMinutes": 45
  }'
```

### 3. Check Telemetry Events
Monitor Grafana dashboard for:
- `stream5.time_crunch_preview_requested`
- `stream5.time_crunch_preview_succeeded`
- `stream5.time_crunch_preview_fallback`

## Rollout Plan

### Phase 1: Internal Testing (Week 1)
- Enable for internal team members only
- Monitor error rates and performance metrics
- Validate telemetry data collection

### Phase 2: Beta Users (Week 2)
- Enable for 10% of beta users
- Monitor compression success rates
- Collect user feedback on preview accuracy

### Phase 3: Gradual Rollout (Week 3-4)
- Increase to 25%, then 50% of users
- Monitor system performance impact
- Validate compression strategy effectiveness

### Phase 4: Full Rollout (Week 5)
- Enable for 100% of users
- Monitor for any edge cases
- Prepare for feature announcement

## Monitoring & Alerts

### Key Metrics to Watch
- Preview request success rate (target: >95%)
- Time constraint satisfaction rate (target: >80%)
- Average response time (target: <2s)
- Error rate (target: <5%)

### Alert Thresholds
- Error rate > 10% for 5 minutes
- Response time > 5s for 5 minutes
- Success rate < 90% for 10 minutes

## Rollback Plan

If issues arise:
1. Set flag to `false` in LaunchDarkly
2. Monitor error rates return to baseline
3. Investigate root cause
4. Fix and re-enable with smaller percentage

## Dependencies

- ✅ Contract regeneration completed
- ✅ Telemetry instrumentation active
- ✅ Monitoring dashboard deployed
- ✅ Unit tests passing
- ✅ Integration tests validated

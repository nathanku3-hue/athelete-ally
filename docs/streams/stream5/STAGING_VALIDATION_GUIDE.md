# Stream5 Time Crunch Mode - Staging Validation Guide

**Target Audience:** QA Team, Operations, DevOps  
**Duration:** 24-48 hours soak period  
**Status:** Ready for staging deployment

## Pre-Deployment Checklist

### 1. Dashboard Deployment
- [ ] Deploy `stream5-time-crunch-dashboard.json` to Grafana staging
- [ ] Verify dashboard loads without errors
- [ ] Confirm all panels show "No data" initially (expected)
- [ ] Test dashboard refresh and time range controls

### 2. Feature Flag Configuration
- [ ] Set `feature.stream5_time_crunch_mode=true` in staging LaunchDarkly
- [ ] Verify environment variable override works: `FEATURE_STREAM5_TIME_CRUNCH_MODE=true`
- [ ] Test flag evaluation in planning-engine logs

### 3. Service Health Checks
- [ ] Confirm planning-engine is healthy before flag enable
- [ ] Verify existing endpoints still work (no regressions)
- [ ] Check database connectivity and performance
- [ ] Validate Redis/NATS connections

## Staging Validation Tests

### Phase 1: Basic Functionality (First 2 hours)

#### Test 1: Endpoint Availability
```bash
# Test endpoint is accessible
curl -X POST https://staging-planning-engine/api/v1/time-crunch/preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <staging-token>" \
  -d '{"planId": "test-plan-id", "targetMinutes": 45}'

# Expected: 404 if plan not found (normal), not 404 for feature_not_available
```

#### Test 2: Feature Flag Response
```bash
# Test with disabled flag (should return feature_not_available)
# Test with enabled flag (should process request)
```

#### Test 3: Telemetry Events
Monitor Grafana dashboard for:
- [ ] `stream5.time_crunch_preview_requested` events appear
- [ ] `stream5.time_crunch_preview_succeeded` events appear
- [ ] No unexpected `stream5.time_crunch_preview_fallback` events

### Phase 2: Load Testing (Hours 2-8)

#### Test 4: Concurrent Requests
```bash
# Simulate 10 concurrent preview requests
for i in {1..10}; do
  curl -X POST https://staging-planning-engine/api/v1/time-crunch/preview \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <staging-token>" \
    -d '{"planId": "<valid-plan-id>", "targetMinutes": 30}' &
done
wait
```

**Monitor:**
- [ ] Response times < 2 seconds
- [ ] No 5xx errors
- [ ] Memory usage stable
- [ ] Database connection pool healthy

#### Test 5: Edge Cases
- [ ] Test with `targetMinutes: 15` (minimum)
- [ ] Test with `targetMinutes: 180` (maximum)
- [ ] Test with invalid plan IDs
- [ ] Test with malformed JSON

### Phase 3: Extended Soak (Hours 8-48)

#### Test 6: Continuous Monitoring
Monitor dashboard metrics every 4 hours:
- [ ] Request success rate > 95%
- [ ] Average response time < 2s
- [ ] Error rate < 5%
- [ ] Compression strategy distribution looks reasonable
- [ ] Time constraint success rate > 80%

#### Test 7: Integration Testing
- [ ] Test frontend TimeCrunchPreviewModal component
- [ ] Verify contract regeneration in gateway-bff
- [ ] Test end-to-end user flow
- [ ] Validate telemetry data in analytics pipeline

## Monitoring Dashboard Guide

### Key Panels to Watch

#### 1. Time Crunch Preview Requests
- **What to look for:** Steady request rate, no sudden spikes
- **Red flags:** Zero requests (flag not working), sudden drops (service issues)

#### 2. Compression Strategy Distribution
- **What to look for:** Balanced distribution across strategies
- **Red flags:** All requests using same strategy, "none" strategy dominant

#### 3. Time Constraint Success Rate
- **What to look for:** >80% success rate
- **Red flags:** <70% success rate (compression algorithm issues)

#### 4. Preview Endpoint Response Time
- **What to look for:** <2s average, <5s 95th percentile
- **Red flags:** >5s average (performance issues)

#### 5. Fallback Reasons
- **What to look for:** Minimal fallbacks, clear error reasons
- **Red flags:** High fallback rate, "internal_error" dominant

### Alert Thresholds

Set up alerts for:
- Error rate > 10% for 5 minutes
- Response time > 5s for 5 minutes  
- Success rate < 90% for 10 minutes
- Zero requests for 30 minutes (flag issue)

## Rollback Plan

If issues detected:

### Immediate Rollback (< 5 minutes)
```bash
# Disable feature flag in LaunchDarkly
feature.stream5_time_crunch_mode: false

# Or set environment variable
FEATURE_STREAM5_TIME_CRUNCH_MODE=false
```

### Verification Steps
- [ ] Confirm endpoint returns `feature_not_available`
- [ ] Monitor error rates return to baseline
- [ ] Check system performance returns to normal
- [ ] Document incident for post-mortem

## Success Criteria

**Green Light for Production Rollout:**
- [ ] 24+ hours of stable operation
- [ ] Success rate > 95%
- [ ] Response time < 2s average
- [ ] Error rate < 5%
- [ ] No regressions in existing functionality
- [ ] QA sign-off on integration tests

## Communication Plan

### Hourly Updates (First 8 hours)
- Send status updates to #stream5-staging channel
- Include key metrics screenshots
- Report any issues immediately

### Daily Summary (After 24 hours)
- Comprehensive metrics report
- Performance analysis
- Recommendation for production rollout

## Contacts

**Primary:** Stream5 Team  
**Escalation:** DevOps Lead  
**QA Lead:** [QA Team Contact]  
**Ops Lead:** [Operations Contact]

---

**Next Steps:** Once staging validation is complete, proceed with 10% production rollout.

# Stream5 Time Crunch Mode - Staging Deployment Checklist

**Target:** 48-hour staging soak period  
**Status:** Ready for deployment  
**Next Gate:** Week 2 beta rollout (10%)

## Pre-Deployment Requirements

### 1. Environment Configuration
- [ ] **Grafana API Key:** Set `STAGING_GRAFANA_API_KEY` environment variable
- [ ] **LaunchDarkly Access:** Verify staging environment access
- [ ] **Database Connectivity:** Confirm planning-engine can connect to staging DB
- [ ] **Service Health:** Verify all staging services are operational

### 2. Dashboard Deployment
```powershell
# Set API key (replace with actual key)
$env:STAGING_GRAFANA_API_KEY="your-staging-api-key-here"

# Deploy dashboard
.\scripts\deploy-stream5-dashboard.ps1 staging
```

**Expected Output:**
- ✅ Grafana connectivity confirmed
- ✅ Dashboard deployed successfully
- ✅ Dashboard verification successful
- Dashboard URL: https://staging-grafana.athlete-ally.com/d/stream5-time-crunch

### 3. Feature Flag Configuration
```yaml
# In LaunchDarkly staging environment
feature.stream5_time_crunch_mode:
  targeting:
    - targeting: ON
      values: true
  fallthrough:
    variation: true
```

**Verification:**
- [ ] Flag shows as "ON" in LaunchDarkly dashboard
- [ ] Planning-engine logs show flag evaluation
- [ ] Endpoint returns preview data (not `feature_not_available`)

## 48-Hour Staging Soak Plan

### Hour 0-2: Initial Deployment
**Tasks:**
- [ ] Deploy dashboard
- [ ] Enable feature flag
- [ ] Run basic functionality tests
- [ ] Verify telemetry events appear

**Success Criteria:**
- Dashboard shows initial metrics
- Preview endpoint responds correctly
- No 5xx errors in logs

### Hour 2-8: Load Testing
**Tasks:**
- [ ] Run concurrent request tests
- [ ] Test edge cases (min/max target minutes)
- [ ] Monitor performance metrics
- [ ] Validate compression strategies

**Success Criteria:**
- Response time < 2s average
- Success rate > 95%
- Error rate < 5%

### Hour 8-48: Extended Monitoring
**Tasks:**
- [ ] Continuous monitoring every 4 hours
- [ ] Integration testing with frontend
- [ ] User acceptance testing
- [ ] Performance optimization

**Success Criteria:**
- Stable metrics for 24+ hours
- No regressions in existing functionality
- QA sign-off on integration tests

## Monitoring Dashboard Guide

### Key Metrics to Watch

#### 1. Time Crunch Preview Requests
- **Target:** Steady request rate
- **Red Flag:** Zero requests (flag issue) or sudden drops

#### 2. Compression Strategy Distribution
- **Target:** Balanced distribution
- **Red Flag:** All requests using same strategy

#### 3. Time Constraint Success Rate
- **Target:** >80% success rate
- **Red Flag:** <70% success rate

#### 4. Preview Endpoint Response Time
- **Target:** <2s average, <5s 95th percentile
- **Red Flag:** >5s average

#### 5. Fallback Reasons
- **Target:** Minimal fallbacks
- **Red Flag:** High fallback rate or "internal_error" dominant

### Alert Thresholds
- **Error Rate:** >10% for 5 minutes
- **Response Time:** >5s for 5 minutes
- **Success Rate:** <90% for 10 minutes
- **Zero Requests:** 30 minutes (flag issue)

## Rollback Procedures

### Immediate Rollback (< 5 minutes)
```yaml
# In LaunchDarkly
feature.stream5_time_crunch_mode:
  targeting:
    - targeting: OFF
      values: false
  fallthrough:
    variation: false
```

### Verification Steps
- [ ] Confirm endpoint returns `feature_not_available`
- [ ] Monitor error rates return to baseline
- [ ] Check system performance returns to normal
- [ ] Document incident for post-mortem

## Success Criteria for Week 2 Beta Rollout

**Technical Metrics:**
- [ ] Success rate > 95% for 24+ hours
- [ ] Response time < 2s average
- [ ] Error rate < 5%
- [ ] No regressions in existing functionality

**Operational Metrics:**
- [ ] QA sign-off on integration tests
- [ ] Ops team confirms system stability
- [ ] Support team ready for user questions
- [ ] Documentation updated and reviewed

## Communication Plan

### Hourly Updates (First 8 hours)
- Send status to #stream5-staging channel
- Include key metrics screenshots
- Report any issues immediately

### Daily Summary (After 24 hours)
- Comprehensive metrics report
- Performance analysis
- Recommendation for beta rollout

### Final Report (After 48 hours)
- Complete validation results
- Go/no-go recommendation
- Beta rollout preparation status

## Next Steps After Successful Soak

### Week 2 Beta Rollout Preparation
- [ ] Prepare beta user list (10% of users)
- [ ] Set up beta user communication
- [ ] Prepare marketing assets
- [ ] Train support team on feature

### Beta Rollout Execution
- [ ] Enable flag for 10% of users
- [ ] Send beta user notifications
- [ ] Monitor user feedback
- [ ] Collect usage analytics

## Contacts

**Primary:** Stream5 Team  
**QA Lead:** [QA Team Contact]  
**Ops Lead:** [Operations Contact]  
**Escalation:** DevOps Lead

---

**Status:** Ready for deployment  
**Next Update:** After 24 hours of staging soak  
**Decision Point:** 48 hours - proceed to beta rollout or rollback

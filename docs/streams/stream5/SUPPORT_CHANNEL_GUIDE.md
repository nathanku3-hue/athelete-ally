# Stream5 Time Crunch Mode - Support Channel Guide

**Purpose:** Monitor and respond to contract regeneration issues and user questions  
**Duration:** Active during rollout period (4-5 weeks)  
**Escalation:** Stream5 team for technical issues

## Support Channel Setup

### Primary Channels
- **#stream5-support** - Main support channel for contract issues
- **#stream5-time-crunch** - Feature-specific questions and feedback
- **#dev-support** - Technical escalation channel

### Monitoring Schedule
- **Week 1:** 24/7 monitoring during staging validation
- **Week 2-3:** Business hours + evening coverage during beta rollout
- **Week 4-5:** Extended hours during major rollout phases

## Common Issues & Responses

### Contract Regeneration Issues

#### Issue: "Contract build fails after pulling latest main"
**Symptoms:**
- TypeScript compilation errors
- Missing `timeCrunchTargetMinutes` field
- Import errors from `@athlete-ally/contracts`

**Response Template:**
```
Hi! This is likely a contract regeneration issue. Please try:

1. Pull latest main: `git checkout main && git pull origin main`
2. Clean install: `rm -rf node_modules package-lock.json && npm install`
3. Rebuild contracts: `npm run build --workspace @athlete-ally/contracts`
4. Check types: `npm run type-check`

If still failing, please share the error message and I'll help debug.
```

#### Issue: "Service can't find timeCrunchTargetMinutes field"
**Symptoms:**
- Runtime errors about missing field
- Type errors in IDE
- Contract consumption failures

**Response Template:**
```
The `timeCrunchTargetMinutes` field was added to `PlanGenerationRequestedEvent`. 

Please verify:
1. You're importing from the built contracts: `@athlete-ally/contracts/dist`
2. Your service has regenerated contract bundles
3. You're using the latest version of the contracts package

If you need help with the regeneration process, let me know!
```

#### Issue: "Feature flag not working in local development"
**Symptoms:**
- Endpoint returns `feature_not_available`
- Feature flag evaluation fails
- Local testing blocked

**Response Template:**
```
For local development, you can bypass LaunchDarkly with an environment variable:

```bash
# Windows PowerShell
$env:FEATURE_STREAM5_TIME_CRUNCH_MODE="true"

# Linux/Mac
export FEATURE_STREAM5_TIME_CRUNCH_MODE="true"

# Then restart your planning-engine service
```

This will enable Time Crunch Mode locally without needing LaunchDarkly access.
```

### Feature Usage Issues

#### Issue: "Preview endpoint returns errors"
**Symptoms:**
- 422 errors with error codes
- 500 internal server errors
- Timeout errors

**Response Template:**
```
The preview endpoint has specific requirements:

1. **Authentication:** Valid user token required
2. **Plan ID:** Must be a valid plan owned by the user
3. **Target Minutes:** Must be between 15-180 minutes
4. **Feature Flag:** Must be enabled for your user segment

Please check:
- Your authentication token is valid
- The plan ID exists and belongs to the user
- Target minutes is within the valid range (15-180)

If still failing, please share the exact error response.
```

#### Issue: "Compression results don't look right"
**Symptoms:**
- Workouts seem too short/long
- Missing exercises
- Unrealistic compression ratios

**Response Template:**
```
Time Crunch Mode uses intelligent compression algorithms that:

1. **Preserve core exercises** (squats, deadlifts, etc.)
2. **Optimize accessory work** (supersets, blocks)
3. **Maintain workout balance** (push/pull ratios)

The compression strategy depends on:
- Original workout structure
- Available equipment
- Target time constraint

If results seem off, please share:
- Original workout duration
- Target time
- Compression strategy used
- Specific concerns

This helps us improve the algorithm!
```

## Escalation Procedures

### Level 1: Basic Support
**Handled by:** Support team, community moderators  
**Issues:** Documentation questions, basic troubleshooting, user guidance

### Level 2: Technical Issues
**Handled by:** Stream5 team, DevOps  
**Issues:** Contract regeneration failures, feature flag problems, API errors

### Level 3: Critical Issues
**Handled by:** Engineering leads, Product team  
**Issues:** Service outages, data corruption, security concerns

## Monitoring Tools

### Dashboard Monitoring
- **Grafana Dashboard:** Monitor preview endpoint metrics
- **Error Rate Alerts:** Set up alerts for error spikes
- **Response Time Monitoring:** Track performance degradation

### Support Metrics
- **Ticket Volume:** Track support request trends
- **Resolution Time:** Monitor response and fix times
- **User Satisfaction:** Collect feedback on support quality

### Communication Channels
- **Slack Alerts:** Real-time notifications for critical issues
- **Email Updates:** Daily summary of support activity
- **Status Page:** Public status updates for major issues

## Response Templates

### Acknowledgment Template
```
Thanks for reaching out about Time Crunch Mode! 

I'm looking into this issue and will get back to you within [timeframe]. 
In the meantime, here are some quick troubleshooting steps:

[Relevant troubleshooting steps]

I'll update you as soon as I have more information.
```

### Resolution Template
```
Great news! I've identified and resolved the issue:

**Problem:** [Brief description]
**Solution:** [What was fixed]
**Prevention:** [How we'll prevent this in the future]

The fix is now live. Please try again and let me know if you encounter any other issues!

Thanks for your patience and for helping us improve Time Crunch Mode.
```

### Escalation Template
```
I'm escalating this issue to our technical team because:

[Reason for escalation]

**Issue Details:**
- User: [User info]
- Error: [Error details]
- Steps to reproduce: [Steps]
- Expected vs Actual: [Comparison]

**Next Steps:**
- Technical team will investigate within 2 hours
- I'll provide updates every 4 hours
- Resolution expected within 24 hours

I'll keep you updated on the progress.
```

## Success Metrics

### Support Quality
- **Target:** <2 hour response time for critical issues
- **Target:** <24 hour resolution time for technical issues
- **Target:** >90% user satisfaction with support

### Issue Prevention
- **Target:** <5% of users need support during rollout
- **Target:** <1% contract regeneration failures
- **Target:** <2% feature usage issues

### Communication
- **Target:** Proactive updates for all users during incidents
- **Target:** Clear documentation reduces support volume
- **Target:** Community self-help reduces escalation needs

## Post-Rollout Support

### Week 6-8: Optimization
- Analyze support patterns and common issues
- Improve documentation based on user questions
- Optimize feature based on user feedback
- Prepare for next feature rollout

### Ongoing Support
- Maintain support channels for ongoing questions
- Regular documentation updates
- User education and training materials
- Feature enhancement based on support insights

---

**Next Steps:** Set up monitoring tools and prepare support team for staging validation period.

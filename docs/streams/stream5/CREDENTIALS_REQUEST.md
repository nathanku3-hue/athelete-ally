# Stream5 Time Crunch Mode - Credentials Request

**To:** DevOps Team, Platform Team  
**From:** Stream5 Development Team  
**Date:** 2025-10-21  
**Priority:** Normal  
**Blocking:** Phase 1 Staging Deployment

---

## Request Summary

Stream5 Time Crunch Mode implementation is complete and ready for staging deployment. We need the following credentials to proceed with Phase 1 deployment and 48-hour soak period.

---

## 1. Grafana API Key (Required)

**Service:** Grafana Cloud  
**Instance:** https://nkgss.grafana.net  
**Environment:** Staging  

**Required Permissions:**
- Dashboard: Create, Update, Read
- Folder: Read (or create in default folder)

**Usage:**
```powershell
$env:STAGING_GRAFANA_API_KEY="<key>"
.\scripts\deploy-stream5-dashboard.ps1 staging
```

**What Will Be Deployed:**
- Dashboard: "Stream5 - Time Crunch Mode Dashboard"
- Panels: 9 monitoring panels (requests, strategies, success rate, latency, fallbacks)
- File: `infrastructure/monitoring/grafana/dashboards/stream5-time-crunch-dashboard.json`

**Validation Command:**
```powershell
curl -H "Authorization: Bearer $KEY" https://nkgss.grafana.net/api/health
```

---

## 2. LaunchDarkly Staging Access (Required)

**Service:** LaunchDarkly  
**Environment:** Staging  
**Flag:** `feature.stream5_time_crunch_mode`

**Required Action:**
- Web UI access to LaunchDarkly staging environment
- Ability to toggle feature flags

**Configuration Needed:**
```yaml
feature.stream5_time_crunch_mode:
  targeting: ON
  fallthrough: true
  targeting_rules: []
```

**Alternative:** If web access not available, please enable flag on our behalf.

---

## 3. Local Development Override (Optional)

For local testing without LaunchDarkly:

```powershell
# Set this in local environment
$env:FEATURE_STREAM5_TIME_CRUNCH_MODE="true"

# Start planning-engine
cd services/planning-engine
npm run dev
```

This is **optional** and not blocking for staging deployment.

---

## Timeline

**Requested By:** As soon as possible  
**Deployment Window:** 30 minutes once credentials received  
**Soak Period:** 48 hours post-deployment  
**Week 2 Beta Target:** Pending successful soak

---

## What Happens After Credentials Received

1. **Immediate (5 minutes):**
   - Deploy Grafana dashboard
   - Enable LaunchDarkly flag
   - Run verification script

2. **First Hour:**
   - Monitor dashboard for first telemetry events
   - Verify endpoint behavior
   - Post status update in #stream5-staging

3. **Hours 1-8:**
   - Hourly monitoring and status updates
   - Integration testing
   - Performance validation

4. **48 Hours:**
   - Continuous monitoring
   - 4-hourly status reports
   - Week 2 beta rollout decision

---

## Rollback Plan

If issues arise:
1. Disable `feature.stream5_time_crunch_mode` in LaunchDarkly (< 5 min)
2. Endpoint returns 404 to all requests
3. Monitor error rates return to baseline
4. Dashboard remains for analysis

**No infrastructure changes needed for rollback.**

---

## Security Notes

- Grafana API key should have minimal required permissions (dashboard only)
- Key will be stored in local environment variable (not committed)
- LaunchDarkly access needed only for initial flag toggle
- No production credentials required at this stage

---

## Contact

**Stream5 Team Lead:** [Contact Info]  
**On-Call:** [If urgent deployment needed]  
**Slack Channel:** #stream5-staging

---

## Approval

- [x] Implementation complete (51cddb8)
- [x] Unit tests passing (9/9)
- [x] Infrastructure code reviewed
- [x] Deployment scripts tested
- [x] Monitoring plan approved
- [x] Rollback procedure documented

**Status:** ✅ Ready for credentials and deployment

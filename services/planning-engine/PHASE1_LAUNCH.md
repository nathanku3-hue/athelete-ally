# 🚀 Phase 1 Launch - Time Crunch Mode

## ✅ **APPROVED & READY TO DEPLOY**

**Date:** 2025-10-22  
**Approval:** Product Owner, Engineering Lead  
**Phase:** 1 of 4 (10% Rollout)  
**Status:** Ready for execution

---

## 📋 Pre-Launch Checklist

- [x] Local verification complete (100% success, 9/9 tests)
- [x] Product approval received
- [x] Engineering approval received
- [x] Documentation complete
- [x] Monitoring dashboard configured
- [x] LaunchDarkly flag created: `feature.stream5_time_crunch_mode`
- [x] Rollback plan established
- [x] Team notified
- [ ] **Production deployment executed**
- [ ] **LaunchDarkly flag enabled (10%)**

---

## 🚀 Deployment Steps

### Option A: Automated Deployment (Recommended)

```powershell
# Execute Phase 1 deployment script
.\scripts\deploy-phase1.ps1

# This will:
# 1. Verify pre-deployment checks
# 2. Commit changes
# 3. Push to remote
# 4. Provide deployment instructions
# 5. Guide LaunchDarkly flag configuration
```

### Option B: Manual Deployment

#### 1. Commit & Push Changes
```bash
git add src/routes/time-crunch.ts
git add src/routes/enhanced-plans.ts
git add src/routes/movement-curation.ts
git add src/server.ts
git add scripts/
git add *.md

git commit -m "feat(stream5): Time Crunch Mode - Production Launch Phase 1

- Implement time-crunch compression algorithm
- Add POST /api/v1/time-crunch/preview endpoint
- Honor Coach's Amendment (core lifts protected)
- 100% local verification success (9/9 tests)
- Feature flag: feature.stream5_time_crunch_mode
- Phase 1: 10% rollout

Approved by: Product Owner, Engineering Lead"

git push origin stream5/time-crunch-mode
```

#### 2. Create Pull Request (if using PR workflow)
- **From:** `stream5/time-crunch-mode`
- **To:** `main`
- **Title:** feat(stream5): Time Crunch Mode - Production Launch
- **Description:** Use `APPROVAL_REQUEST.md` content
- **Attachments:** 
  - `LOCAL_TIMECRUNCH_VERIFICATION.md`
  - `test-results-timecrunch-20251022-160139.json`

#### 3. Deploy to Production
Choose your deployment method:

**Method 1: CI/CD Pipeline**
```bash
# Merge PR → Auto-deploy
# Monitor: [Your CI/CD dashboard URL]
```

**Method 2: Kubernetes**
```bash
kubectl apply -f k8s/planning-engine-deployment.yaml
kubectl rollout status deployment/planning-engine
```

**Method 3: Custom Script**
```bash
./scripts/deploy-production.sh
```

#### 4. Verify Deployment
```bash
# Check service health
curl https://production-url/metrics | grep planning_engine

# Verify time-crunch endpoint exists (should return 404 with flag disabled)
curl -I https://production-url/api/v1/time-crunch/preview
```

---

## 🎯 LaunchDarkly Configuration

### Via Dashboard

1. Navigate to LaunchDarkly dashboard
2. Go to **Flags** → `feature.stream5_time_crunch_mode`
3. Select **production** environment
4. Configure targeting:
   - **Status:** ON
   - **Targeting:** Percentage rollout
   - **Percentage:** 10%
   - **Variation:** true (when targeted)
   - **Default:** false (when not targeted)
5. **Save changes**

### Via CLI (if available)

```bash
ldcli flag update feature.stream5_time_crunch_mode \
  --environment production \
  --enabled true \
  --rollout-percentage 10
```

### Via API (if needed)

```bash
curl -X PATCH \
  https://app.launchdarkly.com/api/v2/flags/default/feature.stream5_time_crunch_mode \
  -H "Authorization: ${LD_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "environmentKey": "production",
    "instructions": [
      {"kind": "turnFlagOn"},
      {"kind": "updatePercentageRollout", "rolloutPercentage": 10}
    ]
  }'
```

---

## 🔍 Initial Verification

### Test First Request

```bash
# Get production JWT token (replace with actual production token)
export PROD_TOKEN="<production-jwt-token>"
export PROD_PLAN_ID="<production-plan-id>"

# Make first time-crunch request
curl -X POST https://production-url/api/v1/time-crunch/preview \
  -H "Authorization: Bearer $PROD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId":"'$PROD_PLAN_ID'","targetMinutes":30}' | jq
```

**Expected Response:**
```json
{
  "planId": "...",
  "targetMinutes": 30,
  "compressedDurationSeconds": 1581,
  "meetsTimeConstraint": true,
  "sessions": [...]
}
```

### Monitor Metrics

```bash
# Watch metrics in real-time
watch -n 30 'curl -s https://production-url/metrics | grep time_crunch'

# Key metrics:
# - planning_engine_time_crunch_requests_total
# - planning_engine_time_crunch_duration_seconds
# - planning_engine_time_crunch_errors_total
```

---

## 📊 Phase 1 Monitoring (First 4 Hours)

### Critical Metrics

| Metric | Target | Rollback Trigger |
|--------|--------|------------------|
| Success Rate | >95% | <90% |
| Response Time (p95) | <5s | >10s |
| Error Rate | <1% | >5% |
| CPU Usage | <70% | >90% |
| Memory Usage | <80% | >95% |

### Monitoring Checklist

**Hour 1:**
- [ ] First request successful
- [ ] No critical errors in logs
- [ ] Metrics dashboard showing data
- [ ] Success rate tracking

**Hour 2:**
- [ ] Success rate >95%
- [ ] Response times healthy
- [ ] No user complaints
- [ ] Error rate <1%

**Hour 3:**
- [ ] Consistent performance
- [ ] No memory leaks
- [ ] Database queries optimized
- [ ] Cache hit rate good

**Hour 4:**
- [ ] All metrics green
- [ ] No incidents
- [ ] User feedback positive
- [ ] **Ready for Phase 2 (25%)**

### Prometheus Queries

```promql
# Success rate (last 5 minutes)
rate(planning_engine_time_crunch_requests_total{status="success"}[5m])
/ 
rate(planning_engine_time_crunch_requests_total[5m])

# p95 response time
histogram_quantile(0.95, 
  rate(planning_engine_time_crunch_duration_seconds_bucket[5m])
)

# Error rate
rate(planning_engine_time_crunch_errors_total[5m])

# Active users
count(count by (user_id) (planning_engine_time_crunch_requests_total))
```

---

## 🚨 Rollback Procedure

### When to Rollback

**Immediate rollback if:**
- Success rate drops below 90%
- Error rate exceeds 5%
- Critical errors detected
- Service crashes/restarts
- Database connection issues
- User complaints about feature

### Rollback Steps

**1. Disable LaunchDarkly Flag (INSTANT)**
```bash
# Via CLI
ldcli flag update feature.stream5_time_crunch_mode \
  --environment production \
  --enabled false

# Via Dashboard
# LaunchDarkly → feature.stream5_time_crunch_mode → Toggle OFF
```

**2. Verify Rollback**
```bash
# Endpoint should return 404
curl -I https://production-url/api/v1/time-crunch/preview
# Expected: HTTP 404 - feature_not_available
```

**3. Investigate**
- Review error logs
- Check metrics dashboard
- Identify root cause
- Create fix

**4. Re-deploy & Retry**
- Deploy fix
- Re-enable flag at 10%
- Monitor closely

---

## ✅ Phase 1 Success Criteria

**Proceed to Phase 2 (25%) if:**
- ✅ 4+ hours of stable operation
- ✅ Success rate consistently >95%
- ✅ Response times <5s (p95)
- ✅ Error rate <1%
- ✅ No critical issues
- ✅ User feedback positive/neutral
- ✅ Coach's Amendment working correctly

**Timeline:**
- **Hour 0-4:** Phase 1 monitoring (10%)
- **Hour 4-6:** Decision to scale to Phase 2
- **Hour 6+:** Phase 2 begins (25%)

---

## 📞 Contact & Escalation

### On-Call Team
- **Technical Lead:** [Your Name]
- **Product Owner:** [Product Contact]
- **Platform/Ops:** [Ops Contact]

### Communication Channels
- **Slack:** #stream5-timecrunch
- **Incidents:** #production-incidents
- **Dashboard:** [Monitoring URL]

### Escalation Path
1. **Minor issues:** Document in #stream5-timecrunch
2. **Performance degradation:** Alert tech lead
3. **Critical errors:** Page on-call + disable flag
4. **Service down:** Incident response + disable flag

---

## 📝 Status Updates

### Template for Hourly Updates

```
Phase 1 Status Update - Hour X

✅ Metrics:
- Success Rate: XX%
- Response Time (p95): XXs
- Error Rate: XX%
- Active Users: XX

📊 Observations:
- [Note any issues or patterns]

🎯 Next Actions:
- [Continue monitoring / Scale to Phase 2 / Investigate issue]
```

---

## 🎉 Launch Day Checklist

**Before Deployment:**
- [ ] Run `.\scripts\deploy-phase1.ps1 -DryRun`
- [ ] Verify all tests passing
- [ ] Confirm approvals received
- [ ] Alert team of deployment

**During Deployment:**
- [ ] Execute deployment script
- [ ] Push code to production
- [ ] Enable LaunchDarkly flag (10%)
- [ ] Verify first request

**After Deployment:**
- [ ] Monitor for 1 hour intensively
- [ ] Check metrics dashboard
- [ ] Review logs for errors
- [ ] Document any issues

**Hour 4 Decision:**
- [ ] Review all metrics
- [ ] Check success criteria
- [ ] Decide: Scale to 25% or investigate

---

**Status:** Ready to launch Phase 1 (10% rollout)  
**Risk:** LOW (Feature flag protected, instant rollback)  
**Confidence:** HIGH (100% local test success)  

**LET'S SHIP IT! 🚀**

# 🚀 RAILWAY DEPLOYMENT CHECKLIST

## Status: Ready for Execution
**Date:** 2025-10-23  
**Feature:** Time Crunch Mode (Stream 5)  
**Target:** Production (Phase 1 - 10% rollout)

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Code Verification (COMPLETED)
- [x] Time Crunch code on main branch (commit: afdebae)
- [x] TypeScript build successful
- [x] Unit tests passing (3/3 time-crunch tests)
- [x] Railway workflow exists (.github/workflows/railway-deploy.yml)

### Railway Account Setup (TODO - YOU)
- [ ] 1. Create account at https://railway.app/
- [ ] 2. Create project: "athlete-ally-production"
- [ ] 3. Get Railway token (Settings → Tokens)
- [ ] 4. Add RAILWAY_TOKEN to GitHub Secrets

### Railway Infrastructure Setup (TODO - YOU)
- [ ] 5. Create service: "planning-engine"
- [ ] 6. Add PostgreSQL database
- [ ] 7. Add Redis database
- [ ] 8. Add NATS service

### Environment Variables in Railway (TODO - YOU)

Copy this to Railway dashboard → planning-engine service → Variables:

```bash
# === REQUIRED SECRETS ===
OPENAI_API_KEY=sk-proj-[YOUR-KEY-FROM-OPENAI]
JWT_SECRET=XqFpbSqgR8m8mNte1u+gRj0Jo9l4VucIXVTxbY1UGngfqNPkhui/e94YBHHKN0+0xpNv/f6oS0UkuVJz5lRsXw==
LAUNCHDARKLY_SDK_KEY=api-375bb749-5688-4691-a002-59d3d854984b

# === DATABASE CONNECTIONS (Railway auto-fills) ===
PLANNING_DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
NATS_URL=${{NATS.NATS_URL}}

# === FEATURE FLAGS ===
EVENT_STREAM_MODE=single
FEATURE_SERVICE_MANAGES_STREAMS=false
FEATURE_SERVICE_MANAGES_CONSUMERS=false

# === ENVIRONMENT ===
NODE_ENV=production
PORT=8080
```

---

## 🚀 DEPLOYMENT STEPS

### Method 1: Automatic via GitHub Actions (Recommended)

**Once all prerequisites are complete:**

1. **Push to main branch** (Time Crunch code already there)
```bash
cd E:\vibe\athlete-ally-original
git checkout main
git pull origin main
git push origin main
```

2. **Monitor GitHub Actions**
   - Go to: https://github.com/nathanku3-hue/athelete-ally/actions
   - Watch "Railway Production Deploy" workflow
   - Should complete in ~5 minutes

3. **Get Production URL**
   - Railway dashboard → planning-engine service
   - Copy the public URL (e.g., `https://planning-engine-production.up.railway.app`)

---

### Method 2: Manual via Railway Dashboard (Fallback)

If GitHub Actions fails:

1. Railway dashboard → planning-engine service
2. Settings → Connect Repo
3. Select: `nathanku3-hue/athelete-ally`
4. Root directory: `/services/planning-engine`
5. Click "Deploy"

---

## 🏥 VERIFICATION STEPS

### Step 1: Health Check
```bash
$PROD_URL = "https://[YOUR-RAILWAY-URL]"
curl "$PROD_URL/health"
```
**Expected:** `{"status":"healthy",...}`

### Step 2: Time Crunch Endpoint Exists
```bash
curl -X POST "$PROD_URL/api/v1/time-crunch/preview" `
  -H "Content-Type: application/json" `
  -d '{"planId":"test","targetMinutes":30}'
```
**Expected:** 401 Unauthorized (endpoint exists, needs auth)

### Step 3: Metrics Available
```bash
curl "$PROD_URL/metrics"
```
**Expected:** Prometheus metrics output

---

## 🎯 LAUNCHDARKLY FEATURE FLAG SETUP

**After deployment is verified:**

1. Go to: https://app.launchdarkly.com/
2. Find flag: `feature.stream5_time_crunch_mode`
3. Switch to **Production** environment
4. Enable at **10% rollout**:
   - Toggle: ON
   - Targeting: Random 10% of users
   - Save changes

---

## 📊 MONITORING (4 HOURS)

Run every 30 minutes:

```bash
$PROD_URL = "https://[YOUR-RAILWAY-URL]"

# Check metrics
curl "$PROD_URL/metrics" | Select-String "time_crunch"

# Expected metrics:
# time_crunch_requests_total{status="success"} > 0
# time_crunch_duration_seconds{quantile="0.95"} < 5.0
```

### Success Criteria
- ✅ API success rate > 95%
- ✅ Response time p95 < 5 seconds
- ✅ Error rate < 1%
- ✅ No critical errors in Railway logs

### Rollback Trigger
- ❌ Success rate < 90%
- ❌ Error rate > 2%
- ❌ Response time p95 > 7 seconds

**Rollback Method:** LaunchDarkly dashboard → Toggle flag OFF

---

## 📝 TROUBLESHOOTING

### Deployment Fails
1. Check Railway logs: Dashboard → planning-engine → Logs
2. Check GitHub Actions logs
3. Verify all environment variables set
4. Verify databases are running

### Health Check Fails
1. Check service is running: Railway dashboard
2. Check logs for startup errors
3. Verify DATABASE_URL is correct
4. Verify port binding (should be 8080)

### Time Crunch Endpoint 404
1. Verify code deployed: Check GitHub Actions success
2. Check Railway deployment status
3. Verify route registration in logs

---

## 🎉 SUCCESS CRITERIA

Deployment is successful when:
- [x] Railway project created
- [x] All services running (PostgreSQL, Redis, NATS, planning-engine)
- [x] Health check returns 200
- [x] Time Crunch endpoint exists
- [x] LaunchDarkly flag enabled at 10%
- [x] First successful Time Crunch request logged
- [x] 4 hours monitoring with green metrics

---

## 📞 SUPPORT RESOURCES

**Railway Documentation:** https://docs.railway.app/  
**LaunchDarkly Docs:** https://docs.launchdarkly.com/  
**Time Crunch Implementation:** `services/planning-engine/src/time-crunch/`  
**Infrastructure Docs:** `infrastructure/DEPLOYMENT_GUIDE.md`

---

## 🔐 SECURITY NOTES

- ❌ Never commit RAILWAY_TOKEN to git
- ❌ Never commit OPENAI_API_KEY to git
- ❌ Never log JWT_SECRET
- ✅ Use GitHub Secrets for tokens
- ✅ Use Railway environment variables for secrets
- ✅ Rotate secrets every 90 days (see infrastructure/PRODUCTION_SECRETS.md)

---

## 📋 DEPLOYMENT LOG

Fill this out as you complete each step:

```
=== DEPLOYMENT RECORD ===
Date: _______________
Engineer: _______________

Railway Setup:
[ ] Account created at: _______________
[ ] Project created at: _______________
[ ] Token added to GitHub at: _______________
[ ] Databases provisioned at: _______________
[ ] Environment variables configured at: _______________

Deployment:
[ ] GitHub Actions triggered at: _______________
[ ] Deployment completed at: _______________
[ ] Production URL: _______________
[ ] Health check passed at: _______________

Feature Flag:
[ ] Flag enabled at: _______________
[ ] Initial percentage: 10%
[ ] First request logged at: _______________

Monitoring:
[ ] Hour 1 (_______________): Success _____%, Response time _____s
[ ] Hour 2 (_______________): Success _____%, Response time _____s
[ ] Hour 3 (_______________): Success _____%, Response time _____s
[ ] Hour 4 (_______________): Success _____%, Response time _____s

Outcome:
[ ] SUCCESS / ROLLBACK
[ ] Issues: _______________
[ ] Next steps: _______________

Sign-off: _______________
```

---

## 🚀 QUICK START (TL;DR)

1. Create Railway account → Create project "athlete-ally-production"
2. Add databases: PostgreSQL + Redis + NATS
3. Set environment variables in Railway dashboard (copy from above)
4. Add RAILWAY_TOKEN to GitHub Secrets
5. Push to main → Watch GitHub Actions deploy
6. Verify: curl https://[railway-url]/health
7. Enable LaunchDarkly flag at 10%
8. Monitor for 4 hours

**Estimated time:** 1-2 hours setup + 4 hours monitoring = 6 hours total

---

**Good luck! 🎉**

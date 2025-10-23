# 🎯 DEPLOYMENT QUICK REFERENCE CARD

**Print this and keep it handy during deployment**

---

## 🔗 ESSENTIAL URLS

| Resource | URL |
|----------|-----|
| **Railway Dashboard** | https://railway.app/ |
| **GitHub Repo** | https://github.com/nathanku3-hue/athelete-ally |
| **GitHub Actions** | https://github.com/nathanku3-hue/athelete-ally/actions |
| **GitHub Secrets** | https://github.com/nathanku3-hue/athelete-ally/settings/secrets/actions |
| **LaunchDarkly** | https://app.launchdarkly.com/ |
| **OpenAI API Keys** | https://platform.openai.com/api-keys |

---

## 🔑 SECRETS NEEDED

```bash
# Get from OpenAI dashboard (create new key)
OPENAI_API_KEY=sk-proj-[YOUR-KEY]

# Already generated for you
JWT_SECRET=XqFpbSqgR8m8mNte1u+gRj0Jo9l4VucIXVTxbY1UGngfqNPkhui/e94YBHHKN0+0xpNv/f6oS0UkuVJz5lRsXw==

# Already provided in handoff doc
LAUNCHDARKLY_SDK_KEY=api-375bb749-5688-4691-a002-59d3d854984b

# Railway will auto-generate these
PLANNING_DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
NATS_URL=${{NATS.NATS_URL}}
```

---

## 📋 RAILWAY SETUP STEPS

### 1. Create Account & Project
```
1. Go to https://railway.app/
2. Sign up with GitHub (nathanku3-hue account)
3. Click "New Project"
4. Name: athlete-ally-production
```

### 2. Add Databases
```
Click "+ New" three times:
1. Database → PostgreSQL
2. Database → Redis  
3. Template → Search "NATS" → Deploy
```

### 3. Create Service
```
1. Click "+ New" → Empty Service
2. Name: planning-engine
3. Settings → Generate Domain (get public URL)
```

### 4. Connect GitHub
```
1. planning-engine service → Settings
2. Connect Repo: nathanku3-hue/athelete-ally
3. Root Directory: /services/planning-engine
4. Deploy Branch: main
```

### 5. Set Environment Variables
```
planning-engine → Variables → Add all secrets from above
```

### 6. Get Railway Token
```
1. Account Settings → Tokens
2. Create Token (full access)
3. Copy token
4. Add to GitHub: Repository Secrets → RAILWAY_TOKEN
```

---

## ✅ VERIFICATION COMMANDS

```powershell
# Replace with your Railway URL
$PROD_URL = "https://planning-engine-production.up.railway.app"

# Health check
curl "$PROD_URL/health"
# Expected: {"status":"healthy"}

# Time Crunch endpoint exists
curl -X POST "$PROD_URL/api/v1/time-crunch/preview" `
  -H "Content-Type: application/json" `
  -d '{"planId":"test","targetMinutes":30}'
# Expected: 401 or 400 (endpoint exists)

# Metrics
curl "$PROD_URL/metrics" | Select-String "time_crunch"
# Expected: Prometheus metrics
```

---

## 🚨 ROLLBACK PROCEDURE

**If anything goes wrong:**

### Immediate Rollback (Feature Flag)
```
1. Go to https://app.launchdarkly.com/
2. Find: feature.stream5_time_crunch_mode
3. Toggle: OFF
4. Save
⏱️ Takes effect in < 30 seconds
```

### Service Rollback (Railway)
```
1. Railway dashboard → planning-engine
2. Deployments tab
3. Click "..." on previous deployment
4. Click "Redeploy"
⏱️ Takes ~2 minutes
```

---

## 📊 SUCCESS METRICS

Monitor these every 30 minutes for 4 hours:

| Metric | Target | Rollback Trigger |
|--------|--------|------------------|
| **Success Rate** | > 95% | < 90% |
| **Response Time (p95)** | < 5s | > 7s |
| **Error Rate** | < 1% | > 2% |
| **Critical Errors** | 0 | Any |

---

## 🐛 COMMON ISSUES

### Issue: Deployment fails with "Cannot find module"
**Fix:** Verify workspace dependencies built first
```bash
npm run build -w @athlete-ally/shared
npm run build -w @athlete-ally/shared-types
npm run build -w @athlete-ally/database-utils
npm run build -w @athlete-ally/logger
```

### Issue: Health check returns 502/503
**Fix:** Check Railway logs for startup errors
```
Railway dashboard → planning-engine → Logs
Look for: Database connection errors, missing env vars
```

### Issue: Time Crunch endpoint returns 404
**Fix:** Verify route registration
```
Check logs for: "Registered route: POST /api/v1/time-crunch/preview"
```

### Issue: Database connection error
**Fix:** Verify DATABASE_URL format
```bash
# Should start with postgresql:// or postgres://
PLANNING_DATABASE_URL=postgresql://username:password@host:port/database
```

---

## 📞 EMERGENCY CONTACTS

**Railway Support:** https://railway.app/help  
**LaunchDarkly Support:** https://support.launchdarkly.com/  
**Code Issues:** Check `services/planning-engine/src/time-crunch/`  

---

## ⏱️ TIMELINE

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Railway account setup | 15 min | 15 min |
| Database provisioning | 15 min | 30 min |
| Environment config | 15 min | 45 min |
| GitHub token setup | 5 min | 50 min |
| Deploy via GitHub Actions | 5 min | 55 min |
| Verification | 15 min | 70 min |
| Feature flag enable | 5 min | 75 min |
| **Total Setup** | **~1.5 hours** | **1.5 hours** |
| Monitoring (4 hours) | 4 hours | **5.5 hours** |

---

## ✅ FINAL CHECKLIST

Before going live:
- [ ] Railway project created
- [ ] All 3 databases running (Postgres, Redis, NATS)
- [ ] planning-engine service deployed
- [ ] Health check returns 200
- [ ] Metrics endpoint working
- [ ] Time Crunch endpoint exists
- [ ] LaunchDarkly flag ready (not enabled yet)
- [ ] OpenAI API key valid
- [ ] Monitoring dashboard ready

After 4 hours of successful monitoring:
- [ ] Scale to 25% (Phase 2)
- [ ] Document any issues
- [ ] Plan Phase 3 (50%)

---

**🎉 You've got this!**

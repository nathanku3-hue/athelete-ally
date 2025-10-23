# Railway Deployment Guide - Start Now

**Status:** ✅ PR #104 merged to main (commit `7ade87c`)  
**Branch to Deploy:** `main`  
**Service:** planning-engine  
**Time:** ~30-45 minutes

---

## 🎯 Quick Start (5 Steps)

1. **Create Railway Account** → https://railway.app/
2. **Connect GitHub** → Authorize repository access
3. **Create Project** → Deploy from GitHub
4. **Add Databases** → PostgreSQL + Redis
5. **Set Environment Variables** → Copy from guide below

---

## 📋 Step-by-Step Instructions

### Step 1: Railway Account Setup (5 min)

**Go to:** https://railway.app/

**Actions:**
1. Click "Start a New Project" or "Sign up with GitHub"
2. Authorize Railway to access `nathanku3-hue/athelete-ally`
3. Confirm email if needed

**Result:** ✅ Railway dashboard ready

---

### Step 2: Create New Project (10 min)

**In Railway Dashboard:**

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose: `nathanku3-hue/athelete-ally`
4. **IMPORTANT:** Select branch **`main`** (not feature branch)

**Service Configuration:**

```yaml
Service Name: planning-engine-production
Root Directory: /services/planning-engine
Build Command: npm run build
Start Command: npm start
Port: 4102 (or leave blank for Railway auto-detect)
```

**How to Set:**
- Click on your deployed service
- Go to "Settings" tab
- Update "Root Directory" → `/services/planning-engine`
- Update "Custom Start Command" → `npm start`
- Update "Custom Build Command" → `npm run build`

**Result:** ✅ Service created (will fail first deploy - that's normal, need DB next)

---

### Step 3: Add Databases (10 min)

#### PostgreSQL

**In Railway Project:**
1. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway auto-creates database
3. Railway auto-creates `DATABASE_URL` variable
4. **IMPORTANT:** Rename variable to `PLANNING_DATABASE_URL`

**How to Rename:**
1. Click on PostgreSQL service
2. Go to "Variables" tab
3. Find `DATABASE_URL`
4. Click edit → Rename to `PLANNING_DATABASE_URL`
5. Save

#### Redis

**In Railway Project:**
1. Click **"New"** → **"Database"** → **"Add Redis"**
2. Railway auto-creates Redis instance
3. Railway auto-creates `REDIS_URL` variable (keep this name)

**Result:** ✅ Two databases running

---

### Step 4: Environment Variables (10 min)

**In planning-engine service, go to Variables tab:**

#### Required Variables

```bash
# Database (auto-created, just verify name)
PLANNING_DATABASE_URL=postgresql://...

# Redis (auto-created)
REDIS_URL=redis://...

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-...

# JWT Secret (generate new one)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# LaunchDarkly (if you have it)
LAUNCHDARKLY_SDK_KEY=sdk-...
```

#### Optional Variables (for MVP, can skip NATS)

```bash
# If NATS not ready, skip event processing
FEATURE_DISABLE_EVENTS=true

# Or provide NATS URL if you have it
NATS_URL=nats://your-nats-server:4223

# Node Environment
NODE_ENV=production

# Port (Railway usually auto-detects)
PORT=4102
```

#### How to Generate JWT_SECRET

**Option 1: Use PowerShell**
```powershell
# Generate secure random string
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Option 2: Use Node**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Use Online (less secure)**
- https://randomkeygen.com/ → "CodeIgniter Encryption Keys"

#### Environment Variables Checklist

- [ ] `PLANNING_DATABASE_URL` - From Railway PostgreSQL
- [ ] `REDIS_URL` - From Railway Redis
- [ ] `OPENAI_API_KEY` - From OpenAI dashboard
- [ ] `JWT_SECRET` - Generated above
- [ ] `LAUNCHDARKLY_SDK_KEY` - From LaunchDarkly (optional)
- [ ] `FEATURE_DISABLE_EVENTS` - Set to `true` if no NATS

**Result:** ✅ All required variables set

---

### Step 5: Deploy & Verify (10 min)

#### Trigger Deployment

**In Railway:**
1. Go to planning-engine service
2. Click "Deployments" tab
3. Railway should auto-deploy after variables are set
4. If not, click "Deploy" → "Redeploy"

**Watch Build Logs:**
- Click on deployment in progress
- Monitor logs for errors
- Look for: "planning-engine listening on :4102"

**Expected Timeline:**
- Building: ~5 minutes
- Deploying: ~2 minutes
- Total: ~7 minutes

#### Get Your URL

**Railway gives you a URL:**
- Format: `https://planning-engine-production.up.railway.app`
- Find it: Click service → "Settings" → "Domains"
- Or: Railway shows it in deployment logs

#### Verify Deployment

**Option 1: Use Browser**
```
Open: https://your-railway-url.up.railway.app/health
Expected: JSON response with "status": "healthy"
```

**Option 2: Use PowerShell**
```powershell
# Set your Railway URL
$url = "https://your-railway-url.up.railway.app"

# Test health endpoint
Invoke-RestMethod -Uri "$url/health"

# Test metrics endpoint
Invoke-RestMethod -Uri "$url/metrics"
```

**Option 3: Use verify-deployment.ps1**
```powershell
# Update the script with your Railway URL (remove https://)
.\verify-deployment.ps1 -ProductionUrl "your-railway-url.up.railway.app"
```

#### Verification Checklist

- [ ] Service shows "Active" status in Railway
- [ ] Logs show "planning-engine listening on :4102"
- [ ] No errors in logs
- [ ] `/health` returns 200 with JSON
- [ ] `/metrics` returns 200 with Prometheus metrics
- [ ] `/api/v1/time-crunch/preview` returns 401 or 404 (auth required)

**Result:** ✅ Deployment successful!

---

## 🚨 Troubleshooting

### Build Fails

**Error:** "Cannot find module"
```bash
Solution: Check Root Directory is set to /services/planning-engine
```

**Error:** "npm ci failed"
```bash
Solution: Should not happen (we fixed this!), but if it does:
- Check Railway is using Node 20.x
- Verify package-lock.json is in git
```

### Service Crashes on Start

**Error:** "Cannot connect to database"
```bash
Solution:
1. Verify PLANNING_DATABASE_URL is set
2. Check PostgreSQL service is running
3. Restart planning-engine service
```

**Error:** "Redis connection failed"
```bash
Solution:
1. Verify REDIS_URL is set
2. Check Redis service is running
3. Restart planning-engine service
```

**Error:** "NATS connection failed" (if not using FEATURE_DISABLE_EVENTS)
```bash
Solution:
1. Set FEATURE_DISABLE_EVENTS=true to skip NATS
2. Or deploy NATS separately
```

### Health Check Fails

**Error:** 404 on /health
```bash
This would mean our PR didn't work, but it did!
Double-check you deployed from main branch (commit 7ade87c)
```

**Error:** 503 on /health
```bash
Service is running but unhealthy
Check Railway logs for which dependency is failing:
- Database connection
- Redis connection
- NATS connection (if enabled)
```

### Environment Variable Issues

**Missing OPENAI_API_KEY**
```bash
Health check will show LLM as "degraded" (not critical)
Get key from: https://platform.openai.com/api-keys
```

**Missing JWT_SECRET**
```bash
Generate one with the command in Step 4
```

---

## 📊 Post-Deployment Checks

### Immediate (First 10 minutes)

**Monitor Railway Logs:**
```bash
Look for:
✅ "planning-engine listening on :4102"
✅ "connected to planning_db"
✅ "connected to redis"
✅ "Routes registered: enhanced-plans, movement-curation, time-crunch, api-docs"
✅ "health check routes registered"

Watch for:
❌ Connection errors
❌ Unhandled exceptions
❌ Memory issues
```

**Test All Endpoints:**
```powershell
$url = "https://your-railway-url.up.railway.app"

# Health endpoints
Invoke-RestMethod "$url/health"
Invoke-RestMethod "$url/health/ready"
Invoke-RestMethod "$url/health/live"

# Metrics
Invoke-RestMethod "$url/metrics"

# Time Crunch (should be 401 unauthorized or feature flag response)
Invoke-RestMethod "$url/api/v1/time-crunch/preview" -ErrorAction SilentlyContinue
```

### First Hour

**Monitor Metrics:**
- CPU usage (should be low, <20%)
- Memory usage (should be stable, <512MB)
- Response times (should be <500ms)
- Error rates (should be 0%)

**Check Health Dashboard:**
- Database: healthy
- Redis: healthy
- NATS: healthy (if enabled) or n/a
- Memory: <70%
- Disk: <70%

### First 24 Hours

**Watch for:**
- Memory leaks (gradual increase)
- Database connection pool exhaustion
- Redis connection issues
- Unexpected errors in logs

**Action if issues:**
- Check Railway logs
- Review health endpoint
- Restart service if needed
- Rollback if critical

---

## ✅ Success Criteria

### Deployment Successful When:

1. ✅ Railway shows "Active" status
2. ✅ `/health` returns 200 with all checks healthy
3. ✅ `/metrics` returns Prometheus metrics
4. ✅ Logs show no errors for 30 minutes
5. ✅ Service responds within 500ms
6. ✅ Database and Redis connections stable

---

## 🎯 Next Steps After Deployment

### 1. Update Configuration (Optional)
```bash
# Add custom domain if desired
Railway → Settings → Domains → Add Custom Domain

# Set up monitoring alerts
Railway → Settings → Webhooks → Add webhook for deployment failures
```

### 2. Document Your URLs
```bash
Production URL: https://your-railway-url.up.railway.app
Health Check: https://your-railway-url.up.railway.app/health
Metrics: https://your-railway-url.up.railway.app/metrics
```

### 3. Enable LaunchDarkly Flag (After Verification)
```bash
# Wait until deployment is stable (30-60 minutes)
# Then enable feature.stream5_time_crunch_mode at 10%
# Monitor according to PHASE1_GUARDRAILS_IMPLEMENTATION_PLAN.md
```

### 4. Share with Team
```markdown
🎉 Planning Engine deployed!

Production URL: [your URL]
Health Check: [your URL]/health
Metrics: [your URL]/metrics

Status: ✅ All checks passing
Next: Starting 10% Time Crunch rollout
```

---

## 🔗 Quick Links

- **Railway Dashboard:** https://railway.app/
- **OpenAI API Keys:** https://platform.openai.com/api-keys
- **LaunchDarkly:** Your dashboard URL
- **GitHub Repo:** https://github.com/nathanku3-hue/athelete-ally

---

## 📞 Need Help?

**During deployment:**
- Check Railway logs first
- Verify all environment variables
- Test with verify-deployment.ps1

**After deployment:**
- Monitor Railway dashboard
- Check health endpoint regularly
- Watch logs for errors

**Issues?** Let me know and I'll help debug!

---

**Start Deployment:** https://railway.app/ → New Project → Deploy from GitHub

**Good luck! 🚀**

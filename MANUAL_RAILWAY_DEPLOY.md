# 🚀 Manual Railway Deployment

Since GitHub has branch protection rules, we'll deploy directly via Railway.

## ✅ What's Already Done

- ✅ Railway project created: "athlete-ally-production"
- ✅ Databases added: PostgreSQL, Redis, NATS
- ✅ Environment variables configured
- ✅ Railway token set in GitHub Secrets
- ✅ Time Crunch code on main branch (commit: afdebae)

## 🎯 DEPLOYMENT OPTIONS

### Option 1: Railway Dashboard (Easiest - 5 minutes)

1. **Go to Railway dashboard:**
   ```
   https://railway.app/
   ```

2. **Navigate to your project:**
   - Click on "athlete-ally-production" project
   - Select "planning-engine" service

3. **Connect GitHub Repository:**
   - Click "Settings" tab
   - Scroll to "Service Source"
   - Click "Connect Repo"
   - Select: `nathanku3-hue/athelete-ally`
   - Root Directory: `/services/planning-engine`
   - Branch: `main`
   - Click "Connect"

4. **Deploy:**
   - Railway will automatically detect changes and deploy
   - Or click "Deploy" button manually
   - Watch deployment logs in real-time

5. **Get Production URL:**
   - Go to "Settings" tab
   - Under "Networking" → Click "Generate Domain"
   - Copy the URL (e.g., `https://planning-engine-production.up.railway.app`)

---

### Option 2: Railway CLI (Alternative)

If you managed to install Railway CLI:

```powershell
# Login
railway login

# Link to your project
railway link

# Select:
# - Project: athlete-ally-production
# - Environment: production
# - Service: planning-engine

# Deploy
railway up

# Get URL
railway domain
```

---

### Option 3: Create PR (GitHub Actions)

If you want to use GitHub Actions workflow:

```powershell
# Switch back to infrastructure branch
git checkout infrastructure/production-setup-plan

# Create a new branch for PR
git checkout -b deploy/railway-production

# Push to GitHub
git push origin deploy/railway-production

# Create PR at:
# https://github.com/nathanku3-hue/athelete-ally/compare
```

Then the Railway workflow will run on merge.

---

## 🏥 VERIFICATION AFTER DEPLOYMENT

Once deployed, get your production URL and test:

```powershell
# Replace with your actual Railway URL
$PROD_URL = "https://planning-engine-production.up.railway.app"

# Health check
curl "$PROD_URL/health"
# Expected: {"status":"healthy"}

# Time Crunch endpoint
curl -X POST "$PROD_URL/api/v1/time-crunch/preview" `
  -H "Content-Type: application/json" `
  -d '{"planId":"test","targetMinutes":30}'
# Expected: 401 or 400 (endpoint exists)

# Metrics
curl "$PROD_URL/metrics"
# Expected: Prometheus metrics
```

---

## 🎯 RECOMMENDED: Option 1 (Railway Dashboard)

**Go to Railway dashboard now:**
1. https://railway.app/
2. Find "athlete-ally-production" project
3. Click "planning-engine" service
4. Settings → Connect Repo → Select `nathanku3-hue/athelete-ally`
5. Root: `/services/planning-engine`, Branch: `main`
6. Click "Deploy"

**This is the fastest and most reliable method.**

---

## 📝 WHAT TO DO NEXT

Once deployment completes:

1. **Save the production URL**
2. **Run verification commands** (see above)
3. **If healthy, proceed to LaunchDarkly** to enable feature flag
4. **Start monitoring** using the monitoring script

---

## 🆘 TROUBLESHOOTING

### Deployment fails with "Cannot find module"
- Check build logs in Railway dashboard
- Verify workspace build order
- Check environment variables are set

### Service won't start
- Check Railway logs for errors
- Verify DATABASE_URL format
- Check all required env vars are present

### Can't connect to database
- Verify database is running (Railway dashboard)
- Check DATABASE_URL uses Railway's internal connection
- Format: `postgresql://postgres:password@postgres.railway.internal:5432/railway`

---

**Next:** Once deployed and verified, proceed to enable LaunchDarkly feature flag!

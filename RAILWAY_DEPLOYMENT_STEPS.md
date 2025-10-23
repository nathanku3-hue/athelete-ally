# 🚀 RAILWAY DEPLOYMENT - QUICK START GUIDE

## Step-by-Step Instructions

### 1. Create Railway Account ✅
Go to: https://railway.app/
- Sign up with GitHub (recommended)
- Verify email

### 2. Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account if not already
4. Select repository: `nathanku3-hue/athelete-ally`
5. Select branch: `main`

### 3. Configure Service
1. Railway will detect the monorepo
2. **Root Directory:** Set to `services/planning-engine`
3. **Build Command:** Leave as auto-detected
4. **Start Command:** `npm start`

### 4. Add PostgreSQL Database
1. In your Railway project, click **"New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically create `DATABASE_URL` variable

### 5. Add Environment Variables
Click **"Variables"** tab and add:

```
NODE_ENV=production
PORT=4102
LAUNCHDARKLY_SDK_KEY=api-375bb749-5688-4691-a002-59d3d854984b

# Generate JWT secret:
JWT_SECRET=<copy from below>
```

**Generate JWT Secret:**
Run this in PowerShell:
```powershell
$bytes = New-Object Byte[] 48
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```
Copy the output and paste as JWT_SECRET value.

**OpenAI API Key:**
- Go to: https://platform.openai.com/api-keys
- Create new key named "Athlete Ally Production"
- Add as: `OPENAI_API_KEY=sk-proj-...`

### 6. Deploy!
1. Click **"Deploy"**
2. Watch the build logs
3. Wait for deployment to complete (~5 minutes)

### 7. Get Your Production URL
After deployment:
1. Go to **"Settings"** tab
2. Under **"Networking"** section
3. Click **"Generate Domain"**
4. Copy the URL (e.g., `https://athlete-ally-production.up.railway.app`)

### 8. Verify Deployment
Test these endpoints (replace URL):

```powershell
# Health check
curl https://YOUR-RAILWAY-URL.up.railway.app/health

# Metrics
curl https://YOUR-RAILWAY-URL.up.railway.app/metrics

# Time Crunch endpoint (should return 401)
curl -X POST https://YOUR-RAILWAY-URL.up.railway.app/api/v1/time-crunch/preview `
  -H "Content-Type: application/json" `
  -d '{"planId":"test","targetMinutes":30}'
```

---

## 🎯 NEXT: Enable Feature Flag

Once deployment is verified, enable the feature flag:

1. Go to: https://app.launchdarkly.com/
2. Find flag: `feature.stream5_time_crunch_mode`
3. Environment: **Production**
4. Turn **ON** and set to **10% rollout**
5. Save changes

---

## 📊 MONITOR (4 Hours)

Watch these metrics every 30 minutes:

```powershell
# Get metrics
curl https://YOUR-RAILWAY-URL.up.railway.app/metrics | Select-String "time_crunch"
```

**Success Criteria:**
- ✅ Success rate > 95%
- ✅ Response time p95 < 5s
- ✅ Error rate < 1%

**If problems:**
- Turn flag OFF in LaunchDarkly
- Check Railway logs
- Report issues

---

## 💰 COST ESTIMATE

**Free tier includes:**
- $5 credit/month
- Enough for development/testing

**For production:**
- Planning Engine: ~$20/month
- PostgreSQL: ~$10/month
- **Total: ~$30/month**

**First month is FREE** with trial credit!

---

## 🆘 TROUBLESHOOTING

### Build Fails
- Check Railway build logs
- Verify `services/planning-engine` is set as root directory
- Ensure all dependencies in package.json

### Health Check Fails
- Check if PORT=4102 is set
- Verify DATABASE_URL is configured
- Check logs for errors

### Can't Access URL
- Make sure domain is generated (Settings → Networking)
- Wait 1-2 minutes after deployment
- Check deployment status is "Active"

---

## ✅ SUCCESS CHECKLIST

- [ ] Railway account created
- [ ] GitHub repo connected
- [ ] PostgreSQL database added
- [ ] Environment variables configured
- [ ] Service deployed successfully
- [ ] Health check returns 200
- [ ] Time Crunch endpoint exists (401 OK)
- [ ] LaunchDarkly flag enabled (10%)
- [ ] First successful request logged
- [ ] Monitoring for 4 hours
- [ ] Metrics staying green

---

**Good luck! 🚀**

Questions? Check Railway docs: https://docs.railway.app/

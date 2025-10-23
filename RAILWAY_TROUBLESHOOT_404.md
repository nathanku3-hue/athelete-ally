# Railway 404 Error - Troubleshooting Guide

**Error:** "Application not found" when accessing health endpoint

**Your URL:** https://planning-engine-production.up.railway.app

---

## 🔍 Diagnosis

The URL is accessible (Railway's infrastructure responds), but your application isn't running.

**Possible causes:**
1. Service hasn't finished deploying yet
2. Build failed
3. Service crashed on startup
4. Wrong root directory setting
5. Port configuration issue

---

## 📋 Step-by-Step Fix

### **Step 1: Check Deployment Status** ⭐ START HERE

**In Railway Dashboard:**

1. Click on your **planning-engine-production** service
2. Go to **"Deployments"** tab
3. Look at the latest deployment

**What status do you see?**

✅ **"Deployed"** with green checkmark
- If yes → Go to Step 2

⏳ **"Building"** or "In Progress"
- Wait for it to complete (5-10 minutes)
- Watch the build logs

❌ **"Failed"** or red X
- Go to Step 3 (Build Failed)

🔄 **"Crashed"** or keeps restarting
- Go to Step 4 (Startup Failed)

---

### **Step 2: Check Build Logs**

**If deployment shows "Deployed" but still getting 404:**

1. Click on the latest deployment
2. Click **"View Logs"** or **"Logs"** tab
3. Scroll through the logs

**Look for these success indicators:**
```
✅ "planning-engine listening on :4102"
✅ "Server started successfully"
✅ "connected to planning_db"
✅ "connected to redis"
```

**If you DON'T see these:**
- Service built successfully but isn't starting
- Go to Step 4

**If you DO see these:**
- Service is running but on wrong port
- Go to Step 5

---

### **Step 3: Fix Build Failures**

**Common build issues:**

#### **Issue: "Cannot find module" or "npm ci failed"**

**Fix:**
1. Go to Settings tab
2. Verify **Root Directory** = `/services/planning-engine`
3. Verify **Build Command** = `npm run build`
4. Verify **Start Command** = `npm start`
5. Click **"Redeploy"**

#### **Issue: "No package.json found"**

**Fix:**
1. Root Directory is wrong
2. Should be `/services/planning-engine` (with leading slash)
3. Update Settings → Root Directory
4. Redeploy

#### **Issue: "Node version mismatch"**

**Fix:**
1. Railway should auto-detect Node 20.x
2. If not, add to Variables:
   - Name: `NODE_VERSION`
   - Value: `20.18.0`
3. Redeploy

---

### **Step 4: Fix Startup Failures**

**If service crashes immediately after starting:**

#### **Check Logs for Error Messages**

**Common errors:**

**Error: "Cannot connect to database"**
```
Fix:
1. Verify PLANNING_DATABASE_URL is set
2. Click PostgreSQL service → Variables → Copy connection string
3. Make sure it's named PLANNING_DATABASE_URL (not DATABASE_URL)
4. Restart service
```

**Error: "Redis connection failed"**
```
Fix:
1. Verify REDIS_URL is set
2. Click Redis service → Variables → Copy connection string
3. Restart service
```

**Error: "Missing environment variable"**
```
Fix:
Check all required variables are set:
- PLANNING_DATABASE_URL
- REDIS_URL
- OPENAI_API_KEY
- JWT_SECRET
- FEATURE_DISABLE_EVENTS
- NODE_ENV
```

---

### **Step 5: Fix Port Configuration**

**If service is running but Railway can't reach it:**

#### **Check Port Settings**

1. Go to Settings tab
2. Look for **"Networking"** or **"Port"** section
3. Railway should auto-detect port 4102

**If not auto-detected:**
- Add Variable: `PORT` = `4102`
- Or let Railway auto-assign (remove PORT variable)

#### **Verify Start Command**

**Correct start command:**
```
npm start
```

**NOT:**
- `node dist/index.js` (might use wrong port)
- `npm run dev` (development mode)

---

### **Step 6: Force Redeploy**

**After fixing any issues:**

1. Go to Deployments tab
2. Click **"Deploy"** dropdown (top right)
3. Select **"Redeploy"**
4. Wait 5-10 minutes
5. Check logs for success messages
6. Test health endpoint again

---

## 🔧 Quick Diagnostic Commands

**Run these in PowerShell to check status:**

```powershell
$url = "https://planning-engine-production.up.railway.app"

# Test if Railway responds at all
Write-Host "Testing Railway endpoint..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $url -ErrorAction Stop
} catch {
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test health endpoint
Write-Host "`nTesting /health endpoint..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$url/health"
    Write-Host "✅ Success!" -ForegroundColor Green
    $health | ConvertTo-Json
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test root endpoint
Write-Host "`nTesting root endpoint..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $url -ErrorAction Stop
    Write-Host "✅ Root accessible" -ForegroundColor Green
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
```

---

## 📸 What Railway Should Look Like When Working

### **Deployment Tab:**
```
┌─────────────────────────────────┐
│ Latest Deployment              │
│ ✅ Deployed                    │
│ Status: Active                 │
│ Created: 2 minutes ago         │
│                                │
│ [View Logs] [Redeploy]        │
└─────────────────────────────────┘
```

### **Logs Should Show:**
```
[INFO] npm start
[INFO] planning-engine listening on :4102
[INFO] connected to planning_db
[INFO] connected to redis
[INFO] Routes registered: enhanced-plans, movement-curation, time-crunch, api-docs
[INFO] health check routes registered
```

### **Settings Should Have:**
```
Root Directory: /services/planning-engine
Build Command: npm run build
Start Command: npm start
```

### **Variables Should Include:**
```
PLANNING_DATABASE_URL = postgresql://...
REDIS_URL = redis://...
OPENAI_API_KEY = sk-...
JWT_SECRET = 7NgpuC6BY...
FEATURE_DISABLE_EVENTS = true
NODE_ENV = production
```

---

## ✅ Success Checklist

**When deployment is successful:**

- [ ] Deployment status = "Deployed" (green)
- [ ] Logs show "planning-engine listening on :4102"
- [ ] No error messages in logs
- [ ] Service stays running (no crashes)
- [ ] Health endpoint returns JSON (not 404)
- [ ] All database connections successful

---

## 🆘 Still Not Working?

**If you've tried everything above:**

1. **Check Railway Status Page**
   - https://status.railway.app/
   - Make sure Railway services are operational

2. **Try Different Endpoint**
   - Test: `https://planning-engine-production.up.railway.app/`
   - Even 404 from your app is better than "Application not found"

3. **Review Environment Variables**
   - Make sure DATABASE_URL was renamed to PLANNING_DATABASE_URL
   - All required variables present
   - No typos in variable names

4. **Check Build Command Output**
   - Look for TypeScript compilation errors
   - npm install errors
   - Missing dependencies

---

## 📞 Report Back With

**To help you further, I need to know:**

1. What's the deployment status? (Deployed/Failed/Building/Crashed)
2. What do the logs show? (Copy last 20 lines)
3. What's in Settings → Root Directory?
4. What environment variables are set?

---

**Let's get this fixed! Check your Railway dashboard and let me know what you see.** 🚀

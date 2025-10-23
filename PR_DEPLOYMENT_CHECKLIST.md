# PR Approval & Deployment Checklist

## 📋 Pre-PR Submission
- [x] Code changes committed to `fix/health-check-routes` branch
- [x] Changes pushed to origin
- [x] TypeScript compilation passes (`npm run type-check`)
- [x] Linting passes with no errors
- [x] PR description created (see `PR_HEALTH_CHECK_FIX.md`)

## 🔍 PR Creation Steps

1. **Open PR on GitHub**
   - Go to: https://github.com/nathanku3-hue/athelete-ally/compare/main...fix/health-check-routes
   - Title: `Fix: Add Missing Health Check Routes to Planning Engine`
   - Copy content from `PR_HEALTH_CHECK_FIX.md` into description
   - Add labels: `bug`, `deployment`, `infrastructure`

2. **Wait for CI Checks**
   - [ ] All GitHub Actions workflows pass
   - [ ] TypeScript compilation succeeds
   - [ ] Lint checks pass
   - [ ] Tests pass (if any)
   - [ ] No merge conflicts with main

3. **Request Review**
   - [ ] Tag relevant reviewers (team leads, backend engineers)
   - [ ] Respond to any feedback or change requests
   - [ ] Make additional commits if needed

4. **Get Approval**
   - [ ] At least 1 approval from code owner/maintainer
   - [ ] All review comments resolved
   - [ ] CI still passing on latest commit

## 🚀 Post-Merge Deployment

### 5. Merge to Main
   - [ ] Squash and merge (or merge strategy per team policy)
   - [ ] Delete `fix/health-check-routes` branch after merge
   - [ ] Verify main branch has your changes

### 6. Railway Deployment Setup

**Create Railway Account:**
- [ ] Go to https://railway.app/
- [ ] Sign up with GitHub account
- [ ] Authorize Railway to access your repository

**Create New Project:**
- [ ] Click "New Project" in Railway dashboard
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose `nathanku3-hue/athelete-ally` repository
- [ ] Select **main** branch (IMPORTANT: wait until PR is merged)

**Configure Service:**
- [ ] Service name: `planning-engine-production`
- [ ] Root directory: `/services/planning-engine`
- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`
- [ ] Port: `4102` (or Railway's auto-assigned port)

### 7. Add Dependencies

**PostgreSQL Database:**
- [ ] In Railway project, click "New" → "Database" → "PostgreSQL"
- [ ] Railway auto-creates `DATABASE_URL` variable
- [ ] Rename to `PLANNING_DATABASE_URL` in environment variables

**Redis:**
- [ ] Click "New" → "Database" → "Redis"
- [ ] Railway auto-creates `REDIS_URL` variable

**NATS (Optional for MVP):**
- [ ] Deploy NATS separately or use Railway template
- [ ] Add `NATS_URL` environment variable

### 8. Configure Environment Variables

Copy from `RAILWAY_ENV_VARS.txt` and add in Railway dashboard:

**Required:**
```bash
OPENAI_API_KEY=sk-...                           # Get from OpenAI dashboard
JWT_SECRET=<your-secret-from-env-file>          # Already generated
LAUNCHDARKLY_SDK_KEY=<your-key>                 # From LaunchDarkly
PLANNING_DATABASE_URL=postgresql://...          # Auto-created by Railway
REDIS_URL=redis://...                           # Auto-created by Railway
```

**Optional:**
```bash
NATS_URL=nats://localhost:4223                  # If NATS available
NODE_ENV=production
PORT=4102
FEATURE_DISABLE_EVENTS=true                     # Set to skip NATS if not ready
```

### 9. Deploy and Verify

**Initial Deployment:**
- [ ] Click "Deploy" in Railway dashboard
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Check logs for any errors
- [ ] Verify service shows "Active" status

**Run Verification:**
```powershell
# Update URL in verify-deployment.ps1 with your Railway URL
# Format: planning-engine-production.up.railway.app
.\verify-deployment.ps1 -ProductionUrl "your-railway-url.up.railway.app"
```

**Expected Results:**
- [ ] ✅ Health Check endpoint returns 200
- [ ] ✅ Metrics endpoint returns 200
- [ ] ✅ Time Crunch endpoint returns 401 (unauthorized) or feature flag response
- [ ] ⚠️  Database shows warning (acceptable if not fully configured)
- [ ] ⚠️  LaunchDarkly shows warning (acceptable if checking from external)

### 10. Monitor Production

**First 24 Hours:**
- [ ] Check Railway logs every 2-4 hours
- [ ] Monitor `/health` endpoint status
- [ ] Check error rates in `/metrics`
- [ ] Verify database connections stable
- [ ] Monitor memory usage

**Set Up Alerts:**
- [ ] Railway webhook for deployment failures
- [ ] Health check monitoring (Railway has built-in)
- [ ] Error threshold alerts

## 🐛 Troubleshooting

### Build Fails
- Check Railway build logs for specific error
- Verify `package.json` scripts are correct
- Ensure all dependencies are in `dependencies` not `devDependencies`

### Health Check Fails
- Verify `PLANNING_DATABASE_URL` is set correctly
- Check `REDIS_URL` is accessible
- Review logs: `railway logs` command

### 404 Errors
- Confirm root directory is set to `/services/planning-engine`
- Verify start command is `npm start`
- Check routes are registered in `server.ts`

## 📞 Support Resources

- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Create issue in repository if deployment fails

## ✅ Success Criteria

Deployment is successful when:
- ✅ Railway shows service as "Active"
- ✅ `/health` returns 200 with all checks healthy
- ✅ `/metrics` returns Prometheus metrics
- ✅ No errors in Railway logs for 1 hour
- ✅ Database migrations completed (if any)
- ✅ Feature flags load from LaunchDarkly

---

**Timeline Estimate:**
- PR Review: 1-2 days (depends on team)
- CI Checks: 5-15 minutes
- Railway Setup: 30 minutes
- Initial Deployment: 10 minutes
- Verification: 15 minutes
- **Total: 2-3 days** (mostly waiting for review)

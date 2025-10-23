# Production Deployment Guide

## Prerequisites

### Required Tools
```bash
# Install Railway CLI
npm install -g @railway/cli

# Install Docker (optional, for local testing)
# Download from: https://www.docker.com/products/docker-desktop

# Install Node.js 20.18.0
# Download from: https://nodejs.org/
```

### Required Access
- [ ] Railway account with project access
- [ ] Railway API token (for CI/CD)
- [ ] GitHub repository access
- [ ] LaunchDarkly access (for feature flags)
- [ ] Production secrets (see PRODUCTION_SECRETS.md)

---

## One-Time Setup

### 1. Create Railway Project

```bash
# Login to Railway
railway login

# Create project
railway init
# Project name: athlete-ally-production
# Environment: production

# Link to GitHub repository
railway github link nathanku3-hue/athlete-ally

# Enable automatic deployments
railway settings --auto-deploy true
```

### 2. Provision PostgreSQL

```bash
# Add PostgreSQL service
railway add --database postgres

# Get database URL
railway variables get DATABASE_URL
```

### 3. Configure Environment Variables

```bash
# Set production secrets (one-time)
railway variables set OPENAI_API_KEY=<your-key>
railway variables set JWT_SECRET=$(openssl rand -base64 64)
railway variables set NODE_ENV=production
railway variables set PORT=4102
railway variables set CORS_ORIGIN=https://app.athlete-ally.com
railway variables set LAUNCHDARKLY_SDK_KEY=api-375bb749-5688-4691-a002-59d3d854984b

# Database URL is auto-configured by Railway
```

### 4. Configure Custom Domain (Optional)

```bash
# Add custom domain
railway domain add api.athlete-ally.com

# Configure DNS:
# Type: CNAME
# Name: api
# Value: [provided by Railway]
```

---

## Deployment Methods

### Method 1: Automatic (GitHub Push)

**Recommended for production**

```bash
# Merge PR to main branch
git checkout main
git pull origin main

# Railway auto-deploys on push to main
# Monitor: https://railway.app/project/athlete-ally-production/deployments
```

### Method 2: Manual CLI Deployment

**Use for hotfixes or when CI/CD is down**

```bash
# 1. Build locally
cd services/planning-engine
npm run build

# 2. Deploy to Railway
railway up

# 3. Wait for deployment
railway status

# 4. Verify
curl https://planning-engine.up.railway.app/health
```

### Method 3: Docker Image Deployment

**Use for controlled releases**

```bash
# 1. Build Docker image
docker build -t athlete-ally/planning-engine:v1.0.0 -f services/planning-engine/Dockerfile .

# 2. Push to Railway
railway deploy

# 3. Monitor deployment
railway logs
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass locally
- [ ] Code reviewed and approved
- [ ] PR merged to main
- [ ] Database migrations prepared (if any)
- [ ] Feature flags configured
- [ ] Monitoring dashboard ready

### During Deployment
- [ ] CI/CD pipeline runs successfully
- [ ] Build completes without errors
- [ ] Tests pass in CI
- [ ] Health check endpoint responds
- [ ] Metrics endpoint accessible

### Post-Deployment
- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] No error spikes in logs
- [ ] Metrics showing normal traffic
- [ ] Feature flags working correctly

---

## Verification Steps

### 1. Health Check

```bash
# Basic health
curl https://planning-engine.up.railway.app/health

# Expected response:
# {
#   "status": "healthy",
#   "uptime": 123,
#   "timestamp": "2025-01-15T10:30:00.000Z"
# }
```

### 2. API Endpoints

```bash
# Test time-crunch endpoint (expects 401 without auth)
curl -X POST https://planning-engine.up.railway.app/api/v1/time-crunch/preview \
  -H "Content-Type: application/json" \
  -d '{"planId":"test","targetMinutes":30}'

# Expected: 401 Unauthorized (endpoint exists)
```

### 3. Metrics

```bash
# Check Prometheus metrics
curl https://planning-engine.up.railway.app/metrics | grep planning_engine

# Expected: Metrics output with counters and gauges
```

### 4. Database Connectivity

```bash
# Check database status (requires auth)
curl https://planning-engine.up.railway.app/health/detailed

# Expected: Database connection status included
```

---

## Rollback Procedures

### Automatic Rollback (Railway)

```bash
# View recent deployments
railway deployments

# Rollback to previous deployment
railway rollback
```

### Manual Rollback (Git Revert)

```bash
# 1. Find commit to revert
git log --oneline

# 2. Revert commit
git revert <commit-hash>

# 3. Push to main (triggers auto-deploy)
git push origin main
```

### Emergency Rollback (Feature Flag)

```bash
# Disable feature via LaunchDarkly (no code deployment needed)
# Go to: https://app.launchdarkly.com/
# Toggle: feature.stream5_time_crunch_mode → OFF
```

---

## Troubleshooting

### Deployment Failed

**Check logs:**
```bash
railway logs --follow
```

**Common issues:**
- Build errors: Check package.json scripts
- Database connection: Verify DATABASE_URL is set
- Port conflicts: Ensure PORT=4102 is configured
- Memory issues: Upgrade Railway plan or optimize code

### Health Check Failing

```bash
# 1. Check service status
railway status

# 2. View recent logs
railway logs --tail 100

# 3. Restart service
railway restart

# 4. If still failing, rollback
railway rollback
```

### High Error Rates

```bash
# 1. Check error logs
railway logs --filter error

# 2. Check metrics
curl https://planning-engine.up.railway.app/metrics

# 3. If critical, disable feature flag
# LaunchDarkly → feature.stream5_time_crunch_mode → OFF

# 4. Investigate and fix
# 5. Re-enable feature flag when ready
```

---

## Monitoring & Alerts

### Real-time Monitoring

```bash
# Watch logs in real-time
railway logs --follow

# Filter for errors
railway logs --filter error --follow

# Check CPU/Memory usage
railway metrics
```

### Set Up Alerts

**Railway Dashboard:**
1. Go to Project Settings
2. Enable notifications for:
   - Deployment failures
   - High error rates
   - Resource limits reached
   - Downtime

**LaunchDarkly Alerts:**
1. Enable flag change notifications
2. Set up Slack/email webhooks
3. Monitor flag evaluation metrics

---

## Maintenance

### Database Backups

```bash
# Railway auto-backups daily
# Manual backup:
railway pg:backup create

# List backups:
railway pg:backup list

# Restore backup:
railway pg:backup restore <backup-id>
```

### Log Retention

```bash
# Railway retains logs for 7 days (free tier)
# Export logs for long-term storage:
railway logs --since 24h > logs-$(date +%Y%m%d).txt
```

### Cost Monitoring

```bash
# Check current usage
railway usage

# View billing
railway billing
```

---

## Support & Escalation

### Railway Support
- Dashboard: https://railway.app/help
- Discord: https://discord.gg/railway
- Email: team@railway.app

### Internal Escalation
1. Check #engineering Slack channel
2. Page on-call engineer (if critical)
3. Create incident ticket
4. Document in post-mortem

---

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/admin.html)

# Railway Deployment Troubleshooting Summary

## Issues Encountered & Solutions

### 1. Docker Cache Hell
**Problem**: Railway kept using cached frontend Dockerfile instead of planning-engine  
**Solution**: Removed all Dockerfiles, forced Railway to use Nixpacks/Railpack

### 2. Wrong Start Command
**Problem**: Auto-detected `node dist/index.js` instead of `node services/planning-engine/dist/index.js`  
**Solution**: Added custom start command in Railway dashboard settings + railway.json

### 3. Missing Prisma Client
**Problem**: Build failed with "Cannot find module prisma/generated/client"  
**Solution**: Added `prisma generate` to build script in package.json

### 4. Missing Workspace Dependencies
**Problem**: Build failed with "Cannot find module '@athlete-ally/shared'"  
**Solution**: Updated nixpacks.toml to run `npm run build:packages` before service build

## Final Configuration

### nixpacks.toml
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = [
  "npm run build:packages",
  "cd services/planning-engine && npm run build"
]

[start]
cmd = "node services/planning-engine/dist/index.js"
```

### services/planning-engine/package.json
```json
"scripts": {
  "build": "prisma generate && tsc -p tsconfig.json"
}
```

### Railway Settings
- **Custom Start Command**: `node services/planning-engine/dist/index.js`
- **Health Check Path**: `/health`
- **Root Directory**: `/` (monorepo root)

## Environment Variables Required
See `railway-env-vars.txt` for full list.

## Next Steps After Deployment Success
1. Verify `/health` endpoint returns 200
2. Test database connectivity
3. Implement Phase 1 guardrails from `PHASE1_GUARDRAILS_IMPLEMENTATION_PLAN.md`
4. Set up LaunchDarkly 10% rollout for Time Crunch feature

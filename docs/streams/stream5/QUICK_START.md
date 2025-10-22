# Stream 5 - Quick Start (TL;DR)

## 🎯 Goal
Seed 8 foundational movements into planning-engine database and verify insert/update behavior.

## ⚡ Quick Commands

### Prerequisites (One-Time Setup)
```powershell
# 1. Start Docker Desktop (manually)

# 2. Start infrastructure
npm run infra:up

# 3. Set database URL
$env:PLANNING_DATABASE_URL="postgresql://athlete:athlete@localhost:55432/athlete_planning"

# 4. Setup database schema
cd services/planning-engine
npx prisma generate
npx prisma db push
cd ../..
```

### Run Seeding (Test This)
```powershell
# First run (creates 8 movements)
$env:PLANNING_DATABASE_URL="postgresql://athlete:athlete@127.0.0.1:55432/athlete_planning"
npm run seed:movements

# Or with DSN flag (no env var needed)
npm run seed:movements -- --dsn="postgresql://athlete:athlete@127.0.0.1:55432/athlete_planning"

# Second run (updates same 8 movements)
npm run seed:movements -- --dsn="postgresql://athlete:athlete@127.0.0.1:55432/athlete_planning"
```

### Verify Results
```powershell
# Connect to database
psql postgresql://athlete:athlete@localhost:55432/athlete_planning

# Check counts
SELECT COUNT(*) FROM movement_library;        -- Expect: 8
SELECT COUNT(*) FROM movement_audit_log;      -- Expect: 16+

# List movements
SELECT name, slug, classification FROM movement_library ORDER BY name;
```

## ✅ Expected Results

### First Run
```
Created: 8
Updated: 0
Skipped: 0
Errors: 0
```

### Second Run
```
Created: 0
Updated: 8
Skipped: 0
Errors: 0
```

## 📋 What Was Created

| File | Description |
|------|-------------|
| `scripts/seed-movements.ts` | Main seed script |
| `services/planning-engine/data/movements-placeholder.json` | 8 test movements |
| `package.json` | Added `seed:movements` command |

## 🆕 Time Crunch Preview (Stream 5 Activation)

1. **Start the local stack**
   ```powershell
   npm run dev:all:local
   ```
2. **Generate a plan** via onboarding or use the existing mocked plan in `/plan`.
3. **Open Today’s Training** (`http://localhost:3000/plan`) and select **Time Crunch Mode**.
4. The modal calls `POST /api/v1/time-crunch/preview` (gateway → planning-engine) and renders the compressed structure (core-first, supersets, blocks).
5. Preview telemetry is emitted automatically:
   - Requested/succeeded/fallback events from planning-engine.
   - Declines when users dismiss the modal (frontend → gateway).

> **Tip:** Look for the `Time Crunch` badge on the modal header and verify segment badges (core, supersets, blocks). If compression fails, consult the troubleshooting note in `DEPLOYMENT_GUIDE.md` for fallback guidance.

## 🚀 Advanced Options

```powershell
# Seed to any DSN (includes migrations)
.\scripts\seed-to-dsn.ps1 -Dsn "postgresql://user:pass@host:port/db"

# Generate portable dump artifact
.\scripts\generate-seed-dump.ps1

# Restore from dump
.\scripts\restore-seed.ps1 -DumpFile "path.sql" -Dsn "postgresql://..."

# Staging emulator
docker compose --profile staging up -d postgres-staging
```

## 📚 Full Documentation

- **Deployment Guide:** `docs/streams/stream5/DEPLOYMENT_GUIDE.md` ⭐ START HERE
- **Setup Guide:** `docs/streams/stream5/SETUP_GUIDE.md`
- **Verification Checklist:** `docs/streams/stream5/VERIFICATION_CHECKLIST.md`
- **Implementation Summary:** `docs/streams/stream5/IMPLEMENTATION_SUMMARY.md`

## 🚨 Troubleshooting

**Database connection failed?**
→ Check Docker is running: `docker ps`

**Missing tables?**
→ Run: `cd services/planning-engine && npx prisma db push`

**Script not found?**
→ Check you're in project root: `E:\vibe\athlete-ally-original`

## ⏭️ After Testing

1. Document results in `VERIFICATION_CHECKLIST.md`
2. Wait for Ops staging credentials
3. Rerun on staging when credentials arrive
4. Proceed to Stream 5 Item #2 (scoring function)

---

**Note:** This uses placeholder data (8 movements). Science team's canonical dataset (50+ movements) arrives Oct 17. Just swap the file and rerun.

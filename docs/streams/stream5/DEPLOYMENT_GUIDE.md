# Stream 5 - Movement Seeding Deployment Guide

## Overview

This guide covers all deployment paths for seeding the movement library, including local testing, staging emulation, and production deployment using portable dump artifacts.

## Quick Reference

| Scenario | Command |
|----------|---------|
| **Local seeding** | `npm run seed:movements -- --dsn="postgresql://..."` |
| **Seed to any DSN** | `.\scripts\seed-to-dsn.ps1 -Dsn "postgresql://..."` |
| **Generate dump** | `.\scripts\generate-seed-dump.ps1` |
| **Restore dump** | `.\scripts\restore-seed.ps1 -DumpFile "path.sql" -Dsn "..."` |
| **Staging emulator** | `docker compose --profile staging up -d postgres-staging` |

## Methods

### Method 1: Direct Seeding with DSN Override

**Use Case:** Quick seeding to any database with custom DSN

```powershell
# With CLI flag
npm run seed:movements -- --dsn="postgresql://user:pass@host:port/db"

# With custom data file
npm run seed:movements -- --dsn="postgresql://..." --file="path/to/movements.json"

# With environment variable (fallback)
$env:PLANNING_DATABASE_URL="postgresql://user:pass@host:port/db"
npm run seed:movements
```

**What it does:**
1. Connects to specified database
2. Runs movement import with auto-publish
3. Creates movements in `movement_library` table

**Requirements:**
- Database must exist
- Schema must be applied (Prisma migrations)
- Network access to database

---

### Method 2: Seed-to-DSN Script (Recommended)

**Use Case:** Full automated seeding including migrations

```powershell
# Basic usage
.\scripts\seed-to-dsn.ps1 -Dsn "postgresql://user:pass@host:port/db"

# With custom data
.\scripts\seed-to-dsn.ps1 `
  -Dsn "postgresql://user:pass@host:port/db" `
  -DataFile "services/planning-engine/data/movements-canonical.json"

# Skip migrations (if schema already applied)
.\scripts\seed-to-dsn.ps1 `
  -Dsn "postgresql://..." `
  -SkipMigrations
```

**What it does:**
1. ✅ Applies Prisma migrations (`migrate deploy` or `db push`)
2. ✅ Seeds movements via import CLI
3. ✅ Validates completion
4. ✅ Provides verification commands

**When to use:**
- First-time seeding to new environment
- Staging deployment
- Production deployment
- Schema may not be up to date

---

### Method 3: Staging Emulator (Local Staging Test)

**Use Case:** Test staging workflows locally before deploying

**Step 1: Start staging emulator**
```powershell
# Start isolated staging Postgres
docker compose -f docker/compose/preview.yml --profile staging up -d postgres-staging

# Verify running
docker ps | Select-String "postgres-staging"
```

**Step 2: Seed to emulator**
```powershell
.\scripts\seed-to-dsn.ps1 `
  -Dsn "postgresql://athlete:athlete_staging@localhost:55433/athlete_planning_staging"
```

**Step 3: Generate dump artifact**
```powershell
.\scripts\generate-seed-dump.ps1 `
  -Dsn "postgresql://athlete:athlete_staging@localhost:55433/athlete_planning_staging" `
  -OutputDir "artifacts/seed-dumps"
```

**Ports:**
- Local dev: `55432` (postgres)
- Staging emulator: `55433` (postgres-staging)

**When to use:**
- Testing before real staging deployment
- Validating dump generation
- Dry-run of deployment workflow

---

### Method 4: Dump Generation & Restore (Portable Artifacts)

**Use Case:** Ship pre-seeded database snapshots for instant deployment

#### Generate Dump

```powershell
# From local database
.\scripts\generate-seed-dump.ps1

# From staging emulator
.\scripts\generate-seed-dump.ps1 `
  -Dsn "postgresql://athlete:athlete_staging@localhost:55433/athlete_planning_staging"

# Custom output directory
.\scripts\generate-seed-dump.ps1 `
  -OutputDir "releases/v1.0"
```

**Output:** `artifacts/seed-dumps/movements_seed_YYYYMMDD_HHMMSS.sql`

**Artifact contains:**
- Schema for movement tables (DROP + CREATE)
- All movement_library rows
- All movement_staging rows (if any)
- Complete movement_audit_log

#### Restore Dump

```powershell
# Interactive (prompts for confirmation)
.\scripts\restore-seed.ps1 `
  -DumpFile "artifacts/seed-dumps/movements_seed_20251015.sql" `
  -Dsn "postgresql://user:pass@host:port/db"

# Non-interactive (CI/automation)
.\scripts\restore-seed.ps1 `
  -DumpFile "path/to/dump.sql" `
  -Dsn "postgresql://..." `
  -SkipConfirmation
```

**When to use:**
- **Instant staging deployment:** No need to wait for seeding to complete
- **Production releases:** Ship verified seed data
- **Disaster recovery:** Restore known-good state
- **Development onboarding:** New devs get instant data
- **CI/CD:** Fast, repeatable deployments

**Advantages:**
- ✅ Faster than re-running seed script
- ✅ Atomic (all-or-nothing)
- ✅ Versioned artifacts (git or artifact repo)
- ✅ No dependency on source data files

---

### Method 5: CI-Generated Artifacts (Automated)

**Use Case:** Continuous delivery of seed artifacts

**Workflow:** `.github/workflows/generate-seed-dump.yml`

**Triggers:**
- Manual dispatch (Actions tab → "Generate Movement Seed Dump" → Run workflow)
- Push to `main` or `stream5` branches
- Changes to:
  - `services/planning-engine/prisma/schema.prisma`
  - `services/planning-engine/data/movements-*.json`
  - `scripts/seed-movements.ts`

**What it does:**
1. Spins up ephemeral Postgres (GitHub Actions service)
2. Applies Prisma schema
3. Seeds movements
4. Generates pg_dump artifact
5. Uploads as GitHub artifact (30-day retention)
6. Verifies row counts

**Download artifact:**
```powershell
# Via GitHub CLI
gh run download <run-id> -n movement-seed-dump-<sha>

# Via UI
Actions tab → Select workflow run → Artifacts section → Download
```

**Deploy artifact:**
```powershell
.\scripts\restore-seed.ps1 `
  -DumpFile "movement-seed-dump-<sha>/movements_seed_ci.sql" `
  -Dsn "postgresql://staging-dsn" `
  -SkipConfirmation
```

---

## Deployment Scenarios

### Scenario 1: Local Development

```powershell
# Start local Postgres
docker compose -f docker/compose/preview.yml up -d postgres

# Seed directly
npm run seed:movements -- --dsn="postgresql://athlete:athlete@127.0.0.1:55432/athlete_planning"
```

### Scenario 2: Staging Deployment (When Ops Provides DSN)

**Option A: Direct seed**
```powershell
.\scripts\seed-to-dsn.ps1 -Dsn "<staging-dsn-from-ops>"
```

**Option B: Use pre-generated dump**
```powershell
# Download latest CI artifact
gh run download --name movement-seed-dump-latest

# Restore
.\scripts\restore-seed.ps1 `
  -DumpFile "movements_seed_ci.sql" `
  -Dsn "<staging-dsn-from-ops>" `
  -SkipConfirmation
```

### Scenario 3: Production Deployment

**Recommended: Use verified dump artifact**

```powershell
# 1. Tag release dump
git tag -a v1.0-seed -m "Movement library v1.0"
git push --tags

# 2. Generate production dump from staging
.\scripts\generate-seed-dump.ps1 `
  -Dsn "<staging-dsn>" `
  -OutputDir "releases/v1.0"

# 3. Test restore in staging-emulator first
docker compose --profile staging up -d postgres-staging
.\scripts\restore-seed.ps1 `
  -DumpFile "releases/v1.0/movements_seed_*.sql" `
  -Dsn "postgresql://athlete:athlete_staging@localhost:55433/athlete_planning_staging"

# 4. Verify
docker exec -it compose-postgres-staging-1 psql -U athlete -d athlete_planning_staging -c "SELECT COUNT(*) FROM movement_library;"

# 5. Deploy to production
.\scripts\restore-seed.ps1 `
  -DumpFile "releases/v1.0/movements_seed_*.sql" `
  -Dsn "<production-dsn>" `
  -SkipConfirmation
```

---

## Verification

After any deployment method:

```powershell
# Count check
docker exec -it <container> psql -U <user> -d <database> -c "
SELECT 
  (SELECT COUNT(*) FROM movement_library) as library,
  (SELECT COUNT(*) FROM movement_audit_log) as audit;
"

# Sample movements
docker exec -it <container> psql -U <user> -d <database> -c "
SELECT name, slug, classification FROM movement_library ORDER BY name LIMIT 5;
"

# Audit trail
docker exec -it <container> psql -U <user> -d <database> -c "
SELECT action, COUNT(*) FROM movement_audit_log GROUP BY action ORDER BY action;
"
```

**Expected results (placeholder data):**
- `movement_library`: 8 rows
- `movement_audit_log`: 40+ rows
- Audit actions: CREATED, REVIEW_SUBMITTED, APPROVED, PUBLISHED

---

## Troubleshooting

### Connection Refused

```
Error: Can't reach database server at `host:port`
```

**Solutions:**
1. Verify DSN is correct
2. Check firewall / network access
3. Try `127.0.0.1` instead of `localhost` (Windows)
4. Verify Postgres is running: `docker ps`

### Schema Not Applied

```
Error: relation "movement_library" does not exist
```

**Solutions:**
1. Use `seed-to-dsn.ps1` instead (applies migrations)
2. Manually apply: `cd services/planning-engine && npx prisma db push`
3. Use dump restore (includes schema)

### Published Movements Cannot Be Edited

```
ERROR   back-squat :: Published movements cannot be edited
```

**This is expected!** Once movements are published, they're immutable.

**Solutions:**
- For testing: Drop tables and re-seed
- For updates: Create new movement versions (not supported yet in placeholder)
- For fresh seed: Use Method 4 (restore dump with `--clean`)

---

### Time Crunch Preview Fails or Returns Fallback

```
HTTP 422: plan_not_compressible
```

**Solutions:**
1. Confirm the plan contains sessions with exercises. Empty or mock sessions cannot be compressed.
2. Verify `plan.content` exists for the requested `planId` (seeded placeholder plans are not compressible).
3. Check service logs for `stream5.time_crunch_preview_fallback` and inspect the `reason` value (`plan_missing_content`, `internal_error`).
4. Regenerate a plan through onboarding and retry the preview request.

---

## When Ops Delivers Staging DSN

### Quick Start

```powershell
# Method A: Direct seed (4-5 minutes)
.\scripts\seed-to-dsn.ps1 -Dsn "<staging-dsn-from-ops>"

# Method B: Restore dump (<1 minute)
.\scripts\restore-seed.ps1 `
  -DumpFile "artifacts/seed-dumps/movements_seed_latest.sql" `
  -Dsn "<staging-dsn-from-ops>"
```

### Verification Checklist

- [ ] Movements seeded: `SELECT COUNT(*) FROM movement_library;` = 8
- [ ] Audit log populated: `SELECT COUNT(*) FROM movement_audit_log;` >= 40
- [ ] Sample query works: `SELECT * FROM movement_library WHERE slug = 'back-squat';`
- [ ] Report back to team: "Stream 5 Item #1 complete - staging seeded"

---

## Best Practices

1. **Always use dump artifacts for production** - Verified, fast, repeatable
2. **Test in staging emulator first** - Catch issues before real deployment
3. **Version your dumps** - Git tag or artifact versioning
4. **Generate dumps in CI** - Automated, consistent, auditable
5. **Keep dumps small** - Only movement tables, no unnecessary data
6. **Document DSN in team wiki** - But never commit credentials to git

---

## Next Steps

Once movements are seeded in staging:

1. ✅ Mark Stream 5 Item #1 complete
2. ⏭️  Proceed to Stream 5 Item #2: Scoring function
3. ⏭️  Implement CoachTip trigger logic
4. ⏭️  Build weekly review system

---

## Reference

| File | Purpose |
|------|---------|
| `scripts/seed-movements.ts` | Core seeding orchestrator |
| `scripts/seed-to-dsn.ps1` | Full automated seed (migrations + data) |
| `scripts/generate-seed-dump.ps1` | Create portable artifact |
| `scripts/restore-seed.ps1` | Deploy artifact to any DSN |
| `.github/workflows/generate-seed-dump.yml` | CI automation |
| `docker/compose/preview.yml` | Staging emulator profile |

**DSN Format:**
```
postgresql://username:password@hostname:port/database
```

**Example DSNs:**
- Local: `postgresql://athlete:athlete@127.0.0.1:55432/athlete_planning`
- Staging emu: `postgresql://athlete:athlete_staging@localhost:55433/athlete_planning_staging`
- Staging (Ops): `<provided-by-ops>`
- Production: `<provided-by-ops>`

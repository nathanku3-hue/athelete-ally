# Stream 5 - Movement Library Seeding Setup Guide

## Overview
Stream 5 is the V1 planning engine backend track covering scoring function, CoachTip trigger, and weekly review logic. Movement library seeding is the first prerequisite step.

## Prerequisites
- Docker Desktop installed and running
- Node.js 20+ and npm 10+
- PostgreSQL client (optional, for manual verification)

## Quick Start

### 1. Start Local Infrastructure

Start Postgres and other services:

```powershell
npm run infra:up
```

This will start:
- PostgreSQL on port 55432 (mapped from internal 5432)
- Redis on port 6379
- NATS on port 4223

### 2. Set Environment Variables

Create a `.env` file in `services/planning-engine/`:

```bash
PLANNING_DATABASE_URL=postgresql://athlete:athlete@localhost:55432/athlete_planning
NODE_ENV=development
```

Or set temporarily in your shell (PowerShell):

```powershell
$env:PLANNING_DATABASE_URL="postgresql://athlete:athlete@localhost:55432/athlete_planning"
```

### 3. Run Prisma Migrations

Navigate to planning-engine and apply the schema:

```powershell
cd services/planning-engine
npx prisma migrate deploy
# or for dev with migration creation:
npx prisma migrate dev
```

Generate Prisma client:

```powershell
npx prisma generate
```

### 4. Run Movement Seeding (First Run)

From the project root:

```powershell
npm run seed:movements
```

Expected output:
```
═══════════════════════════════════════════════════════════
  Stream 5 - Movement Library Seeding
═══════════════════════════════════════════════════════════

📁 Data file:     services\planning-engine\data\movements-placeholder.json
🗄️  Database:      postgresql://athlete:****@localhost:55432/athlete_planning
👤 Actor:         seed@athlete-ally.internal (seed-script)
🔄 Update mode:   enabled

🚀 Starting movement import...

CREATED back-squat
CREATED bench-press
CREATED deadlift
CREATED pull-up
CREATED overhead-press
CREATED box-jump
CREATED rowing-erg
CREATED assault-bike

Processed 8 movements
  Created: 8
  Updated: 0
  Skipped: 0
  Errors: 0

✅ Movement seeding completed successfully
```

### 5. Run Movement Seeding (Second Run - Update Test)

Run the same command again to verify update behavior:

```powershell
npm run seed:movements
```

Expected output:
```
UPDATED back-squat
UPDATED bench-press
UPDATED deadlift
...

Processed 8 movements
  Created: 0
  Updated: 8
  Skipped: 0
  Errors: 0
```

### 6. Verify Data in Database

Connect to Postgres and verify:

```powershell
# Using psql
psql postgresql://athlete:athlete@localhost:55432/athlete_planning

# Then run queries:
SELECT COUNT(*) FROM movement_library;
SELECT name, slug, classification FROM movement_library LIMIT 5;
SELECT COUNT(*) FROM movement_audit_log;
```

Or use a GUI tool like pgAdmin, DBeaver, or DataGrip.

## Movement Data

### Placeholder Data
Currently using 8 foundational movements in `services/planning-engine/data/movements-placeholder.json`:

1. **Strength Movements**
   - Back Squat
   - Bench Press
   - Deadlift
   - Pull-Up
   - Overhead Press

2. **Power Movements**
   - Box Jump

3. **Conditioning Movements**
   - Rowing (Ergometer)
   - Assault Bike

### Real Science Team Data
Expected delivery: **October 17, 2025**

When the canonical dataset arrives:
1. Place it in `services/planning-engine/data/movements-canonical.json`
2. Set environment variable: `SEED_MOVEMENTS_FILE=services/planning-engine/data/movements-canonical.json`
3. Run seed script again

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PLANNING_DATABASE_URL` | *required* | Postgres connection string |
| `SEED_MOVEMENTS_FILE` | `movements-placeholder.json` | Path to movement data file |
| `SEED_MOVEMENTS_UPDATE` | `true` | Enable update mode (vs. skip existing) |
| `CURATION_ACTOR_ID` | `seed-script` | Actor ID for audit trail |
| `CURATION_ACTOR_EMAIL` | `seed@athlete-ally.internal` | Actor email for audit trail |

### Using Custom Data

```powershell
$env:SEED_MOVEMENTS_FILE="path/to/your/movements.json"
npm run seed:movements
```

### Disable Update Mode

To skip existing movements instead of updating:

```powershell
$env:SEED_MOVEMENTS_UPDATE="false"
npm run seed:movements
```

## Data Format

Movements must follow this JSON schema:

```json
{
  "movements": [
    {
      "name": "Movement Name",
      "slug": "movement-slug",
      "classification": "strength|power|conditioning",
      "equipment": ["item1", "item2"],
      "primaryMuscles": ["muscle1", "muscle2"],
      "secondaryMuscles": ["muscle3"],
      "recommendedRpe": 7.5,
      "progressionIds": ["advanced-movement"],
      "regressionIds": ["easier-movement"],
      "tags": ["tag1", "tag2"],
      "instructions": {
        "setup": "How to set up",
        "execution": "How to perform",
        "cues": ["Cue 1", "Cue 2"]
      },
      "metadata": {
        "difficulty": "beginner|intermediate|advanced",
        "movementPattern": "squat|hinge|push|pull"
      }
    }
  ]
}
```

## Troubleshooting

### Database Connection Failed

```
❌ Error: connect ECONNREFUSED localhost:55432
```

**Solution:**
1. Verify Docker is running: `docker ps`
2. Check if postgres container is up: `docker compose -f docker/compose/preview.yml ps`
3. Restart infrastructure: `npm run infra:down` then `npm run infra:up`

### Port Already in Use

```
? Port check failed
```

**Solution:**
The script will automatically try alternative ports. If that fails:
```powershell
$env:POSTGRES_PORT="5434"
npm run infra:up
```

Then update `PLANNING_DATABASE_URL` to use port 5434.

### Prisma Client Not Generated

```
Error: Cannot find module '@prisma/client'
```

**Solution:**
```powershell
cd services/planning-engine
npx prisma generate
```

### Schema Not Migrated

```
Error: Table "movement_library" does not exist
```

**Solution:**
```powershell
cd services/planning-engine
npx prisma migrate dev
# or
npx prisma db push
```

### Duplicate Slug Error

```
ERROR duplicate-slug :: Duplicate slug "back-squat" detected
```

**Solution:**
Each movement must have a unique slug. Check your JSON file for duplicates.

## Next Steps

Once movement seeding is verified:

1. ✅ Movement library populated
2. ⏭️  Implement scoring function (Stream 5 item #2)
3. ⏭️  Add CoachTip trigger logic (Stream 5 item #3)
4. ⏭️  Build weekly review system (Stream 5 item #4)

## Staging Deployment

When Ops provides staging Postgres credentials:

1. Set `PLANNING_DATABASE_URL` to staging connection string
2. Run migrations: `npx prisma migrate deploy`
3. Run seed script: `npm run seed:movements`
4. Verify in staging database
5. Proceed with Stream 5 backend implementation

## References

- [Movement Curation Runbook](../../streams/B/movement-curation-runbook.md)
- [Movement Import CLI](../../../services/planning-engine/src/curation/import-cli.ts)
- [Prisma Schema](../../../services/planning-engine/prisma/schema.prisma)

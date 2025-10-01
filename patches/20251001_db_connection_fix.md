# Database Connection Fix - 2025-10-01

## Issue
normalize-service could not connect to PostgreSQL because it was using the wrong port:
- Expected: `postgresql://localhost:5432/athlete_normalize`
- Actual database port: `55432` (mapped from Docker container)
- Impact: 33 HRV messages queued in NATS, none processed

## Root Cause
No `.env` file existed in `services/normalize-service/` directory for local development. The service was running outside Docker but trying to use Docker-internal configuration.

## Fix Applied
Created `services/normalize-service/.env` file with correct local development configuration:

```env
DATABASE_URL=postgresql://athlete:athlete@localhost:55432/athlete_normalize
NATS_URL=nats://localhost:4223
NODE_ENV=development
PORT=4102
# ... other config ...
```

## Files Changed
- **Created**: `E:\vibe\athlete-ally-original\services\normalize-service\.env`
  - Set DATABASE_URL to use port 55432 (host-mapped PostgreSQL port)
  - Set NATS_URL to use port 4223 (host-mapped NATS port)

## Verification Results
✅ **Database Connection**: SUCCESS
- Service started without ECONNREFUSED errors
- Health check shows: `eventBus: "connected"`, `nats: "connected"`

✅ **Message Processing**: PARTIAL SUCCESS
- 5 HRV records successfully written to database
- Consumer processed messages: delivered=33, ackFloor=20
- Database records confirmed with proper data (userId, date, rmssd, lnRmssd)

⚠️ **Known Issue**: NATS iterator error
- Error: "NatsError: already yielding" in pull consumer loop
- This is a separate code bug in `services/normalize-service/src/index.ts` (line 199)
- Issue: Multiple concurrent iterations on the same pull subscription
- Does NOT affect database connection

## Database Validation
```sql
SELECT COUNT(*) FROM hrv_data;
-- Result: 5 rows

SELECT "userId", date, rmssd, "lnRmssd", "createdAt"
FROM hrv_data
ORDER BY "createdAt" DESC
LIMIT 5;
-- Shows 5 valid records with proper data
```

## Consumer Status
```json
{
  "consumer": "normalize-hrv-durable",
  "numPending": 0,
  "numAckPending": 0,
  "numRedelivered": 1,
  "delivered": { "consumer_seq": 33, "stream_seq": 33 },
  "ackFloor": { "consumer_seq": 28, "stream_seq": 20 }
}
```

## Recommendations
1. ✅ **COMPLETE**: Database connection fixed - proceed with E2E testing
2. ⚠️ **TODO**: Fix NATS iterator issue in normalize-service (separate task)
   - Problem: Lines 185-215 in `src/index.ts`
   - Solution: Use proper async iteration pattern for pull consumer
3. 📝 **DOCUMENTATION**: Add `.env.example` file to normalize-service for future developers

## Environment Variable Priority
For future reference:
1. Command-line export: `export DATABASE_URL=...`
2. `.env` file in service directory (services/normalize-service/.env) ← **Used here**
3. `.env` file in project root
4. Docker Compose environment section (for containerized services)
5. Source code defaults

## Success Criteria Met
- [x] normalize-service connects to database successfully
- [x] No "ECONNREFUSED" errors in logs
- [x] Messages processed from NATS queue
- [x] Database records inserted (hrv_data table)
- [x] Consumer shows messages acknowledged
- [ ] Full 33 messages processed (blocked by iterator issue)
- [ ] OTel metrics visible (metrics endpoint has connection issues)

## Next Steps
- Phase 7 can proceed with caution
- Monitor for database connection stability
- Address NATS iterator bug in separate hotfix

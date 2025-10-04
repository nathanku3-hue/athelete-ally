# Insights Engine (Readiness v1)

Endpoints
- GET /api/v1/readiness/:userId/latest → latest ReadinessRecord or { userId, incomplete: true }
- GET /api/v1/readiness/:userId?days=7 → array of ReadinessRecord (desc)

Contracts & Schemas
- ReadinessRecord in packages/contracts/openapi.yaml

Environment
- PORT=4103
- DATABASE_URL=postgresql://user:pass@localhost:5432/athlete_insights
- READINESS_CONSUMER_ENABLED=false
- PUBLISH_READINESS_EVENTS=false
- READINESS_FORMULA_VARIANT=baseline

Notes
- DB date is DATE (UTC). API returns dates as YYYYMMDD.
- Upsert is idempotent by (userId, date).

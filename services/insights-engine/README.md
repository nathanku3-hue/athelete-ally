# Insights Engine

- Port: 4103
- Env: `DATABASE_URL` must point to the DB with normalized `sleep_data` and `hrv_data`.

## Readiness API v1
- `GET /api/v1/readiness/:userId/latest`
  - Always `200`; returns a ReadinessRecord with `incomplete=true` when inputs are missing.
- `GET /api/v1/readiness/:userId?days=7`
  - Returns `ReadinessRecord[]` (descending by date).

ReadinessRecord fields: `userId`, `date` (YYYYMMDD), `score` (0..100), `incomplete` (boolean), optional `components` `{ sleepScore, hrvScore }`.

## Metrics
- `readiness_compute_total{result=success|incomplete|error}`
- `readiness_compute_duration_seconds` (histogram)
- `api_requests_total{route,status}`

## Tracing
- Span `readiness.compute` with attrs: `user_id_hash` (sha256 first 8), `date`, `result`.

## Smoke
- `node scripts/smoke-readiness.js` (seeds normalized rows when `DATABASE_URL` set) then calls both endpoints.

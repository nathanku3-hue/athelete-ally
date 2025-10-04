# Readiness API Runbook (Stream E)

Scope: services/insights-engine only. Provides baseline smoke steps and metrics interpretation for readiness v1.

Usage
- Start service: `npm run dev -w services/insights-engine` (Node 20.18.x)
- Endpoints:
  - `GET /api/v1/readiness/:userId/latest` → `{ userId, date?, score?, incomplete, components? }`
  - `GET /api/v1/readiness/:userId?days=7` → array sorted by `date` (DESC)
  - `GET /metrics` → Prometheus text format

Smoke Test
- Command: `node scripts/smoke-readiness.js --base http://localhost:4103 --user <id> --days 7 --out reports/readiness`
- Pass criteria:
  - latest returns 200 and contains either `score` (number) or `incomplete: true`
  - range returns 200 and an array in descending date order
- Output: `reports/readiness/<timestamp>.json` (not committed)

Metrics
- `http_requests_total{method,route,status}`: counts readiness route hits
- `readiness_compute_total{operation,status[,user]}`: compute attempts and results
- `readiness_compute_duration_seconds{operation,status}`: histogram for compute time
- Cardinality control: set `METRICS_INCLUDE_USER=true` to add hashed `user` label (12 hex chars). Default off.

Edge Cases & Behavior
- Date handling: UTC day boundaries via `startOfUtcDay()`; storage uses UTC dates
- Range days clamp: `1..31`; invalid/NaN defaults to `7`
- Missing inputs: marks `incomplete=true`; clamps scores to 0..100
- Errors: returns `{ error: 'internal_error' }` with 500; metrics label `status=error`

Troubleshooting
- No metrics: ensure `/metrics` reachable; confirm `prom-client` registered (default metrics present)
- High cardinality: keep `METRICS_INCLUDE_USER` off in prod; use only in dev for local triage
- DB unavailable: routes still return `incomplete` where possible; observe `status=error` increments


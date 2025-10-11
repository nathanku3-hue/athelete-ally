# Readiness v1 Troubleshooting Runbook

Symptoms
- 200 with incomplete=true for latest
- Empty array for range
- 5xx from endpoints

Checklist
- DB connectivity: DATABASE_URL reachable; service /health returns database=connected
- Source data presence: confirm entries in hrv_data and sleep_data for user/date (UTC). Missing inputs lead to incomplete=true.
- Date boundaries: inputs are stored as DATE (UTC). Ensure requests consider UTC day.
- Metrics: inspect /api/v1/metrics counters for api_requests_total{route,status} trends.
- Logs: look for readiness latest failed / readiness range failed errors.

Mitigations
- Backfill source data for target dates
- Recompute by hitting latest endpoint again (upsert is idempotent)
- If DB degraded, restart service and database; verify Prisma client connectivity

Escalation
- If repeated 5xx: capture logs and DB status; file an issue with request samples and timestamps.

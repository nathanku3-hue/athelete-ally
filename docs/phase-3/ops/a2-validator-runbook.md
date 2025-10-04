# A2 Grafana Validator Runbook

Purpose
- Provide a safe, non-blocking validation of key Grafana dashboards. When secrets are absent, the job clearly SKIPs and uploads no sensitive data.

Triggers
- Scheduled daily at 09:00 UTC
- Manual via workflow dispatch with inputs: `uids` (csv), `renderPNGs` (bool), `basePath` (optional), `rejectUnauthorized` (bool)

Secrets
- GRAFANA_URL: base URL (e.g., https://grafana.example.com)
- GRAFANA_TOKEN: API token with Dashboard read, and Render permissions if PNGs enabled

Outputs
- Artifact: JSON summary always; optional PNGs when renderPNGs=true and renderer available; retention 7 days
- Repo (optional/manual): You may commit selected summaries under `reports/a2-validator/` for historical records.

Behavior
- No secrets -> SKIP (log: NO_AUTH/MISSING_SECRETS) and exit 0
- 401/403 -> SKIP (NO_AUTH)
- Partial failures -> still exit 0 (non-blocking), summarize per-UID results

Local Dry Run
```
GRAFANA_URL=https://grafana.example.com \
GRAFANA_TOKEN=xxxxx \
node scripts/ops/grafana-validate.mjs --uids aa-sleep-norm --renderPNGs false --outDir a2-artifacts
```

Notes
- Supports optional self-signed TLS via `rejectUnauthorized=false` (use cautiously)
- Supports Grafana behind a base path via `basePath` input or `GRAFANA_BASE_PATH` env
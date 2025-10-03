# A2 Grafana Validator Runbook

- Purpose: Validate the Sleep Normalize dashboard on Grafana Cloud daily and on demand.
- Schedule: 09:00 UTC daily; manual dispatch allowed.
- Secrets: `GRAFANA_URL`, `GRAFANA_TOKEN` (read-only token). If secrets missing, workflow skips safely.
- Dashboard UID: `aa-sleep-norm` (override via `DASH_UID`).
- Time range: last 6h by default (`FROM=now-6h`, `TO=now`).
- Variables: `job=normalize`, `stream=AA_CORE_HOT`, `durable=normalize-sleep-durable`, `subject=athlete-ally.sleep.raw-received`.
- Outputs: `reports/grafana/a2_validator_summary.json` and optional `reports/grafana/*.png` renders (artifact, 7 days).

Local run:
```
GRAFANA_URL=... GRAFANA_TOKEN=... node scripts/ops/a2-validate-grafana.mjs
```
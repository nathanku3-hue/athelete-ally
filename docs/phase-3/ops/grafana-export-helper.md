# Grafana Export Helper

- Script: `scripts/ops/grafana-export.mjs`
- Purpose: Export dashboards by UID from Grafana to local JSON (for cloud?repo drift checks).
- Usage:
```
GRAFANA_URL=https://nkgss.grafana.net \
GRAFANA_TOKEN=*** \
node scripts/ops/grafana-export.mjs aa-sleep-norm
```
- Output: `monitoring/grafana/dashboards/exported/<uid>.json`
- Not wired into CI (manual utility).
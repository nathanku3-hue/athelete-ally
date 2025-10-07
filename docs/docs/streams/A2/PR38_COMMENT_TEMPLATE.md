# PR #38 — Sleep Observability (A2) Validation Update

- Window: last 6h (staging)
- Datasource: grafanacloud-nkgss-prom
- Variables: job=normalize (fallback normalize-service), stream=AA_CORE_HOT, durable=normalize-sleep-durable, subject=athlete-ally.sleep.raw-received
- Dashboard: Sleep Normalize Pipeline (uid=aa-sleep-norm)

Promtool summary:

```
$ promtool check rules monitoring/alert_rules.yml
SUCCESS: 3 rules found

$ promtool check rules monitoring/normalize-alerts.yml
SUCCESS: 4 rules found
```

Screenshots (UI uploads preferred):
- sleep-obs-01-variables.png (variables panel)
- sleep-obs-02-overview.png (overview)
- sleep-obs-03-dlq.png (DLQ)
- sleep-obs-04-alerts-group-inactive.png (or promtool OK snippet above)
- sleep-obs-05-alert-detail.png (if applicable)

Notes:
- If folders:read|write not granted, dashboard remains in General; validator will attempt move once perms are granted.
- Daily validator: `.github/workflows/a2-validate-grafana.yml` running at 09:00 UTC; failures will appear in Actions with details.

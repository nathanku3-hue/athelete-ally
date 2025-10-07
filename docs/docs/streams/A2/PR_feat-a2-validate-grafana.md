Title
chore(A2): add staging Grafana validator + daily cron (Sleep dashboard)

PR Body
Context

- Scope: A2 Sleep Observability (staging only). No service/runtime changes.
- Goal: Keep the Sleep Normalize Pipeline dashboard healthy and verifiable with automated, low-noise checks.

Whats Included

- scripts/ops/grafana-validate.mjs
    - Verifies dashboard uid=aa-sleep-norm exists, required variables present (job, stream, durable, subject), and renders one panel with variables applied.
    - Optional: when MOVE_TO_OBSERVABILITY=true and token has folders:read|write, attempts to move the dashboard into the Observability folder; warns and continues on 403.
- .github/workflows/a2-validate-grafana.yml
    - Runs daily at 09:00 UTC; also supports manual workflow_dispatch.
    - Validates monitoring/alert_rules.yml and monitoring/normalize-alerts.yml via promtool (skips with note if missing).
    - Calls grafana-validate.mjs against uid=aa-sleep-norm with variables:
        - job=normalize, stream=AA_CORE_HOT, durable=normalize-sleep-durable, subject=athlete-ally.sleep.raw-received
    - Manual toggle: workflow_dispatch input moveToObservability wires to env MOVE_TO_OBSERVABILITY for a one-off folder move.
    - Secrets: GRAFANA_URL and GRAFANA_TOKEN. If absent, the job logs [A2] SKIP and exits 0 (no CI noise).
- docs/runbook/sleep-troubleshooting.md
    - Adds Validation & Troubleshooting (A2 Sleep Observability) with how-to, secrets, manual run, failure signals, and evidence to attach to PRs.
- docs/streams/A2/PR38_COMMENT_TEMPLATE.md
    - Ready-to-paste PR comment template for attaching 5 screenshots and promtool OK proof.

Files Changed

- scripts/ops/grafana-validate.mjs
- .github/workflows/a2-validate-grafana.yml
- docs/runbook/sleep-troubleshooting.md
- docs/streams/A2/PR38_COMMENT_TEMPLATE.md

How To Use

- Repo secrets (staging):
    - GRAFANA_URL=https://nkgss.grafana.net
    - GRAFANA_TOKEN=token with dashboards:write, folders:read|write, datasources:read
- Manual run:
    - GitHub Actions  A2 Validate Grafana (Sleep)  Run workflow
    - Optional: check moveToObservability to attempt folder move (warns/continues if token lacks folder perms)
- Local (optional):
    - GRAFANA_URL/TOKEN exported; then run:
      node scripts/ops/grafana-validate.mjs

Behavior and Safety

- No hub edits; adds shard scripts/workflow/docs only.
- Non-blocking: workflow exits 0 when secrets are missing and logs a clear SKIP message.
- Dashboard state: only reads; optional folder move is guarded behind explicit toggle and perms.

Evidence

- Local promtool checks succeeded:
    - monitoring/alert_rules.yml  OK
    - monitoring/normalize-alerts.yml  OK
- Dashboard was previously imported and rendered in staging with variables set (PR #38 notes).

Rollout/Next Steps

- Add the two remaining screenshots to PR #38 via PR UI:
    - sleep-obs-01-variables.png
    - sleep-obs-04-alerts-group-inactive.png (or include promtool OK snippet)
- Optionally run the workflow with moveToObservability checked once folder perms are available.

Checklist

- [ ] Repo secrets added in Settings  Actions secrets and variables
- [ ] Manual workflow run succeeds (with/without move toggle)
- [ ] PR #38 updated with remaining screenshots
- [ ] Confirm job summary includes promtool and render checks
- [ ] (Optional) Move dashboard to Observability via the toggle

Refs

- A2 Sleep Observability: PR #38
- Validator workflow: .github/workflows/a2-validate-grafana.yml

Suggested squash commit message

chore(A2): add staging Grafana validator + daily cron (Sleep dashboard)

Add a daily GitHub Action and validation script for the Sleep Normalize Pipeline dashboard (uid=aa-sleep-norm). The job validates Prometheus alert rules (promtool), checks dashboard variables and renders a panel, and supports a manual toggle to move the dashboard to the Observability folder when perms allow. No service/runtime changes; skips cleanly when secrets are absent. Docs and PR comment template included.

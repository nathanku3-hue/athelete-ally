# Review Guide: Stream B (Observability + Ops)

Time: ~10–15 minutes total. Use PR-by-PR checks below.

What To Check First (all PRs)
- Scope: Shards-only (scripts/docs/workflows/reports); no hub edits; no runtime code.
- CI impact: New/edited workflows are non-blocking unless stated; validator SKIPs cleanly without secrets.
- Determinism: Dashboards index check is report-only; uploads artifacts on drift; does not write files.

A2 Validator PR (feat/a2-validate-grafana)
Files
- .github/workflows/a2-validate-grafana.yml
- scripts/ops/grafana-validate.mjs
- docs/phase-3/ops/a2-validator-runbook.md
- reports/a2-validator/a2-summary-*.json (SKIP example)
Verify
- Workflow: schedule 09:00 UTC + workflow_dispatch; Node 20; 7-day artifacts; SKIP on missing/401/403 auth.
- Inputs guarded: inputs used only on workflow_dispatch; schedule uses script defaults.
- Script: pure Node 20, no deps; inputs uids/renderPNGs/basePath/rejectUnauthorized; JSON summary; PNGs optional.
- Docs: clear inputs, SKIP behavior, artifact expectations.
Quick Run
- Manual dispatch without secrets -> SKIP summary JSON present.

Grafana Export Helper PR (chore/grafana-export-helper)
Files
- scripts/ops/grafana-export.mjs
Verify
- CLI: supports UIDs via args or file; default output to reports/grafana-export/YYYYMMDD/; optional --to-dashboards.
- Sanitization: strips id/version/folderId/meta/timestamps; filenames uid-kebab-title.json; no CI wiring.
Quick Run
- node scripts/ops/grafana-export.mjs --help (prints usage; exit 0).

NATS URL Scan PR (chore/nats-url-scan)
Files
- scripts/ops/scan-nats-urls.mjs
- reports/nats_url_scan.json
- reports/nats_url_scan.md
Verify
- Scope: scans code+config+.env*+workflows; excludes node_modules/dist/build/.git; redacts creds.
- Patterns: nats://, tls://, ws/wss; ports 4222/4223; tiers prod/non-prod/unknown (+ optional allowlist at config/prod-hosts.txt).
- Reports: JSON + MD; no other code/config changes.
Quick Run
- node scripts/ops/scan-nats-urls.mjs (regenerates outputs locally).

ZeroConf + CI Hygiene PRs (chore/zero-conf-bootstrap, chore/ci-concurrency-hygiene)
Files
- package.json (scripts only)
- scripts/build-openapi.ts, build-alerts.ts, build-docs-index.ts, build-registry.ts (stubs)
- .github/workflows/*.yml (ci.yml, boundaries-check.yml, e2e/test/deploy if present)
- .github/workflows/dashboards-determinism.yml
- scripts/ops/check-grafana-index.mjs
- docs/phase-3/ops/branch-conflict-plan.md
Verify
- package.json: build:infra present; build:all chains build:infra && turbo run build; existing scripts retained.
- Stubs: run and exit 0; no hub writes.
- Workflows: use local eslint; npm ci precedes lint; add concurrency groups; boundaries uses boundaries-${{ github.ref }}.
- Determinism: dashboards-determinism.yml is non-blocking; check-grafana-index reads only; uploads artifacts.
Quick Run
- npm ci; npm run build:infra && npm run build:all (succeed; no hub edits)
- node scripts/ops/check-grafana-index.mjs (reports drift or OK; no writes)

Acceptance
GO when
- Shards-only changes; no runtime code edits.
- Validator SKIP path clean; artifacts appear when secrets exist.
- build:infra + build:all run locally; determinism workflow report-only.
- Workflows use local eslint and concurrency groups; no new CI blockers.
STOP when
- Determinism drift caused by PR; investigate before merging.
- Any workflow becomes blocking or modifies runtime behavior.
- PR#46 is red and the change could affect its scope.
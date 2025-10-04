# Branch Conflict Plan (Union Strategy)

Policy
- Never edit hub files (aggregated indexes)
- Only modify shards:
  - docs/streams/{A1,A2,B}/
  - openapi/{paths,components}/*.yaml
  - monitoring/alert_rules.d/*.yml
  - monitoring/grafana/dashboards/*.json
  - registry/*.json

Merge Strategy
- Prefer union merges for conflicting JSON/YAML fragments
- If hub drift occurs: run generators (build:openapi, build:alerts, build:docs, build:registry) locally; do not commit hubs unless PR has `allowhubedit`
- Rebase daily; keep PRs <= 400 LOC; crosslink instead of editing other streams

Hotspots
- package.json scripts: avoid changing runtime-facing scripts; only add build:infra
- Workflows: add concurrency groups; do not alter deploy semantics

Rollback
- Each PR contains patches/ under repo root for offline apply
- To revert, close draft PR and drop branch; no main changes performed
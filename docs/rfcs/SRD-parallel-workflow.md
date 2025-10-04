# SRD Parallel Workflow: Zero-Conflict By Construction

Status: Draft Owners: Core Platform Last Updated: YYYY-MM-DD

## Why

We eliminate PR merge conflicts by construction: humans only add append-only shards, bots compose
single-writer hub files deterministically. This reduces the collision surface to near-zero and
ensures main/integration stay green.

## Lock-Ins

- Single-writer hubs: generated only by integration workflow
- Append-only shards: docs, openapi fragments, alerts, dashboards, registry JSON
- Deterministic builders: canonical merge, ASCII key sort, stable formatting, de-dupe by `id`
- CI gates: block hub edits, enforce generators, duplicate-id checks, Prettier/EditorConfig, merge
  queue with autorebase
- Ownership: CODEOWNERS per shard path; labels by stream/domain

## Directory Layout

- docs/streams/{A1,A2,B}/ ? author docs/runbooks per stream
- openapi/{paths,components}/ ? OpenAPI fragments; `openapi.yaml` is generated
- monitoring/alert_rules.d/ ? rule groups; `monitoring/alert_rules.yml` is generated
- monitoring/grafana/dashboards/ ? one JSON per dashboard; index is generated
- registry/ ? JSON fragments; `registry.json` and `registry.ts` are generated

## ID Convention

- Format: `{stream}-{domain}-{slug}` (ASCII). Examples: `A1-docs-overview`, `A1-api-health`,
  `A1-alerts-api-latency`.
- Uniqueness enforced in pre-commit and CI.

## Local Workflow

- Create/modify shards only. Never edit hubs.
- Run: `npm ci` then `npm run build:all`.
- Validate: `npm run validate:ids` and `npm run format:check`.
- Do not commit hubs; pre-commit hooks will block it.

## CI & Merge Queue

- PRs: CI blocks hub edits (unless `allowhubedit` label set by maintainers); builds and validates
  hubs and fragments.
- Integration branch: Merge Queue merges PRs into `integration`; the `Integration Hub Commit`
  workflow regenerates hubs and commits as a single-writer bot change.
- Main: receives the merge-queue result only; history is linear with squash merges.

## Maintenance

- Daily rebase bot keeps PRs fresh.
- Reserved prefixes and shard filename guidance reduce accidental path/id collisions.

## Future Extensions

- Infra/Helm indexes, protobuf registry, SQL migrations catalog builders (same pattern).

## Engineer Quickstart

- Docs: `docs/streams/{YourStream}/<slug>__<optional sha>.md` with frontmatter `id`, `title`.
- OpenAPI: `openapi/paths/*.yaml` and `openapi/components/*.yaml` with `x-id` in fragments.
- Alerts: put unique `annotations.id` on each rule.
- Dashboards: tags contain `id:<your-id>`.
- Registry: each JSON fragment declares `id`.

## Commands

- `npm run build:all` ? regenerate hubs locally
- `npm run validate:ids` ? duplicate/format check
- `npm run format:check` ? Prettier

## Notes

- `.gitattributes` marks hubs `merge=ours` to avoid local merge noise.
- Windows devs: set `git config core.autocrlf false`.
\n### Linting CI stability\n- Use local ESLint via npm scripts (npm run lint:ci) to avoid npx version drift.\n- Compact formatter is provided by devDep eslint-formatter-compact and enabled in CI workflows.\n
### Dashboards Index (generated)
- A small generator builds `monitoring/grafana/dashboards/index.json` from `monitoring/grafana/dashboards/*.json` (excluding subfolders and `index.json`).
- Each entry: `file`, `title`, `uid`, `panelsCount` (leaf panels only), `checksumSha256` (raw file bytes).
- Stable sort: `uid` asc (empty last), then `title`, then `file`.
- Included in `build:all` and covered by the hub drift guard in CI. Use `npm run verify:dashboards-index` locally.
# Supply Chain Guardrails (Stream D)

This baseline adds non-blocking, auditable guardrails for supply chain security and license compliance without touching runtime code.

What runs (PRs + daily cron, artifacts retained 7 days):
- SBOM: CycloneDX for root and each workspace.
- Licenses: Report-only scan against an allowlist (JSON + Markdown summary).
- Secrets: Gitleaks report-only scan.
- Dependencies: Outdated/deprecated/peer-conflict summary.

Outputs (artifact-first):
- `reports/sbom/<date>/*.cdx.json`
- `reports/licenses/<date>/{root,workspace}.json` and `summary.md`
- `reports/deps/<date>/{root,workspace}.json` and `summary.md`

Job summaries (usability):
- SBOM: shows component counts per target.
- Licenses: highlights top non-allowlisted licenses and first offenders.
- Dependencies: lists Top 10 outdated by impact and deprecated count.
- Secrets: shows counts by rule and top files (redacted).

Local usage (optional):

```bash
# Install once if needed
npm ci

# SBOMs
node scripts/ops/gen-sbom.mjs

# License compliance
node scripts/ops/license-scan.mjs

# Dependency report
node scripts/ops/dep-report.mjs
```

Notes:
- Tools are invoked via `npx` with pinned versions in CI to avoid adding runtime deps.
- Scripts degrade gracefully if offline: they emit stub or partial reports rather than failing.
- Initial policy is report-only; future PRs can move disallowed licenses to a blocking gate once reviewed.

Secrets scanning config:
- `.gitleaks.toml` reduces noise in tests/fixtures, docs, and placeholders; action runs with `--config-path .gitleaks.toml`.

Allowlist policy (initial):
- Allow: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, MPL-2.0, EPL-2.0, CC0-1.0, Unlicense
- Warn: LGPL-2.1, LGPL-3.0 (manual review)
- Disallow (future blocking): AGPL-3.0, SSPL-1.0, GPL-2.0-only, GPL-3.0-only

CI Environment:
- Node 20.18.x via `actions/setup-node@v4`, npm cache enabled, `TZ=UTC`.
- All jobs `continue-on-error: true` and do not modify runtime code.

Next steps (optional):
- Add exceptions/overrides per package (license or secret scan) as needed.
- Consider exporting SBOMs to a registry or SCA system for cross-run diffing.
- Tighten license policy incrementally (introduce blocking on deny list) once reports are stable.

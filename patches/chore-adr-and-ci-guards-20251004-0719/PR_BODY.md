Title: docs(adr)+ci: add ADRs for deps and determinism; add nonblocking arch guards

Summary
- Introduces ADR-0001 (Dependency Governance) and ADR-0002 (Deterministic Generators).
- Adds two nonblocking CI jobs:
  - deps-consistency: syncpack report (list mismatches/semver lint).
  - verify-generated: re-runs generators, uploads drift patch if any.
- No runtime changes; report-only until the baseline stabilizes.

Why
- Prevent adhoc overrides and peer conflicts (Renovate + syncpack).
- Ensure all generators are byte-stable; convert principles to guardrails.

How to verify
- ADR docs render under docs/adr/.
- Workflow .github/workflows/arch-guards.yml appears in PR checks (report-only).
- Artifacts uploaded on generator drift (generated-diff.patch).

Next steps (after 12 green days)
- Flip verify-generated to blocking (remove continue-on-error and use git diff --exit-code).
- Add deps-consistency to blocking with project-owned rules.

Risks
- None; jobs are nonblocking and artifact-only.

Rollback
- Remove workflow file; no data migrations or runtime impacts.

Engineer Checklist
- [ ] Docs added: ADR0001, ADR0002 under docs/adr/
- [ ] CI workflow added: arch-guards.yml with two report-only jobs
- [ ] No runtime code touched; only docs/ci/scripts
- [ ] Node 20.18.x and npm ci used
- [ ] Artifacts uploaded on drift

Local Verify
- npm ci (or npm i --package-lock-only first to refresh lockfile)
- npm run deps:lint (expect non-zero on mismatches; CI treats as report-only)
- If generators exist: npm run build:infra && npm run build:dashboards-index (no file diffs)

Notes
- If npm ci fails in CI due to lockfile drift, it will not fail the overall build because the job has continue-on-error: true. To eliminate the warning, run npm i --package-lock-only and commit the updated package-lock.json.

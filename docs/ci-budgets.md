# CI Lint Budgets (Stream 3)

This repository enforces ESLint budgets with delta-only blocking on changed files. Baseline violations are recorded and reported, but never block.

Key principles:
- Baseline is the current repo state: `lint-budget.json` at repo root (generatedAt, exact tool versions, per-rule counts).
- Pull requests must not introduce any new ESLint violations in changed files. If they do, the ESLint Guardrails job fails.
- A quarterly reduction target of -10% is tracked via reporting; enforcement remains delta-only.
- Job Summary always prints: ESLint version, plugin versions, and a hash of `eslint.config.mjs` for auditability.

Workflows:
- `.github/workflows/eslint-guardrails.yml`
  - `baseline` (non-blocking): generates a fresh baseline report artifact for visibility.
  - `delta` (blocking): checks changed files against `lint-budget.json` and fails on new violations.
- Other workflows adopt the invariant: workspace-aware installs and build-before-lint/type-check.

Prisma enforcement:
- Each Prisma-enabled service must provide `prisma:generate`, `prebuild`, and `predev` scripts that run generate. CI verifies via `scripts/ci/prisma-enforce.mjs`.

Exemptions:
- Exemptions are discouraged. If needed, open an ADR describing scope/duration and attach justification. Prefer targeted rule fixes instead.

Operations:
- Updating the baseline requires an explicit decision and PR. Change `lint-budget.json` only when we decide to re-baseline (e.g., after a reduction cycle).
- Any tooling/version changes must pin exact versions and document in the PR.


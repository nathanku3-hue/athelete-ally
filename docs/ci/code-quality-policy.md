# Code Quality Policy: Two-Tier Linting Strategy

## Status
**Active** | **Effective:** 2025-10-11 | **Review:** 2025-12-31 (Extended)

## Context
After Stream 3 PR1 (Frontend ESLint Debt) successfully resolved ~52 `@typescript-eslint/no-explicit-any` warnings, we formalized our linting strategy to balance strict quality gates with practical technical debt management.

## Policy

### Tier 1: Changed-Files Linting (BLOCKING GATE ✅)
- **Workflow:** `.github/workflows/eslint-guardrails.yml` > `lint-changed-files` job
- **Enforcement:** `--max-warnings=0` (zero tolerance)
- **Scope:** Only files modified in PR
- **Rationale:** New/modified code must meet current standards
- **Status:** **BLOCKING** - PR cannot merge if this fails

### Tier 2: Full-Repo Linting (BASELINE REPORT-ONLY 📊)
- **Workflows:**
  - `.github/workflows/ci.yml` > `quality` job (line 123)
  - `.github/workflows/eslint-guardrails.yml` > `lint-baseline` job (line 296)
- **Enforcement:** `continue-on-error: true` (non-blocking)
- **Scope:** Entire codebase
- **Rationale:** Track technical debt trends without blocking PRs for untouched legacy code
- **Artifacts:** `baseline-lint.json` uploaded for historical tracking
- **Status:** **NON-BLOCKING** - Informational only

## Decision Rationale

### Why Baseline is Non-Blocking
1. **Pre-existing warnings in untouched code** (packages/shared/*, services/*, etc.)
2. **Legacy code cleanup** is tracked separately in technical debt backlog
3. **Avoid blocking productive PRs** that touch unrelated files
4. **Gradual improvement** via dedicated cleanup PRs (like Stream 3 PR1)

### Why Changed-Files Remains Blocking
1. **Prevents new technical debt** accumulation
2. **Enforces quality standards** for all new/modified code
3. **Fast feedback loop** (only lints changed files, not entire repo)
4. **Zero ambiguity** - `--max-warnings=0` is clear gate

## Revert Plan (2025-12-31)

**Trigger Conditions** for re-evaluating baseline enforcement:
1. **Baseline warnings < 50** across entire repo
2. **All P1 Reliability items** completed (Jest standardization, dist exports)
3. **No critical technical debt** PRs in flight

**Current Status (2025-10-11):**
- Baseline warnings: ~895 (far exceeds 50 threshold)
- P1 Reliability items: In progress
- **Decision:** Extend report-only status to 2025-12-31

**If triggers met by 2025-12-31:**
- Consider making baseline lint blocking again
- OR maintain report-only status permanently with quarterly reviews

**If triggers NOT met:**
- Extend report-only status to 2026-03-31
- Create dedicated technical debt cleanup sprint

## Monitoring

### Weekly
- Review `baseline-lint.json` artifacts for trend analysis
- Track warning count decrease from cleanup PRs

### Before 2025-10-17
- Generate summary report of baseline lint trends
- Assess feasibility of making baseline blocking
- Update this policy with decision

## Related Documents
- Stream 3 PR1: Frontend ESLint Debt Resolution
- Reliability Focus Brief: Stream 1 P1 Items
- `eslint.config.unified.mjs`: Unified ESLint configuration

## Contacts
- **Policy Owner:** Engineering Lead
- **Questions:** See `.github/workflows/eslint-guardrails.yml` comments

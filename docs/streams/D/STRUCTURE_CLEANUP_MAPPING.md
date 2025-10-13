# Stream D: Structure Cleanup Mapping

**Status:** Planning Phase
**Date:** 2025-10-14
**Scope:** Root directory documentation reorganization

## Objective

Clean up scattered documentation in root directory by moving temporary, session, and tracking documents into organized `docs/` structure.

## Protected Areas (DO NOT TOUCH)

### Root Files
- `README.md` - Standard root readme (KEEP)
- `LICENSE` - Legal requirement (KEEP if exists)
- `CONTRIBUTING.md` - Standard (KEEP if exists)

### Stream Documentation
- `docs/streams/A1/`, `A2/`, `streamA/` - Stream A (PROTECTED)
- `docs/streams/B/` - Stream B (PROTECTED)
- `docs/streams/stream3/` - Stream 3/C (PROTECTED)
- `docs/streams/Stream2/` - Stream 2 (PROTECTED)

### Service/Package/App Local Docs
- All `{service}/README.md` - Standard locations (KEEP)
- All `{package}/README.md` - Standard locations (KEEP)
- All `{service}/docs/*` - Service-specific docs (KEEP)
- All test directories with local READMEs (KEEP)

---

## Proposed Moves

### Category 1: Session/Handoff Documents → `docs/archive/sessions/`

| Current Path | New Path | Rationale |
|-------------|----------|-----------|
| `HANDOFF_REPORT.md` | `docs/archive/sessions/HANDOFF_REPORT.md` | Temporary session handoff |
| `MISSION_BRIEF.md` | `docs/archive/sessions/MISSION_BRIEF.md` | Session brief |
| `AGENTS.md` | `docs/archive/sessions/AGENTS.md` | Session agent config |
| `POST_MERGE_IMPLEMENTATION_SUMMARY.md` | `docs/archive/sessions/POST_MERGE_IMPLEMENTATION_SUMMARY.md` | Session summary |
| `POST_MERGE_TEST_RESULTS.md` | `docs/archive/sessions/POST_MERGE_TEST_RESULTS.md` | Session test results |
| `SMOKE_TEST_RESULTS.md` | `docs/archive/sessions/SMOKE_TEST_RESULTS.md` | Session test results |
| `PHASE3_WRAPUP_STATUS.md` | `docs/archive/sessions/PHASE3_WRAPUP_STATUS.md` | Phase 3 session status |

### Category 2: Issue/Bug Tracking → `docs/issues/`

| Current Path | New Path | Rationale |
|-------------|----------|-----------|
| `BUG_INGEST_PORT_MISMATCH.md` | `docs/issues/BUG_INGEST_PORT_MISMATCH.md` | Bug tracking doc |
| `ESLINT_HOTFIX_STATUS.md` | `docs/issues/ESLINT_HOTFIX_STATUS.md` | Hotfix tracking |
| `ci-issue-stream2-jest.md` | `docs/issues/ci-issue-stream2-jest.md` | CI issue tracking |
| `DIST_ARTIFACTS_FIX.md` | `docs/issues/DIST_ARTIFACTS_FIX.md` | Fix tracking |

### Category 3: CI/Reliability Tracking → `docs/ci/tracking/`

| Current Path | New Path | Rationale |
|-------------|----------|-----------|
| `CI_EXCEPTIONS_TRACKING.md` | `docs/ci/tracking/CI_EXCEPTIONS_TRACKING.md` | CI exceptions log |

### Category 4: PR Drafts/Templates → `docs/archive/pr-drafts/`

| Current Path | New Path | Rationale |
|-------------|----------|-----------|
| `PR_DESCRIPTION_integration_merge_batch.md` | `docs/archive/pr-drafts/PR_DESCRIPTION_integration_merge_batch.md` | Historical PR draft |
| `PR_DESCRIPTION_stream4_boundaries_jest.md` | `docs/archive/pr-drafts/PR_DESCRIPTION_stream4_boundaries_jest.md` | Historical PR draft |
| `PR_DESCRIPTION_training_philosophy_removal.md` | `docs/archive/pr-drafts/PR_DESCRIPTION_training_philosophy_removal.md` | Historical PR draft |

### Category 5: Planning/Backlog → `docs/planning/`

| Current Path | New Path | Rationale |
|-------------|----------|-----------|
| `BACKLOG_TICKETS.md` | `docs/planning/BACKLOG_TICKETS.md` | Product backlog tracking |

### Category 6: Active Session Files (DEFER)

| Current Path | Action | Rationale |
|-------------|--------|-----------|
| `AUTONOMOUS_TODO.md` | DEFER - Active session file | Currently in use by Stream D |

---

## Out of Scope

### Service-Level Documentation (Already Organized)
- `services/planning-engine/docs/*` - Service-specific docs (KEEP IN PLACE)
- `services/planning-engine/README.md` - Standard service readme (KEEP)
- `services/planning-engine/JEST_CONFIG.md` - Service-specific config docs (KEEP)
- `services/planning-engine/elk/README.md` - ELK stack docs (KEEP)
- `services/planning-engine/security/*` - Security docs (KEEP)
- `services/normalize-service/INTEGRATION_TESTS.md` - Service-specific tests (KEEP)

### Package-Level Documentation (Already Organized)
- `packages/*/README.md` - Standard package readmes (KEEP)
- `packages/protocol-types/docs/architecture.md` - Package-specific arch docs (KEEP)
- `packages/shared-types/CHANGELOG.md` - Standard changelog (KEEP)

### App-Level Documentation (Already Organized)
- `apps/frontend/tests/e2e/README.md` - Test-specific readme (KEEP)
- `apps/frontend/tests/manual/regression-test-script.md` - Test scripts (KEEP)

---

## Implementation Plan

### Phase 1: Root Directory Cleanup (H1)
**Batch 1A:** Session/Archive Docs (7 files, ~50 LOC)
- Create `docs/archive/sessions/`
- Move 7 session documents
- Commit: `docs(streamD): archive session handoff documents`

**Batch 1B:** Issue Tracking (4 files, ~40 LOC)
- Create `docs/issues/`
- Move 4 issue tracking documents
- Commit: `docs(streamD): consolidate issue tracking documents`

**Batch 1C:** CI Tracking (1 file, ~20 LOC)
- Create `docs/ci/tracking/`
- Move CI_EXCEPTIONS_TRACKING.md
- Commit: `docs(streamD): move CI tracking to docs/ci/tracking`

**Batch 1D:** PR Drafts (3 files, ~30 LOC)
- Create `docs/archive/pr-drafts/`
- Move 3 PR description documents
- Commit: `docs(streamD): archive historical PR drafts`

**Batch 1E:** Planning Docs (1 file, ~15 LOC)
- Create `docs/planning/`
- Move BACKLOG_TICKETS.md
- Commit: `docs(streamD): move backlog to docs/planning`

### Phase 2: Reference Updates (H5)
- Search for any hardcoded references to moved files
- Update references in CI configs, documentation, scripts
- Commit per reference group

### Phase 3: Verification (H6)
- Run full lint: `npm run lint`
- Run full build: `npm run build`
- Verify all tests pass: `npm test`
- Generate final mapping log

---

## Rollback Strategy

Each batch is independent and can be rolled back via:
```bash
git revert <commit-hash>
```

Or manual restoration from git history.

---

## Success Criteria

1. ✅ Root directory contains ≤5 .md files (README.md + max 4 others)
2. ✅ All moved files are accessible in new locations
3. ✅ No broken references in codebase
4. ✅ CI passes without errors
5. ✅ All PRs ≤200 LOC
6. ✅ Complete mapping log generated

---

## Notes

- **Conservative approach:** Only touching root-level clutter, not reorganizing service/package docs
- **Atomic commits:** Each batch is independently revertible
- **Stream isolation:** No modifications to protected stream directories
- **Standard preservation:** All standard file locations (README, CHANGELOG, etc.) preserved

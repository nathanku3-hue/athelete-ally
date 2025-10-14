# Stream D: Final Root Directory Cleanup Plan

**Status:** PLANNING - AWAITING APPROVAL
**Date:** 2025-10-14
**Branch:** streamD/final-cleanup (to be created)
**Standard:** Industry best practices for TypeScript monorepos (Turborepo/Nx patterns)

---

## Objective

Apply industry-standard monorepo root directory organization to achieve:
- **Clean separation:** Config vs. code vs. generated artifacts
- **Gitignore compliance:** No tracked files that should be ignored
- **Logical grouping:** Related configs/scripts consolidated
- **Minimal root:** Only essential top-level items

---

## Industry Standard Root Structure

```
├── .github/           # CI/CD workflows, actions
├── apps/              # Application workspaces
├── services/          # Service workspaces
├── packages/          # Shared package workspaces
├── config/            # Shared configs (typescript, jest, eslint)
├── docs/              # Documentation
├── scripts/           # Build/dev scripts
├── infrastructure/    # IaC, deployment configs
├── .gitignore         # Git ignore rules
├── package.json       # Root package manifest
├── tsconfig.base.json # Base TypeScript config
├── turbo.json         # Turborepo config
├── README.md          # Project readme
└── [essential configs only]
```

---

## Cleanup Categories

### Category 1: DELETE - Tracked files that should be .gitignored ✅

**Temporary/Generated Files (15 files):**
```
❌ ingest.err.log         # Service log (gitignored)
❌ ingest.log             # Service log (gitignored)
❌ ingest.out.log         # Service log (gitignored)
❌ normalize.log          # Service log (gitignored)
❌ PATCH_TMP.patch        # Empty temp file
❌ session_log.json       # Temp session file
❌ tmp_codemod.json       # Temp codemod artifact
❌ tmp_codemod_apply.json # Temp codemod artifact
❌ tsconfig.tsbuildinfo   # Build cache (gitignored)
❌ boundaries-report.json # Generated report
❌ config-debug.json      # Debug artifact
❌ eslint.config.mjs.bak  # Backup file
❌ eslint-config-artifacts.json # Generated artifact
❌ health-test-results.json # Test result artifact
```

**Generated Folders (5 folders):**
```
❌ coverage/              # Test coverage (gitignored)
❌ test-results/          # Test results (gitignored)
❌ smoke-results/         # Smoke test results (gitignored)
❌ tmp/                   # Temporary files (gitignored)
❌ reports/               # Generated reports (gitignored)
```

**Rationale:** These are already in .gitignore but accidentally tracked. Should be removed from git.

---

### Category 2: CONSOLIDATE - Move to logical parent directories

**A. CI/CD Files → `.github/ci/`**
```
📁 ci/boundaries-allowlist.json       → .github/ci/boundaries-allowlist.json
📁 ci/boundaries-baseline.json        → .github/ci/boundaries-baseline.json
📁 ci/console-allowlist.json          → .github/ci/console-allowlist.json
📁 lint-budget.json                   → .github/ci/lint-budget.json
```

**B. Docker Compose Files → `docker/compose/`**
```
📁 docker-compose/ci.yml              → docker/compose/ci.yml
📁 docker-compose/ci-minimal.yml      → docker/compose/ci-minimal.yml
📁 docker-compose/ci-standalone.yml   → docker/compose/ci-standalone.yml
📁 docker-compose/preview.yml         → docker/compose/preview.yml
📂 docker-compose.yml                 → docker/compose/main.yml
```
Keep symlink or script wrapper at root if teams rely on `docker-compose.yml` location.

**C. Monitoring → `infrastructure/monitoring/`**
```
📁 monitoring/                        → infrastructure/monitoring/
📁 observability/                     → infrastructure/observability/
```
Or consolidate both into `infrastructure/monitoring/` if they overlap.

**D. Test Root → Investigate/Remove**
```
📁 src/__tests__/                     → Investigate (unusual for monorepo root)
```
Likely leftover from migration. Should be under a specific package/service.

**E. Environment Examples → `docs/examples/`**
```
📂 env.ci.example                     → docs/examples/env.ci.example
📂 env.development.example            → docs/examples/env.development.example
📂 env.example                        → KEEP (root .env.example is standard)
```

**Rationale:**
- Industry standard: CI configs in `.github/`, docker in `docker/`, infrastructure separate
- Reduces root clutter while maintaining accessibility
- `.env.example` in root is industry standard, others are reference docs

---

### Category 3: REVIEW - Generated Hub Files

**OpenAPI Hub (if generated):**
```
⚠️ openapi.yaml                       # Check if generated from openapi/ shards
```
- **If generated:** Add to .gitignore, document generator usage
- **If hand-maintained:** Keep but add comment explaining relationship to shards

**Registry Hub (if generated):**
```
⚠️ registry.json                      # Check if generated from registry/ shards
⚠️ registry.ts                        # Check if generated from registry/ shards
```
- **If generated:** Add to .gitignore, document generator usage
- **If hand-maintained:** Keep

**Action:** Need to verify with scripts/build-openapi.ts and scripts/build-registry.ts

---

### Category 4: KEEP - Industry Standard Root Files ✅

**Package Management:**
- ✅ package.json, package-lock.json, .npmrc

**Git Configuration:**
- ✅ .gitignore, .gitattributes, .git/, .github/, .githooks/, .husky/

**Language/Runtime:**
- ✅ tsconfig.base.json, tsconfig.json, .nvmrc

**Code Quality:**
- ✅ eslint.config.mjs, eslint.config.unified.mjs
- ✅ .prettierrc.json, .prettierignore
- ✅ .lintstagedrc.js
- ✅ .editorconfig

**Build/Deploy:**
- ✅ turbo.json, Dockerfile, .dockerignore

**Testing:**
- ✅ jest.config.js (if passthrough to jest/)
- ✅ playwright.config.ts

**Security/Validation:**
- ✅ .gitleaks.toml, .spectral.yaml, .actionlint.yml, .geminirc.yaml

**Dependency Management:**
- ✅ renovate.json

**Documentation:**
- ✅ README.md
- ✅ AUTONOMOUS_TODO.md (active session file - keep for now)

**Monorepo Structure:**
- ✅ apps/, services/, packages/

**Operational Directories:**
- ✅ config/ (shared TypeScript, Jest configs)
- ✅ jest/ (shared Jest configs)
- ✅ scripts/ (build/dev scripts)
- ✅ templates/ (code templates)
- ✅ registry/ (operational registry)
- ✅ infrastructure/ (IaC)
- ✅ docker/ (Docker configs)
- ✅ openapi/ (OpenAPI shards)
- ✅ prisma/ (Prisma schema if shared)
- ✅ patches/ (operational patches for dependencies)

---

## Implementation Phases

### Phase 1: DELETE - Remove Tracked Gitignored Files (Batch 1A)
**Files:** 15 temporary files + 5 folders
**Safety:** All in .gitignore, can be regenerated
**Commands:**
```bash
git rm --cached ingest.*.log normalize.log PATCH_TMP.patch session_log.json \
  tmp_codemod*.json tsconfig.tsbuildinfo boundaries-report.json \
  config-debug.json eslint.config.mjs.bak eslint-config-artifacts.json \
  health-test-results.json

git rm -r --cached coverage/ test-results/ smoke-results/ tmp/ reports/
```

**Commit:** `chore(streamD): remove tracked files that are .gitignored`

---

### Phase 2: VERIFY - Check Generated Hub Files (Batch 2A)
**Investigation needed:**
1. Check if `openapi.yaml` is generated: `npm run build:openapi`
2. Check if `registry.json/ts` are generated: `npm run build:registry`
3. If generated → add to .gitignore
4. If hand-maintained → document in README

**No commits yet** - need verification first

---

### Phase 3: CONSOLIDATE - CI Configs (Batch 3A)
**Files:** 4 CI config files
**Target:** `.github/ci/`
**Commands:**
```bash
mkdir -p .github/ci
git mv ci/boundaries-allowlist.json .github/ci/
git mv ci/boundaries-baseline.json .github/ci/
git mv ci/console-allowlist.json .github/ci/
git mv lint-budget.json .github/ci/
rmdir ci/  # if empty after move
```

**Update references:** Search and update paths in:
- `.github/workflows/*.yml`
- `scripts/*.ts`

**Commit:** `refactor(streamD): consolidate CI configs into .github/ci/`

---

### Phase 4: CONSOLIDATE - Docker Compose (Batch 4A)
**Files:** 5 docker-compose files
**Target:** `docker/compose/`
**Commands:**
```bash
mkdir -p docker/compose
git mv docker-compose/*.yml docker/compose/
git mv docker-compose.yml docker/compose/main.yml
rmdir docker-compose/

# Create convenience symlink (optional)
ln -s docker/compose/main.yml docker-compose.yml
```

**Update references:** Search and update in:
- `.github/workflows/*.yml`
- `scripts/`
- `README.md`

**Commit:** `refactor(streamD): consolidate docker-compose files into docker/compose/`

---

### Phase 5: CONSOLIDATE - Infrastructure (Batch 5A)
**Decision needed:** Merge `monitoring/` + `observability/` or keep separate?

**Option A - Merge:**
```bash
git mv monitoring/ infrastructure/monitoring/
git mv observability/ infrastructure/observability/
```

**Option B - Keep Separate:** No action

**Commit:** `refactor(streamD): move monitoring to infrastructure/`

---

### Phase 6: CONSOLIDATE - Env Examples (Batch 6A)
**Files:** 2 env example files (keep root .env.example)
**Commands:**
```bash
mkdir -p docs/examples
git mv env.ci.example docs/examples/
git mv env.development.example docs/examples/
```

**Update references:** Search and update in:
- `README.md`
- `docs/getting-started/`

**Commit:** `docs(streamD): move additional env examples to docs/examples/`

---

### Phase 7: INVESTIGATE - Root src/ (Batch 7A)
**Action:**
1. Verify `src/__tests__/` contents
2. If leftover: Move tests to appropriate package/service
3. If active: Document purpose in README

**Commit:** TBD based on findings

---

### Phase 8: UPDATE - .gitignore Additions (Batch 8A)
**Add to .gitignore if generated:**
```
# Generated hub files (if auto-generated from shards)
/openapi.yaml
/registry.json
/registry.ts

# Already present but ensure these patterns exist:
*.log
*.tsbuildinfo
coverage/
test-results/
smoke-results/
tmp/
reports/
```

**Commit:** `chore(streamD): ensure .gitignore covers all generated artifacts`

---

### Phase 9: DOCUMENTATION (Batch 9A)
**Update README.md with:**
- Root directory structure explanation
- Build script documentation (`npm run build:openapi`, etc.)
- Link to docs/streams/D/ for cleanup history

**Commit:** `docs(streamD): document root directory organization`

---

## Rollback Strategy

Each phase is independent and can be rolled back via:
```bash
git revert <commit-hash>
```

Or selective restoration:
```bash
git checkout HEAD~1 -- path/to/file
```

---

## Success Criteria

### Before (Current State)
- **Root files:** ~40 files
- **Root directories:** ~29 directories
- **Tracked but gitignored:** 20+ files/folders
- **CI configs:** Scattered (ci/, root, .github/)
- **Docker configs:** Split (docker/, docker-compose/, root)

### After (Target State)
- **Root files:** ~20 essential config files
- **Root directories:** ~15 logical directories
- **Tracked but gitignored:** 0 files/folders
- **CI configs:** Consolidated in `.github/ci/`
- **Docker configs:** Consolidated in `docker/compose/`
- **Monitoring:** Under `infrastructure/`
- **Env examples:** In `docs/examples/`

### Metrics
- ✅ Root file reduction: ~50%
- ✅ Root directory reduction: ~48%
- ✅ Zero tracked+gitignored files
- ✅ Logical grouping achieved
- ✅ CI passes (lint, build, test)
- ✅ No broken references

---

## Risks & Mitigations

### Risk 1: Breaking CI Workflows
**Mitigation:**
- Search all .github/workflows/*.yml for path references
- Update atomically in same commit as move
- Test locally with `act` if possible

### Risk 2: Breaking Developer Scripts
**Mitigation:**
- Search scripts/ for hard-coded paths
- Update in same commit
- Add symlinks for critical paths if needed

### Risk 3: Team Disruption
**Mitigation:**
- Clear documentation of changes
- Communicate in PR description
- Provide migration guide

### Risk 4: Docker Compose Location Change
**Mitigation:**
- Keep symlink at root: `docker-compose.yml` → `docker/compose/main.yml`
- Or update docs + team communication

---

## Questions for Approval

1. **Docker Compose:** Keep `docker-compose.yml` at root (symlink) or require `docker/compose/main.yml`?

2. **Monitoring/Observability:** Merge into `infrastructure/` or keep separate at root level?

3. **Generated Hubs (openapi.yaml, registry.*):** Should we verify they're generated and gitignore them?

4. **Root src/:** Should we investigate and move, or is this intentional?

5. **Env examples:** Move `env.ci.example` and `env.development.example` to docs/examples/?

6. **Phasing:** Execute all phases in one session, or split into multiple PRs?

---

## Approval Required

**Please confirm:**
- ✅ Category 1 (DELETE tracked+gitignored files) - Proceed?
- ✅ Category 2 (CONSOLIDATE) - Which options for docker-compose, monitoring?
- ✅ Category 3 (REVIEW generated hubs) - Investigate first?
- ✅ Phasing strategy - Single PR or multiple PRs?

**Reply with:**
- "Approve all with Option X for docker-compose, Option Y for monitoring"
- Or specific modifications to the plan

---

## Next Steps After Approval

1. Create branch: `streamD/final-cleanup`
2. Execute phases sequentially with verification between each
3. Update all references atomically
4. Run full CI suite: `npm run lint && npm run build && npm test`
5. Create PR with detailed migration guide
6. Document in `docs/streams/D/FINAL_CLEANUP_SUMMARY.md`

# ZeroConf Infra + CI Hygiene (Option 2C) — Final

This change set unifies infra build steps, replaces `npx eslint` with local runner, and adds safe job-level concurrency for heavy flows without altering runtime behavior.

What changed
- package.json: ensured `build:infra` and `build:all` chain; kept `preinstall`, `prepare`, `lint:ci`.
- ESLint: pinned local eslint + plugins; flat-config wired import rules.
- Workflows: preserved boundaries checks and switched boundary group id to `boundaries-${{ github.ref }}`; left other flows intact where already healthy.
- Docs: this file; patches emitted for offline apply.

Why
- Remove npx drift; ensure deterministic local tooling.
- Avoid duplicate/competing runs for e2e/test/deploy (cancel-in-progress).
- Keep boundaries enforcement stable and explicit.

Validation Steps
1) Install and bootstrap
   - npm ci
   - node -v should satisfy engines; preinstall gate must pass.
2) Infra pipeline
   - npm run build:infra
   - npm run build:all  # should internally run build:infra then turbo
3) Lint and types
   - npm run lint:ci
   - npm run type-check  (if present)
4) Determinism (dashboards index)
   - npm run verify:dashboards-index  # exits 0 with no diff
5) Hub drift (local check similar to CI)
   - npm run build:all
   - Verify `ci.yml` “Verify Hubs Match” step logic: no hub diffs after build.
6) Workflows sanity (static)
   - Boundaries concurrency group equals `boundaries-${{ github.ref }}` and job runs `npm ci` before lint.
   - Concurrency present for deploy/test/e2e jobs where added, with `cancel-in-progress: true`.

Stop/Go Gates
- STOP if: hub/index drift appears, or CI red attributable to these changes; package patches and mark Blocked.
- GO when: CI green (or unrelated red), deterministic checks clean.

Roll Back
- Revert commits in branch `chore/ci-zero-conf-option2c` or `git revert` each commit.
- Patches are available under `patches/` for offline apply.

Notes
- Frontend guard: only introduce guards when workflows explicitly operate on `apps/frontend` (not added elsewhere).
- A2 validator remains unaffected; skips cleanly when secrets are absent.

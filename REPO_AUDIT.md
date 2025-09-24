# REPO_AUDIT.md

Timestamp: 2025-09-23 12:55:24 +08:00
Branch   : feature/autonomous-hardening-20250923

## Summary
- Monorepo (npm workspaces + Turbo). Package manager: npm@10.9.3
- Node requirement: 20.18.0
- Frontend present: True; BFF present: True
- Dockerfile monorepo-aware: True

## Top-level Directories
- .git
- .githooks
- .github
- .turbo
- apps
- coverage
- docs
- infrastructure
- monitoring
- packages
- prisma
- reports
- scripts
- services
- src
- test-results
- tmp_autonomous_patches


## Workflows (.github/workflows)
- actionlint.yml
- alpha-smoke.yml
- backend-deploy.yml
- branch-protection.yml
- ci-diagnostics.yml
- ci.yml
- deploy.yml
- v3-test-first.yml


## Workspaces (package.json)
- apps/*
- services/*
- packages/*


## Notable Findings
- deploy.yml enforces Node 20 + npm ci and GHCR permissions.
- Docker step structure shows a misplaced/empty Buildx step (will fix).
- Some workflows still use Node 18 / older actions.
- Frontend Next.js standalone build expected at apps/frontend/.next/standalone.

## Next (Planned Small Steps)
1) Fix Buildx step in deploy.yml (structural).
2) Align Node 20 + npm ci across workflows (backend-deploy, v3-test-first).
3) Bump upload-artifact to v4 (and optionally codecov to v4).
4) Add/verify /api/health for container HEALTHCHECK.
5) Keep HANDOFF_REPORT.md updated and emit patch.

# RFC: Monorepo Tooling Upgrade (Turbo-first, Nx evaluation)

Author: Platform | Date: 2025-09-29 | Status: Draft

## Problem Statement

Phase 3 exposed recurring issues not in app design, but in dev/CI architecture:
- Tsconfig drift across services/packages
- Prisma engine download fragility and inconsistent generation
- Relative-path CI scripts and context-sensitive failures
- Lint rule conflicts around optional runtime fallbacks

These are symptoms of managing a complex monorepo with manual, duplicated configs.

## Goals
- Centralize config and task orchestration so standards are enforced, not suggested
- Deterministic CI: resilient generation, absolute paths, required guards
- Developer ergonomics: one-liners for common tasks, consistent scaffolding

## Non-goals
- Rewriting service code or runtime architecture
- Mandating tool migration before Phase 3 feature completion

## Proposal

Short-term (now):
- Lean into Turborepo we already use
  - Define explicit pipelines (lint → type-check → build → test) in 
  - Make , , ,  required checks
  - Add CI guards: tsconfig drift, actionlint, Prisma generate wrapper
- Golden path templates: new service skeleton with standard tsconfig, prisma, health, metrics, telemetry fallback

Mid-term (30 days):
- Enable remote caching in CI for Turbo; measure cache hit rates
- Finalize Prisma generation wrapper + caches + mirror secrets
- Add per-package task aliases to reduce local footguns

Long-term (60 days):
- Evaluate Nx vs continued Turbo investment
  - Nx generators, enforced project graph, affected targets, plugins
  - Migration cost vs benefits relative to current Turbo baseline
- Decide and execute (either adopt Nx or standardize further on Turbo with templates/composite actions)

## Risks
- Partial adoption causing new drift (mitigate via CI guard + docs + templates)
- Tooling migration fatigue (mitigate by scoping and keeping developer UX front-and-center)

## Rollout & Ownership
- Platform owns RFC implementation; feature teams unaffected except for consistent scripts
- Branch protection update to add the new required checks after landing guards

## Success Metrics
- CI flake rate down; build times stable or improved with caching
- New services comply without manual changes
- Fewer PRs blocked by path/tsconfig/prisma/lint issues


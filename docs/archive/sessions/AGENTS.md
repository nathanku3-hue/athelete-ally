# Repository Guidelines

## Project Structure & Module Organization
- Monorepo using npm workspaces and turbo; Node 20.18.0 + npm 10.x.
- Apps: apps/frontend (Next.js), apps/gateway-bff.
- Services: services/* (back-end services).
- Packages: reusable libs under packages/* (e.g., logger, health-schema, shared, event-bus, shared-types).
- Scripts & CI: scripts/**, .github/workflows/**, TypeScript base in config/typescript/.
- Logging: In packages/** use @athlete-ally/logger; console.* is disallowed (ESLint). Exception: types-only packages (e.g., shared-types) may use console with explicit eslint-disable comments.

## Build, Test, and Development Commands
- Install: npm ci --workspaces --include-workspace-root
- Build all: npm run build (packages then frontend)
- Type check: npm run type-check:all
- Lint: npm run lint:all or scoped (e.g., npx eslint packages --config eslint.config.unified.mjs)
- Tests: npm run test (Jest); coverage: npm run test:coverage; Playwright: npm run e2e:pw
- Console scan (packages): npx tsx scripts/scan-console-packages.ts

## Coding Style & Naming Conventions
- TypeScript, 2-space indent, LF endings (.editorconfig). Prettier enforced (.prettierrc).
- ESLint flat config: eslint.config.unified.mjs.
- Naming: types/interfaces PascalCase, variables/functions camelCase, files kebab-case.ts.
- No console.* in packages/**; use createLogger(adapter, { module, service }) from @athlete-ally/logger.

## Testing Guidelines
- Frameworks: Jest (+ jsdom), ts-jest present; Playwright for E2E.
- Locations/patterns: **/__tests__/**, *.test.ts[x], *.spec.ts[x].
- Keep unit tests near code; integration/e2e under app/service specific folders.
- Aim to cover new/changed code paths; run npm run test:ci locally before PRs.

## Commit & Pull Request Guidelines
- Conventional Commits: feat:, fix:, chore:, refactor:, with scoped examples like fix(stream2): restore noUnusedLocals.
- PRs: clear description, link issues, include screenshots for UI, note migrations/CI guard impacts.
- CI must be green; do not weaken ESLint rules. Frontend/services linting is gated by changed-files filters.

## Security & Configuration Tips
- Never commit secrets; use .env.example. Avoid logging sensitive data.
- Stick to Node 20.18.0 (nvm use 20.18.0); avoid npm 11 to prevent lockfile churn.
- When adding packages, keep tsconfig clean (no stray paths that pull source from other packages).

## Architectural Decisions
- See docs/rfcs/ for Architecture Decision Records (ADRs) documenting key technical decisions
- Upcoming ADRs:
  - Logger policy: @athlete-ally/logger usage in packages, console.* exceptions for types-only packages
  - CI execution pattern: Changed-files gating, non-blocking exceptions with revert dates, guardrail philosophy

# Repository Guidelines

## Project Structure & Module Organization
- The repo is a Turborepo-based TypeScript monorepo. User-facing apps live under `apps/` (`frontend`, `gateway-bff`), back-end services under `services/` (notably `planning-engine`), and shared libraries inside `packages/` (e.g., `logger`, `shared`, `shared-types`).
- CI and infrastructure assets are in `.github/`, `docker/`, and `infrastructure/`. Operational scripts sit in `scripts/`, while decisions and stream records live under `docs/`.
- Keep new code close to existing domain modules; prefer extending package/service-specific entry points over creating ad-hoc helpers at the root.

## Build, Test, and Development Commands
- `npm run dev:all:local` starts the coordinated local stack (frontend, gateway BFF, and required services).
- `npm run build` compiles packages and the frontend; use before publishing artifacts or cutting releases.
- `npm run lint`, `npm run type-check`, and `npm run test:unit` are the minimum pre-PR checks; add `npx jest --config jest/jest.config.integration.cjs` when touching async plan generation.
- Use `npx tsx scripts/scan-console-packages.ts` for Stream 2 regressions and `npm run infra:up` / `npm run infra:down` to manage local dependencies.

## Coding Style & Naming Conventions
- TypeScript + ECMAScript modules everywhere; avoid default exports except for Next.js pages. Shared types belong in `packages/shared-types`.
- Formatting is enforced via Prettier (`tabWidth: 2`, single quotes) and the unified ESLint config (`eslint.config.unified.mjs`). Run `npm run lint` before committing.
- Within `packages/**`, replace all `console.*` usage with `@athlete-ally/logger`; annotate asynchronous functions with explicit return types and prefer descriptive function names (no single-letter identifiers).

## Testing Guidelines
- Unit tests live beside code in `__tests__/unit/` and end with `.test.ts`. Integration suites for planning engine reside in `services/planning-engine/src/__tests__/integration/`.
- Prioritize targeted commands: `npm run test:services` for service-level suites, `npm run test:integration` or the specific Jest config for async generator coverage, and `npm run test:frontend` when touching Next.js code.
- Maintain or extend existing fixtures; new behaviors require matching assertions (safety/compliance/performance scoring now expects detailed factor output).

## Commit & Pull Request Guidelines
- Follow Conventional Commit prefixes (`feat`, `fix`, `chore`, `refactor`, etc.) to match current history (e.g., `fix(ci): resolve ts-jest lookup`). Reference issues or streams in the summary when applicable.
- PRs must document affected areas, verification commands, and flag toggles. Attach Turbo/CI outputs or plan scoring payloads when relevant, and request reviews from stream owners (Stream 2/3/5) as needed.

## Architectural Decisions
- Treat the ADR collection in `docs/rfcs/` as the single source of truth for architectural choices. Any new logger, scoring, or guardrail strategy must be recorded there before broad rollout.
- For feature work that diverges from an ADR, draft an addendum or follow-up RFC and link it in your PR description to keep the decision log current.

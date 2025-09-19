# Unreleased

Internal
- Fix TypeScript path mapping for `@athlete-ally/contracts` to prevent double `events` in resolution and add explicit `@athlete-ally/contracts/events` mappings (tsconfig.base.json, tsconfig.json)
- Align `packages/event-bus/tsconfig.json` paths and includes to `contracts/events`
- Update shared-types smoke tests to match current Zod schemas; all package tests green via `npm run test:packages`

# Phase 2: Magic Slice Alpha (v0.2.0-alpha)

v0.2.0-alpha.1 — UX Polish & Validation Hardening
- Frontend: Wire Magic Slice feedback hooks into Plan page (RPE and Performance)
- Frontend: Inline validation, field-level errors, a11y attributes, and disabled/pending states
- Frontend: Dev-only feedback page to exercise hooks end-to-end in local env
- Gateway‑BFF: Expose Magic Slice routes under both `/v1/*` and `/api/v1/*` to unblock UI

Date: $(date -u +"%Y-%m-%d")

Highlights
- Unified API surface at Gateway‑BFF under `/api/v1/*` with secure CORS and auth propagation
- Live event bus wiring (Profile Onboarding → NATS → Planning Engine) for async plan generation
- Frontend polish: refactored PlanFeedbackPanel with better performance and accessibility
- E2E test for critical flow: onboarding → plan generation → status polling
- Monitoring runbook finalized (Prometheus, Grafana, Jaeger) with on‑call procedures

Changes
- Gateway‑BFF
  - Rebuilt server with CORS allowlist, Swagger at `/api/docs`, health at `/api/health`
  - Added proxies:
    - POST `/api/v1/onboarding` → profile-onboarding
    - POST `/api/v1/plans/generate`, GET `/api/v1/plans/status` → planning-engine
    - GET `/api/v1/exercises`, GET `/api/v1/exercises/:id` → exercises service
    - GET `/api/v1/workouts/summary`, sessions endpoints → workouts service
  - Fixed rate limiter (Redis/in-memory; `X-RateLimit-*` headers; strict endpoints)
- Services
  - profile-onboarding: publish `onboarding_completed` via @athlete-ally/event-bus
  - planning-engine: use @athlete-ally/event-bus for publish/subscribe
- Frontend
  - Inject Authorization header for all `trainingAPI` requests and onboarding submit
  - Added PlanFeedbackPanel; switched plan page to the new panel
  - Aligned rewrites to `NEXT_PUBLIC_API_BASE_URL`
- Tests
  - Added `src/__tests__/e2e/onboarding-plan.e2e.test.ts`
- Monitoring & Ops
  - Expanded monitoring/README with runbook (targets, traces, troubleshooting)
- DX
  - Added `scripts/start-local-dev.js`, `package.json` dev scripts

Breaking Changes
- None. Frontend API remains `/api/v1/*`; BFF proxies fulfill the same surface with auth and CORS applied.

Upgrade Notes
- Ensure `NEXT_PUBLIC_API_BASE_URL` is set (default `http://localhost:4000`)
- Ensure NATS/Redis/Prometheus/Grafana/Jaeger are running for full observability

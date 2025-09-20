# Technical Debt Log

Cross-service consistency audit and known issues for future hardening.

## Cross-Service Consistency Audit
Services reviewed:
- apps/gateway-bff/src/index.ts
- services/planning-engine/src/server.ts and health modules
- services/profile-onboarding/src/index.ts

Findings
- Error handling
  - Gateway BFF: try/catch on proxy routes; returns 502 bad_gateway; logs via request.log.error.
  - Planning Engine: try/catch in handlers; mixed response shapes; logs via Fastify logger.
  - Profile Onboarding: try/catch; returns 500 internal_server_error; logs via server.log.error.
  - Suggested: shared error envelope with code/message and correlation id (Small to Medium).

- Telemetry initialization
  - Gateway/Profile Onboarding: explicit telemetry init import at top-level.
  - Planning Engine: telemetry spread across startup/health/enhanced files.
  - Suggested: one telemetry init per service with documented exporters; add withSpan helper (Medium).

- Health checks
  - Gateway: has /api/health, /health, and /api/v1/health.
  - Planning Engine: rich set (health, detailed, ready, live, metrics).
  - Profile Onboarding: minimal /health.
  - Suggested: standardize liveness/live and readiness/ready plus /health (Small).

- Metrics
  - Gateway/Profile Onboarding: none.
  - Planning Engine: Prometheus metrics including event processing.
  - Suggested: minimal metrics endpoint per service (Small to Medium).

- Auth and ownership
  - Gateway: JWT parsed by shared middleware; some ownership checks.
  - Planning Engine: assumes upstream checks.
  - Profile Onboarding: has preHandler guard for onboarding; depends on upstream auth.
  - Suggested: document boundaries and enforce consistently (Small).

## Known Technical Issues
- Next build uses Babel causing next/font SWC conflict; see reports/baseline-1/next-build.log. Action: allow SWC by removing or narrowing babel.config (Medium).
- ESLint flat-config composition error (Unexpected undefined config). Action: audit flat array; enable reporting without autofix (Medium).
- Jest mapper simplification. Action: prefer pathsToModuleNameMapper; keep ESM extension mapper (Small).
- Duplicate health endpoints in Gateway. Action: keep /api/health and /health/*; remove /api/v1/health (Small).
- Legacy AdjustmentSuggestions component still present; PlanFeedbackPanel is primary. Action: deprecate and remove after migration (Small).
- Event bus resilience (backoff, DLQ, lag metrics). See docs/ops/EventBus-Tuning.md (Medium).
- NodeNext/path resolution quirks. Action: keep root tsconfig mappings minimal and explicit (Small).

## Accessibility (automated checks)
Axe-core tests added for IntentForm and PlanFeedbackPanel. Violations (if any) should be summarized here in future runs.

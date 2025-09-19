# Gateway BFF

The Gateway BFF fronts the Magic Slice APIs and proxies requests to internal services with strict auth and CORS.

## Middleware Order
- authMiddleware (from @athlete-ally/shared): parses JWT and attaches request.user
- userRateLimitMiddleware: per-user rate limits
- strictRateLimitMiddleware: route-level rate limits
- cleanupMiddleware: scrubs sensitive fields from responses

## Core Routes
- Health and Docs
  - GET /api/health
  - GET /api/docs

- Onboarding
  - POST /api/v1/onboarding → profile-onboarding

- Plan Generation
  - POST /api/v1/plans/generate → planning-engine (legacy simple)
  - GET  /api/v1/plans/status?jobId=... → planning-engine
  - Enhanced:
    - POST /api/v1/plans/enhanced/generate

- Feedback
  - POST /api/v1/plans/feedback/rpe
  - POST /api/v1/plans/feedback/performance

- Adaptations
  - GET  /api/v1/plans/:planId/adaptations
  - POST /api/v1/plans/:planId/adaptations/apply

Notes
- Magic Slice routes are exposed at both /api/v1/* and /v1/* for compatibility with clients during migration.
- All proxied downstream responses are envelope-validated before returning.


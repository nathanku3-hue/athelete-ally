# Adaptive Engine (Thin Magic Slice)

- Service: `services/adaptive-engine`
- Port: 4104 (compose profile `adaptive`)
- Endpoints:
  - GET `/health` ? basic liveness
  - GET `/metrics` ? placeholder metrics (Prometheus-ready in future PR)
  - GET `/adaptive/today?userId=` ? returns `AdaptiveSuggestion` (stub or readiness-driven)

Flags:
- `ADAPTATION_STUB` (default true): return static `AdaptiveSuggestion` for UI unblock.
- `READINESS_ADAPTATION` (default false): when true and stub is false, fetch `insights-engine` `/readiness/today` and map readiness buckets to adjustments:
  - <40 ? `reduce`
  - 40?60 ? `maintain`
  - 60?80 ? `slight_increase`
  - >80 ? `increase`

Resilience:
- 5xx upstream ? 204 No Content
- Timeout (INSIGHTS_TIMEOUT_MS) ? 204 No Content
- 404 upstream ? propagate 404

Types:
- `packages/shared-types/src/schemas/adaptive.ts` exports `AdaptiveSuggestionSchema` and `AdaptiveAdjustment`

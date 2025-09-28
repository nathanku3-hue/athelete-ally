# Phase 3 Architecture v0.1

## Added
- SRD: docs/phase-3/architecture.md (context, principles, services, data flow, storage, security, NFRs, ops)
- API Contracts:
  - Ingest webhooks: docs/phase-3/api/ingest/webhooks.md (+ security verification details)
  - Insights endpoints: docs/phase-3/api/insights/endpoints.md
- Normalized JSON Schemas (v1):
  - heart_rate, hrv, sleep, steps, fitness_session under docs/phase-3/schemas/normalized/
  - Concrete example payloads under docs/phase-3/schemas/normalized/examples/
- Provider raw notes (Phase 1): garmin.md, oura.md
- Ops: SLO/SLIs and Alerts/Runbooks under docs/phase-3/ops/

## Notes
- Subjects: athlete-ally.raw.{provider}.{domain}.v1, athlete-ally.normalized.{domain}.v1
- Security: HMAC/JWT verification, replay protection, idempotency, encryption at rest/in transit.
- Versioning: all schemas v1; breaking changes will introduce v2 subjects.

# Phase 3 Shared Reality Document (SRD)

This document aligns design, contracts, and operational expectations for the Phase 3 data pipeline: ingest-service, normalize-service, and insights-engine.

## 1. Context & Goals
- Problem: unify third-party biometric/webhook data into a canonical model and surface timely insights.
- Goals: reliable intake; strict validation; canonicalize to normalized events; compute and expose insights.
- Success: end-to-end delivery SLOs met; versioned schemas; observable, secure, and maintainable services.

## 2. Scope and Out-of-Scope
- In Scope: webhook intake (Garmin, Oura), normalization of core domains (heart_rate, hrv, sleep, steps, fitness_session), insights aggregation and APIs.
- Out of Scope: UI/visualization, long-term ML modeling, billing.

## 3. Principles
- Reliability first (at-least-once + idempotency; DLQ for poison messages).
- Security by default (least privilege, encrypted data in transit/at rest, secret hygiene).
- Version everything (schemas, subjects, APIs) and never break consumers.
- Observability baked-in (metrics, logs, traces, audit events).

## 4. Services Overview
- ingest-service
  - Accept provider webhooks, verify authenticity (HMAC/JWT), dedupe (Idempotency-Key or delivery id), persist raw payload reference, publish raw events.
- normalize-service
  - Consume raw, validate provider payload, map to normalized domain schema, enrich with metadata, publish athlete-ally.normalized.{domain}.v1.
- insights-engine
  - Consume normalized streams, compute metrics/insights and store aggregates, expose REST endpoints for retrieval.

## 5. Data Flow (Happy Path)
1) Provider -> ingest-service: POST /ingest/webhooks/{provider}.
2) ingest-service verifies signature, records idempotency, pushes raw event to NATS subject: athlete-ally.raw.{provider}.{domain}.v1; archives payload to object storage.
3) normalize-service consumes raw, transforms and validates, publishes athlete-ally.normalized.{domain}.v1.
4) insights-engine consumes normalized, updates aggregates, serves insights queries.

Error Paths: signature invalid -> 401; malformed -> 400; transient -> 5xx with retry; poison -> DLQ subject athlete-ally.dlq.* and alert.

## 6. Storage & Retention
- Raw payloads: S3-compatible object storage (encrypted, versioned, 30?90 days retention).
- Normalized operational store: PostgreSQL.
- Optional analytics: ClickHouse (future) for long-range aggregations.

## 7. Interfaces & Contracts
- Ingest webhooks: see api/ingest/webhooks.md.
- Insights APIs: see api/insights/endpoints.md.
- Normalized schemas: see schemas/normalized/*.v1.json.

## 8. Security & Privacy
- OAuth consent and scope minimization per provider; token storage encrypted; rotation and revocation honored.
- TLS for all traffic; encryption at rest (DB and object storage with KMS-managed keys).
- PII minimization; configurable retention; audit logging; RBAC, least privilege IAM; DSRs (export/delete) supported.
- Threats addressed: replay attacks (HMAC + timestamp + idempotency), schema poisoning (strict validation), secret leakage (no tokens in logs).

## 9. Non-Functional Requirements
- Availability: 99.9% ingest path; Data durability >= 11 9s on object storage.
- Throughput: baseline 50 rps per provider; burst 200 rps; p99 end-to-end normalize < 5s.
- Backpressure: queue-based buffering, rate limiting, DLQ drain runbook.

## 10. Operations & Observability
- Metrics: request rate/latency, error rates, queue lag, normalization failures, DLQ depth.
- Logs: structured with correlation ids; sensitive fields redacted.
- Tracing: distributed traces spanning ingest -> normalize -> insights.
- Runbooks: replay from object storage, DLQ reprocessing, key rotation.

## 11. Open Questions / Assumptions
- Providers v1: Garmin, Oura.
- Event bus: NATS JetStream; subjects and durable names as proposed.
- API style: REST+JSON v1.

## 12. Versioning & Change Management
- Subjects and JSON Schema include version (v1); new breaking fields trigger v2 subjects.
- Deprecation windows documented; consumers notified via release notes.

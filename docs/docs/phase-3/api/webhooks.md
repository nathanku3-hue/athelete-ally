# Webhooks (Oura)

- Endpoint: `POST /v1/webhooks/oura`
- Auth: Signature header verification (HMAC); no bearer required.
- Response: `202 Accepted` on enqueue; `400 invalid_signature`; `409 duplicate_event`.

Request Headers
- `X-Oura-Signature`: HMAC signature (algorithm TBA)
- `X-Request-Id`: optional, echoed in logs

Request Body
- Opaque JSON from provider; not persisted to logs.

Processing
- Idempotency key: `provider:oura:eventId:<providerId>:<eventId>:<tsWindow>`
- Raw persisted to S3; envelope published to `health.raw.oura.webhook`.

Contracts
- Envelope type: `HealthRawEnvelope` (from `@athlete-ally/shared-types`)
- Normalized types: see `docs/phase-3/schemas/` (source: `@athlete-ally/shared-types`)
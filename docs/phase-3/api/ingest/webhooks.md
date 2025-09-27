# Ingest Webhooks API

Base path: `/ingest/webhooks/{provider}`

- Method: POST
- Path params:
  - `provider`: `garmin` | `oura`
- Headers:
  - `content-type: application/json`
  - `x-provider-signature`: HMAC or `authorization: bearer <jwt>` (provider-specific)
  - `x-delivery-id`: unique delivery id from provider (used for idempotency)
  - `x-timestamp`: RFC3339 timestamp
  - `idempotency-key`: optional; if absent we derive from `x-delivery-id`
- AuthN/Z: request must pass provider verification (HMAC over raw body with shared secret, or provider JWT).

## Response Codes
- 202 Accepted `{ "accepted": true, "delivery_id": "...", "trace_id": "..." }`
- 400 Bad Request (malformed JSON)
- 401 Unauthorized (signature invalid)
- 409 Conflict (duplicate delivery)
- 429 Too Many Requests (backpressure)
- 5xx Transient error (provider should retry with exponential backoff)

## Emitted Events
- Subject: `athlete-ally.raw.{provider}.{domain}.v1`
- Message body: provider payload wrapped with metadata and object storage reference.

### Example Request
POST /ingest/webhooks/garmin

Headers:
```
content-type: application/json
x-provider-signature: sha256=abcdef...
x-delivery-id: 4b3b2c9e-02f6-4ec4-bc40-2c9ec5
x-timestamp: 2025-09-27T12:34:56Z
idempotency-key: 4b3b2c9e-02f6-4ec4-bc40-2c9ec5
```

Body (provider-specific JSON):
```
{ "domain": "heart_rate", "data": { /* provider fields */ } }
```

### Example Emitted Raw Event
Subject: `athlete-ally.raw.garmin.heart_rate.v1`

Body:
```
{
  "version": "v1",
  "provider": "garmin",
  "domain": "heart_rate",
  "user_id": "user-123",
  "delivery_id": "4b3b2c9e-02f6-4ec4-bc40-2c9ec5",
  "received_at": "2025-09-27T12:34:57Z",
  "object_ref": {
    "bucket": "biometrics-raw",
    "key": "garmin/heart_rate/2025/09/27/4b3b2c9e.json"
  },
  "payload": { /* provider JSON (optional inline echo) */ }
}
```

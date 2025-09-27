# Raw Oura Payload Notes (Phase 1)

- Reference provider docs for exact fields. We persist the raw payload (encrypted) and attach metadata:
```
{
  "provider": "oura",
  "domain": "<domain>",
  "delivery_id": "<uuid>",
  "received_at": "<iso8601>",
  "object_ref": { "bucket": "biometrics-raw", "key": "oura/<domain>/..." }
}
```
- Domains v1: heart_rate, hrv, sleep, steps, fitness_session.

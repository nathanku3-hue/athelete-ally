# Readiness v1 Flow (PRR2/PRR3)

Goal: compute daily readiness from normalized HRV and Sleep, persist to `readiness_data`, and expose stable read-only APIs.

Data Sources (read-only)
- `hrv_data` (lnRmssd per UTC day)
- `sleep_data` (durationMinutes per UTC day; optional qualityScore)

Storage (insights-engine Prisma)
- `readiness_data` (id, userId, date DATE, score int 0..100, incomplete bool, components JSON, timestamps)
- Unique (userId, date)

Compute (baseline variant)
- sleep_ratio = duration_norm (duration/480 clamped) blended with quality when present: `0.8*duration_norm + 0.2*(qualityScore/100)`
- hrv_ratio = lnRmssd_today / mean(lnRmssd over previous 7 days) (clamped to [0,1])
- readiness = round(100 * (0.6*sleep_ratio + 0.4*hrv_ratio)), clamped [0,100]
- Missing input(s) → `incomplete=true`; still upsert record

API (append-only in OpenAPI)
- `GET /api/v1/readiness/:userId/latest` → latest record or `{ userId, incomplete: true }`
- `GET /api/v1/readiness/:userId?days=7` → list (desc) up to N items
- Responses use `YYYYMMDD` date strings

Observability
- Metrics: `readiness_compute_total{result}`, `readiness_compute_duration_seconds`, `api_requests_total{route,status}`
- Tracing: span `readiness.compute`, attrs: date, result; omit raw userId (optional SHA-256 hash)

Flags (documented)
- `READINESS_CONSUMER_ENABLED=false`, `PUBLISH_READINESS_EVENTS=false`, `READINESS_FORMULA_VARIANT=baseline`

Notes
- No stream topic changes; consumer is future work (flagged off)
- DB migrations are separate; tests prefer in-memory/SQLite-style stubs

# SLOs and SLIs (Phase 3)

## Ingest Service
- Availability SLO: 99.9% monthly success rate (2xx) for valid requests; excludes client 4xx.
- Latency SLO: p99 < 250ms for request handling excluding provider delays.
- Replay protection: < 0.1% of accepted requests outside 5m window.
- DLQ budget: < 0.5% of messages land in DLQ per day.

SLIs:
- `http_requests_total{service="ingest",code=~"2.."}` / total
- `http_request_duration_seconds_bucket{service="ingest",le="0.25"}`
- `ingest_dlq_messages_total / ingest_messages_total`

## Normalize Service
- E2E processing SLO: 99% of events from raw->normalized in < 5s.
- Validation failure rate < 1% (tracked per provider and domain).

SLIs:
- `pipeline_e2e_duration_seconds{path="raw_to_normalized"}` histogram p99
- `normalize_validation_failures_total / normalize_events_total`

## Insights Engine
- Freshness SLO: normalized-to-insight p99 < 60s (streaming metrics).
- Query latency SLO: p99 < 200ms for summary endpoint under nominal load.

SLIs:
- `insight_freshness_seconds` histogram
- `http_request_duration_seconds_bucket{service="insights",path="/insights/v1/users/.*/summary",le="0.2"}`

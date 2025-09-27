# Alerts and Runbooks (Phase 3)

## Alert Policies
- Ingest 5xx rate > 1% for 5m -> page (SEV-2)
- Ingest p99 latency > 500ms for 10m -> page (SEV-2)
- Normalize DLQ depth increases for 10m -> page (SEV-2)
- Pipeline E2E p99 > 10s for 15m -> page (SEV-2)
- Insights freshness p99 > 300s for 30m -> ticket (SEV-3)

## Example PromQL
- 5xx rate:
```
sum(rate(http_requests_total{service="ingest",code=~"5.."}[5m]))
/
sum(rate(http_requests_total{service="ingest"}[5m])) > 0.01
```
- p99 latency:
```
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{service="ingest"}[5m])) by (le)) > 0.5
```
- DLQ growth:
```
rate(jsm_stream_dlq_messages_total{stream="ATHLETE_ALLY_DLQ"}[10m]) > 0
```

## Runbooks
- DLQ drain: pause consumers, inspect messages, fix root cause, re-publish from DLQ to raw subject or bypass to normalized after patch.
- Replay: rehydrate from object storage by time/window; ensure idempotency keys are enforced to avoid duplicates.
- Key rotation: rotate KMS keys; re-encrypt data at rest via envelope keys; update service secrets via CI/CD.
- Rate limits/backpressure: enable 429 with Retry-After; scale horizontally or raise quotas.

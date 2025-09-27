# Insights API

## GET /insights/v1/users/{userId}/summary
- Query: `range=7d|30d|90d`
- Response 200:
```
{
  "user_id": "user-123",
  "range": "30d",
  "metrics": {
    "resting_hr_avg": 54,
    "hrv_rmssd_avg_ms": 48.2,
    "sleep_efficiency_pct": 90,
    "steps_total": 124500,
    "sessions_completed": 12
  },
  "provenance": { "as_of": "2025-09-27T12:34:56Z" }
}
```

## GET /insights/v1/users/{userId}/metrics/{metric}
- Query: `from=<iso8601>&to=<iso8601>&agg=1m|5m|1h|1d`
- Response 200:
```
{
  "user_id": "user-123",
  "metric": "heart_rate",
  "agg": "1m",
  "series": [ { "timestamp": "2025-09-27T12:00:00Z", "value": 62 } ],
  "units": "bpm",
  "provenance": { "domain": "heart_rate", "version": "v1" }
}
```

# Insights API

## Overview
The Insights API provides aggregated fitness metrics and analytics for users, including HRV, sleep, heart rate, and training data.

## Base Configuration
- **Base Path**: `/insights/v1`
- **Protocol**: HTTPS only
- **Authentication**: Bearer token (JWT)
- **Rate Limiting**: 100 requests/minute per user
- **Timeout**: 10 seconds

## Available Metrics
- `heart_rate`: Heart rate data (bpm)
- `hrv`: Heart rate variability (RMSSD in ms)
- `sleep`: Sleep quality and duration metrics
- `steps`: Daily step counts
- `fitness_session`: Training session data
- `readiness`: Overall readiness score

## Endpoints

### GET /insights/v1/users/{userId}/summary
Get aggregated metrics summary for a user over a specified time range.

**Path Parameters:**
- `userId` (string, required): User identifier

**Query Parameters:**
- `range` (string, required): Time range (`7d`, `30d`, `90d`, `1y`)

**Response 200:**
```json
{
  "user_id": "user-123",
  "range": "30d",
  "metrics": {
    "resting_hr_avg": 54,
    "hrv_rmssd_avg_ms": 48.2,
    "sleep_efficiency_pct": 90,
    "steps_total": 124500,
    "sessions_completed": 12,
    "readiness_score": 85
  },
  "provenance": { 
    "as_of": "2025-09-27T12:34:56Z",
    "data_freshness": "5m"
  }
}
```

### GET /insights/v1/users/{userId}/metrics/{metric}
Get time-series data for a specific metric.

**Path Parameters:**
- `userId` (string, required): User identifier
- `metric` (string, required): Metric name (see Available Metrics)

**Query Parameters:**
- `from` (string, required): Start time (ISO8601)
- `to` (string, required): End time (ISO8601)
- `agg` (string, optional): Aggregation level (`1m`, `5m`, `1h`, `1d`)

**Response 200:**
```json
{
  "user_id": "user-123",
  "metric": "heart_rate",
  "agg": "1m",
  "series": [
    { "timestamp": "2025-09-27T12:00:00Z", "value": 62 },
    { "timestamp": "2025-09-27T12:01:00Z", "value": 65 }
  ],
  "units": "bpm",
  "provenance": { 
    "domain": "heart_rate", 
    "version": "v1",
    "last_updated": "2025-09-27T12:34:56Z"
  }
}
```

### GET /insights/v1/users/{userId}/readiness
Get current readiness score and recommendations.

**Path Parameters:**
- `userId` (string, required): User identifier

**Response 200:**
```json
{
  "user_id": "user-123",
  "readiness_score": 85,
  "components": {
    "hrv_score": 90,
    "sleep_score": 80,
    "recovery_score": 85
  },
  "recommendations": [
    {
      "type": "training",
      "message": "Consider light training today",
      "priority": "medium"
    }
  ],
  "provenance": {
    "calculated_at": "2025-09-27T12:34:56Z",
    "data_freshness": "2h"
  }
}
```

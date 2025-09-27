# Raw Garmin Payload Schema

## Overview
This document describes the raw payload formats received from Garmin Connect webhooks. Raw payloads are stored encrypted in object storage with metadata attached.

## Supported Domains
- `heart_rate`: Heart rate measurements
- `hrv`: Heart rate variability data
- `sleep`: Sleep quality and duration
- `steps`: Daily step counts
- `fitness_session`: Training session data

## Common Metadata Structure
All raw payloads are wrapped with the following metadata:

```json
{
  "provider": "garmin",
  "domain": "<domain>",
  "delivery_id": "<uuid>",
  "received_at": "<iso8601>",
  "object_ref": {
    "bucket": "biometrics-raw",
    "key": "garmin/<domain>/<year>/<month>/<day>/<delivery_id>.json"
  }
}
```

## Domain-Specific Payloads

### Heart Rate
```json
{
  "timestamp": "2025-09-27T12:00:00Z",
  "heart_rate": 65,
  "zone": "fat_burn",
  "device_id": "garmin-12345"
}
```

### HRV
```json
{
  "timestamp": "2025-09-27T12:00:00Z",
  "rmssd_ms": 48.2,
  "device_id": "garmin-12345"
}
```

### Sleep
```json
{
  "session_id": "sleep-12345",
  "start_time": "2025-09-26T22:30:00Z",
  "end_time": "2025-09-27T06:30:00Z",
  "total_duration_sec": 28800,
  "efficiency_pct": 90,
  "stages": [
    {
      "stage": "light",
      "start_time": "2025-09-26T22:30:00Z",
      "end_time": "2025-09-26T23:00:00Z",
      "duration_sec": 1800
    }
  ]
}
```

### Steps
```json
{
  "date": "2025-09-27",
  "steps": 12450,
  "distance_meters": 8500,
  "calories_burned": 450
}
```

### Fitness Session
```json
{
  "session_id": "workout-12345",
  "start_time": "2025-09-27T18:00:00Z",
  "end_time": "2025-09-27T19:00:00Z",
  "activity_type": "strength_training",
  "exercises": [
    {
      "name": "squat",
      "sets": [
        {
          "reps": 5,
          "weight_kg": 100,
          "rpe": 8
        }
      ]
    }
  ]
}
```

## Authentication
Garmin webhooks use HMAC-SHA256 signature verification:
- Header: `x-provider-signature: sha256=<signature>`
- Signature calculated over raw request body using shared secret
- Timestamp validation within 5 minutes

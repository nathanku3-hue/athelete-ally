# Normalize Service API

## Overview
The Normalize Service API processes raw fitness data from various providers and converts it into standardized formats for storage and analysis.

## Base Configuration
- **Base Path**: `/normalize/v1`
- **Protocol**: HTTPS only
- **Authentication**: Service-to-service (mTLS)
- **Rate Limiting**: 500 requests/minute per service
- **Timeout**: 60 seconds

## Supported Data Domains
- `heart_rate`: Heart rate measurements
- `hrv`: Heart rate variability data
- `sleep`: Sleep quality and duration
- `steps`: Daily step counts
- `fitness_session`: Training session data

## Endpoints

### POST /normalize/v1/process
Process raw data from a provider into normalized format.

**Request Body:**
```json
{
  "provider": "garmin",
  "domain": "heart_rate",
  "user_id": "user-123",
  "raw_data": {
    "timestamp": "2025-09-27T12:00:00Z",
    "heart_rate": 65,
    "zone": "fat_burn"
  },
  "metadata": {
    "delivery_id": "4b3b2c9e-02f6-4ec4-bc40-2c9ec5",
    "received_at": "2025-09-27T12:34:56Z"
  }
}
```

**Response 200:**
```json
{
  "processed": true,
  "normalized_data": {
    "timestamp": "2025-09-27T12:00:00Z",
    "heart_rate_bpm": 65,
    "zone": "fat_burn",
    "quality_score": 0.95
  },
  "validation": {
    "schema_version": "v1",
    "validation_passed": true,
    "warnings": []
  },
  "provenance": {
    "provider": "garmin",
    "domain": "heart_rate",
    "processed_at": "2025-09-27T12:34:57Z"
  }
}
```

### GET /normalize/v1/schemas/{domain}
Get the current schema for a data domain.

**Path Parameters:**
- `domain` (string, required): Data domain (`heart_rate`, `hrv`, `sleep`, `steps`, `fitness_session`)

**Response 200:**
```json
{
  "domain": "heart_rate",
  "version": "v1",
  "schema": {
    "type": "object",
    "properties": {
      "timestamp": { "type": "string", "format": "date-time" },
      "heart_rate_bpm": { "type": "number", "minimum": 30, "maximum": 220 },
      "zone": { "type": "string", "enum": ["rest", "fat_burn", "cardio", "peak"] },
      "quality_score": { "type": "number", "minimum": 0, "maximum": 1 }
    },
    "required": ["timestamp", "heart_rate_bpm"]
  },
  "last_updated": "2025-09-27T12:00:00Z"
}
```

### POST /normalize/v1/batch
Process multiple raw data points in a single request.

**Request Body:**
```json
{
  "provider": "garmin",
  "domain": "heart_rate",
  "user_id": "user-123",
  "batch_data": [
    {
      "timestamp": "2025-09-27T12:00:00Z",
      "heart_rate": 65,
      "zone": "fat_burn"
    },
    {
      "timestamp": "2025-09-27T12:01:00Z",
      "heart_rate": 68,
      "zone": "fat_burn"
    }
  ],
  "metadata": {
    "delivery_id": "batch-4b3b2c9e",
    "received_at": "2025-09-27T12:34:56Z"
  }
}
```

**Response 200:**
```json
{
  "processed": true,
  "batch_size": 2,
  "results": [
    {
      "index": 0,
      "normalized_data": {
        "timestamp": "2025-09-27T12:00:00Z",
        "heart_rate_bpm": 65,
        "zone": "fat_burn",
        "quality_score": 0.95
      },
      "validation": { "schema_version": "v1", "validation_passed": true }
    },
    {
      "index": 1,
      "normalized_data": {
        "timestamp": "2025-09-27T12:01:00Z",
        "heart_rate_bpm": 68,
        "zone": "fat_burn",
        "quality_score": 0.92
      },
      "validation": { "schema_version": "v1", "validation_passed": true }
    }
  ],
  "provenance": {
    "provider": "garmin",
    "domain": "heart_rate",
    "processed_at": "2025-09-27T12:34:57Z"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "validation_failed",
  "message": "Invalid data format",
  "details": {
    "field": "heart_rate",
    "issue": "Value must be between 30 and 220"
  }
}
```

### 422 Unprocessable Entity
```json
{
  "error": "schema_mismatch",
  "message": "Data does not match expected schema",
  "details": {
    "expected_schema": "heart_rate.v1",
    "received_fields": ["timestamp", "hr"]
  }
}
```

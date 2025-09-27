# Ingest Webhooks API

## Overview
The Ingest Webhooks API receives real-time data from third-party fitness providers (Garmin, Oura, etc.) and publishes raw events to the event bus for processing.

## Base Configuration
- **Base Path**: `/ingest/webhooks/{provider}`
- **Protocol**: HTTPS only
- **Rate Limiting**: 1000 requests/minute per provider
- **Timeout**: 30 seconds

## Supported Providers
- `garmin`: Garmin Connect webhooks
- `oura`: Oura Ring API webhooks
- `fitbit`: Fitbit webhooks (planned)
- `apple`: Apple Health webhooks (planned)

## Authentication & Security
Each provider uses different authentication methods:
- **Garmin**: HMAC-SHA256 signature verification
- **Oura**: JWT token validation
- **Fitbit**: OAuth2 bearer token
- **Apple**: Certificate-based validation

## Endpoints

### POST /ingest/webhooks/{provider}
Receives webhook data from fitness providers.

**Path Parameters:**
- `provider` (string, required): Provider identifier (`garmin`, `oura`, `fitbit`, `apple`)

**Headers:**
- `content-type: application/json` (required)
- `x-provider-signature: <signature>` (required, provider-specific)
- `x-delivery-id: <uuid>` (required, unique delivery identifier)
- `x-timestamp: <RFC3339>` (required, request timestamp)
- `idempotency-key: <uuid>` (optional, defaults to x-delivery-id)

**Request Body:**
Provider-specific JSON payload containing fitness data.

**Response Codes:**
- `202 Accepted`: Successfully queued for processing
- `400 Bad Request`: Malformed request or invalid JSON
- `401 Unauthorized`: Invalid signature or authentication
- `409 Conflict`: Duplicate delivery (already processed)
- `429 Too Many Requests`: Rate limit exceeded
- `5xx Server Error`: Transient error (retry with exponential backoff)

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

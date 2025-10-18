# CoachTip Service

Event-driven microservice for generating personalized coaching tips based on training plan scoring data.

## Overview

The CoachTip service subscribes to `plan_generated` events, analyzes plan scoring data (safety, compliance, performance), and generates contextual coaching recommendations stored in Redis for API retrieval.

## Architecture

```
plan_generated event (NATS) + enriched planData
       ↓
CoachTip Subscriber
       ↓
Extract scoring data from planData.scoring
       ↓
CoachTipGenerator.generateTips() → CoachTipPayload
       ↓
TipStorage.storeTip() → Redis (with TTL)
       ↓
API: GET /v1/plans/:id/coach-tip → Frontend
```

## Prerequisites

- Node.js 18+
- Redis (localhost:6379 or via Docker)
- NATS with JetStream (localhost:4223 or via Docker)

## Installation

```bash
npm install
```

## Configuration

Environment variables:

```bash
PORT=4103                                    # HTTP server port
REDIS_URL=redis://localhost:6379            # Redis connection URL
NATS_URL=nats://localhost:4223              # NATS server URL
NODE_ENV=development                         # Environment (development|production)
```

## Running Tests

```bash
# Test Redis connection
node src/test/redis-connection.js

# Run functional tests
node src/test/functional.js

# Run component verification
npx tsx src/test/verify-components.ts
```

## Development

```bash
# Start service in development mode
npm run dev

# With custom configuration
REDIS_URL=redis://localhost:6379 NATS_URL=nats://localhost:4223 PORT=4103 npm run dev
```

## Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Public Endpoints

- `GET /v1/plans/:id/coach-tip` - Get coaching tip for a plan
- `GET /v1/coach-tips/:tipId` - Get coaching tip by ID
- `GET /v1/users/:userId/coach-tips` - Get all tips for a user

### Internal Endpoints

- `GET /health` - Health check
- `GET /info` - Service information
- `GET /subscriber/status` - Event subscriber status
- `GET /v1/coach-tips/stats` - Storage statistics
- `POST /v1/coach-tips/cleanup` - Clean up expired tips

## Example Response

```json
{
  "id": "tip-plan-12345-1234567890",
  "planId": "plan-12345",
  "userId": "user-123",
  "message": "Your plan has several safety concerns. Consider reducing training volume or intensity for the first 2 weeks.",
  "type": "safety",
  "priority": "high",
  "action": {
    "actionType": "modify_plan",
    "data": {
      "suggestion": "reduce_volume",
      "weeks": [1, 2]
    }
  },
  "scoringContext": {
    "totalScore": 68.5,
    "safetyScore": 65,
    "complianceScore": 78,
    "performanceScore": 72
  },
  "generatedAt": "2025-10-15T08:00:00.000Z",
  "expiresAt": "2025-10-22T08:00:00.000Z",
  "storedAt": "2025-10-15T08:00:01.000Z"
}
```

## Tip Generation Logic

Tips are generated based on scoring thresholds:

### Safety Factor
- **< 70:** High priority safety warning
- **< 85:** Medium priority form guidance

### Compliance Factor
- **< 75:** High priority schedule adjustment
- **< 90:** Medium priority planning recommendation

### Performance Factor
- **≥ 90:** Low priority optimization tip
- **< 75:** Medium priority variety enhancement

### Overall Score
- **≥ 90:** Low priority general encouragement
- **< 70:** High priority guidance recommendation

## Storage

Tips are stored in Redis with:
- **Key structure:** `coach-tip:{tipId}`, `plan-tips:{planId}`
- **TTL:** 7 days (configurable via tip expiration)
- **Indexing:** By planId for O(1) retrieval

## Monitoring

- Health check: `GET /health`
- Storage stats: `GET /v1/coach-tips/stats`
- Subscriber status: `GET /subscriber/status`
- Automatic cleanup: Runs hourly to remove expired tips

## Error Handling

- Event processing failures trigger retry mechanisms
- Redis connection failures log errors and reconnect automatically
- Invalid scoring data is logged and skipped gracefully
- Duplicate tips for the same plan are prevented

## Development Notes

- Uses NATS JetStream for reliable event delivery
- Employs concurrency control (max 5 concurrent tip generations)
- Implements graceful shutdown on SIGTERM/SIGINT
- Maintains separation of concerns (generator, storage, subscriber)

## Related Services

- **planning-engine:** Publishes `plan_generated` events with scoring data
- **Frontend:** Consumes tips via `/v1/plans/:id/coach-tip` endpoint

## License

Proprietary - Athlete Ally Project
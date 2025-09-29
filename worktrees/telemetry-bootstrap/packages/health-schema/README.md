# @athlete-ally/health-schema

Unified health schema for Athlete Ally services providing consistent health check responses across all services.

## Features

- **Standardized response format**: Consistent health response schema across all services
- **Build information**: Automatic inclusion of SHA and build ID
- **Uptime tracking**: Service uptime in seconds
- **Framework adapters**: Ready-to-use handlers for Express, Fastify, and Next.js
- **Environment awareness**: Automatic environment detection
- **Validation**: Schema validation for health responses

## Installation

```bash
npm install @athlete-ally/health-schema
```

## Usage

### Basic Health Response

```typescript
import { createHealthResponse } from '@athlete-ally/health-schema';

const health = createHealthResponse({
  serviceName: 'my-service',
  version: '1.0.0',
  environment: 'production',
});

console.log(health);
// {
//   ok: true,
//   status: 'healthy',
//   sha: 'abc123...',
//   buildId: 'build-456',
//   service: 'my-service',
//   uptimeSec: 3600,
//   timestamp: '2024-01-01T00:00:00.000Z',
//   version: '1.0.0',
//   environment: 'production'
// }
```

### Express.js Handler

```typescript
import express from 'express';
import { createExpressHealthHandler } from '@athlete-ally/health-schema';

const app = express();

app.get('/health', createExpressHealthHandler({
  serviceName: 'my-service',
  version: '1.0.0',
}));
```

### Fastify Handler

```typescript
import Fastify from 'fastify';
import { createFastifyHealthHandler } from '@athlete-ally/health-schema';

const fastify = Fastify();

fastify.get('/health', createFastifyHealthHandler({
  serviceName: 'my-service',
  version: '1.0.0',
}));
```

### Next.js API Route

```typescript
// app/api/health/route.ts
import { createNextHealthHandler } from '@athlete-ally/health-schema';

export const GET = createNextHealthHandler({
  serviceName: 'frontend',
  version: '1.0.0',
});
```

### Health Status Variations

```typescript
import {
  createHealthResponse,
  createDegradedHealthResponse,
  createUnhealthyHealthResponse,
} from '@athlete-ally/health-schema';

// Healthy (default)
const healthy = createHealthResponse({ serviceName: 'my-service' });

// Degraded (some functionality impaired)
const degraded = createDegradedHealthResponse(
  { serviceName: 'my-service' },
  'Database connection slow'
);

// Unhealthy (service not functioning)
const unhealthy = createUnhealthyHealthResponse(
  { serviceName: 'my-service' },
  'Database connection failed'
);
```

### Build Information

The schema automatically reads build information from:

1. **Build info file** (if `buildInfoPath` provided):
   ```json
   {
     "sha": "abc123...",
     "buildId": "build-456"
   }
   ```

2. **Environment variables**:
   ```bash
   GIT_SHA=abc123...
   BUILD_ID=build-456
   # or
   COMMIT_SHA=abc123...
   BUILD_NUMBER=build-456
   ```

3. **Fallback**: `'unknown'` if neither available

### Validation

```typescript
import { validateHealthResponse } from '@athlete-ally/health-schema';

const response = await fetch('/health').then(r => r.json());

if (validateHealthResponse(response)) {
  console.log('Valid health response:', response.service);
} else {
  console.error('Invalid health response format');
}
```

## Response Schema

```typescript
interface HealthResponse {
  ok: boolean;                    // Overall health status
  status: 'healthy' | 'degraded' | 'unhealthy';
  sha: string;                    // Git commit SHA
  buildId: string;                // Build identifier
  service: string;                // Service name
  uptimeSec: number;              // Service uptime in seconds
  timestamp: string;              // ISO timestamp
  version?: string;               // Service version
  environment?: string;           // Environment name
  reason?: string;                // Optional reason for degraded/unhealthy
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GIT_SHA` | Git commit SHA | `'unknown'` |
| `BUILD_ID` | Build identifier | `'unknown'` |
| `COMMIT_SHA` | Alternative SHA variable | `'unknown'` |
| `BUILD_NUMBER` | Alternative build ID | `'unknown'` |
| `NODE_ENV` | Environment name | `'development'` |

## CI Integration

### Build Info File

Create a build info file during CI:

```bash
# In your CI pipeline
echo "{
  \"sha\": \"$GITHUB_SHA\",
  \"buildId\": \"$GITHUB_RUN_ID\"
}" > build-info.json
```

### Health Check Validation

```bash
# Validate health response schema
curl -s http://localhost:3000/health | jq '.ok, .status, .sha, .buildId'
```

## Migration Guide

### From Custom Health Endpoints

1. **Replace custom health logic**:
   ```typescript
   // Before
   app.get('/health', (req, res) => {
     res.json({ status: 'ok' });
   });
   
   // After
   import { createExpressHealthHandler } from '@athlete-ally/health-schema';
   app.get('/health', createExpressHealthHandler({
     serviceName: 'my-service',
   }));
   ```

2. **Update health checks**:
   ```typescript
   // Before
   const response = await fetch('/health');
   const data = await response.json();
   if (data.status === 'ok') { ... }
   
   // After
   const response = await fetch('/health');
   const data = await response.json();
   if (data.ok && data.status === 'healthy') { ... }
   ```

## Troubleshooting

### Missing Build Information

1. Set environment variables in CI:
   ```bash
   export GIT_SHA=$GITHUB_SHA
   export BUILD_ID=$GITHUB_RUN_ID
   ```

2. Create build info file:
   ```bash
   echo '{"sha":"'$GIT_SHA'","buildId":"'$BUILD_ID'"}' > build-info.json
   ```

### Health Check Failures

1. Verify service is running
2. Check health endpoint returns 200 status
3. Validate response schema
4. Check service uptime is reasonable

# @athlete-ally/otel-preset

OpenTelemetry preset for Athlete Ally services providing consistent telemetry configuration across all services.

## Features

- **Environment-driven configuration**: Automatically configures exporters based on environment variables
- **Consistent resource attributes**: Standardized service metadata across all services
- **Graceful shutdown**: Proper cleanup on SIGTERM/SIGINT
- **Minimal dependencies**: Only imports what's needed, with peer dependencies for exporters
- **No-op mode**: Disabled telemetry when `TELEMETRY_ENABLED=false`

## Installation

```bash
npm install @athlete-ally/otel-preset
```

### Peer Dependencies

Install the exporters you need:

```bash
# For Jaeger tracing
npm install @opentelemetry/exporter-jaeger

# For Prometheus metrics
npm install @opentelemetry/exporter-prometheus

# For OTLP (OpenTelemetry Protocol)
npm install @opentelemetry/exporter-otlp-http
```

## Usage

### Basic Setup

```typescript
import { initTelemetry } from '@athlete-ally/otel-preset';

const telemetry = initTelemetry({
  serviceName: 'my-service',
  serviceVersion: '1.0.0',
});

// Use the tracer and meter
const span = telemetry.tracer.startSpan('my-operation');
// ... do work
span.end();
```

### Environment Configuration

The preset respects these environment variables:

```bash
# Enable/disable telemetry
TELEMETRY_ENABLED=true

# Choose exporter type
OTEL_EXPORTER=jaeger|prometheus|otlp|none

# Jaeger configuration
JAEGER_ENDPOINT=http://localhost:14268/api/traces

# Prometheus configuration
PROMETHEUS_PORT=9464

# OTLP configuration
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

### Advanced Configuration

```typescript
const telemetry = initTelemetry({
  serviceName: 'my-service',
  serviceVersion: '1.0.0',
  environment: 'production',
  instanceId: 'my-service-pod-1',
  enabled: true,
  exporters: {
    jaeger: {
      endpoint: 'http://jaeger:14268/api/traces',
    },
    prometheus: {
      port: 9464,
      endpoint: '/metrics',
    },
  },
  instrumentations: {
    fs: false,
    http: true,
    express: true,
    fastify: false,
  },
});
```

### Business Metrics Helper

```typescript
import { createBusinessMetrics } from '@athlete-ally/otel-preset';

const metrics = createBusinessMetrics(telemetry.meter, 'my-service');

// Record API requests
metrics.apiRequests.add(1, { method: 'GET', endpoint: '/users' });

// Record response time
metrics.apiResponseTime.record(0.5, { method: 'GET', endpoint: '/users' });

// Record errors
metrics.apiErrors.add(1, { method: 'GET', endpoint: '/users', status: '500' });
```

### Business Span Helper

```typescript
import { createBusinessSpan } from '@athlete-ally/otel-preset';

const span = createBusinessSpan(telemetry.tracer, 'user-operation', {
  'user.id': '123',
  'operation.type': 'create',
  'resource.type': 'workout',
});
// ... do work
span.end();
```

## Environment Matrix

| Environment | TELEMETRY_ENABLED | OTEL_EXPORTER | Notes |
|-------------|-------------------|---------------|-------|
| Local Development | `false` | `none` | No exporters by default |
| CI | `false` | `none` | Disabled to avoid network calls |
| Staging | `true` | `jaeger` | Jaeger for debugging |
| Production | `true` | `otlp` | OTLP for observability platform |

## Migration Guide

### From Custom Telemetry Setup

1. **Replace custom telemetry initialization**:
   ```typescript
   // Before
   import { NodeSDK } from '@opentelemetry/sdk-node';
   // ... custom setup
   
   // After
   import { initTelemetry } from '@athlete-ally/otel-preset';
   const telemetry = initTelemetry({ serviceName: 'my-service' });
   ```

2. **Update business metrics**:
   ```typescript
   // Before
   const meter = metrics.getMeter('my-service', '1.0.0');
   const apiRequests = meter.createCounter('api_requests_total');
   
   // After
   import { createBusinessMetrics } from '@athlete-ally/otel-preset';
   const metrics = createBusinessMetrics(telemetry.meter, 'my-service');
   ```

3. **Update business spans**:
   ```typescript
   // Before
   const tracer = trace.getTracer('my-service', '1.0.0');
   const span = tracer.startSpan('operation');
   
   // After
   import { createBusinessSpan } from '@athlete-ally/otel-preset';
   const span = createBusinessSpan(telemetry.tracer, 'operation', attributes);
   ```

## Troubleshooting

### Telemetry Not Working

1. Check `TELEMETRY_ENABLED=true`
2. Verify exporter dependencies are installed
3. Check exporter endpoints are accessible
4. Look for initialization logs

### Performance Issues

1. Disable unused instrumentations (`fs: false`)
2. Use sampling for high-traffic services
3. Consider async exporters for production

### CI Failures

1. Ensure `TELEMETRY_ENABLED=false` in CI
2. Don't install exporter dependencies in CI
3. Use no-op mode for tests

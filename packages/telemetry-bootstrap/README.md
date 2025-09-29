@athlete-ally/telemetry-bootstrap

Minimal, reusable bootstrap for OpenTelemetry traces and Prometheus metrics.

- Single function: bootstrapTelemetry({...})
- Sensible defaults via env vars; zero PII policy
- Compatible with all Node services (Fastify/Express/etc.)

Quick start (TypeScript)

import { bootstrapTelemetry } from '@athlete-ally/telemetry-bootstrap';
const telemetry = bootstrapTelemetry({ serviceName: 'ingest-service', traces: { enabled: true }, metrics: { enabled: true, port: 9464, endpoint: '/metrics' } });
const tracer = telemetry.tracer; // safe no-op if disabled

Env variables
- TELEMETRY_ENABLED=true|false (default false)
- OTEL_TRACES_EXPORTER=otlp|none (future: jaeger)
- OTEL_METRICS_EXPORTER=prometheus|none (uses embedded HTTP server)
- PROMETHEUS_PORT (default 9464)
- PROMETHEUS_ENDPOINT (default /metrics)

Note: This wrapper currently leverages the internal package @athlete-ally/otel-preset. Metrics use the OpenTelemetry Prometheus exporter with its own small HTTP server. If you need the /metrics route on your app server, mount a proxy route in your service in Phase 2.

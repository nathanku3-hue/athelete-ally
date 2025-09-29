// Minimal OpenTelemetry tracer helper for ingest-service
import { trace } from '@opentelemetry/api';

export const tracer = trace.getTracer('ingest-service', '0.1.0');
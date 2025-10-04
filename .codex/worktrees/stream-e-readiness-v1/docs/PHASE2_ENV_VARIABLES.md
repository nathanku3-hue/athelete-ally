# Phase 2 Migration: Environment Variables Reference

**Status**: Reference Documentation
**Version**: 1.0
**Date**: 2025-10-01

---

## Overview

This document provides a complete reference for all environment variables related to the 3-stream topology migration, including backward compatibility mappings and migration-specific settings.

---

## Core Configuration

### Stream Topology Mode

```bash
EVENT_STREAM_MODE=multi
```

**Description**: Controls which stream topology to use

**Values**:
- `multi` (default) - Use 3-stream topology (AA_CORE_HOT, AA_VENDOR_HOT, AA_DLQ)
- `single` - Use legacy single-stream topology (ATHLETE_ALLY_EVENTS)

**Used by**: event-bus package, all services

**Migration notes**:
- Defaults to `multi` in new deployments
- Set to `single` for instant rollback
- No restart required for mode changes (services detect on reconnect)

---

### Stream Names (Overridable)

```bash
STREAM_CORE_NAME=AA_CORE_HOT
STREAM_VENDOR_NAME=AA_VENDOR_HOT
STREAM_DLQ_NAME=AA_DLQ
STREAM_LEGACY_NAME=ATHLETE_ALLY_EVENTS
```

**Description**: Customize stream names per environment

**Defaults**: Values shown above

**Used by**: event-bus package `getStreamName()` function

**Use cases**:
- Testing: `STREAM_CORE_NAME=TEST_CORE_HOT`
- Staging: `STREAM_CORE_NAME=STAGING_CORE_HOT`
- Blue-green: `STREAM_CORE_NAME=AA_CORE_HOT_V2`

---

## HRV Consumer Configuration

### Core Settings

```bash
NORMALIZE_HRV_DURABLE=normalize-hrv-durable
NORMALIZE_HRV_MAX_DELIVER=5
NORMALIZE_HRV_DLQ_SUBJECT=dlq.normalize.hrv.raw-received
NORMALIZE_HRV_ACK_WAIT_MS=60000
```

**NORMALIZE_HRV_DURABLE**
- Description: Durable consumer name for HRV messages
- Default: `normalize-hrv-durable`
- Migration note: **UNCHANGED** (keeping existing name for continuity)

**NORMALIZE_HRV_MAX_DELIVER**
- Description: Maximum redelivery attempts before DLQ
- Default: `5`
- Range: 1-100
- Recommendation: 3-5 for production

**NORMALIZE_HRV_DLQ_SUBJECT**
- Description: Subject prefix for DLQ messages
- Default: `dlq.normalize.hrv.raw-received`
- Must match DLQ stream subject pattern: `dlq.>`

**NORMALIZE_HRV_ACK_WAIT_MS**
- Description: Time to wait for ACK before redelivery
- Default: `60000` (60 seconds)
- Range: 5000-300000 (5s-5m)
- Recommendation: 60s for database operations

---

### Pull Loop Tuning

```bash
HRV_BATCH_SIZE=10
HRV_EXPIRES_MS=5000
HRV_IDLE_BACKOFF_MS=50
```

**HRV_BATCH_SIZE**
- Description: Number of messages to request per pull
- Default: `10`
- Range: 1-100
- Tuning: Lower for real-time, higher for throughput

**HRV_EXPIRES_MS**
- Description: Max time to wait for batch fulfillment
- Default: `5000` (5 seconds)
- Range: 1000-30000 (1s-30s)
- Must be < ACK_WAIT_MS

**HRV_IDLE_BACKOFF_MS**
- Description: Delay between empty fetches (polling backoff)
- Default: `50` (50 milliseconds)
- Range: 10-5000 (10ms-5s)
- Tuning: Lower for latency, higher for CPU efficiency

---

### Stream Binding Fallback

```bash
AA_STREAM_CANDIDATES=AA_CORE_HOT,ATHLETE_ALLY_EVENTS
```

**Description**: Comma-separated list of streams to try binding to (in order)

**Default**: `AA_CORE_HOT,ATHLETE_ALLY_EVENTS`

**Used by**: normalize-service HRV consumer binding logic

**Examples**:
```bash
# Multi-stream with fallback
AA_STREAM_CANDIDATES=AA_CORE_HOT,ATHLETE_ALLY_EVENTS

# Single-stream only (no fallback)
AA_STREAM_CANDIDATES=ATHLETE_ALLY_EVENTS

# Testing new stream
AA_STREAM_CANDIDATES=TEST_CORE_HOT,AA_CORE_HOT,ATHLETE_ALLY_EVENTS
```

---

## Vendor (Oura) Consumer Configuration

```bash
NORMALIZE_DURABLE_NAME=normalize-oura
NORMALIZE_OURA_MAX_DELIVER=5
NORMALIZE_DLQ_SUBJECT=dlq.vendor.oura.webhook
NORMALIZE_OURA_ACK_WAIT_MS=15000
NORMALIZE_OURA_BACKOFF_MS=250,1000,5000
```

**NORMALIZE_DURABLE_NAME**
- Description: Durable consumer name for vendor webhooks
- Default: `normalize-oura`
- Migration note: **UNCHANGED**

**NORMALIZE_OURA_MAX_DELIVER**
- Description: Maximum redelivery attempts
- Default: `5`

**NORMALIZE_DLQ_SUBJECT**
- Description: DLQ subject for vendor messages
- Default: `dlq.vendor.oura.webhook`

**NORMALIZE_OURA_ACK_WAIT_MS**
- Description: ACK timeout (shorter than HRV due to simpler processing)
- Default: `15000` (15 seconds)

**NORMALIZE_OURA_BACKOFF_MS**
- Description: Exponential backoff delays (comma-separated)
- Default: `250,1000,5000` (250ms, 1s, 5s)
- Currently not used by implementation (future enhancement)

---

## NATS Connection

```bash
NATS_URL=nats://localhost:4223
```

**Description**: NATS server connection URL

**Default**: `nats://localhost:4223`

**Format**: `nats://[user:pass@]host:port[,host2:port2,...]`

**Examples**:
```bash
# Local development
NATS_URL=nats://localhost:4223

# Production cluster
NATS_URL=nats://nats1.prod:4223,nats2.prod:4223,nats3.prod:4223

# With authentication
NATS_URL=nats://user:pass@nats.prod:4223
```

**Migration note**: Phase 3 unified all services to port 4223 (previously mixed 4222/4223)

---

## Database Configuration

### Normalize Service

```bash
DATABASE_URL=postgresql://athlete:athlete@localhost:55432/athlete_normalize
```

**Description**: PostgreSQL connection string for normalize-service

**Format**: `postgresql://user:pass@host:port/database`

**Migration note**: Updated to use port 55432 (Docker-exposed port)

---

## Observability

### Prometheus Metrics

```bash
PROMETHEUS_PORT=9464
PROMETHEUS_ENDPOINT=/metrics
TELEMETRY_ENABLED=true
```

**PROMETHEUS_PORT**
- Description: HTTP port for Prometheus metrics scraping
- Default: `9464` (normalize-service)
- Ports by service:
  - ingest-service: `9463`
  - normalize-service: `9464`
  - readiness-service: `9465`

**PROMETHEUS_ENDPOINT**
- Description: HTTP path for metrics endpoint
- Default: `/metrics`

**TELEMETRY_ENABLED**
- Description: Enable OpenTelemetry traces + metrics
- Default: `true`
- Values: `true` | `false`

---

### OpenTelemetry Traces

```bash
OTEL_SERVICE_NAME=normalize-service
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_TRACES_SAMPLER=always_on
```

**OTEL_SERVICE_NAME**
- Description: Service name for trace spans
- Default: Service-specific (e.g., `normalize-service`)

**OTEL_EXPORTER_OTLP_ENDPOINT**
- Description: OTLP collector endpoint
- Default: `http://localhost:4318` (Jaeger OTLP gRPC)
- Set to empty string to disable export

**OTEL_TRACES_SAMPLER**
- Description: Trace sampling strategy
- Default: `always_on`
- Values: `always_on` | `always_off` | `traceidratio` | `parentbased_always_on`

---

## Deployment Configuration

### Service Ports

```bash
# Ingest Service
PORT=4101  # HTTP API

# Normalize Service
PORT=4102  # HTTP health/metrics

# Readiness Service
PORT=4103  # HTTP API
```

### Node Environment

```bash
NODE_ENV=production
```

**Values**:
- `development` - Single replica, verbose logs
- `production` - Multi-replica (3), optimized logs

**Impact**:
- Stream replica count: 1 (dev) vs 3 (prod)
- Log verbosity
- Error stack traces

---

## Migration-Specific Variables

### Blue-Green Deployment

```bash
# Blue instance (legacy)
SERVICE_VERSION=blue
EVENT_STREAM_MODE=single
AA_STREAM_CANDIDATES=ATHLETE_ALLY_EVENTS

# Green instance (new)
SERVICE_VERSION=green
EVENT_STREAM_MODE=multi
AA_STREAM_CANDIDATES=AA_CORE_HOT,ATHLETE_ALLY_EVENTS
```

### Gradual Rollout

```bash
NEW_TOPOLOGY_PERCENTAGE=0.10  # 10% of traffic
```

**Description**: Percentage of messages to route to new topology (0.0-1.0)

**Note**: Not yet implemented in ingest-service (future enhancement)

---

## Complete .env Example Files

### Development (.env.development)

```bash
# Node
NODE_ENV=development

# NATS
NATS_URL=nats://localhost:4223

# Stream Topology
EVENT_STREAM_MODE=multi
STREAM_CORE_NAME=AA_CORE_HOT
STREAM_VENDOR_NAME=AA_VENDOR_HOT
STREAM_DLQ_NAME=AA_DLQ
STREAM_LEGACY_NAME=ATHLETE_ALLY_EVENTS

# HRV Consumer
NORMALIZE_HRV_DURABLE=normalize-hrv-durable
NORMALIZE_HRV_MAX_DELIVER=5
NORMALIZE_HRV_DLQ_SUBJECT=dlq.normalize.hrv.raw-received
NORMALIZE_HRV_ACK_WAIT_MS=60000
HRV_BATCH_SIZE=10
HRV_EXPIRES_MS=5000
HRV_IDLE_BACKOFF_MS=50
AA_STREAM_CANDIDATES=AA_CORE_HOT,ATHLETE_ALLY_EVENTS

# Vendor Consumer
NORMALIZE_DURABLE_NAME=normalize-oura
NORMALIZE_OURA_MAX_DELIVER=5
NORMALIZE_DLQ_SUBJECT=dlq.vendor.oura.webhook
NORMALIZE_OURA_ACK_WAIT_MS=15000
NORMALIZE_OURA_BACKOFF_MS=250,1000,5000

# Database
DATABASE_URL=postgresql://athlete:athlete@localhost:55432/athlete_normalize

# Observability
TELEMETRY_ENABLED=true
PROMETHEUS_PORT=9464
PROMETHEUS_ENDPOINT=/metrics
OTEL_SERVICE_NAME=normalize-service
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_TRACES_SAMPLER=always_on

# Service
PORT=4102
```

---

### Production (.env.production)

```bash
# Node
NODE_ENV=production

# NATS (clustered)
NATS_URL=nats://nats1.prod:4223,nats2.prod:4223,nats3.prod:4223

# Stream Topology
EVENT_STREAM_MODE=multi
STREAM_CORE_NAME=AA_CORE_HOT
STREAM_VENDOR_NAME=AA_VENDOR_HOT
STREAM_DLQ_NAME=AA_DLQ

# HRV Consumer (production tuning)
NORMALIZE_HRV_DURABLE=normalize-hrv-durable
NORMALIZE_HRV_MAX_DELIVER=5
NORMALIZE_HRV_DLQ_SUBJECT=dlq.normalize.hrv.raw-received
NORMALIZE_HRV_ACK_WAIT_MS=90000  # 90s for DB latency
HRV_BATCH_SIZE=20  # Higher throughput
HRV_EXPIRES_MS=10000  # 10s batch window
HRV_IDLE_BACKOFF_MS=100  # Balance latency/CPU
AA_STREAM_CANDIDATES=AA_CORE_HOT

# Vendor Consumer
NORMALIZE_DURABLE_NAME=normalize-oura
NORMALIZE_OURA_MAX_DELIVER=5
NORMALIZE_DLQ_SUBJECT=dlq.vendor.oura.webhook
NORMALIZE_OURA_ACK_WAIT_MS=30000  # 30s for webhook processing
NORMALIZE_OURA_BACKOFF_MS=1000,5000,15000

# Database (RDS)
DATABASE_URL=postgresql://athlete:${DB_PASSWORD}@rds.prod:5432/athlete_normalize?sslmode=require

# Observability
TELEMETRY_ENABLED=true
PROMETHEUS_PORT=9464
PROMETHEUS_ENDPOINT=/metrics
OTEL_SERVICE_NAME=normalize-service
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger-collector:4318
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1  # 10% sampling

# Service
PORT=4102
```

---

### Rollback (.env.rollback)

```bash
# Instant rollback configuration - revert to single-stream topology

# CRITICAL: Set mode to single
EVENT_STREAM_MODE=single

# Force legacy stream
AA_STREAM_CANDIDATES=ATHLETE_ALLY_EVENTS

# Keep all other settings unchanged
NORMALIZE_HRV_DURABLE=normalize-hrv-durable
NORMALIZE_HRV_MAX_DELIVER=5
NORMALIZE_HRV_ACK_WAIT_MS=60000
# ... (rest of config)
```

---

## Backward Compatibility Matrix

| Variable | Phase 1 (Legacy) | Phase 2 (Migration) | Notes |
|----------|------------------|---------------------|-------|
| `NATS_URL` | `nats://localhost:4222` | `nats://localhost:4223` | Unified in Phase 3 |
| `EVENT_STREAM_MODE` | *(not used)* | `multi` (default) | New variable |
| `STREAM_*_NAME` | *(not used)* | Customizable | Optional overrides |
| `NORMALIZE_HRV_DURABLE` | `normalize-hrv-durable` | **UNCHANGED** | Continuity preserved |
| `AA_STREAM_CANDIDATES` | *(not used)* | `AA_CORE_HOT,ATHLETE_ALLY_EVENTS` | Fallback logic |
| Metrics labels | `{result, subject}` | `{result, subject, stream, durable}` | Added labels |

---

## Validation Commands

### Check Current Configuration

```bash
# Show all NATS-related env vars
env | grep -E 'NATS|STREAM|NORMALIZE|HRV' | sort

# Verify mode
echo $EVENT_STREAM_MODE  # Should be "multi" or "single"

# Check stream candidates
echo $AA_STREAM_CANDIDATES  # Should list streams in order
```

### Test Configuration Changes

```bash
# Dry-run with new config
EVENT_STREAM_MODE=multi npm start -- --dry-run

# Validate env file syntax
set -a && source .env.production && set +a && echo "✅ Valid"
```

---

## Troubleshooting

### Consumer Not Binding

**Symptom**: `Failed to bind consumer to any stream`

**Check**:
```bash
echo $AA_STREAM_CANDIDATES
nats stream list  # Verify streams exist
```

**Fix**: Ensure at least one stream in candidates list exists

---

### Wrong Stream Mode

**Symptom**: Service binds to unexpected stream

**Check**:
```bash
echo $EVENT_STREAM_MODE  # Should match intention
docker logs normalize-service | grep "bound to"
```

**Fix**: Verify .env file is sourced correctly

---

### Performance Issues

**Symptom**: High CPU or slow processing

**Check**:
```bash
echo $HRV_BATCH_SIZE      # Too low = overhead
echo $HRV_IDLE_BACKOFF_MS # Too low = CPU thrash
echo $HRV_EXPIRES_MS      # Too high = latency
```

**Tuning guidance**:
- Low latency: `BATCH_SIZE=1, EXPIRES_MS=1000, IDLE_BACKOFF_MS=10`
- Balanced: `BATCH_SIZE=10, EXPIRES_MS=5000, IDLE_BACKOFF_MS=50` (default)
- High throughput: `BATCH_SIZE=50, EXPIRES_MS=15000, IDLE_BACKOFF_MS=500`

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-01 | Initial release for Phase 2 migration |

---

**Document Version**: 1.0
**Last Updated**: 2025-10-01
**Maintained by**: Platform Team

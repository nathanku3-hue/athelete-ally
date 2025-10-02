# Phase 3 Monitoring Queries and Alert Rules

**Purpose:** Prometheus/Grafana queries and alert rules for Phase B multi-stream migration monitoring.

**Last Updated:** 2025-10-02

---

## Table of Contents

1. [Prometheus Metrics Reference](#prometheus-metrics-reference)
2. [Grafana Dashboard Panels](#grafana-dashboard-panels)
3. [Alert Rules](#alert-rules)
4. [SLI/SLO Definitions](#slislo-definitions)

---

## Prometheus Metrics Reference

### Service Metrics (prom-client)

```promql
# HRV Message Processing Counter (normalize-service)
normalize_hrv_messages_total{result, subject, stream, durable}

# Labels:
#   result: "success" | "schema_invalid" | "dlq" | "retry"
#   subject: "athlete-ally.hrv.raw-received"
#   stream: "AA_CORE_HOT" | "ATHLETE_ALLY_EVENTS"
#   durable: "normalize-hrv-durable"

# Event Bus Publishing Counter (all services)
event_bus_events_published_total{topic, status}

# Labels:
#   topic: "hrv_raw_received" | "hrv_normalized_stored" | ...
#   status: "success" | "error"

# Event Bus Schema Validation Counter
event_bus_schema_validation_total{topic, status}
event_bus_schema_validation_failures_total{topic, error_type}

# Event Bus Processing Duration (histogram)
event_bus_event_processing_duration_seconds{topic, operation, status}
```

### Default Node.js Metrics

```promql
# Process metrics
process_cpu_user_seconds_total
process_cpu_system_seconds_total
process_resident_memory_bytes
nodejs_eventloop_lag_seconds
nodejs_heap_size_total_bytes
nodejs_heap_size_used_bytes

# HTTP metrics (if using prom-client default registry)
http_request_duration_seconds
http_requests_total
```

---

## Grafana Dashboard Panels

### Panel 1: HRV Message Success Rate by Stream

**Query:**
```promql
# Success rate per stream (last 5 minutes)
sum(rate(normalize_hrv_messages_total{result="success"}[5m])) by (stream)
```

**Visualization:** Time Series (Line Chart)
**Y-Axis:** Messages/sec
**Legend:** `{{stream}}`

**Expected Behavior:**
- **Pre-Migration:** All traffic on `ATHLETE_ALLY_EVENTS`
- **Post-Migration:** All traffic on `AA_CORE_HOT`
- **During Rollback:** Traffic returns to `ATHLETE_ALLY_EVENTS`

---

### Panel 2: HRV Message Result Distribution

**Query:**
```promql
# Message counts by result type (last 5 minutes)
sum(rate(normalize_hrv_messages_total[5m])) by (result)
```

**Visualization:** Time Series (Stacked Area)
**Y-Axis:** Messages/sec
**Legend:** `{{result}}`

**Colors:**
- `success`: Green
- `retry`: Yellow
- `schema_invalid`: Orange
- `dlq`: Red

**Expected Behavior:**
- `success` should be dominant (> 95%)
- `retry` should be minimal (< 5%)
- `schema_invalid` should be rare (< 0.1%)
- `dlq` should be near-zero

---

### Panel 3: DLQ Message Rate (Alert Threshold)

**Query:**
```promql
# DLQ messages per second (5-minute rate)
sum(rate(normalize_hrv_messages_total{result="dlq"}[5m]))
```

**Visualization:** Time Series (Line Chart) with Alert Threshold
**Y-Axis:** Messages/sec
**Alert Threshold Line:** 0.01 (≈0.6 msg/min)

**Expected Behavior:**
- Normal: 0 messages/sec
- Warning: > 0 messages/sec for 5 minutes
- Critical: > 0.1 messages/sec (6 msg/min)

---

### Panel 4: Event Bus Publishing Success Rate

**Query:**
```promql
# Success rate for HRV publishing (ingest-service)
sum(rate(event_bus_events_published_total{topic="hrv_raw_received", status="success"}[5m]))
```

**Visualization:** Time Series (Line Chart)
**Y-Axis:** Events/sec

**Paired with Error Rate:**
```promql
sum(rate(event_bus_events_published_total{topic="hrv_raw_received", status="error"}[5m]))
```

---

### Panel 5: Schema Validation Failure Rate

**Query:**
```promql
# Schema validation failures per second
sum(rate(event_bus_schema_validation_failures_total[5m])) by (topic, error_type)
```

**Visualization:** Time Series (Line Chart)
**Y-Axis:** Failures/sec
**Legend:** `{{topic}}: {{error_type}}`

**Expected Behavior:**
- Normal: 0 failures/sec
- Warning: > 0 failures/sec sustained (indicates schema drift or bad data)

---

### Panel 6: Message Processing Latency (p50, p95, p99)

**Query:**
```promql
# P50 latency (normalize.hrv.consume span)
histogram_quantile(0.50,
  sum(rate(event_bus_event_processing_duration_seconds_bucket{topic="hrv_raw_received", operation="consume"}[5m])) by (le)
)

# P95 latency
histogram_quantile(0.95,
  sum(rate(event_bus_event_processing_duration_seconds_bucket{topic="hrv_raw_received", operation="consume"}[5m])) by (le)
)

# P99 latency
histogram_quantile(0.99,
  sum(rate(event_bus_event_processing_duration_seconds_bucket{topic="hrv_raw_received", operation="consume"}[5m])) by (le)
)
```

**Visualization:** Time Series (Multi-line)
**Y-Axis:** Seconds
**Legend:** `p50`, `p95`, `p99`

**Expected Behavior:**
- p50 < 0.1s
- p95 < 0.5s
- p99 < 1.0s

---

### Panel 7: Stream Fallback Detection

**Query:**
```promql
# Count of messages processed on legacy stream (should be 0 after migration)
sum(rate(normalize_hrv_messages_total{stream="ATHLETE_ALLY_EVENTS"}[5m]))
```

**Visualization:** Stat (Single Value) + Time Series
**Threshold:**
- Green: 0 messages/sec (all traffic on AA_CORE_HOT)
- Yellow: > 0 messages/sec (fallback detected)
- Red: Only ATHLETE_ALLY_EVENTS traffic (AA_CORE_HOT down)

**Use Case:** Detect if services are falling back to legacy stream

---

### Panel 8: Service Health Status

**Query:**
```promql
# Up status (1 = healthy, 0 = down)
up{job="normalize-service"}
up{job="ingest-service"}
```

**Visualization:** Stat Panel (Boolean)
**Thresholds:**
- Green: 1
- Red: 0

---

## Alert Rules

### Alert 1: DLQ Message Spike

**Severity:** Warning
**Trigger:** DLQ rate > 0 for 5 minutes

```yaml
- alert: HRVDLQMessagesDetected
  expr: |
    sum(rate(normalize_hrv_messages_total{result="dlq"}[5m])) > 0
  for: 5m
  labels:
    severity: warning
    component: normalize-service
    category: data-quality
  annotations:
    summary: "HRV messages being sent to DLQ"
    description: |
      DLQ message rate: {{ $value | humanize }} msg/sec
      This indicates messages are failing after max retries.
      Check normalize-service logs for error patterns.
    dashboard: https://grafana.example.com/d/phase3-multi-stream
    runbook: https://github.com/example/runbooks/hrv-dlq-spike
```

**Response Actions:**
1. Check normalize-service logs for error patterns
2. Inspect DLQ messages: `nats stream view AA_DLQ`
3. Verify database connectivity
4. Check for schema validation failures

---

### Alert 2: Stream Fallback Detected

**Severity:** Warning
**Trigger:** Messages on ATHLETE_ALLY_EVENTS stream after migration

```yaml
- alert: StreamFallbackDetected
  expr: |
    sum(rate(normalize_hrv_messages_total{stream="ATHLETE_ALLY_EVENTS"}[5m])) > 0
  for: 5m
  labels:
    severity: warning
    component: normalize-service
    category: infrastructure
  annotations:
    summary: "Normalize service falling back to legacy stream"
    description: |
      Messages are being processed on ATHLETE_ALLY_EVENTS instead of AA_CORE_HOT.
      This indicates the consumer on AA_CORE_HOT is not found or unavailable.
      Current rate: {{ $value | humanize }} msg/sec on legacy stream
    dashboard: https://grafana.example.com/d/phase3-multi-stream
    runbook: https://github.com/example/runbooks/stream-fallback
```

**Response Actions:**
1. Verify AA_CORE_HOT stream exists: `nats stream info AA_CORE_HOT`
2. Verify consumer exists: `nats consumer info AA_CORE_HOT normalize-hrv-durable`
3. Check normalize-service logs for "Consumer not found" errors
4. If persists > 10 minutes, consider rollback

---

### Alert 3: Schema Validation Failure Rate High

**Severity:** Warning
**Trigger:** Schema validation failures > 0.1/sec for 5 minutes

```yaml
- alert: SchemaValidationFailuresHigh
  expr: |
    sum(rate(event_bus_schema_validation_failures_total[5m])) > 0.1
  for: 5m
  labels:
    severity: warning
    component: event-bus
    category: data-quality
  annotations:
    summary: "High rate of schema validation failures"
    description: |
      Schema validation failure rate: {{ $value | humanize }} failures/sec
      Topics affected: {{ range query "sum(rate(event_bus_schema_validation_failures_total[5m])) by (topic)" }}{{ .Labels.topic }}{{ end }}
      This may indicate schema drift or bad data from upstream sources.
    dashboard: https://grafana.example.com/d/event-bus-overview
```

**Response Actions:**
1. Check which topics are affected
2. Inspect failed events in DLQ
3. Verify contract schema versions are in sync
4. Check for recent schema changes

---

### Alert 4: HRV Processing Stopped

**Severity:** Critical
**Trigger:** No successful HRV messages for 5 minutes

```yaml
- alert: HRVProcessingStopped
  expr: |
    sum(rate(normalize_hrv_messages_total{result="success"}[5m])) == 0
  for: 5m
  labels:
    severity: critical
    component: normalize-service
    category: availability
  annotations:
    summary: "HRV message processing has stopped"
    description: |
      No successful HRV messages processed in the last 5 minutes.
      This indicates a complete service failure or upstream data flow issue.
      Immediate investigation required.
    dashboard: https://grafana.example.com/d/phase3-multi-stream
    runbook: https://github.com/example/runbooks/hrv-processing-stopped
```

**Response Actions:**
1. Check normalize-service health endpoint
2. Check ingest-service health endpoint
3. Verify NATS connectivity
4. Check database connectivity
5. Review service logs for errors
6. **If cannot resolve quickly**: Execute rollback procedure

---

### Alert 5: Message Processing Latency High

**Severity:** Warning
**Trigger:** P95 latency > 1 second for 10 minutes

```yaml
- alert: HRVProcessingLatencyHigh
  expr: |
    histogram_quantile(0.95,
      sum(rate(event_bus_event_processing_duration_seconds_bucket{topic="hrv_raw_received", operation="consume"}[5m])) by (le)
    ) > 1.0
  for: 10m
  labels:
    severity: warning
    component: normalize-service
    category: performance
  annotations:
    summary: "HRV message processing latency is high"
    description: |
      P95 processing latency: {{ $value | humanizeDuration }}
      Target SLO: < 0.5s
      This may indicate database performance issues or resource contention.
    dashboard: https://grafana.example.com/d/phase3-multi-stream
```

**Response Actions:**
1. Check database connection pool usage
2. Check service CPU/memory usage
3. Review slow query logs
4. Check for database locks or contention

---

## SLI/SLO Definitions

### SLI 1: HRV Message Processing Success Rate

**Definition:** Percentage of HRV messages successfully processed (result="success") out of all attempted messages.

**Measurement:**
```promql
# Success rate over 5 minutes
sum(rate(normalize_hrv_messages_total{result="success"}[5m]))
/
sum(rate(normalize_hrv_messages_total[5m]))
* 100
```

**SLO Target:** ≥ 99.9% (3 nines)

**Error Budget:** 0.1% = ~43 minutes of failed messages per month

---

### SLI 2: HRV Message Processing Latency

**Definition:** Time from message publish (ingest-service) to database write completion (normalize-service).

**Measurement:**
```promql
# P95 latency
histogram_quantile(0.95,
  sum(rate(event_bus_event_processing_duration_seconds_bucket{topic="hrv_raw_received", operation="consume"}[5m])) by (le)
)
```

**SLO Target:**
- P50 < 100ms
- P95 < 500ms
- P99 < 1000ms

**Error Budget:** 5% of requests can exceed targets

---

### SLI 3: DLQ Message Rate

**Definition:** Rate of messages sent to Dead Letter Queue (indicates unrecoverable failures).

**Measurement:**
```promql
# DLQ rate per second
sum(rate(normalize_hrv_messages_total{result="dlq"}[5m]))
```

**SLO Target:** < 0.01 messages/sec (< 0.1% of total throughput)

**Critical Threshold:** > 0.1 messages/sec sustained for 5 minutes

---

### SLI 4: Service Availability

**Definition:** Percentage of time normalize-service and ingest-service health endpoints return 200 OK.

**Measurement:**
```promql
# Uptime percentage over 5 minutes
avg_over_time(up{job=~"normalize-service|ingest-service"}[5m]) * 100
```

**SLO Target:** ≥ 99.95% (3.5 nines)

**Downtime Budget:** 21.9 minutes per month

---

## Dashboard Layout Recommendations

### Overview Dashboard: "Phase 3 - Multi-Stream Migration"

**Row 1: Key Metrics (Stat Panels)**
- Total Messages/sec (success rate)
- DLQ Messages/sec (alert if > 0)
- Stream Distribution (% on AA_CORE_HOT vs ATHLETE_ALLY_EVENTS)
- Service Health (Up/Down status)

**Row 2: Success vs Failure Rates**
- Panel 1: HRV Success Rate by Stream (time series)
- Panel 2: HRV Result Distribution (stacked area)

**Row 3: DLQ Monitoring**
- Panel 3: DLQ Message Rate (time series with threshold line)
- Panel 4: Schema Validation Failures (time series)

**Row 4: Performance Metrics**
- Panel 6: Processing Latency (p50/p95/p99)
- Panel 8: Event Loop Lag (nodejs_eventloop_lag_seconds)

**Row 5: Infrastructure**
- Panel 7: Stream Fallback Detection (stat + time series)
- Service Memory Usage
- Service CPU Usage

---

## Example Prometheus Configuration

```yaml
# prometheus.yml snippet
scrape_configs:
  - job_name: 'normalize-service'
    static_configs:
      - targets: ['normalize-service.staging:4102']
    metrics_path: '/metrics'
    scrape_interval: 15s
    scrape_timeout: 10s

  - job_name: 'ingest-service'
    static_configs:
      - targets: ['ingest-service.staging:4101']
    metrics_path: '/metrics'
    scrape_interval: 15s
    scrape_timeout: 10s

# Alert rules file reference
rule_files:
  - 'alerts/phase3-multi-stream.yml'
```

---

## Example Alert Manager Configuration

```yaml
# alertmanager.yml snippet
route:
  group_by: ['alertname', 'component']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'platform-ops'

  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-critical'

    - match:
        category: data-quality
      receiver: 'data-quality-slack'

receivers:
  - name: 'platform-ops'
    slack_configs:
      - channel: '#platform-ops'
        text: "{{ range .Alerts }}{{ .Annotations.summary }}\n{{ .Annotations.description }}{{ end }}"

  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: '<PAGERDUTY_SERVICE_KEY>'

  - name: 'data-quality-slack'
    slack_configs:
      - channel: '#data-quality'
        text: "Data Quality Alert: {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}"
```

---

## Testing Alert Rules

```bash
# Unit test alert expressions (requires promtool)
promtool check rules alerts/phase3-multi-stream.yml

# Send test alert
curl -X POST http://alertmanager:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {
      "alertname": "HRVDLQMessagesDetected",
      "severity": "warning",
      "component": "normalize-service"
    },
    "annotations": {
      "summary": "Test alert for DLQ messages",
      "description": "This is a test alert"
    }
  }]'
```

---

## Appendix: Useful PromQL Queries

```promql
# Total message throughput (all results)
sum(rate(normalize_hrv_messages_total[5m]))

# Success rate percentage
sum(rate(normalize_hrv_messages_total{result="success"}[5m]))
/
sum(rate(normalize_hrv_messages_total[5m]))
* 100

# Error rate (schema_invalid + dlq)
sum(rate(normalize_hrv_messages_total{result=~"schema_invalid|dlq"}[5m]))

# Stream distribution (pie chart)
sum(rate(normalize_hrv_messages_total{result="success"}[5m])) by (stream)

# Top error types
topk(5, sum(rate(event_bus_schema_validation_failures_total[5m])) by (error_type))

# Memory growth rate
rate(process_resident_memory_bytes[5m])

# CPU usage percentage
rate(process_cpu_seconds_total[5m]) * 100
```

---

**Document Control:**
- Version: 1.0
- Last Updated: 2025-10-02
- Owner: Platform Engineering / SRE Team
- Related: PHASE_B_RUNBOOK.md, alerts-runbooks.md

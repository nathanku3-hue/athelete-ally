# Sleep Soak Test Results

## Test Configuration

| Parameter | Value |
|-----------|-------|
| **Test Start** | <!-- YYYY-MM-DD HH:MM:SS UTC --> |
| **Test End** | <!-- YYYY-MM-DD HH:MM:SS UTC --> |
| **Environment** | <!-- local / staging / production --> |
| **NATS URL** | <!-- e.g., nats://localhost:4223 --> |
| **NATS HTTP** | <!-- e.g., http://localhost:8222 --> |
| **Normalize Service** | <!-- e.g., http://localhost:4102 --> |
| **Stream** | <!-- e.g., AA_CORE_HOT --> |
| **Sleep Consumer** | <!-- e.g., normalize-sleep-durable --> |
| **HRV Consumer** | <!-- e.g., normalize-hrv-durable --> |

---

## Commands

### Local Development

```bash
# Basic health check
cd docs/phase-3/ops
./48h-soak-health-check.sh --checkpoint 24h

# With JSON output
./48h-soak-health-check.sh --checkpoint 24h --json

# Custom environment
NATS_URL=nats://localhost:4223 \
NATS_HTTP=http://localhost:8222 \
NORMALIZE_URL=http://localhost:4102 \
DATABASE_URL=postgresql://user:pass@localhost:5432/athleteally \
./48h-soak-health-check.sh --checkpoint 24h --json
```

### Staging Environment

```bash
# 24h checkpoint
NATS_URL=nats://staging-nats.example.com:4223 \
NATS_HTTP=http://staging-nats.example.com:8222 \
NORMALIZE_URL=http://staging-normalize.example.com:4102 \
DATABASE_URL="$STAGING_DATABASE_URL" \
./48h-soak-health-check.sh --checkpoint 24h --json

# 48h checkpoint
NATS_URL=nats://staging-nats.example.com:4223 \
NATS_HTTP=http://staging-nats.example.com:8222 \
NORMALIZE_URL=http://staging-normalize.example.com:4102 \
DATABASE_URL="$STAGING_DATABASE_URL" \
./48h-soak-health-check.sh --checkpoint 48h --json
```

### Production Environment

```bash
# 24h checkpoint
NATS_URL=nats://prod-nats.example.com:4223 \
NATS_HTTP=http://prod-nats.example.com:8222 \
NORMALIZE_URL=http://prod-normalize.example.com:4102 \
DATABASE_URL="$PRODUCTION_DATABASE_URL" \
./48h-soak-health-check.sh --checkpoint 24h --json

# 48h checkpoint
NATS_URL=nats://prod-nats.example.com:4223 \
NATS_HTTP=http://prod-nats.example.com:8222 \
NORMALIZE_URL=http://prod-normalize.example.com:4102 \
DATABASE_URL="$PRODUCTION_DATABASE_URL" \
./48h-soak-health-check.sh --checkpoint 48h --json

# Custom stream/durables (if using non-default names)
NATS_URL=nats://prod-nats.example.com:4223 \
NATS_HTTP=http://prod-nats.example.com:8222 \
NORMALIZE_URL=http://prod-normalize.example.com:4102 \
./48h-soak-health-check.sh \
  --checkpoint 48h \
  --stream AA_CORE_HOT \
  --durable-sleep normalize-sleep-durable \
  --durable-hrv normalize-hrv-durable \
  --json
```

---

## 24h Checkpoint

**Timestamp:** <!-- YYYY-MM-DD HH:MM:SS UTC -->

### Health Check Output

```
<!-- Paste full output from ./48h-soak-health-check.sh --checkpoint 24h here -->
```

### Metrics Summary

#### HRV Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Consumer Pending** | <!-- e.g., 3 --> | <!-- PASS / WARN / FAIL --> |
| **Success Count** | <!-- e.g., 12,450 --> | |
| **DLQ Count** | <!-- e.g., 0 --> | <!-- PASS / WARN / FAIL --> |
| **Retry Count** | <!-- e.g., 12 --> | |
| **Success Rate** | <!-- e.g., 99.95% --> | <!-- PASS / WARN / FAIL --> |
| **Stream Purity** | <!-- PASS / FAIL --> | <!-- PASS / FAIL --> |
| **DB Writes (1h)** | <!-- e.g., 523 --> | <!-- PASS / WARN --> |

#### Sleep Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Consumer Pending** | <!-- e.g., 5 --> | <!-- PASS / WARN / FAIL --> |
| **Success Count** | <!-- e.g., 8,230 --> | |
| **DLQ Count** | <!-- e.g., 0 --> | <!-- PASS / WARN / FAIL --> |
| **Retry Count** | <!-- e.g., 8 --> | |
| **Success Rate** | <!-- e.g., 99.92% --> | <!-- PASS / WARN / FAIL --> |
| **Stream Purity** | <!-- PASS / FAIL --> | <!-- PASS / FAIL --> |
| **DB Writes (1h)** | <!-- e.g., 342 --> | <!-- PASS / WARN --> |
| **DLQ Depth** | <!-- e.g., 0 --> | <!-- PASS / WARN / FAIL --> |

### Observations

<!--
- Any anomalies or unexpected behavior
- Performance notes
- Infrastructure issues
- Rate limiting or throttling observed
-->

---

## 48h Checkpoint

**Timestamp:** <!-- YYYY-MM-DD HH:MM:SS UTC -->

### Health Check Output

```
<!-- Paste full output from ./48h-soak-health-check.sh --checkpoint 48h here -->
```

### Metrics Summary

#### HRV Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Consumer Pending** | <!-- e.g., 2 --> | <!-- PASS / WARN / FAIL --> |
| **Success Count** | <!-- e.g., 24,980 --> | |
| **DLQ Count** | <!-- e.g., 0 --> | <!-- PASS / WARN / FAIL --> |
| **Retry Count** | <!-- e.g., 20 --> | |
| **Success Rate** | <!-- e.g., 99.97% --> | <!-- PASS / WARN / FAIL --> |
| **Stream Purity** | <!-- PASS / FAIL --> | <!-- PASS / FAIL --> |
| **DB Writes (1h)** | <!-- e.g., 518 --> | <!-- PASS / WARN --> |

#### Sleep Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Consumer Pending** | <!-- e.g., 4 --> | <!-- PASS / WARN / FAIL --> |
| **Success Count** | <!-- e.g., 16,540 --> | |
| **DLQ Count** | <!-- e.g., 0 --> | <!-- PASS / WARN / FAIL --> |
| **Retry Count** | <!-- e.g., 15 --> | |
| **Success Rate** | <!-- e.g., 99.94% --> | <!-- PASS / WARN / FAIL --> |
| **Stream Purity** | <!-- PASS / FAIL --> | <!-- PASS / FAIL --> |
| **DB Writes (1h)** | <!-- e.g., 345 --> | <!-- PASS / WARN --> |
| **DLQ Depth** | <!-- e.g., 0 --> | <!-- PASS / WARN / FAIL --> |

### Observations

<!--
- Any anomalies or unexpected behavior
- Performance notes
- Infrastructure issues
- Rate limiting or throttling observed
-->

---

## Soak Checklist Results

### HRV Soak Checklist

| Target | 24h Result | 48h Result | Status |
|--------|-----------|-----------|--------|
| **Success Rate ≥ 99.9%** | <!-- e.g., 99.95% --> | <!-- e.g., 99.97% --> | <!-- ✅ / ⚠️ / ❌ --> |
| **Consumer Pending < 10** | <!-- e.g., 3 --> | <!-- e.g., 2 --> | <!-- ✅ / ⚠️ / ❌ --> |
| **DLQ Rate = 0** | <!-- e.g., 0 --> | <!-- e.g., 0 --> | <!-- ✅ / ⚠️ / ❌ --> |
| **Stream Purity = 100%** | <!-- PASS / FAIL --> | <!-- PASS / FAIL --> | <!-- ✅ / ⚠️ / ❌ --> |
| **Fallback Events = 0** | <!-- TODO --> | <!-- TODO --> | <!-- ⏭️ (not tracked) --> |

### Sleep Soak Checklist

| Target | 24h Result | 48h Result | Status |
|--------|-----------|-----------|--------|
| **Success Rate ≥ 99.9%** | <!-- e.g., 99.92% --> | <!-- e.g., 99.94% --> | <!-- ✅ / ⚠️ / ❌ --> |
| **Consumer Pending < 10** | <!-- e.g., 5 --> | <!-- e.g., 4 --> | <!-- ✅ / ⚠️ / ❌ --> |
| **DLQ Rate = 0** | <!-- e.g., 0 --> | <!-- e.g., 0 --> | <!-- ✅ / ⚠️ / ❌ --> |
| **Stream Purity = 100%** | <!-- PASS / FAIL --> | <!-- PASS / FAIL --> | <!-- ✅ / ⚠️ / ❌ --> |
| **Fallback Events = 0** | <!-- TODO --> | <!-- TODO --> | <!-- ⏭️ (not tracked) --> |

---

## Notes

### Issues Encountered

<!--
- List any bugs, errors, or unexpected behavior
- Include timestamps and error messages
-->

### Performance Observations

<!--
- Throughput metrics
- Latency observations
- Resource usage (CPU, memory, connections)
-->

### Infrastructure Notes

<!--
- NATS cluster health
- Database performance
- Network issues
-->

### Recommendations

<!--
- Suggested improvements
- Configuration changes
- Follow-up work needed
-->

---

## Sign-off Checklist

- [ ] 24h checkpoint completed
- [ ] 48h checkpoint completed
- [ ] All metrics meet targets (≥99.9% success, <10 pending, 0 DLQ)
- [ ] No critical errors observed
- [ ] JSON summaries attached (24h + 48h)
- [ ] Observations documented
- [ ] Recommendations noted
- [ ] Results reviewed by: <!-- name -->
- [ ] Approved for production: <!-- YES / NO / CONDITIONAL -->

---

## Attachments

<!--
Link or reference JSON output files:
- soak_sleep_summary_24h.json
- soak_sleep_summary_48h.json
- Grafana dashboard snapshots
- Alert history
-->

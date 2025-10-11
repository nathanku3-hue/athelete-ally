# Phase B - 48h Soak Period Quick Reference

**Start:** 2025-10-02 17:08:59 UTC
**End:** 2025-10-04 17:08:59 UTC
**Status:** 🟢 IN PROGRESS

---

## 🎯 Success Criteria

| Metric | Target | Check Frequency |
|--------|--------|-----------------|
| Fallback events to ATHLETE_ALLY_EVENTS | 0 | Every 24h |
| DLQ message rate | 0 msg/sec | Continuous (alert if >0 for 5min) |
| Consumer pending messages | < 10 | Every 24h |
| Consumer redeliveries | < 10 total | Every 24h |
| Success rate | ≥ 99.9% | Every 24h |
| Stream purity (AA_CORE_HOT) | 100% | Every 24h |
| Database flow | Recent records exist | Every 24h |

---

## 🔍 Quick Health Checks

### Automated Script (Run Every 24h)
```bash
cd /e/vibe/athlete-ally-original
bash docs/phase-3/ops/48h-soak-health-check.sh
```

**Checks:**
1. ✅ Fallback detection (ATHLETE_ALLY_EVENTS message count unchanged)
2. ✅ DLQ stability (AA_DLQ message count < 5)
3. ✅ Consumer health (pending < 100, ack_pending < 50, redeliveries < 10)
4. ✅ Metrics stream labels (100% on AA_CORE_HOT)
5. ✅ Database flow (recent hrv_data inserts)
6. ✅ DLQ rate from metrics (result="dlq" count = 0)

---

### Manual Quick Checks

**Consumer Lag:**
```bash
node -e "
const { connect } = require('nats');
(async () => {
  const nc = await connect({ servers: 'nats://localhost:4223' });
  const jsm = await nc.jetstreamManager();
  const info = await jsm.consumers.info('AA_CORE_HOT', 'normalize-hrv-durable');
  console.log('Pending:', info.num_pending || 0);
  console.log('Ack Pending:', info.num_ack_pending || 0);
  console.log('Redelivered:', info.num_redelivered || 0);
  await nc.close();
})();
"
```

**Stream Info:**
```bash
node -e "
const { connect } = require('nats');
(async () => {
  const nc = await connect({ servers: 'nats://localhost:4223' });
  const jsm = await nc.jetstreamManager();

  const core = await jsm.streams.info('AA_CORE_HOT');
  console.log('AA_CORE_HOT:', core.config.subjects, '- Messages:', core.state.messages);

  const legacy = await jsm.streams.info('ATHLETE_ALLY_EVENTS');
  console.log('ATHLETE_ALLY_EVENTS:', legacy.config.subjects, '- Messages:', legacy.state.messages);

  await nc.close();
})();
"
```

**Database Flow:**
```bash
docker exec athlete-ally-postgres psql -U athlete -d athlete_normalize -c \
  "SELECT COUNT(*) FROM hrv_data WHERE \"createdAt\" > NOW() - INTERVAL '10 minutes';"
```

**Metrics Check:**
```bash
curl -s http://localhost:4102/metrics | grep normalize_hrv_messages_total
```

---

## 🚨 Alert Thresholds

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| Fallback Detected | ATHLETE_ALLY_EVENTS messages > 55 | 🟡 Warning | Investigate consumer on AA_CORE_HOT |
| DLQ Spike | AA_DLQ messages > 5 | 🟡 Warning | Check service logs for DLQ routing |
| Consumer Lag High | Pending > 100 | 🟡 Warning | Check service processing speed |
| DLQ Rate > 0 | normalize_hrv_messages_total{result="dlq"} > 0 for 5min | 🟡 Warning | Review DLQ messages |
| No DB Writes | hrv_data recent count = 0 for 5min | 🔴 Critical | Check service health, DB connectivity |
| Service Crash | Health endpoint 5xx or timeout | 🔴 Critical | Execute rollback procedure |

---

## 🔄 Rollback Procedure

**Trigger:** Any 🔴 Critical alert

**Steps (< 5 minutes):**

1. **Revert Config:**
   ```bash
   cd /e/vibe/athlete-ally-original/services/normalize-service
   # Edit .env: Set EVENT_STREAM_MODE=single
   sed -i 's/EVENT_STREAM_MODE=multi/EVENT_STREAM_MODE=single/' .env
   ```

2. **Restart Service:**
   ```bash
   # Stop current service (find PID with: netstat -ano | grep :4102)
   taskkill //F //PID <PID>

   # Restart
   npm run dev > /tmp/normalize-rollback.log 2>&1 &
   ```

3. **Verify Rollback:**
   ```bash
   sleep 5
   tail -50 /tmp/normalize-rollback.log | grep "Stream mode:"
   # Expected: [event-bus] Stream mode: single

   tail -50 /tmp/normalize-rollback.log | grep "Stream candidates"
   # Expected: Stream candidates: ATHLETE_ALLY_EVENTS
   ```

4. **E2E Test:**
   ```bash
   node -e "
   const { connect } = require('nats');
   (async () => {
     const nc = await connect({ servers: 'nats://localhost:4223' });
     const js = nc.jetstream();
     await js.publish('athlete-ally.hrv.raw-received', new TextEncoder().encode(JSON.stringify({
       eventId: 'rollback-test',
       payload: { userId: 'rollback-test', date: '2025-10-02', rMSSD: 50, capturedAt: new Date().toISOString(), raw: {} }
     })));
     console.log('✅ Test message published');
     await nc.close();
   })();
   "

   # Wait 5 seconds, check database
   docker exec athlete-ally-postgres psql -U athlete -d athlete_normalize -c \
     "SELECT * FROM hrv_data WHERE \"userId\" = 'rollback-test';"
   ```

**Full Procedure:** See `docs/phase-3/ops/PHASE_B_RUNBOOK.md` Section 7

---

## 📊 Monitoring Dashboard Queries

**Grafana Panels to Watch:**

1. **HRV Success Rate by Stream**
   ```promql
   sum(rate(normalize_hrv_messages_total{result="success"}[5m])) by (stream)
   ```
   Expected: 100% on AA_CORE_HOT

2. **DLQ Message Rate**
   ```promql
   sum(rate(normalize_hrv_messages_total{result="dlq"}[5m]))
   ```
   Expected: 0

3. **Consumer Lag**
   ```promql
   nats_consumer_num_pending{stream="AA_CORE_HOT",consumer="normalize-hrv-durable"}
   ```
   Expected: < 10

4. **Processing Latency (P95)**
   ```promql
   histogram_quantile(0.95,
     sum(rate(event_bus_event_processing_duration_seconds_bucket{topic="hrv_raw_received"}[5m])) by (le)
   )
   ```
   Expected: < 0.5s

---

## 📅 Daily Checklist

### Day 1 (24h Mark - 2025-10-03 17:00 UTC)

- [ ] Run `48h-soak-health-check.sh`
- [ ] Verify zero fallback events (ATHLETE_ALLY_EVENTS = 55 messages)
- [ ] Verify 100% stream purity (all success on AA_CORE_HOT)
- [ ] Check consumer lag (pending < 10, redeliveries < 10)
- [ ] Review Grafana dashboards (success rate ≥ 99.9%)
- [ ] Database integrity check (no missing records)
- [ ] Document any warnings or anomalies

### Day 2 (48h Mark - 2025-10-04 17:00 UTC)

- [ ] Run `48h-soak-health-check.sh`
- [ ] Verify all Day 1 criteria maintained
- [ ] Final database integrity check (full 48h period)
- [ ] Review alert history (any false positives?)
- [ ] Document soak period results
- [ ] Update GitHub issue: Staging soak complete ✅
- [ ] Prepare production deployment plan

---

## 📝 Incident Log

| Timestamp | Event | Severity | Action Taken | Resolved |
|-----------|-------|----------|--------------|----------|
| 2025-10-02 17:08 | Soak period started | Info | - | N/A |
| - | - | - | - | - |

---

## 🔗 Related Documentation

- **Staging Results:** `docs/phase-3/ops/PHASE_B_STAGING_RESULTS.md`
- **Operations Runbook:** `docs/phase-3/ops/PHASE_B_RUNBOOK.md`
- **Monitoring Queries:** `docs/phase-3/ops/monitoring-queries.md`
- **Rollback Procedure:** `PHASE_B_RUNBOOK.md` Section 7

---

## 📞 Contact Information

**Primary On-Call:** Platform Engineering Team
**Slack Channel:** `#platform-ops`
**Escalation:** Engineering Manager

---

**Last Updated:** 2025-10-02 17:15 UTC
**Next Review:** 2025-10-03 17:00 UTC (24h mark)

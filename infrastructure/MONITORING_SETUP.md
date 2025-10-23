# Monitoring Infrastructure Setup

## Overview
Complete monitoring solution using Railway's built-in metrics + Grafana Cloud for dashboards.

---

## Option 1: Railway Built-in Monitoring (Quick Start)

### Available Out-of-the-Box
✅ CPU usage  
✅ Memory usage  
✅ Network traffic  
✅ Request rates  
✅ Response times  
✅ Error rates  

### Access
```bash
# View metrics in CLI
railway metrics

# Or visit Railway dashboard:
https://railway.app/project/athlete-ally-production/metrics
```

---

## Option 2: Grafana Cloud (Recommended)

### Benefits
- Custom dashboards
- Advanced alerting
- Long-term data retention
- Integration with LaunchDarkly
- Team collaboration

### Setup Steps

#### 1. Create Grafana Cloud Account
```bash
# Visit: https://grafana.com/auth/sign-up
# Plan: Free tier (14-day metrics retention)
```

#### 2. Configure Prometheus Exporter

Already included in planning-engine service at `/metrics` endpoint.

#### 3. Add Railway as Data Source

**In Grafana Cloud:**
1. Go to Configuration → Data Sources
2. Add new Prometheus data source
3. URL: `https://planning-engine.up.railway.app/metrics`
4. Auth: None (or Basic Auth if secured)
5. Save & Test

#### 4. Import Time Crunch Dashboard

**In Grafana Cloud:**
1. Go to Dashboards → Import
2. Upload file: `infrastructure/monitoring/grafana/dashboards/stream5-time-crunch-dashboard.json`
3. Select Prometheus data source
4. Import

**Dashboard includes:**
- API request rates
- Response times (p50, p95, p99)
- Error rates
- Time crunch compression metrics
- LaunchDarkly flag status

#### 5. Configure Alerts

**Create alerts in Grafana:**

```yaml
# Alert: High Error Rate
Condition: error_rate > 2% for 5 minutes
Severity: Critical
Notification: Slack #engineering

# Alert: Slow Response Time
Condition: p95_response_time > 5s for 10 minutes  
Severity: Warning
Notification: Email engineering-lead@

# Alert: Service Down
Condition: health_check_status != 1 for 2 minutes
Severity: Critical  
Notification: PagerDuty
```

---

## Option 3: Self-Hosted (Advanced)

### Prerequisites
- Docker or Kubernetes cluster
- Storage for metrics (50GB+ recommended)
- Network access to Railway services

### Stack Components
1. **Prometheus** - Metrics collection
2. **Grafana** - Visualization  
3. **Loki** - Log aggregation
4. **AlertManager** - Alert routing

### Quick Start with Docker Compose

```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=<your-password>
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/dashboards

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki

volumes:
  prometheus-data:
  grafana-data:
  loki-data:
```

```bash
# Deploy
docker-compose -f docker-compose.monitoring.yml up -d

# Access
Grafana: http://localhost:3000
Prometheus: http://localhost:9090
```

---

## Metrics Collection

### Application Metrics (Already Configured)

The planning-engine service exposes Prometheus metrics at `/metrics`:

```
# Request metrics
http_request_duration_seconds
http_requests_total
http_request_size_bytes
http_response_size_bytes

# Time Crunch specific
time_crunch_requests_total
time_crunch_duration_seconds
time_crunch_compression_ratio
time_crunch_exercises_removed

# System metrics
process_cpu_user_seconds_total
process_resident_memory_bytes
nodejs_eventloop_lag_seconds
```

### Log Collection

**Railway logs are accessible via:**
```bash
# Real-time
railway logs --follow

# Historical
railway logs --since 24h

# Export
railway logs --since 7d > logs.txt
```

---

## Dashboard Links

**After setup, create bookmarks:**
- Railway Metrics: https://railway.app/project/athlete-ally-production/metrics
- Grafana Dashboard: https://your-org.grafana.net/d/stream5-time-crunch
- LaunchDarkly Insights: https://app.launchdarkly.com/projects/default/flags/feature.stream5_time_crunch_mode/insights

---

## Monitoring Checklist

### Daily Checks
- [ ] No critical alerts triggered
- [ ] Error rate < 1%
- [ ] Response time p95 < 5s
- [ ] CPU usage < 70%
- [ ] Memory usage < 80%

### Weekly Reviews
- [ ] Review alert trends
- [ ] Check dashboard for anomalies  
- [ ] Verify backup logs exported
- [ ] Update documentation if needed

### Monthly Reviews  
- [ ] Analyze performance trends
- [ ] Optimize slow queries
- [ ] Review and adjust alert thresholds
- [ ] Clean up old dashboards
- [ ] Cost optimization review

---

## Troubleshooting

### Metrics Not Showing

```bash
# 1. Verify endpoint is accessible
curl https://planning-engine.up.railway.app/metrics

# 2. Check Grafana data source connection
# Grafana → Configuration → Data Sources → Test

# 3. Verify Prometheus scrape config
# Check prometheus.yml for correct target
```

### Alerts Not Firing

```bash
# 1. Test alert manually
# Grafana → Alert Rules → Test Rule

# 2. Verify notification channel
# Grafana → Alerting → Notification Channels → Send Test

# 3. Check alert history
# Grafana → Alerting → Alert Rules → State History
```

---

## Cost Optimization

### Grafana Cloud Free Tier Limits
- 10,000 series
- 50GB logs
- 14-day retention
- 3 users

**To stay within limits:**
- Reduce metric cardinality
- Sample high-frequency metrics
- Use log filtering
- Archive old dashboards

### Upgrade Paths
- **Starter:** $49/month - 30-day retention
- **Pro:** $299/month - 90-day retention  
- **Enterprise:** Custom pricing - unlimited

---

## Security

### Securing Metrics Endpoint

```typescript
// Add authentication to /metrics endpoint
app.get('/metrics', authenticate, (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

### Network Security
- Use HTTPS only
- Restrict /metrics to monitoring IPs
- Enable Railway private networking
- Use VPN for self-hosted monitoring

---

## Additional Resources

- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Railway Metrics](https://docs.railway.app/reference/metrics)
- [LaunchDarkly Insights](https://docs.launchdarkly.com/home/flags/insights)

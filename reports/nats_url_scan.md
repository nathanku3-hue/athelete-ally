# NATS_URL Scan Report

Scanned files: 1552
Findings: 61

## Summary by URL
- nats://... (1)
- nats://[user:pass@]host:port[,host2:port2,...] (1)
- nats://${NATS_HOST}:4223 (1)
- nats://athlete_ally_nats:YOUR_NATS_PASSWORD@nats:4223 (1)
- nats://localhost:4222 (1)
- nats://localhost:4223 (70)
- nats://localhost:4223) (5)
- nats://nats:4223 (8)
- nats://nats1.prod:4223,nats2.prod:4223,nats3.prod:4223 (3)
- nats://prod-nats:4222 (1)
- nats://staging-nats:4222 (10)
- nats://user:pass@nats.prod:4223 (1)

## Recommendation

- Prefer `nats://localhost:4223` for local/dev; centralize config to avoid drift.

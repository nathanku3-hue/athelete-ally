# Hourly Cadence Template (Hours 1–8)

Hour <N>
- Window: <UTC start – end>
- Success rate: <x%>
- Error rate: <y%>
- P95 latency: <z s>
- Fallback reasons: <top>
- Status: <Green/Yellow/Red>
- Notes: <observations>
- Next: <actions>

Thresholds
- Success < 90% (10m) → rollback
- Errors > 10% (5m) → rollback
- P95 > 5s (5m) → rollback
- Zero requests (30m) → flag issue

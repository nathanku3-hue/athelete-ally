# First Live Status Update Template (to post when staging URL is live)

Channel: #stream5-staging  
Status: 🟢 Staging soak started  
Timestamp: <UTC>

Deployment
- Dashboard: https://nkgss.grafana.net/d/9adf3467-ba7a-445c-b0b8-b87f2aae0e55/stream5-time-crunch-mode-dashboard
- Flag: feature.stream5_time_crunch_mode = ON (staging)
- API: <BASE_URL>

Initial Checks
- Health: <200/FAIL>
- Preview call: <200/plan_not_found/other>

Key Metrics (first 10–15m)
- Success rate: <x%>
- Error rate: <y%>
- P95 latency: <z s>

Next
- Hourly cadence for first 8 hours; rollback if thresholds are breached.

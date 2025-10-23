# Platform Ticket: Provision Planning-Engine Staging API

Summary
- Request provisioning of the planning-engine staging API endpoint for Stream5 Time Crunch Mode verification and 48‑hour soak.

Requested Items
- HTTPS Base URL (externally reachable)
- Bearer token usable for authenticated POSTs
- Test planId that belongs to the token’s user, for /api/v1/time-crunch/preview

Acceptance Criteria
- Hitting GET <BASE_URL>/health returns 200
- POST <BASE_URL>/api/v1/time-crunch/preview with provided token and planId returns either 200 or a typed 4xx (e.g., plan_not_found), not 404/500

Context
- Grafana staging dashboard deployed and ready: https://nkgss.grafana.net/d/9adf3467-ba7a-445c-b0b8-b87f2aae0e55/stream5-time-crunch-mode-dashboard
- LaunchDarkly staging flag feature.stream5_time_crunch_mode is ON (fallthrough=true)

Rollout Plan on Delivery
1) Run .\scripts\verify-staging-deployment.ps1 -StagingUrl <BASE_URL> -TestToken <BEARER> -TestPlanId <PLAN_ID>
2) Start 48‑hour monitoring cadence and post first live update in #stream5-staging

Contacts
- Requester: Stream5 Team
- Channel: #stream5-staging

# Stream 3 – Feature Flags & Telemetry

## LaunchDarkly flags

| Flag key | Surface | Default | Notes |
| --- | --- | --- | --- |
| `feature.v1_planning_scoring` | Planning engine scoring pipeline | Off | Enables the fixed-weight scoring calculation (60/30/10). Falls back to legacy scoring path when disabled. |
| `feature.v1_planning_coach_tip` | CoachTip generation + frontend card | Off | Requires `feature.v1_planning_scoring`. Guards coach tip creation, retrieval route, and UI injection. |
| `feature.v1_planning_weekly_review` | Weekly review summary + notifications | Off | Requires scoring data. Disables review routes and notification emit when turned off. |

All flags are evaluated server-side (planning engine). If the LaunchDarkly SDK key is missing, flags resolve to `false` to keep legacy behaviour.

## Telemetry events

Events are proxied through the gateway (`/v1/telemetry/coach-tip`) and logged for ingestion to the analytics pipeline.

- `coach_tip_shown` – fired when the plan page renders a tip card. Payload: `{ tipId, planId, userId, surface, severity, planScore, timestamp }`.
- `coach_tip_dismissed` – fired when the athlete closes the card without applying adjustments.
- `coach_tip_accepted` – fired when the athlete chooses “Apply suggested adjustment”.
- `weekly_review_applied` *(backlog)* – reserved for when the weekly review apply endpoint is consumed. The gateway currently logs the event body.

## Notification run notes

- `NOTIFICATION_SERVICE_URL` must point at the internal notification service (default: `http://notification-service:8005`).
- Weekly review notifications use template `weekly_review_summary_v1` on channel `mobile_push`.
- Failures are logged but non-blocking; missing URL disables notification dispatch.

# Stream A · Time Crunch Mode

## Overview
- Adds AI-backed compression flow for daily sessions.
- Preserves core lifts, trims accessories, and reduces sets when time constrained.
- Controlled via LaunchDarkly flags:
  - `feature.v1_planning_time_crunch_ai` (planning-engine logic)
  - `feature.v1_planning_time_crunch_ui` (frontend/BFF surface)

## Service Updates
- **Planning Engine**
  - Prisma schema: `Session` gains `isTimeCrunchActive`, `timeCrunchMinutes`, `timeCrunchAppliedAt`, `compressedPlan`, `compressionDiff`, `compressionSummary`.
  - New migration `20251013_time_crunch_session_fields`.
  - Compression logic (`time-crunch/compressor.ts`) prioritises core sets, removes low-priority work, and records change diff.
  - Routes:
    - `POST /api/v1/plans/:planId/compress`
    - `GET /api/v1/plans/:planId/sessions/:sessionId/time-crunch`
  - Metrics:
    - `planning_time_crunch_requests_total{result,source}`
    - `planning_time_crunch_duration_seconds`
  - Structured logs & Segment events (`time_crunch_requested`, `time_crunch_success`, `time_crunch_completed`, `time_crunch_abandoned`).

- **Gateway BFF**
  - LaunchDarkly-enabled proxy via `launchdarkly-node-server-sdk`.
  - New routes:
    - `POST /api/v1/workouts/:planId/compress`
    - `GET /api/v1/workouts/:planId/sessions/:sessionId/time-crunch`
  - Flags evaluated server-side and forwarded to frontend.

- **Frontend**
  - `/plan` page surfaces “Short on Time?” CTA with modal input and diff summary.
  - `TimeCrunchModal` + `TimeCrunchSummary` components render status/diffs.
  - `useTrainingAPI` extended with `loadTimeCrunchStatus` & `compressSession`.
  - UI hides CTA when session lacks LD allowance or API disables path.

## Telemetry & Logging
- Segment events emitted with payload `{ planId, sessionId, userId, source, targetMinutes, achievedMinutes, totalMinutesSaved }`.
- Prometheus metrics aligned with Data Engineering ingest expectations.
- Logger tags: `module=time-crunch`, `service=planning-engine`.

## Rollout
1. Enable `feature.v1_planning_time_crunch_ui` in staging → verify CTA state.
2. Enable `feature.v1_planning_time_crunch_ai` for pilot cohort.
3. Monitor metrics dashboard for `result=failed|disabled` spikes.
4. Roll forward to 10% → 50% → 100% if telemetry remains healthy.

## Operational Notes
- Requires LaunchDarkly SDK key in planning-engine & BFF environments.
- Compression diffs persisted for audit/rollback.
- Fallback behaviour resets stored compression when AI flag disabled.

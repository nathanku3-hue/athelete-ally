# Phase 3: Holistic Performance Hub

Status: Draft
Owner: Platform Team
Linked Docs: docs/ROADMAP.md, docs/TECHNICAL_DOCS.md

## 1. Vision & Scope
Build a holistic performance hub that unifies training workload, recovery, readiness, and outcomes. Integrate new data sources (HRV, sleep) to power better planning, insights, and coaching loops.

Outcomes
- Higher plan adherence via readiness-aware sessions
- Improved recovery by surfacing sleep/HRV risks
- Clear, actionable weekly insights for athletes and coaches

Non-Goals (Phase 3)
- Deep nutrition planning (tracked for Phase 4)
- Wearable vendor-specific UIs

## 2. User Stories (Detailed)
US-1 HRV Ingestion & Readiness
- As an athlete, I can connect my wearable to import daily HRV so the system can compute my readiness score.
- Acceptance: HRV ingested within 1h of availability; readiness 0–100 with clear thresholds; audit log available.

US-2 Sleep Quality Insights
- As an athlete, I can see last-night sleep duration and quality and receive a nudge if sleep debt is accumulating.
- Acceptance: sleep duration and efficiency available daily; “sleep debt” trend shown; alerts togglable.

US-3 Readiness-Guided Plan Adjustment
- As an athlete, I get an adjusted session (intensity/volume) when readiness is low or elevated.
- Acceptance: session diff displayed; rationale includes HRV/sleep drivers; can accept or revert.

US-4 Coach Dashboard
- As a coach, I can see team readiness and sleep flags to plan sessions accordingly.
- Acceptance: team table view with filters; export CSV; drill-in to athlete trend.

US-5 Privacy & Controls
- As a user, I can control which signals (HRV, sleep) I share with my coach and revoke anytime.
- Acceptance: per-signal toggles; revocation effective within 10 minutes; data access logged.

## 3. Data & Integrations
Target Vendors: Oura, WHOOP, Apple Health, Google Fit
Signals: HRV (rMSSD/lnRMSSD), Resting HR, Sleep duration/efficiency, Wake episodes

Data Model (normalized)
- hrv_daily(userId, date, rMSSD, lnRMSSD, readinessScore, vendor, capturedAt)
- sleep_daily(userId, date, durationMin, efficiencyPct, latencyMin, wakeCount, vendor, capturedAt)

## 4. API Design (New/Updated)
Base: /api/v1

Public (authenticated)
- GET /readiness/today
  - 200: { readiness: number(0..100), drivers: string[], updatedAt: ISO8601 }
- GET /sleep/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
  - 200: sleep_daily[]
- POST /connections/:vendor/link (start OAuth)
  - 201: { authUrl: string }
- DELETE /connections/:vendor (revoke)
  - 204: {}

Internal (service-to-service)
- POST /ingest/hrv -> { userId, date, rMSSD, lnRMSSD, vendor }
- POST /ingest/sleep -> { userId, date, durationMin, efficiencyPct, vendor }

Security
- OAuth2/OIDC for vendor linking; signed ingest messages over NATS; RBAC for coach views.

Schemas (canonical)
- Readiness: { readiness: number, drivers: string[], updatedAt: string }
- HRV Daily: { userId: string, date: string(YYYY-MM-DD), rMSSD?: number, lnRMSSD?: number, readinessScore?: number, vendor: string, capturedAt: string }
- Sleep Daily: { userId: string, date: string, durationMin: number, efficiencyPct?: number, latencyMin?: number, wakeCount?: number, vendor: string, capturedAt: string }

## 5. Proposed Architecture
New services (suggested)
- ingest-service: Handles vendor webhooks, OAuth callbacks, retries, dead-letter.
- normalize-service: Normalizes vendor payloads into canonical schema; idempotent writes.
- insights-engine: Computes readiness (HRV/sleep blend), flags, and adjustments.

Data
- PostgreSQL for canonical tables; optional Timeseries (e.g., Timescale) for trend queries.
- NATS for events: vendor.data.received, data.normalized, insights.updated

Sequence (HRV)
1) Vendor webhook -> ingest-service (verify, enqueue vendor.data.received)
2) normalize-service consumes -> writes hrv_daily (idempotent key: userId+date+vendor) -> emits data.normalized
3) insights-engine consumes -> computes readiness -> emits insights.updated -> persists readiness snapshot
4) API gateway surfaces /readiness/today using latest snapshot

Observability
- Tracing (OpenTelemetry), dashboards for ingest lag, normalization failures, and insights coverage.

## 6. Technical PoC Plan: HRV Integration
Goal: ingest HRV from one vendor (Oura OR WHOOP) end-to-end and compute readiness.

Tracks
1) OAuth link flow (start, callback, token store)
2) Webhook receiver (validate signature, enqueue)
3) Normalizer (map payload -> hrv_daily)
4) Insights (readiness formula: scaled lnRMSSD + resting HR modifier)

Acceptance
- 5 users complete OAuth
- Overnight HRV ingested within 1h
- Readiness available before 7am local time

Risks/Mitigations
- Vendor rate limits -> backoff, DLQ
- Missing data -> fallback to moving average, surface “data stale” UI

## 7. Timeline (High Level)
Weeks 1–2: PoC vendor linking + webhook receiver
Weeks 3–4: Normalization + readiness computation + basic UI
Weeks 5–6: Sleep integration + team dashboard
Weeks 7–8: Hardening (observability, backfill, privacy controls) + pilot

## 8. Privacy/Security
- Data minimization; per-signal consent; encrypted secrets; vendor token rotation.

## 9. Rollout & Success Metrics
- Pilot cohort N=20; ≥85% daily readiness coverage; ≥10% plan adherence improvement vs. baseline.

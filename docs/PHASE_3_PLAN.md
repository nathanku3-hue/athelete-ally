# Phase 3 Plan — Holistic Performance Hub

This document outlines initiatives for the next phase focusing on integrated performance insights and adaptive coaching.

## Vision
A unified hub combining training load, recovery signals, and coach guidance into actionable daily plans.

## Key Initiatives
- Expanded Signals
  - HRV ingestion (morning readiness)
  - Sleep quality sources (wearables or manual input)
  - Subjective wellness (RPE trends, soreness, stress)
- Adaptive Engine 2.0
  - Multi-signal fusion for weekly blocks
  - Goal-aware progression with guardrails (injury prevention)
- Insights & Feedback
  - Weekly review insights and coach tips
  - Microcycle progression dashboard

## Data Sources
- Wearables API connectors (HRV, sleep, readiness)
- In-app forms (RPE, soreness, stress, recovery behaviors)

## API Changes
- New endpoints under /api/v2/performance
  - POST /signals/hrv
  - POST /signals/sleep
  - GET /insights/weekly/:userId
- Envelope maintained; JWT auth required; ownership checks at ingress.

## Services
- signals-service: ingest and normalize HRV/sleep; retention policy; metrics
- insights-service: aggregate signals + training data to produce weekly insights
- planning-engine: consumes insights and emits adaptation recommendations

## Storage & Schema
- Append-only signals tables with windowed summaries
- Data retention and downsampling policies

## Observability
- Tracing on ingestion and insights pipelines
- Per-signal lag and freshness metrics

## Milestones
- M1: Signals MVP (HRV + Sleep ingestion)
- M2: Weekly Insights API and UI
- M3: Adaptive Engine integration and closed-loop feedback

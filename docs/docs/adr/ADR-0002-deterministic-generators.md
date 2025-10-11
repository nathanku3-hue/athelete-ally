# ADR-0002: Deterministic Generators in CI

- Status: Accepted
- Date: 2025-10-04
- Context
  - Generated outputs (dashboards index, openapi/alerts/docs/registry) cause noise if non-deterministic.
- Decision
  - All generators must produce byte-stable output (TZ=UTC, stable sort, no now()).
  - CI will re-run generators and fail on drift (after initial report-only period).
- Consequences
  - Add verify-generated CI job (report-only now, blocking later).
- Implementation Notes
  - dashboards index: stable sort; generatedAt = max git commit timestamp; sha256 of raw bytes.
  - Normalize line endings; avoid locale/timezone variance; OS-agnostic.
- Rollout
  - Week 01: Add report-only job with artifacts on diff.
  - Week 12: Flip to blocking (git diff --exit-code) once baseline stable.

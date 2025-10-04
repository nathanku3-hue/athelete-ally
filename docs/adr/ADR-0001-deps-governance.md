# ADR-0001: Dependency Governance (Stacks & Cohesive Upgrades)

- Status: Accepted
- Date: 2025-10-04
- Context
  - Major stacks (OpenTelemetry, NATS, Fastify, Jest) drifted; ad-hoc overrides introduced.
  - CI breakages from peer conflicts; difficult to upgrade coherently.
- Decision
  - Establish stack BOMs at root; pin families coherently across workspaces.
  - Use Renovate (or Dependabot) to group stack updates into single PRs.
  - Use syncpack to enforce consistent ranges across packages.
  - Overrides allowed only as tactical pins; removed after cohesive upgrade.
- Consequences
  - Add CI jobs: deps-consistency (report-only), later blocking.
  - Document upgrade cadence and rollbacks.
- Rollout
  - Week 01: Introduce Renovate config; add syncpack and CI report-only job.
  - Week 12: Cohesive OTel upgrade; remove temporary overrides; drop legacy-peer-deps from CI.

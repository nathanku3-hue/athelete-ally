# Backlog Tickets - Infrastructure Scope

## BUG: Ingest Port Reachability and Binding

**Priority**: Medium  
**Labels**: `bug`, `infrastructure`, `port-configuration`

### Issue
- Ingest service runs on port 4101 but smoke tests expect port 4000
- Service binding configuration needs verification for Windows compatibility

### Acceptance Criteria
- [ ] Smoke tests use correct port 4101 by default
- [ ] Service binds to 0.0.0.0 for cross-platform compatibility
- [ ] Documentation updated with correct port expectations
- [ ] CI/CD pipelines use consistent port configuration

### Files Affected
- `scripts/smoke-alpha.js` - Update default port
- `scripts/smoke-ingest.js` - New ingest-specific smoke test
- Service configuration files - Verify binding addresses

---

## TASK: Operator Script/Runbook for Stream Creation

**Priority**: Medium  
**Labels**: `task`, `infrastructure`, `nats`, `runbook`

### Description
Create operator scripts and runbooks for creating NATS JetStream streams in non-development environments.

### Acceptance Criteria
- [ ] Script to create `AA_CORE_HOT` stream
- [ ] Script to create `AA_VENDOR_HOT` stream  
- [ ] Script to create `AA_DLQ` stream
- [ ] Runbook documentation for stream management
- [ ] Environment-specific configuration templates

### Deliverables
- `scripts/nats/create-streams-operator.js`
- `docs/runbooks/nats-stream-management.md`
- Environment configuration templates

---

## TASK: Grafana Dashboard + Alerts

**Priority**: Low  
**Labels**: `task`, `monitoring`, `grafana`, `alerts`

### Description
Create Grafana dashboard and alerts for normalize service metrics and DLQ monitoring.

### Acceptance Criteria
- [ ] Dashboard panel: Success/Error message counts (overlay)
- [ ] Dashboard panel: DLQ message time series
- [ ] Alert: DLQ messages > 0 for 5 minutes
- [ ] Alert: Consumer lag threshold exceeded
- [ ] Dashboard: Consumer lag visualization

---

## BUG: Season Validation Parity in Onboarding

**Priority**: Medium  
**Labels**: `bug`, `frontend`, `contracts`, `streamA`

### Issue
- Shared schema (`packages/shared-types/src/schemas/onboarding.ts`) requires `competitionDate` when validating step 3 (`season_goals`), but the frontend context permits null season/competition payloads.
- Mismatch causes inconsistent validation outcomes between backend-safe parsing and client-side navigation, especially when the season step is intentionally skipped in H0.

### Acceptance Criteria
- [ ] Align shared schema step validation with updated frontend flow (season optional, no forced competition date).
- [ ] Ensure profile-onboarding service accepts the relaxed payload without manual overrides.
- [ ] Update onboarding tests (contracts + e2e) to reflect the adjusted season rules.
- [ ] Document the revised validation contract in `docs/streams/streamA`.

### Metrics to Monitor
- `normalize_hrv_messages_total{result,subject,stream,durable}`
- `dlq_messages_total`
- Consumer lag metrics

### Deliverables
- `monitoring/grafana/normalize-dashboard.json`
- `monitoring/alert_rules.yml` updates
- Documentation for alert thresholds

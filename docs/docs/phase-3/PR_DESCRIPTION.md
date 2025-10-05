Title: docs(phase-3): add SRD, API contracts, normalized schemas v1 with examples, and ops SLO/alerts (v0.1)

Summary
- Introduces Phase 3 architecture documents and machine-readable JSON Schemas for normalized data.
- Adds ingest security verification details (HMAC/JWT), concrete payload examples, and initial SLOs/alerts.

Scope
- Docs only; no code changes.

Changes
- SRD: docs/phase-3/architecture.md
- API: docs/phase-3/api/ingest/webhooks.md, docs/phase-3/api/insights/endpoints.md
- Schemas: docs/phase-3/schemas/normalized/*.v1.json + examples
- Provider raw notes: docs/phase-3/schemas/raw/{garmin,oura}.md
- Ops: docs/phase-3/ops/{slo-slis.md,alerts-runbooks.md}
- Changelog: docs/phase-3/CHANGELOG.md

Verification
- Schemas visually validated against example payloads.
- Links cross-checked within SRD to API/schemas/ops sections.

Reviewer Checklist
- [ ] Subjects and versioning naming
- [ ] Security verification details accuracy (HMAC/JWT)
- [ ] Schema fields and required sets per domain
- [ ] SLO targets and alert thresholds
- [ ] Directory structure and cross-links

Risks
- Future providers may require additional domains/fields (versioning mitigates).

Follow-ups
- Add provider-specific field mappings (Garmin/Oura) and edge-case examples.
- Provide JSON Schema tests and CI validation harness for examples.

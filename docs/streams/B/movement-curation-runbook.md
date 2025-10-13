# Stream B – Movement Curation MVP Runbook

## Overview
- **Scope:** Internal curator UI, planning-engine curation API, import CLI, audit trail, basic observability.
- **Goal:** Enable operations teams to ingest movement datasets, review drafts, and publish approved entries to the canonical library.
- **Auth:** Internal SSO issues JWTs containing `role: "curator"` (admins also permitted). Gateway BFF and planning-engine enforce role checks on all curation endpoints.

## End-to-End Workflow
1. **Ingest via CLI**
   - Supports JSON or CSV files with field validation, slug generation, and optional auto-submit/publish.
   - CLI user identified via `--actor-id`/`--actor-email` for audit trail attribution.
2. **Review in Curator Console**
   - Draft list with status filters, search, and tag filtering.
   - Detail editor with full metadata editing, instructions, and metadata JSON editing.
   - Actions: save, submit for review, request changes (notes required), approve, publish.
3. **Publish**
   - Publishing creates a new `movement_library` version, links it to the draft, and logs audit events.
4. **Observability**
   - Prometheus metrics exported via planning-engine `/metrics`.
   - BFF exposes curated endpoints under `/api/internal/curation/**`.
5. **Audit Trail**
   - Every create/update/status change/publish captured in `movement_audit_log` with actor info and before/after snapshots (metadata redacted via JSON diff).

## Import CLI
```
tsx services/planning-engine/src/curation/import-cli.ts \
  --file ./movements.csv \
  --format csv \
  --dry-run \
  --actor-id martina.k \
  --actor-email martina.k@athlete-ally.test
```

Key flags:
- `--dry-run` validate without mutating data.
- `--submit` auto submit drafts for review.
- `--publish` approve + publish after validation (implies `--submit`).
- `--update` allow updates when draft/library entries already exist.

Outputs include per-row actions (`CREATED`, `UPDATED`, `SKIPPED`, `ERROR`) and high-level counts. Audit entries are generated for every mutation, including dry-run attempt metadata (flagged `metadata.dryRun = true`).

## Curator Console (Next.js)
- Path: `/curation`
- Features:
  - Token paste login (local storage) for dev; production SSO issues short-lived JWT.
  - Status summaries (draft, ready for review, changes requested, approved, published, archived).
  - Movement list with filters + manual refresh (prevents excess polling).
  - Detailed editor, instructions, metadata JSON input, action notes panel.
  - Library search table for published movements (slug/version review).
- API calls proxied through Gateway BFF → Planning Engine:
  - `GET /api/internal/curation/movements`
  - `POST /api/internal/curation/movements`
  - `PATCH /api/internal/curation/movements/:id`
  - `POST /api/internal/curation/movements/:id/{submit|request-changes|approve|publish}`
  - `GET /api/internal/curation/library`

## Metrics & Observability
Exported via planning-engine OTel Prometheus exporter:
- `movement_curation_drafts_total{status}` – Gauge of draft counts per status.
- `movement_curation_status_transitions_total{from,to}` – Counter of status transitions.
- `movement_curation_publish_attempts_total{result,from,reason}` – Publish attempts (success/failure, previous status, failure reason).
- `movement_curation_drafts_created_total` – Count of draft creations (CLI/UI).

Dashboards can track:
- Pending review backlog (`status="READY_FOR_REVIEW"`).
- Publish success rate (`result` dimension).
- Draft churn (transitions from `CHANGES_REQUESTED` to `READY_FOR_REVIEW`).

## Audit Trail & Rollback
- `movement_audit_log` contains actor id/email/role, action, notes, metadata, before/after snapshots.
- **Rollback Procedure:**
  1. Identify target draft/library via audit log or curator console (published movement card includes IDs).
  2. Use CLI to re-import previous version JSON (from audit snapshot) with `--publish` to reissue canonical record.
  3. If draft should be reverted to review, run `POST /api/internal/curation/movements/:id/request-changes` with reason.
  4. For emergency unpublish, issue `request-changes` (moves draft off approved/published) and notify CLI operator to republish stable version.
- Audit metadata redacts sensitive payloads; only curator identifiers (id/email) stored.

## Backlog / Next Steps
- Surface audit history in UI (timeline per draft).
- Add diff viewer for draft vs. published snapshot.
- Integrate Signal notifications when backlog exceeds threshold (READY_FOR_REVIEW count).
- CLI enhancement: bulk preview HTML report, duplicate detection UX improvements.
- Harden SSO flow (device trust, MFA fallback token handling).


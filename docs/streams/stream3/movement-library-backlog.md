# Stream 3 – Movement Library Backlog

## Seed scope

- [x] Seed the production `movement_library` table with 50 foundational movements covering strength, power, and conditioning patterns.
- [x] Capture baseline metadata (classification, equipment, primary/secondary musculature) so downstream services can surface movement archetypes.

## Follow-on tooling tasks

- [ ] Build a lightweight curator console that reads from `movement_staging` and `movement_library`, supports drafts, review routing, and publication.
- [ ] Wire curator authentication to recognize the new `curator` role and allow delegation for sport-science reviewers.
- [ ] Add movement taxonomy editing (tags, progressions, regressions) with validation against duplicates.
- [ ] Backfill rich instructions (setup, execution, coaching cues) and video references via CSV ingest into staging.
- [ ] Instrument analytics to track movement usage, substitution frequency, and athlete feedback for future pruning.
- [ ] Partner with Data Platform to version control the movement dataset and expose change history via audit logs.

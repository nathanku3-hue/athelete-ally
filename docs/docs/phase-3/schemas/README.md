# Schemas (Source of Truth)

All canonical DTOs are defined in `@athlete-ally/shared-types`. Documentation here references those types to prevent drift.

References
- Health raw envelope: `HealthRawEnvelope`
- Job models: `IngestionJob`, `IngestionJobStatus`
- Oura normalized: `OuraDailyReadiness`, `OuraActivity`, `OuraSleep`, etc.

Generation Plan (optional)
- Use `ts-json-schema-generator` or `typescript-json-schema` to emit JSON Schema for select types into this folder for external consumers.
- Alternatively, render Markdown type excerpts via a doc generator in CI. Keep this folder as pointers if we do not generate artifacts.
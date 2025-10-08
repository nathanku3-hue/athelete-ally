# ADR D6: Logging Facade & Frontend Logs Endpoint

Decision: Adopt a shared logging facade with structured, low-cardinality logs and PII scrubbing. For frontend prod, ship logs to `/api/logs`; for services, prefer stdout JSON.

Context:
- Mixed ad-hoc `console.*` scattered across code; lack of consistent schema; PII risk.
- Need dev DX preserved; production observability and auditability.

Options considered:
- Direct use of console in all layers (Rejected: unstructured, PII risk).
- External log SDKs (Out of scope; infra collects stdout/API).
- Custom facade with adapters (Chosen).

Consequences:
- New package `@athlete-ally/logger` with server/browser adapters.
- Packages enforce `no-console=error`; codemod provided; scan + PR summary in CI.
- `/api/logs` endpoint with x-api-key, rate limit, PII scrub, JSON lines to stdout; dev returns 204.
- Future: promote client-bundle scan to Required; expand dashboards and OpenAPI shards in follow-up.

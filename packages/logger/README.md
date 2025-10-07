# @athlete-ally/logger
Typed logging facade with PII sanitization and environment adapters.
- Server: import { createLogger } from "@athlete-ally/logger"; import nodeAdapter from "@athlete-ally/logger/server";
- Browser: import { createLogger } from "@athlete-ally/logger"; import browserAdapter from "@athlete-ally/logger/browser";
API
const log = createLogger(adapter, { module: "module-name", service: "frontend" });
log.info("message", { field: "route", value: "/home" });
Notes
- PII is scrubbed (email, phone, IP, JWT, UUIDv4, SSN-like); hashes are emitted in `pii_hashes`.
- Production sampling: warn/error 100%, info 10%, debug 0% (override via options).
- Server adapter emits one-line JSON to stdout. Browser dev logs to console; prod POSTs to `/api/logs`.

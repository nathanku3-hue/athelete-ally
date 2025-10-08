# Stream 2: Logging Facade & Endpoint

- Package: `@athlete-ally/logger` with adapters:
  - server: stdout JSON (one-line)
  - browser: dev→console, prod→POST /api/logs
- API: `createLogger(adapter, { module, service, env })` with `debug|info|warn|error`.
- Schema (required): level, msg, ts, service, module, env. Optional: requestId, release, commit, error.name, code, status, route, sampled.
- PII: scrub email, phone, IPv4/IPv6, JWT, UUIDv4, US SSN; emit SHA-256 hashes salted with `LOGS_HASH_SALT`.
- Sampling (prod): error/warn 100%, info 10%, debug 0% (override per module).
- ESLint: `packages/**` `no-console=error`.
- Client bundle scan: blocks server-only imports in `use client` files.

## Usage
```ts
import { createLogger } from '@athlete-ally/logger';
import browserAdapter from '@athlete-ally/logger/browser';
const log = createLogger(browserAdapter, { module: 'component', service: 'frontend' });
log.info('view mounted', { route: '/home' });
```

## /api/logs
- Node runtime, `force-dynamic`.
- Auth: `x-api-key` equals `process.env.LOGS_API_KEY`.
- Rate limit: 10 req/min per key (apiKeyId→x-api-key-id, else x-user-id, else IP); safety cap 50/min per IP; dev exempt.
- Payload: `application/json` array (preferred) or `application/x-ndjson`/`text/plain` lines; max 256KB body, 32KB per event.
- Sanitization: required fields validated; PII scrubbed; emits sanitized JSON lines to stdout.
- Responses: 202 (accepted), 204 (dev), 4xx/5xx on errors.

## Env
- `LOGS_API_KEY` (required in prod)
- `LOGS_HASH_SALT` (rotate every 90d)

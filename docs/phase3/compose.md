Local Stack (Phase 3)

- Default services: ingest (4101), normalize (4102), insights (4103), NATS (4222/8222), Postgres (host 55432 → container 5432)
- Optional profiles:
  - planning: adds planning-engine (4104) and redis (6379)
  - obs: adds OTel Collector (4318), Prometheus (9090), Jaeger (16686), Grafana (3001)

Usage

- Build and up (default stack):
  docker compose up --build

- With planning engine:
  docker compose --profile planning up --build

- With observability UI:
  docker compose --profile obs up --build

- Combine profiles:
  docker compose --profile planning --profile obs up --build

Ports

- Ingest: http://localhost:4101/health
- Normalize: http://localhost:4102/health
- Insights: http://localhost:4103/health
- NATS monitor: http://localhost:8222
- Postgres: localhost:55432 (user/pass in .env or defaults)
- Prometheus (obs): http://localhost:9090
- Jaeger UI (obs): http://localhost:16686
- Grafana (obs): http://localhost:3001 (admin/admin)

Environment

- Copy .env.example to .env if you need to override defaults (e.g., change Postgres host port).
- Services use internal URLs in compose (postgres:5432, nats:4222).

Healthchecks

- Postgres uses pg_isready; app services expose /health.
- Normalize service includes a lightweight HTTP server solely for health/metrics.

Notes

- docker-compose/preview.yml remains for legacy scenarios; prefer the root docker-compose.yml for Phase 3.
- Node 20.18.0 is used in service images; ensure local Node matches for dev scripts.
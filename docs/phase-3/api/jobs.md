# Jobs (Backfill/Sync)

- Start backfill: `POST /v1/health/oura/sync`
  - Body: `{ userId: string, start?: string(YYYY-MM-DD), end?: string(YYYY-MM-DD) }`
  - Response: `{ jobId: string, status: "queued" }`
- Check status: `GET /v1/health/oura/sync/{jobId}`
  - Response: `{ jobId, status, progress, startedAt, updatedAt, lastError? }`

Events
- `health.sync.oura.job.{jobId}` for scheduling and status updates.

Contracts
- `IngestionJob`, `IngestionJobStatus` (from `@athlete-ally/shared-types`)
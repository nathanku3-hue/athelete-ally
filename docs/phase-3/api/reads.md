# Read APIs (REST v1)

- Daily readiness: `GET /v1/health/{userId}/oura/daily?start=YYYY-MM-DD&end=YYYY-MM-DD`
  - 200: `{ items: OuraDailyReadiness[] }`
- Activities: `GET /v1/health/{userId}/oura/activities?start=YYYY-MM-DD&end=YYYY-MM-DD`
  - 200: `{ items: OuraActivity[] }`

Contracts
- `OuraDailyReadiness`, `OuraActivity` from `@athlete-ally/shared-types` (health module)
- Pagination (future): `?cursor=` optional; stable sort by date
- Errors: 400 invalid_range | 404 user_not_found | 500 internal
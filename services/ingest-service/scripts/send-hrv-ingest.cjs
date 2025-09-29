/* Deterministic HRV ingest to drive normalization path */
(async () => {
  const base = process.env.INGEST_BASE_URL || 'http://localhost:4101';
  const userId = process.env.E2E_USER || 'e2e-user-oura';
  const date = process.env.E2E_DATE || '2024-01-15';
  const body = { userId, date, rmssd: 42.5, capturedAt: new Date().toISOString(), raw: { src: 'e2e' } };
  const res = await fetch(`${base}/ingest/hrv`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  console.log('Ingest HRV response', res.status);
  if (!res.ok) process.exit(1);
})();


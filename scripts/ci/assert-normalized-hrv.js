// Asserts the normalized HRV row exists for the E2E user/date.
// Env: DATABASE_URL (preferred), E2E_USER, E2E_DATE
// Back-compat: DATABASE_URL_NORMALIZE (deprecated)
const { Client } = require('pg');

(async () => {
  const url = process.env.DATABASE_URL || process.env.DATABASE_URL_NORMALIZE;
  const userId = process.env.E2E_USER || 'e2e-test-user';
  const date = process.env.E2E_DATE || new Date().toISOString().slice(0, 10);
  if (!url) {
    console.error('DATABASE_URL not set');
    process.exit(2);
  }
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    // Query for the most recent HRV record for our test user with all fields
    const q = `SELECT id, "userId", date, rmssd, "lnRmssd", "capturedAt", "createdAt" FROM hrv_data WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 1`;
    const res = await client.query(q, [userId]);
    if (res.rows.length === 0) {
      console.error('Normalized HRV row not found', { userId });
      process.exit(1);
    }
    const record = res.rows[0];
    console.log('✅ Normalized HRV row OK:', {
      id: record.id,
      userId: record.userId,
      date: record.date,
      rmssd: record.rmssd,
      capturedAt: record.capturedAt
    });
  } finally {
    await client.end();
  }
})();

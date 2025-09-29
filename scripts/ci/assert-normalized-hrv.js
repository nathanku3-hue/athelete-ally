// Asserts the normalized HRV row exists for the E2E user/date.
// Env: DATABASE_URL_NORMALIZE, E2E_USER, E2E_DATE
const { Client } = require('pg');

(async () => {
  const url = process.env.DATABASE_URL_NORMALIZE;
  const userId = process.env.E2E_USER || 'E2E_USER';
  const date = process.env.E2E_DATE || new Date().toISOString().slice(0, 10);
  if (!url) {
    console.error('DATABASE_URL_NORMALIZE not set');
    process.exit(2);
  }
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    // hrvData schema: userId (text), date (date), rmssd (numeric), lnrmssd (numeric) — naming may vary slightly.
    // We query loosely and verify presence.
    const q = `SELECT userId, date FROM hrvData WHERE userId = $1 AND date = $2::date LIMIT 1`;
    const res = await client.query(q, [userId, date]);
    if (res.rows.length === 0) {
      console.error('Normalized HRV row not found', { userId, date });
      process.exit(1);
    }
    console.log('Normalized HRV row OK', res.rows[0]);
  } finally {
    await client.end();
  }
})();


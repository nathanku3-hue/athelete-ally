// Asserts the normalized HRV row exists for the E2E user/date.
// Env: DATABASE_URL (preferred), E2E_USER, E2E_DATE
// Back-compat: DATABASE_URL_NORMALIZE (deprecated)
const { Client } = require('pg');

(async () => {
  const url = process.env.DATABASE_URL || process.env.DATABASE_URL_NORMALIZE;
  const userId = process.env.E2E_USER || 'E2E_USER';
  const date = process.env.E2E_DATE || new Date().toISOString().slice(0, 10);
  if (!url) {
    console.error('DATABASE_URL not set');
    process.exit(2);
  }
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    // Prefer table name mapped by Prisma: hrv_data (@@map), columns use Prisma field names by default
    const q = `SELECT "userId", "date" FROM hrv_data WHERE "userId" = $1 AND "date" = $2::date LIMIT 1`;
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

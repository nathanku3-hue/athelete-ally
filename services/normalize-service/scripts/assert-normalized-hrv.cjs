/* Assert a normalized HRV row exists for the E2E user/date */
(async () => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const userId = process.env.E2E_USER || 'e2e-user-oura';
  const date = process.env.E2E_DATE || '2024-01-15';
  // prisma schema uses a Date column for date; try both direct and cast
  const row = await prisma.hrvData.findFirst({ where: { userId } });
  if (!row) { console.error('No hrvData row for user', userId); process.exit(1); }
  const ymd = new Date(row.date).toISOString().slice(0,10);
  if (ymd !== date) { console.error('Date mismatch', { got: ymd, want: date }); process.exit(1); }
  if (typeof row.rmssd !== 'number' || row.rmssd < 0) { console.error('Invalid rmssd', row.rmssd); process.exit(1); }
  console.log('Assertion passed for user/date', userId, date);
  await prisma.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });


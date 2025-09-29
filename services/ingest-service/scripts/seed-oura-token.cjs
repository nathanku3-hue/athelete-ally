/* Seed Oura tokens for CI using AES-256-GCM encryption compatible with ingest-service */
const crypto = require('node:crypto');

function getKey() {
  const b64 = process.env.TOKEN_ENCRYPTION_KEY || '';
  if (!b64) throw new Error('TOKEN_ENCRYPTION_KEY not set');
  const key = Buffer.from(b64, 'base64');
  if (key.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes (base64)');
  return key;
}
function encrypt(plaintext) {
  const key = getKey(); const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), enc.toString('base64'), tag.toString('base64')].join('.');
}
(async () => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const userId = process.env.E2E_USER || 'e2e-user-oura';
  const at = process.env.OURA_ACCESS_TOKEN;
  const rt = process.env.OURA_REFRESH_TOKEN;
  if (!at || !rt) { console.log('No tokens provided; skipping seed'); process.exit(0); }
  await prisma.$executeRawUnsafe(
    'CREATE TABLE IF NOT EXISTS "OuraToken" ("userId" TEXT PRIMARY KEY, "accessToken" TEXT NOT NULL, "refreshToken" TEXT NOT NULL, "scope" TEXT, "expiresAt" BIGINT, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())'
  );
  const rec = {
    userId,
    accessToken: encrypt(at),
    refreshToken: encrypt(rt),
    scope: 'offline_access',
    expiresAt: null,
  };
  await prisma.$executeRawUnsafe(
    'INSERT INTO "OuraToken" ("userId","accessToken","refreshToken","scope","expiresAt") VALUES ($1,$2,$3,$4,$5) ON CONFLICT ("userId") DO UPDATE SET "accessToken"=EXCLUDED."accessToken", "refreshToken"=EXCLUDED."refreshToken", "scope"=EXCLUDED."scope", "expiresAt"=EXCLUDED."expiresAt"',
    rec.userId, rec.accessToken, rec.refreshToken, rec.scope, rec.expiresAt
  );
  console.log('Seeded Oura tokens for', userId);
  await prisma.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });


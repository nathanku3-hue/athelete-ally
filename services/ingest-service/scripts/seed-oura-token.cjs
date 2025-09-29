#!/usr/bin/env node

/**
 * Seed Oura token script for E2E testing
 * AES-256-GCM encrypts and upserts Oura tokens
 */

const crypto = require('crypto');
const { Client } = require('pg');

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function encryptToken(token, key) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, Buffer.from(key, 'hex'));
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted: encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}

async function seedOuraToken() {
  const accessToken = process.env.OURA_ACCESS_TOKEN;
  const refreshToken = process.env.OURA_REFRESH_TOKEN;
  const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY;
  const databaseUrl = process.env.DATABASE_URL_INGEST || 'postgresql://athlete:athlete@localhost:55432/athlete';

  if (!accessToken || !refreshToken || !encryptionKey) {
    console.log('Skipping token seeding - missing required environment variables');
    return;
  }

  console.log('Seeding Oura tokens...');

  const client = new Client({
    connectionString: databaseUrl
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Encrypt tokens
    const encryptedAccess = encryptToken(accessToken, encryptionKey);
    const encryptedRefresh = encryptToken(refreshToken, encryptionKey);

    // Upsert token record
    const query = `
      INSERT INTO oura_tokens (user_id, access_token, refresh_token, expires_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
    `;

    const userId = 'e2e-test-user';
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    await client.query(query, [
      userId,
      JSON.stringify(encryptedAccess),
      JSON.stringify(encryptedRefresh),
      expiresAt
    ]);

    console.log('Successfully seeded Oura tokens for E2E test user');
  } catch (error) {
    console.error('Error seeding Oura tokens:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  seedOuraToken().catch(console.error);
}

module.exports = { seedOuraToken };

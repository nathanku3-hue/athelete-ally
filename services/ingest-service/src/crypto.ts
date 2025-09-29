import crypto from 'node:crypto';

// AES-256-GCM encryption helpers for securing tokens at rest
export function getKey(): Buffer {
  const b64 = process.env.TOKEN_ENCRYPTION_KEY || '';
  if (!b64) throw new Error('TOKEN_ENCRYPTION_KEY not set');
  const key = Buffer.from(b64, 'base64');
  if (key.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes (base64-encoded)');
  return key;
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // store as base64(iv).base64(cipher).base64(tag)
  return [iv.toString('base64'), enc.toString('base64'), tag.toString('base64')].join('.');
}

export function decrypt(blob: string): string {
  const key = getKey();
  const [ivB64, ctB64, tagB64] = blob.split('.');
  const iv = Buffer.from(ivB64, 'base64');
  const ct = Buffer.from(ctB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(ct), decipher.final()]);
  return dec.toString('utf8');
}


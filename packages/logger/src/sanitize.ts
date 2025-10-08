/**
 * PII sanitization utilities
 * - Scrubs email, phone, IPv4/IPv6, JWT, UUID v4, US SSN-like
 * - Returns sanitized string and hashes of redacted fragments (SHA-256 with optional salt)
 */
import crypto from 'crypto';

const SALT = process.env.LOGS_HASH_SALT || '';

// Precompiled regexes for PII patterns (aggressive but safe)
const patterns: { name: string; re: RegExp }[] = [
  { name: 'email', re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { name: 'phone', re: /(?:(?:\+?\d{1,3})?[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g },
  { name: 'ipv4', re: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g },
  { name: 'ipv6', re: /\b(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}\b/gi },
  // JWT: header.payload.signature (base64url)
  { name: 'jwt', re: /eyJ[\w-]+\.[\w-]+\.[\w-]+/g },
  // UUID v4
  { name: 'uuid', re: /\b[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi },
  // US SSN-like (very strict, reduces false positives)
  { name: 'ssn', re: /\b(?!000|666|9\d\d)(\d{3})[- ]?(?!00)(\d{2})[- ]?(?!0000)(\d{4})\b/g },
];

export type SanitizeResult = { text: string; hashes: string[] };

function sha256(value: string): string {
  return crypto.createHash('sha256').update(SALT + value).digest('hex');
}

/**
 * Scrub PII from a string. Returns sanitized text and hashes of removed parts.
 */
export function sanitizeText(input: unknown): SanitizeResult {
  let text = typeof input === 'string' ? input : JSON.stringify(input);
  const hashes: string[] = [];

  for (const { re } of patterns) {
    text = text.replace(re, (match) => {
      hashes.push(sha256(match));
      return '[REDACTED]';
    });
  }
  return { text, hashes };
}

const allowedContextKeys = new Set([
  'field', 'value', 'environment', 'route', 'requestId', 'status'
]);

export type LogContext = Partial<Record<'field' | 'value' | 'environment' | 'route' | 'requestId', string> & { status: number }> & Record<string, unknown>;

/**
 * Filter context to allowed low-cardinality keys and sanitize string values.
 */
export function filterAndSanitizeContext(ctx: LogContext | undefined) {
  if (!ctx || typeof ctx !== 'object') return { context: undefined as any, hashes: [] as string[] };
  const out: Record<string, unknown> = {};
  const hashes: string[] = [];
  for (const [k, v] of Object.entries(ctx)) {
    if (!allowedContextKeys.has(k)) continue;
    if (typeof v === 'string') {
      const s = sanitizeText(v);
      out[k] = s.text;
      hashes.push(...s.hashes);
    } else {
      out[k] = v;
    }
  }
  return { context: Object.keys(out).length ? out : undefined, hashes };
}
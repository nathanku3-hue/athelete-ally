import { NextRequest, NextResponse } from 'next/server';
import { sanitizeText, filterAndSanitizeContext } from '@athlete-ally/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const perKeyBuckets = new Map<string, { tokens: number; last: number }>();
const perIpBuckets = new Map<string, { tokens: number; last: number }>();

const PER_KEY_LIMIT = 10; // req/min
const PER_IP_LIMIT = 50;  // req/min safety cap

function bucketAllow(map: Map<string, { tokens: number; last: number }>, key: string, limitPerMin: number): boolean {
  const now = Date.now();
  const minute = 60_000;
  const refillRate = limitPerMin / minute; // tokens per ms
  const b = map.get(key) || { tokens: limitPerMin, last: now };
  const elapsed = now - b.last;
  b.tokens = Math.min(limitPerMin, b.tokens + elapsed * refillRate);
  b.last = now;
  if (b.tokens >= 1) { b.tokens -= 1; map.set(key, b); return true; }
  map.set(key, b); return false;
}

function getIp(req: NextRequest): string {
  const hf = req.headers.get('x-forwarded-for'); if (hf) return hf.split(',')[0].trim();
  const rip = req.headers.get('x-real-ip'); if (rip) return rip;
  return '0.0.0.0';
}
function getIdentity(req: NextRequest): { key: string; ip: string } {
  const ip = getIp(req); const apiKeyId = req.headers.get('x-api-key-id'); const userId = req.headers.get('x-user-id'); return { key: apiKeyId || userId || ip, ip };
}
function unauthorized() { return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } }); }
function tooMany(status: 429, msg: string) { return NextResponse.json({ error: 'rate_limited', message: msg }, { status, headers: { 'Cache-Control': 'no-store' } }); }
function badRequest(msg: string, code = 400) { return NextResponse.json({ error: 'bad_request', message: msg }, { status: code, headers: { 'Cache-Control': 'no-store' } }); }

const MAX_BODY_BYTES = 256 * 1024; const MAX_EVENT_BYTES = 32 * 1024;
function validateEvent(ev: any) {
  const required = ['level','msg','ts','service','module','env']; for (const k of required) { if (!(k in ev)) return `missing required field ${k}`; }
  if (!['debug','info','warn','error'].includes(ev.level)) return 'invalid level'; if (typeof ev.msg !== 'string') return 'msg must be string';
  const size = Buffer.byteLength(JSON.stringify(ev)); if (size > MAX_EVENT_BYTES) return `event too large (${size} > ${MAX_EVENT_BYTES})`;
  return null;
}
function sanitizeEvent(ev: any) {
  const s = sanitizeText(ev.msg); ev.msg = s.text; const { context, hashes } = filterAndSanitizeContext(ev.context);
  if (context) ev.context = context; else delete ev.context; const hashesArr = Array.isArray(ev.pii_hashes) ? ev.pii_hashes : []; ev.pii_hashes = [...hashesArr, ...s.hashes, ...hashes]; return ev;
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'production') { return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } }); }
  const apiKey = req.headers.get('x-api-key'); if (!apiKey || apiKey !== process.env.LOGS_API_KEY) return unauthorized();
  const { key, ip } = getIdentity(req);
  if (!bucketAllow(perIpBuckets, ip, PER_IP_LIMIT)) return tooMany(429, 'ip limit exceeded');
  if (!bucketAllow(perKeyBuckets, key, PER_KEY_LIMIT)) return tooMany(429, 'key limit exceeded');
  const ctype = req.headers.get('content-type') || ''; let raw: string;
  try { raw = await req.text(); } catch { return badRequest('failed to read body'); }
  const bodyBytes = Buffer.byteLength(raw); if (bodyBytes > MAX_BODY_BYTES) return badRequest(`payload too large (${bodyBytes} > ${MAX_BODY_BYTES})`, 413);
  let events: any[] = [];
  try {
    if (ctype.includes('application/json')) { const parsed = JSON.parse(raw); events = Array.isArray(parsed) ? parsed : [parsed]; }
    else if (ctype.includes('application/x-ndjson') || ctype.includes('text/plain')) { raw.split(/\r?\n/).filter(Boolean).forEach((line) => events.push(JSON.parse(line))); }
    else { return badRequest('unsupported content-type'); }
  } catch { return badRequest('invalid JSON'); }
  const sanitized: any[] = [];
  for (const ev of events) { const err = validateEvent(ev); if (err) return badRequest(err); sanitized.push(sanitizeEvent(ev)); }
  for (const ev of sanitized) { try { console.log(JSON.stringify({ ...ev, received_at: new Date().toISOString() })); } catch {} }
  return new NextResponse(null, { status: 202, headers: { 'Cache-Control': 'no-store' } });
}

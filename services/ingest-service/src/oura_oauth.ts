// Temporary any types to resolve Fastify type system drift
type FastifyInstance = any;
type FastifyReply = any;
type FastifyRequest = any;
import { randomBytes } from 'node:crypto';
import { encrypt, decrypt } from './crypto';
import { getTokenStore, OuraTokenRecord } from './tokenStore';

// Minimal state cache with TTL to protect the callback flow
class TTLCache<V> {
  private m = new Map<string, { v: V; exp: number }>();
  constructor(private ttlMs: number) {}
  set(k: string, v: V) { this.m.set(k, { v, exp: Date.now() + this.ttlMs }); }
  pop(k: string): V | undefined { const e = this.m.get(k); if (!e) return; this.m.delete(k); return e.exp > Date.now() ? e.v : undefined; }
}
const stateCache = new TTLCache<{ userId: string }>(10 * 60 * 1000);

function assertEnabled() {
  if ((process.env.OURA_OAUTH_ENABLED || 'false').toLowerCase() !== 'true') {
    throw new Error('Oura OAuth is disabled');
  }
}

function buildAuthorizeURL(userId: string) {
  const clientId = process.env.OURA_CLIENT_ID || '';
  const redirectUri = process.env.OURA_REDIRECT_URI || '';
  const scope = process.env.OURA_SCOPE || 'personal,heartrate,heartrate_daily,workout,activity,tag,userbasic,offline_access';
  if (!clientId || !redirectUri) throw new Error('Missing OURA_CLIENT_ID/OURA_REDIRECT_URI');
  const state = randomBytes(16).toString('hex');
  stateCache.set(state, { userId });
  const params = new URLSearchParams({ response_type: 'code', client_id: clientId, redirect_uri: redirectUri, scope, state });
  return { url: `https://cloud.ouraring.com/oauth/authorize?${params.toString()}`, state };
}

async function exchangeCode(code: string) {
  const tokenUrl = 'https://api.ouraring.com/oauth/token';
  const clientId = process.env.OURA_CLIENT_ID || '';
  const clientSecret = process.env.OURA_CLIENT_SECRET || '';
  const redirectUri = process.env.OURA_REDIRECT_URI || '';
  if (!clientId || !clientSecret || !redirectUri) throw new Error('Missing Oura credentials');
  const body = new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri, client_id: clientId, client_secret: clientSecret });
  const res = await fetch(tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in?: number; scope?: string }>
}

export function registerOuraOAuthRoutes(app: FastifyInstance) {
  if ((process.env.OURA_OAUTH_ENABLED || 'false').toLowerCase() !== 'true') {
    app.log.info('Oura OAuth flow disabled by OURA_OAUTH_ENABLED');
    return;
  }
  const store = getTokenStore();

  // GET /auth/oura/link?userId=...
  app.get('/auth/oura/link', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      assertEnabled();
      const userId = (req.query as any).userId as string;
      if (!userId) return reply.code(400).send({ error: 'userId required' });
      const { url } = buildAuthorizeURL(userId);
      reply.redirect(url);
    } catch (err) {
      app.log.error({ err }, 'link error');
      reply.code(500).send({ error: 'link_failed' });
    }
  });

  // GET /auth/oura/callback?code=...&state=...
  app.get('/auth/oura/callback', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      assertEnabled();
      const { code, state } = (req.query as any) as { code?: string; state?: string };
      if (!code || !state) return reply.code(400).send({ error: 'missing_params' });
      const s = stateCache.pop(state);
      if (!s) return reply.code(400).send({ error: 'invalid_state' });
      const tokens = await exchangeCode(code);
      const now = Date.now();
      const rec: OuraTokenRecord = {
        userId: s.userId,
        accessToken: encrypt(tokens.access_token),
        refreshToken: encrypt(tokens.refresh_token),
        scope: tokens.scope,
        expiresAt: tokens.expires_in ? now + tokens.expires_in * 1000 : undefined,
      };
      await store.put(rec);
      return { status: 'connected', userId: s.userId };
    } catch (err) {
      app.log.error({ err }, 'callback error');
      reply.code(500).send({ error: 'callback_failed' });
    }
  });

  // POST /auth/oura/refresh { userId }
  app.post('/auth/oura/refresh', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      assertEnabled();
      const { userId } = (req.body as any) || {};
      if (!userId) return reply.code(400).send({ error: 'userId required' });
      const rec = await store.get(userId);
      if (!rec) return reply.code(404).send({ error: 'not_found' });
      const tokenUrl = 'https://api.ouraring.com/oauth/token';
      const clientId = process.env.OURA_CLIENT_ID || '';
      const clientSecret = process.env.OURA_CLIENT_SECRET || '';
      const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: decrypt(rec.refreshToken), client_id: clientId, client_secret: clientSecret });
      const res = await fetch(tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!res.ok) return reply.code(502).send({ error: 'refresh_failed' });
      const data = await res.json() as any;
      await store.update(userId, {
        accessToken: encrypt(data.access_token),
        refreshToken: encrypt(data.refresh_token || decrypt(rec.refreshToken)),
        expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : rec.expiresAt,
        scope: data.scope || rec.scope,
      });
      return { status: 'refreshed', userId };
    } catch (err) {
      app.log.error({ err }, 'refresh error');
      reply.code(500).send({ error: 'refresh_failed' });
    }
  });
}


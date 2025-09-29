import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import Fastify from 'fastify';
import { registerOuraOAuthRoutes } from '../oura_oauth';

const OLD_ENV = process.env;

describe('Oura OAuth flow (feature-flagged)', () => {
  let app: ReturnType<typeof Fastify>;

  beforeAll(() => {
    process.env = { ...OLD_ENV };
    process.env.OURA_OAUTH_ENABLED = 'true';
    process.env.OURA_CLIENT_ID = 'cid';
    process.env.OURA_CLIENT_SECRET = 'secret';
    process.env.OURA_REDIRECT_URI = 'http://localhost:4101/auth/oura/callback';
    process.env.TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
    app = Fastify();
    registerOuraOAuthRoutes(app);
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await app.close();
  });

  it('returns redirect to Oura authorize for link', async () => {
    const res = await app.inject({ method: 'GET', url: '/auth/oura/link?userId=u1' });
    expect(res.statusCode).toBe(302);
    const loc = res.headers['location'] as string;
    expect(loc).toContain('cloud.ouraring.com/oauth/authorize');
    expect(loc).toContain('client_id=cid');
  });

  it('handles callback and stores tokens (mocked exchange)', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => ({ access_token: 'at', refresh_token: 'rt', expires_in: 3600 }) } as any);
    // Step 1: get state created by hitting link
    const link = await app.inject({ method: 'GET', url: '/auth/oura/link?userId=u2' });
    const loc = link.headers['location'] as string;
    const url = new URL(loc);
    const state = url.searchParams.get('state');
    expect(state).toBeTruthy();
    const cb = await app.inject({ method: 'GET', url: `/auth/oura/callback?code=code123&state=${state}` });
    expect(cb.statusCode).toBe(200);
    expect(cb.json()).toEqual({ status: 'connected', userId: 'u2' });
    fetchSpy.mockRestore();
  });
});


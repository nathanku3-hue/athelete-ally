import { buildServer, bucketAdjustment } from '../index';
import { afterAll, describe, expect, it } from '@jest/globals';

const OLD_ENV = process.env;

describe('adaptive-engine /adaptive/today', () => {
  afterAll(() => { process.env = { ...OLD_ENV }; });

  it('returns stub suggestion when ADAPTATION_STUB=true', async () => {
    process.env.ADAPTATION_STUB = 'true';
    process.env.READINESS_ADAPTATION = 'false';
    const app = buildServer();
    const res = await app.inject({ method: 'GET', url: '/adaptive/today?userId=u1' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.userId).toBe('u1');
    expect(body.adjustment).toBe('maintain');
  });

  it('maps readiness buckets to adjustments when READINESS_ADAPTATION=true', async () => {
    process.env.ADAPTATION_STUB = 'false';
    process.env.READINESS_ADAPTATION = 'true';
    (global as any).fetch = async () => ({ ok: true, status: 200, json: async () => ({ userId: 'u2', date: '2024-01-15', readinessScore: 85, drivers: [], timestamp: new Date().toISOString() }) });
    const app = buildServer();
    const res = await app.inject({ method: 'GET', url: '/adaptive/today?userId=u2' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.adjustment).toBe('increase');
    expect(body.readinessBucket).toBe('very_high');
  });

  it('Upstream Failure: propagates 204 when insights returns 5xx', async () => {
    process.env.ADAPTATION_STUB = 'false';
    process.env.READINESS_ADAPTATION = 'true';
    (global as any).fetch = async () => ({ ok: false, status: 502, json: async () => ({}) });
    const app = buildServer();
    const res = await app.inject({ method: 'GET', url: '/adaptive/today?userId=u3' });
    expect(res.statusCode).toBe(204);
  });

  it('Upstream Timeout: returns 204 on timeout', async () => {
    process.env.ADAPTATION_STUB = 'false';
    process.env.READINESS_ADAPTATION = 'true';
    process.env.INSIGHTS_TIMEOUT_MS = '5';
    (global as any).fetch = () => Promise.reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    const app = buildServer();
    const res = await app.inject({ method: 'GET', url: '/adaptive/today?userId=u4' });
    expect(res.statusCode).toBe(204);
  });

  it('Data Not Found: propagates 404', async () => {
    process.env.ADAPTATION_STUB = 'false';
    process.env.READINESS_ADAPTATION = 'true';
    (global as any).fetch = async () => ({ ok: false, status: 404, json: async () => ({}) });
    const app = buildServer();
    const res = await app.inject({ method: 'GET', url: '/adaptive/today?userId=u5' });
    expect(res.statusCode).toBe(404);
  });

  it('golden tests: bucket mapping boundaries', () => {
    expect(bucketAdjustment(0).adjustment).toBe('reduce');
    expect(bucketAdjustment(39.9).adjustment).toBe('reduce');
    expect(bucketAdjustment(40).adjustment).toBe('maintain');
    expect(bucketAdjustment(60).adjustment).toBe('maintain');
    expect(bucketAdjustment(60.1).adjustment).toBe('slight_increase');
    expect(bucketAdjustment(80).adjustment).toBe('slight_increase');
    expect(bucketAdjustment(80.1).adjustment).toBe('increase');
    expect(bucketAdjustment(100).adjustment).toBe('increase');
  });
});


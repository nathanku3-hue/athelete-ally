import { NextRequest } from 'next/server';
import { POST } from '../../app/api/logs/route';

describe.skip('/api/logs', () => {
  function makeReq(body: any, headers: Record<string,string> = {}) {
    const req = new Request('http://localhost/api/logs', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body)
    });
    return new NextRequest(req);
  }

  const OLD_ENV = process.env;
  beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });
  afterAll(() => { (console.log as any).mockRestore?.(); });
  beforeEach(() => { jest.resetModules(); process.env = { ...OLD_ENV, NODE_ENV: 'production', LOGS_API_KEY: 'k' }; });
  afterEach(() => { process.env = OLD_ENV; });

  it('rejects unauthorized', async () => {
    const res = await POST(makeReq([]));
    expect(res.status).toBe(401);
  });

  it('accepts valid batch and returns 202', async () => {
    const now = new Date().toISOString();
    const ev = { level: 'info', msg: 'hello user john@example.com', ts: now, service: 'frontend', module: 'comp', env: 'production' };
    const res = await POST(makeReq([ev], { 'x-api-key': 'k' }));
    expect([202,204]).toContain(res.status);
  });

  it('enforces size limits', async () => {
    const now = new Date().toISOString();
    const big = 'x'.repeat(40 * 1024);
    const ev = { level: 'info', msg: big, ts: now, service: 'frontend', module: 'comp', env: 'production' };
    const res = await POST(makeReq([ev], { 'x-api-key': 'k' }));
    expect(res.status).toBe(400);
  });
});

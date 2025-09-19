import Fastify from 'fastify';
import { registerMagicSliceRoutes } from '../../lib/routes';

jest.mock('../../lib/proxy', () => ({
  proxyRequest: jest.fn(),
}));
import { proxyRequest } from '../../lib/proxy';

function okResponse(body: any, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as any;
}

describe('Gateway→Planning feedback proxy', () => {
  let app: ReturnType<typeof Fastify>;

  beforeEach(async () => {
    app = Fastify({ logger: false });
    registerMagicSliceRoutes(app);
    await app.ready();
    (proxyRequest as jest.Mock).mockReset();
  });

  afterEach(async () => {
    await app.close();
  });

  it('proxies valid RPE feedback', async () => {
    (proxyRequest as jest.Mock).mockResolvedValue(okResponse({ success: true, data: {} }));

    const payload = {
      sessionId: 's1',
      exerciseId: 'squat',
      rpe: 8,
      completionRate: 100,
      timestamp: new Date().toISOString(),
    };
    const res = await app.inject({ method: 'POST', url: '/v1/plans/feedback/rpe', payload });
    expect(res.statusCode).toBe(200);
  });

  it('proxies valid performance metrics', async () => {
    (proxyRequest as jest.Mock).mockResolvedValue(okResponse({ success: true, data: {} }));

    const payload = {
      sessionId: 's2',
      totalVolume: 12000,
      averageRPE: 7,
      completionRate: 95,
      recoveryTime: 24,
      sleepQuality: 7,
      stressLevel: 3,
      timestamp: new Date().toISOString(),
    };
    const res = await app.inject({ method: 'POST', url: '/v1/plans/feedback/performance', payload });
    expect(res.statusCode).toBe(200);
  });

  it('rejects invalid RPE payload with 400', async () => {
    (proxyRequest as jest.Mock).mockResolvedValue(okResponse({ success: true, data: {} }));
    const res = await app.inject({ method: 'POST', url: '/v1/plans/feedback/rpe', payload: { rpe: 12 } });
    expect(res.statusCode).toBe(400);
  });
});


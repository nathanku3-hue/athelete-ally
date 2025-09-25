import Fastify from 'fastify';
import { registerMagicSliceRoutes } from '../../lib/routes';

// Mock the upstream proxy to control downstream responses
jest.mock('../../lib/proxy', () => ({
  proxyRequest: jest.fn(),
}));

import { proxyRequest } from '../../lib/proxy';

function okResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('Gateway→Planning contract validation', () => {
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

  it('accepts valid envelope from downstream for enhanced generate', async () => {
    (proxyRequest as jest.Mock).mockResolvedValue(okResponse({ success: true, data: { id: 'plan-1' } }));

    const payload = {
      userId: 'user-1',
      trainingIntent: {
        primaryGoal: 'strength',
        secondaryGoals: [],
        experienceLevel: 'beginner',
        timeConstraints: { availableDays: 3, sessionDuration: 60, preferredTimes: [] },
        equipment: ['bodyweight'],
        limitations: [],
        preferences: { intensity: 'low', style: 'traditional', progression: 'linear' }
      },
      currentFitnessLevel: { strength: 5, endurance: 5, flexibility: 5, mobility: 5 },
      injuryHistory: [],
      performanceGoals: { shortTerm: [], mediumTerm: [], longTerm: [] },
      feedbackHistory: []
    };

    const res = await app.inject({
      method: 'POST',
      url: '/v1/plans/enhanced/generate',
      payload,
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
  });

  it('rejects invalid downstream envelope with 502', async () => {
    (proxyRequest as jest.Mock).mockResolvedValue(okResponse({ not: 'envelope' }));

    const payload = {
      userId: 'user-1',
      trainingIntent: {
        primaryGoal: 'strength',
        secondaryGoals: [],
        experienceLevel: 'beginner',
        timeConstraints: { availableDays: 3, sessionDuration: 60, preferredTimes: [] },
        equipment: ['bodyweight'],
        limitations: [],
        preferences: { intensity: 'low', style: 'traditional', progression: 'linear' }
      },
      currentFitnessLevel: { strength: 5, endurance: 5, flexibility: 5, mobility: 5 },
      injuryHistory: [],
      performanceGoals: { shortTerm: [], mediumTerm: [], longTerm: [] },
      feedbackHistory: []
    };

    const res = await app.inject({ method: 'POST', url: '/v1/plans/enhanced/generate', payload });
    expect(res.statusCode).toBe(502);
  });

  it('rejects invalid request payload with 400', async () => {
    (proxyRequest as jest.Mock).mockResolvedValue(okResponse({ success: true, data: {} }));

    const badPayload = { userId: 'user-1' }; // missing required fields
    const res = await app.inject({ method: 'POST', url: '/v1/plans/enhanced/generate', payload: badPayload });
    expect(res.statusCode).toBe(400);
  });
});
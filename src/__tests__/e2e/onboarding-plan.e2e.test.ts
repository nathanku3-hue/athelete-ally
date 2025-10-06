/**
 * E2E: Onboarding -> Plan Generation -> Status Polling
 * - Uses Gateway-BFF API surface at /api/v1/*
 * - Requires running services (NATS, profile-onboarding, planning-engine)
 * - Skips gracefully if BFF health is not reachable
 */

import { randomUUID } from 'node:crypto';
import { JWTManager } from '@athlete-ally/shared/auth/jwt';

const BASE_URL = process.env.E2E_API_BASE_URL || 'http://localhost:4000';
const TIMEOUT_MS = parseInt(process.env.E2E_TIMEOUT_MS || '90000', 10);

async function get(url: string, token?: string) {
  const resp = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const text = await resp.text();
  try { return { status: resp.status, data: text ? JSON.parse(text) : {} }; }
  catch { return { status: resp.status, data: text }; }
}

async function post(url: string, body: any, token?: string) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await resp.text();
  try { return { status: resp.status, data: text ? JSON.parse(text) : {} }; }
  catch { return { status: resp.status, data: text }; }
}

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }

describe('E2E: Onboarding -> Plan Generation -> Status', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    // Health check; skip if BFF is down
    try {
      const health = await get(`${BASE_URL}/api/health`);
      if (health.status !== 200) {
        // @ts-expect-error - Jest's skip via pending
        pending(`BFF health not ready: status=${health.status}`);
      }
    } catch (err) {
      // @ts-expect-error - Jest's skip via pending
      pending(`BFF not reachable at ${BASE_URL}: ${String(err)}`);
    }

    userId = randomUUID();
    token = JWTManager.generateToken({ userId, role: 'user' });
  });

  it(
    'submits onboarding, queues plan generation, and polls status',
    async () => {
      // 1) Submit onboarding (basic payload)
      const onboardingPayload = {
        userId,
        purpose: 'general_fitness',
        proficiency: 'beginner',
        season: 'offseason',
        availabilityDays: 3,
        weeklyGoalDays: 3,
        equipment: ['bodyweight'],
        fixedSchedules: [],
        recoveryHabits: [],
        onboardingStep: 6,
        isOnboardingComplete: true,
      };
      const onboarding = await post(
        `${BASE_URL}/api/v1/onboarding`,
        onboardingPayload,
        token
      );
      expect([200, 202]).toContain(onboarding.status);

      // 2) Trigger plan generation explicitly for deterministic status polling
      const gen = await post(
        `${BASE_URL}/api/v1/plans/generate`,
        { userId },
        token
      );
      expect(gen.status).toBe(202);
      const jobId = gen.data?.jobId as string;
      expect(typeof jobId).toBe('string');

      // 3) Poll status until we observe a valid state or timeout
      const start = Date.now();
      let lastStatus: any = null;
      while (Date.now() - start < TIMEOUT_MS) {
        const res = await get(
          `${BASE_URL}/api/v1/plans/status?jobId=${encodeURIComponent(jobId)}`,
          token
        );
        if (res.status === 200 && res.data) {
          lastStatus = res.data;
          // Accept any of these states as “valid response seen”
          if (
            typeof lastStatus.status === 'string' &&
            ['queued', 'processing', 'completed', 'failed', 'not_found'].includes(lastStatus.status) ||
            lastStatus.jobId
          ) {
            break;
          }
        }
        await sleep(1500);
      }

      expect(lastStatus).toBeTruthy();
      // Must at least include a status or jobId
      expect(
        typeof lastStatus.status === 'string' || typeof lastStatus.jobId === 'string'
      ).toBe(true);
    },
    TIMEOUT_MS + 5000
  );
});


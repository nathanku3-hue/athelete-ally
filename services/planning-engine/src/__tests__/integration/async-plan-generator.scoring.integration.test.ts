import { jest } from '@jest/globals';
import { prisma } from '../../db.js';
import { AsyncPlanGenerator } from '../../optimization/async-plan-generator.js';
import { ConcurrencyController } from '../../concurrency/controller.js';
import type { TrainingPlan, TrainingPlanRequest } from '../../llm.js';
import type { PlanGeneratedEvent } from '@athlete-ally/contracts';

jest.mock('../../llm.js', () => {
  const actual = jest.requireActual('../../llm.js') as Record<string, unknown>;
  return {
    ...actual,
    generateTrainingPlan: jest.fn(),
  };
});

jest.mock('../../feature-flags/index.js', () => ({
  isFeatureEnabled: jest.fn(),
  initializeFeatureFlags: jest.fn(),
  closeFeatureFlags: jest.fn(),
  FEATURE_FLAGS: {
    coachTip: 'ai-feature-coachtip',
    weeklyReview: 'ai-feature-weekly-review',
  },
}));

const { generateTrainingPlan } = jest.requireMock('../../llm.js') as {
  generateTrainingPlan: jest.Mock;
};
const { isFeatureEnabled } = jest.requireMock('../../feature-flags/index.js') as {
  isFeatureEnabled: jest.Mock;
};

const generateTrainingPlanMock = generateTrainingPlan as jest.MockedFunction<
  (request: TrainingPlanRequest) => Promise<TrainingPlan>
>;

type IsFeatureEnabledFn = (flagKey: string, defaultValue?: boolean) => Promise<boolean>;
const isFeatureEnabledMock = isFeatureEnabled as unknown as jest.MockedFunction<IsFeatureEnabledFn>;

class StubEventPublisher {
  public generatedEvents: PlanGeneratedEvent[] = [];

  async publishPlanGenerated(event: PlanGeneratedEvent | any) {
    this.generatedEvents.push(event);
  }

  async publishPlanGenerationRequested() {
    return;
  }

  async publishPlanGenerationFailed() {
    return;
  }

  isHealthy() {
    return true;
  }
}

const TEST_DSN =
  process.env.PLANNING_DATABASE_URL ??
  'postgresql://athlete:athlete_staging@127.0.0.1:55433/athlete_planning_staging';

const requestFixture: TrainingPlanRequest = {
  userId: 'user-int-001',
  proficiency: 'intermediate',
  season: 'offseason',
  availabilityDays: 4,
  weeklyGoalDays: 4,
  selectedDaysPerWeek: 4,
  equipment: ['barbell', 'dumbbells'],
  purpose: 'general_fitness',
};

function planFixture(): TrainingPlan {
  const now = new Date('2025-01-01T00:00:00.000Z');
  return {
    id: 'plan-int-001',
    userId: requestFixture.userId,
    name: 'Integration Test Plan',
    description: 'Integration test plan with progression and deload',
    duration: 12,
    microcycles: [
      {
        weekNumber: 1,
        deload: false,
        sessions: [
          { dayOfWeek: 1, intensity: 'medium', exercises: [] },
          { dayOfWeek: 3, intensity: 'high', exercises: [] },
          { dayOfWeek: 5, intensity: 'medium', exercises: [] },
        ],
      },
      {
        weekNumber: 4,
        deload: true,
        sessions: [
          { dayOfWeek: 2, intensity: 'low', exercises: [] },
          { dayOfWeek: 4, intensity: 'medium', exercises: [] },
        ],
      },
    ],
    progression: {
      phases: [
        { name: 'Base', duration: 4, focus: 'volume' },
        { name: 'Build', duration: 4, focus: 'intensity' },
      ],
    },
    createdAt: now,
    updatedAt: now,
  } as unknown as TrainingPlan;
}

async function truncatePlanningTables() {
  await prisma.$transaction([
    prisma.exercise.deleteMany({}),
    prisma.session.deleteMany({}),
    prisma.microcycle.deleteMany({}),
    prisma.plan.deleteMany({}),
    prisma.planJob.deleteMany({}),
  ]);
}

async function waitForJob(jobId: string): Promise<any> {
  const timeout = Date.now() + 5000;
  while (Date.now() < timeout) {
    const job = await prisma.planJob.findUnique({ where: { jobId } });
    if (job?.status === 'completed' || job?.status === 'failed') {
      return job;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Plan job ${jobId} did not complete within timeout`);
}

describe('AsyncPlanGenerator scoring integration', () => {
  let eventPublisher: StubEventPublisher;
  let generator: AsyncPlanGenerator;

  beforeAll(() => {
    process.env.PLANNING_DATABASE_URL = TEST_DSN;
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    eventPublisher = new StubEventPublisher();
    generator = new AsyncPlanGenerator(
      null,
      new ConcurrencyController(),
      eventPublisher as any
    );
    await truncatePlanningTables();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('persists scoring data when feature flag is enabled', async () => {
    isFeatureEnabledMock.mockResolvedValue(true);
    generateTrainingPlanMock.mockResolvedValue(planFixture());

    const jobId = 'job-scoring-on';

    await prisma.planJob.create({
      data: {
        jobId,
        userId: requestFixture.userId,
        status: 'queued',
        progress: 0,
        requestData: requestFixture as any,
        startedAt: new Date(),
      },
    });

    await generator.generatePlanAsync(jobId, requestFixture);
    const job = await waitForJob(jobId);

    expect(job.status).toBe('completed');
    const scoring = (job.resultData as any)?.scoring;
    expect(scoring).toBeDefined();
    expect(scoring.total).toBeGreaterThan(0);
    expect(scoring.weights).toEqual(
      expect.objectContaining({ safety: expect.any(Number), compliance: expect.any(Number), performance: expect.any(Number) })
    );

    const storedPlan = await prisma.plan.findFirst({
      where: { userId: requestFixture.userId },
    });
    const storedContent = storedPlan?.content as any;
    expect(storedContent).toMatchObject({
      scoring: expect.objectContaining({
        version: 'fixed-weight-v1',
      }),
    });

    expect(eventPublisher.generatedEvents).toHaveLength(1);
    expect((eventPublisher.generatedEvents[0] as any).planData.scoring).toBeDefined();
  });

  it('omits scoring when feature flag is disabled', async () => {
    isFeatureEnabledMock.mockResolvedValue(false);
    generateTrainingPlanMock.mockResolvedValue(planFixture());

    const jobId = 'job-scoring-off';

    await prisma.planJob.create({
      data: {
        jobId,
        userId: requestFixture.userId,
        status: 'queued',
        progress: 0,
        requestData: requestFixture as any,
        startedAt: new Date(),
      },
    });

    await generator.generatePlanAsync(jobId, requestFixture);
    const job = await waitForJob(jobId);

    expect(job.status).toBe('completed');
    const scoring = (job.resultData as any)?.scoring;
    expect(scoring).toBeUndefined();

    const storedPlan = await prisma.plan.findFirst({
      where: { userId: requestFixture.userId },
    });
    const storedContent = storedPlan?.content as any;
    expect(storedContent?.scoring).toBeUndefined();

    expect(eventPublisher.generatedEvents).toHaveLength(1);
    expect((eventPublisher.generatedEvents[0] as any).planData.scoring).toBeUndefined();
  });
});

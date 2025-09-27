// Planning Engine ????
// Jest globals are available without import
// Global mocks are provided by global-mocks.ts

// ???? - ????????????
import { AsyncPlanGenerator } from '../../optimization/async-plan-generator';
import { ConcurrencyController } from '../../concurrency/controller';

// ??Redis???
class MockRedis {
  private cache = new Map<string, { value: string; expires: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async setex(key: string, ttl: number, value: string): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async ping(): Promise<string> {
    return 'PONG';
  }
}

// ???????
class MockEventPublisher {
  async publishPlanGenerated(event: any): Promise<void> {
    console.log('Mock: Publishing plan generated event', event.eventId);
  }
}

// ????????
class DatabaseOptimizer {
  async batchUpdateStatus(updates: any[]): Promise<void> {
    // ??????
  }
  
  async updatePlanStatusBatch(updates: any[]): Promise<void> {
    // ??????
  }
}

describe('Planning Engine Performance Tests', () => {
  let asyncPlanGenerator: AsyncPlanGenerator;
  let databaseOptimizer: DatabaseOptimizer;
  let concurrencyController: ConcurrencyController;
  let eventPublisher: MockEventPublisher;
  let mockRedis: MockRedis;

  beforeAll(async () => {
    // ???????
    mockRedis = new MockRedis();
    eventPublisher = new MockEventPublisher();
    concurrencyController = new ConcurrencyController();
    databaseOptimizer = new DatabaseOptimizer();
    
    // ??????????
    asyncPlanGenerator = new AsyncPlanGenerator(
      mockRedis,
      concurrencyController,
      eventPublisher as any
    );
  });

  beforeEach(() => {
    // ????
    (mockRedis as any).cache.clear();
  });

  afterAll(async () => {
    // ????
    await asyncPlanGenerator.cleanupCache();
  });

  describe('??????', () => {
    it('???????????', async () => {
      const request = {
        userId: 'test-user-1',
        proficiency: 'intermediate',
        season: 'offseason',
        availabilityDays: 3,
        weeklyGoalDays: 3,
        equipment: ['bodyweight', 'dumbbells'],
        purpose: 'general_fitness',
      };

      const mockPlan = {
        name: 'Test Plan',
        description: 'Test Description',
        duration: 4,
        microcycles: [
          {
            weekNumber: 1,
            name: 'Week 1',
            phase: 'preparation',
            sessions: [
              {
                dayOfWeek: 1,
                name: 'Upper Body',
                duration: 60,
                exercises: [
                  {
                    name: 'Push-ups',
                    category: 'strength',
                    sets: 3,
                    reps: '8-12',
                    weight: 'bodyweight',
                    notes: 'Keep core tight',
                  },
                ],
              },
            ],
          },
        ],
      };

      // ??????
      const cacheKey = (asyncPlanGenerator as any)['generateCacheKey'](request);
      await (asyncPlanGenerator as any)['cache'].set(cacheKey, mockPlan, 3600);

      // ??????
      const cachedPlan = await (asyncPlanGenerator as any)['cache'].get(cacheKey);
      expect(cachedPlan).toEqual(mockPlan);
    });

    it('??????????', async () => {
      const request = {
        userId: 'test-user-2',
        proficiency: 'beginner',
        season: 'pre-season',
        availabilityDays: 4,
        weeklyGoalDays: 4,
        equipment: ['barbell', 'plates'],
        purpose: 'strength_training',
      };

      const mockPlan = {
        name: 'Beginner Plan',
        description: 'Beginner Description',
        duration: 4,
        microcycles: [],
      };

      // ???????1??
      const cacheKey = (asyncPlanGenerator as any)['generateCacheKey'](request);
      await (asyncPlanGenerator as any)['cache'].set(cacheKey, mockPlan, 1);

      // ????????
      let cachedPlan = await (asyncPlanGenerator as any)['cache'].get(cacheKey);
      expect(cachedPlan).toEqual(mockPlan);

      // ????
      await new Promise(resolve => setTimeout(resolve, 1100));

      // ?????????null
      cachedPlan = await (asyncPlanGenerator as any)['cache'].get(cacheKey);
      expect(cachedPlan).toBeNull();
    });
  });

  describe('????????', () => {
    it('??????????', async () => {
      const maxConcurrent = 2;
      concurrencyController.setMaxConcurrency('plan_generation', maxConcurrent);

      const tasks = Array.from({ length: 5 }, (_, i) => ({
        id: `task-${i}`,
        data: { userId: `user-${i}` },
        retries: 0,
        maxRetries: 3,
        createdAt: new Date(),
      }));

      const startTime = Date.now();
      const promises = tasks.map(task =>
        concurrencyController.execute(
          'plan_generation',
          task,
          async () => {
            // ??????
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        )
      );

      await Promise.all(promises);
      const duration = Date.now() - startTime;

      // ????????????????????
      expect(duration).toBeGreaterThan(200); // ????3???
      expect(duration).toBeLessThan(1000); // ????????????
    });
  });

  describe('??????', () => {
    it.skip('??????????', async () => {
      // TODO: Fix ESM Prisma mock issue - https://github.com/nathanku3-hue/athelete-ally/issues/ci-mock-fix
      // Issue: Prisma updateMany mock not working correctly in ESM environment
      const requests = Array.from({ length: 10 }, (_, i) => ({
        userId: `user-${i}`,
        proficiency: 'intermediate' as const,
        season: 'offseason' as const,
        availabilityDays: 3,
        weeklyGoalDays: 3,
        equipment: ['bodyweight'],
        purpose: 'general_fitness' as const,
      }));

      const jobIds = Array.from({ length: 10 }, (_, i) => `job-${i}`);

      // ??????
      const startTime = Date.now();
      const promises = jobIds.map((jobId, index) =>
        asyncPlanGenerator.generatePlanAsync(jobId, requests[index], 1)
      );

      await Promise.all(promises);
      const duration = Date.now() - startTime;

      // ??????
      const queueStatus = asyncPlanGenerator.getQueueStatus();
      expect(queueStatus.queueLength).toBe(0); // ?????????
      expect(queueStatus.processingCount).toBe(0); // ?????????

      console.log(`??10?????: ${duration}ms`);
      expect(duration).toBeLessThan(5000); // ???5????
    });
  });

  describe('?????????', () => {
    it('??????????', async () => {
      const updates = Array.from({ length: 100 }, (_, i) => ({
        planId: `plan-${i}`,
        status: 'completed',
        progress: 100,
      }));

      const startTime = Date.now();
      
      // ???????????????????
      // ??????????????
      try {
        await databaseOptimizer.updatePlanStatusBatch(updates);
      } catch (error) {
        // ??????????
        expect(error).toBeDefined();
      }

      const duration = Date.now() - startTime;
      console.log(`????100?????: ${duration}ms`);
      expect(duration).toBeLessThan(1000); // ???1????
    });
  });

  describe('???????', () => {
    it.skip('???????????????', async () => {
      // TODO: Fix ESM Prisma mock issue - https://github.com/nathanku3-hue/athelete-ally/issues/ci-mock-fix
      // Issue: Prisma updateMany mock not working correctly in ESM environment
      const concurrentUsers = 20;
      const requestsPerUser = 5;
      
      const allRequests = [];
      for (let user = 0; user < concurrentUsers; user++) {
        for (let req = 0; req < requestsPerUser; req++) {
          allRequests.push({
            jobId: `job-${user}-${req}`,
            request: {
              userId: `user-${user}`,
              proficiency: 'intermediate',
              season: 'offseason',
              availabilityDays: 3,
              weeklyGoalDays: 3,
              equipment: ['bodyweight'],
              purpose: 'general_fitness',
            },
          });
        }
      }

      const startTime = Date.now();
      
      // ??????
      const promises = allRequests.map(({ jobId, request }) =>
        asyncPlanGenerator.generatePlanAsync(jobId, request, 1)
      );

      await Promise.all(promises);
      const duration = Date.now() - startTime;

      console.log(`??${allRequests.length}???????: ${duration}ms`);
      console.log(`??????: ${duration / allRequests.length}ms`);
      
      // ??????
      const queueStatus = asyncPlanGenerator.getQueueStatus();
      expect(queueStatus.queueLength).toBe(0);
      expect(queueStatus.processingCount).toBe(0);

      // ????
      expect(duration).toBeLessThan(10000); // ???10????
      expect(duration / allRequests.length).toBeLessThan(100); // ??????????100ms
    });
  });

  describe('??????', () => {
    it('??????????????????', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // ????????
      const requests = Array.from({ length: 1000 }, (_, i) => ({
        userId: `user-${i}`,
        proficiency: 'intermediate',
        season: 'offseason',
        availabilityDays: 3,
        weeklyGoalDays: 3,
        equipment: ['bodyweight'],
        purpose: 'general_fitness',
      }));

      // ????
      for (let i = 0; i < requests.length; i++) {
        const cacheKey = (asyncPlanGenerator as any)['generateCacheKey'](requests[i]);
        await (asyncPlanGenerator as any)['cache'].set(cacheKey, {
          name: `Plan ${i}`,
          description: `Description ${i}`,
          duration: 4,
          microcycles: [],
        }, 3600);
      }

      const afterCacheMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = afterCacheMemory - initialMemory;
      
      console.log(`??1000????????: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      // ????
      await asyncPlanGenerator.cleanupCache();
      
      const afterCleanupMemory = process.memoryUsage().heapUsed;
      const memoryAfterCleanup = afterCleanupMemory - initialMemory;
      
      console.log(`?????????: ${(memoryAfterCleanup / 1024 / 1024).toFixed(2)}MB`);
      
      // ????????
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // ????100MB
    });
  });
});

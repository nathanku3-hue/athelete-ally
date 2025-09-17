import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePlans, useCreatePlan, useDeletePlan } from '@/hooks/useTrainingQueries';
import { trainingAPI } from '@/lib/api/training';

// Mock the API
jest.mock('@/lib/api/training');
const mockTrainingAPI = trainingAPI as jest.Mocked<typeof trainingAPI>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useTrainingQueries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('usePlans', () => {
    it('should fetch plans successfully', async () => {
      const mockPlans = [
        {
          id: '1',
          name: 'Test Plan',
          description: 'Test Description',
          duration: 12,
          difficulty: 'intermediate',
          category: 'strength',
          sessionsPerWeek: 3,
          estimatedTime: 60,
          tags: ['test'],
          status: 'active',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      mockTrainingAPI.getPlans.mockResolvedValue(mockPlans);

      const { result } = renderHook(() => usePlans(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPlans);
      expect(mockTrainingAPI.getPlans).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch error', async () => {
      const error = new Error('Fetch failed');
      mockTrainingAPI.getPlans.mockRejectedValue(error);

      const { result } = renderHook(() => usePlans(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useCreatePlan', () => {
    it('should create plan successfully', async () => {
      const newPlan = {
        name: 'New Plan',
        description: 'New Description',
        duration: 8,
        difficulty: 'beginner',
        category: 'cardio',
        sessionsPerWeek: 2,
        estimatedTime: 45,
        tags: ['new'],
      };

      const createdPlan = { ...newPlan, id: '2', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      mockTrainingAPI.createPlan.mockResolvedValue(createdPlan);

      const { result } = renderHook(() => useCreatePlan(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.mutateAsync).toBeDefined();
      });

      const mutationResult = await result.current.mutateAsync(newPlan);

      expect(mutationResult).toEqual(createdPlan);
      expect(mockTrainingAPI.createPlan).toHaveBeenCalledWith(newPlan);
    });
  });

  describe('useDeletePlan', () => {
    it('should delete plan successfully', async () => {
      const planId = '1';
      mockTrainingAPI.deletePlan.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeletePlan(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.mutateAsync).toBeDefined();
      });

      await result.current.mutateAsync(planId);

      expect(mockTrainingAPI.deletePlan).toHaveBeenCalledWith(planId);
    });
  });
});




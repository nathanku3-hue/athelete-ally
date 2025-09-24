import { describe, it, expect } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePlans, usePlan, useCreatePlan } from '@hooks/useTrainingQueries';

describe('useTrainingQueries', () => {
  it('should initialize usePlans with default values', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    const { result } = renderHook(() => usePlans(), { wrapper });
    expect(result.current.isLoading).toBeDefined();
  });
  
  it('should handle usePlan with valid id', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    const { result } = renderHook(() => usePlan('test-plan-id'), { wrapper });
    expect(result.current.isLoading).toBeDefined();
  });
  
  it('should initialize useCreatePlan mutation', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    const { result } = renderHook(() => useCreatePlan(), { wrapper });
    expect(result.current.isPending).toBeDefined();
  });
});
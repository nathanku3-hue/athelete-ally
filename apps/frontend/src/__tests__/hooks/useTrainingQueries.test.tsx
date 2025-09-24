import { describe, it, expect } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTrainingQueries } from '@hooks/useTrainingQueries';

describe('useTrainingQueries', () => {
  it('should initialize with default values', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    const { result } = renderHook(() => useTrainingQueries(), { wrapper });
    expect(result.current.isLoading).toBe(false);
  });
  
  it('should handle query parameters', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    const { result } = renderHook(() => 
      useTrainingQueries({ userId: 'test-user' }), { wrapper }
    );
    expect(result.current.userId).toBe('test-user');
  });
  
  it('should handle loading state', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    const { result } = renderHook(() => useTrainingQueries(), { wrapper });
    expect(result.current.isLoading).toBeDefined();
  });
});
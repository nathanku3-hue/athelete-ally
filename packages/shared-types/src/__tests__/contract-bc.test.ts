/**
 * Unit Tests for Backward Compatibility Mappings
 * 
 * Tests BC mapping behavior under different CONTRACT_V1_COMPAT modes
 * and includes telemetry assertions.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock environment variables
const originalEnv = process.env;

describe('Contract Backward Compatibility', () => {
  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
  });

  describe('CONTRACT_V1_COMPAT modes', () => {
    it('should work in "on" mode (default)', async () => {
      process.env.CONTRACT_V1_COMPAT = 'on';
      
      // Re-import to get fresh config
      const { mapLegacyFatigueLevel, mapLegacySeason } = await import('@athlete-ally/shared-types');
      
      // Should map legacy values
      expect(mapLegacyFatigueLevel('normal')).toBe('moderate');
      expect(mapLegacySeason('off-season')).toBe('offseason');
      expect(mapLegacySeason('pre-season')).toBe('preseason');
      expect(mapLegacySeason('in-season')).toBe('inseason');
    });

    it('should work in "strict" mode with warnings', async () => {
      process.env.CONTRACT_V1_COMPAT = 'strict';
      
      // Mock console.warn
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Re-import to get fresh config
      const { mapLegacyFatigueLevel, mapLegacySeason } = await import('@athlete-ally/shared-types');
      
      // Should still map but with warnings
      expect(mapLegacyFatigueLevel('normal')).toBe('moderate');
      expect(mapLegacySeason('off-season')).toBe('offseason');
      
      // Should have logged warnings
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Deprecated: "normal" fatigue level detected')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Deprecated: "off-season" detected')
      );
      
      consoleSpy.mockRestore();
    });

    it('should throw errors in "off" mode', async () => {
      process.env.CONTRACT_V1_COMPAT = 'off';
      
      // Re-import to get fresh config
      const { mapLegacyFatigueLevel, mapLegacySeason } = await import('@athlete-ally/shared-types');
      
      // Should throw errors for legacy values
      expect(() => mapLegacyFatigueLevel('normal')).toThrow(
        'Legacy mapping disabled. Invalid fatigue level: normal'
      );
      expect(() => mapLegacySeason('off-season')).toThrow(
        'Legacy mapping disabled. Invalid season: off-season'
      );
    });
  });

  describe('Telemetry integration', () => {
    it('should record telemetry when enabled', async () => {
      process.env.CONTRACT_V1_COMPAT = 'on';
      process.env.CONTRACT_TELEMETRY = 'true';
      
      // Re-import to get fresh config
      const { mapLegacyFatigueLevel, getContractMetrics } = await import('@athlete-ally/shared-types');
      
      // Clear any existing metrics
      const initialMetrics = getContractMetrics();
      
      // Use legacy mapping
      mapLegacyFatigueLevel('normal');
      
      // Check telemetry was recorded
      const metrics = getContractMetrics();
      expect(metrics.totalMappings).toBeGreaterThan(initialMetrics.totalMappings);
      expect(metrics.byFieldValue['fatigue_level:normal']).toBeGreaterThan(0);
    });

    it('should not record telemetry when disabled', async () => {
      process.env.CONTRACT_V1_COMPAT = 'on';
      process.env.CONTRACT_TELEMETRY = 'false';
      
      // Re-import to get fresh config
      const { mapLegacyFatigueLevel, getContractMetrics } = await import('@athlete-ally/shared-types');
      
      // Clear any existing metrics
      const initialMetrics = getContractMetrics();
      
      // Use legacy mapping
      mapLegacyFatigueLevel('normal');
      
      // Check telemetry was NOT recorded
      const metrics = getContractMetrics();
      expect(metrics.totalMappings).toBe(initialMetrics.totalMappings);
    });
  });

  describe('Server-only wrapper', () => {
    it('should work on server side', async () => {
      // Mock server environment
      delete (global as any).window;
      process.env.NODE_ENV = 'test';
      
      const { serverOnly, getRuntimeInfo } = await import('@athlete-ally/shared-types/server-only');
      
      // Should work on server
      const result = serverOnly(() => 'server-result', 'test function');
      expect(result).toBe('server-result');
      
      // Should detect server environment
      const runtimeInfo = getRuntimeInfo();
      expect(runtimeInfo.isServerSide).toBe(true);
      expect(runtimeInfo.isClientSide).toBe(false);
    });

    it('should throw error on client side', async () => {
      // Mock client environment
      (global as any).window = {};
      
      const { serverOnly } = await import('@athlete-ally/shared-types/server-only');
      
      // Should throw error on client
      expect(() => {
        serverOnly(() => 'client-result', 'test function');
      }).toThrow('server-only function called on client side');
    });

    it('should throw error in Edge Runtime', async () => {
      // Mock Edge Runtime
      (global as any).EdgeRuntime = {};
      
      const { serverOnly } = await import('@athlete-ally/shared-types/server-only');
      
      // Should throw error in Edge Runtime
      expect(() => {
        serverOnly(() => 'edge-result', 'test function');
      }).toThrow('test function called in Edge Runtime');
    });
  });

  describe('Metrics adapter', () => {
    it('should record metrics correctly', async () => {
      const { ContractMetricsService } = await import('@athlete-ally/shared-types/metrics-adapter');
      
      const service = new ContractMetricsService();
      
      // Record some metrics
      service.recordLegacyMapping('fatigue_level', 'normal', 'test');
      service.recordLegacyMapping('season', 'off-season', 'test');
      service.recordValidationFailure('schema', 'invalid_type', 'test');
      
      // Get metrics summary
      const summary = service.getMetricsSummary();
      expect(summary.totalMetrics).toBeGreaterThan(0);
      expect(summary.metrics.contract_legacy_mapping_total).toBe(2);
      expect(summary.metrics.contract_validation_failure_total).toBe(1);
    });

    it('should generate Prometheus format', async () => {
      const { ContractMetricsService } = await import('@athlete-ally/shared-types/metrics-adapter');
      
      const service = new ContractMetricsService();
      service.recordLegacyMapping('fatigue_level', 'normal', 'test');
      
      const metrics = service.getMetrics();
      expect(metrics).toContain('# HELP contract_legacy_mapping_total');
      expect(metrics).toContain('# TYPE contract_legacy_mapping_total counter');
      expect(metrics).toContain('contract_legacy_mapping_total{field="fatigue_level",value="normal",environment="test"}');
    });
  });

  describe('API integration', () => {
    it('should handle server contract requests', async () => {
      // Mock server environment
      delete (global as any).window;
      
      const { handleServerContractRequest } = await import('@athlete-ally/shared-types/server-only');
      
      // Mock NextRequest
      const mockRequest = {
        json: async () => ({ level: 'normal', season: 'off-season' })
      } as any;
      
      // Should handle request correctly
      const result = await handleServerContractRequest(
        mockRequest,
        async (mappedBody) => {
          expect(mappedBody.level).toBe('moderate');
          expect(mappedBody.season).toBe('offseason');
          return { success: true };
        }
      );
      
      expect(result.success).toBe(true);
    });
  });
});

/**
 * Feature Hello Contract Test
 * 
 * This test verifies the contract of the feature-hello package
 * and ensures all exports are properly typed and functional.
 */

import { describe, it, expect } from '@jest/globals';
import { HelloRequestSchema, HelloResponseSchema } from '../src/schemas.js';
import { HelloFeatureToggle } from '../src/toggle.js';
import { HelloMetrics } from '../src/metrics.js';
import { HelloService } from '../src/serveronly.js';

describe('Feature Hello Contract', () => {
  describe('schemas', () => {
    it('should validate HelloRequest', () => {
      const validRequest = {
        message: 'test message',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };
      
      const result = HelloRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate HelloResponse', () => {
      const validResponse = {
        greeting: 'Hello, world!',
        timestamp: '2023-01-01T00:00:00.000Z',
        featureEnabled: true,
      };
      
      const result = HelloResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('toggle', () => {
    it('should check feature enabled status', () => {
      const toggle = new HelloFeatureToggle(['test-feature']);
      expect(toggle.isEnabled('test-feature')).toBe(true);
      expect(toggle.isEnabled('disabled-feature')).toBe(false);
    });
  });

  describe('metrics', () => {
    it('should collect metrics', () => {
      const metrics = new HelloMetrics();
      metrics.increment('test.counter');
      metrics.timing('test.timing', 100);
      
      const collected = metrics.getMetrics();
      expect(collected.get('test.counter')).toBe(1);
      expect(collected.get('test.timing')).toBe(100);
    });
  });

  describe('service', () => {
    it('should process greeting requests', async () => {
      const service = new HelloService();
      const request = { message: 'test' };
      
      const response = await service.processGreeting(request);
      expect(response.greeting).toContain('test');
      expect(response.featureEnabled).toBe(true);
      expect(response.timestamp).toBeDefined();
    });
  });
});

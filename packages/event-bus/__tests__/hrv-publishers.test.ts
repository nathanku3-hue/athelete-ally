import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { EventBus } from '../src/index.ts';
import { HRVRawReceivedEvent, HRVNormalizedStoredEvent, EVENT_TOPICS } from '@athlete-ally/contracts';

// Mock NATS
jest.mock('nats', () => ({
  connect: jest.fn(),
}));

// Mock validator
jest.mock('../src/validator.ts', () => ({
  eventValidator: {
    validateEvent: jest.fn().mockResolvedValue({ valid: true, errors: [] }),
  },
}));

// Mock prom-client
jest.mock('prom-client', () => ({
  register: {
    registerMetric: jest.fn(),
    metrics: jest.fn().mockResolvedValue(''),
  },
  Counter: jest.fn().mockImplementation(() => ({
    inc: jest.fn(),
  })),
  Histogram: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
  })),
}));

describe('HRV Publishers', () => {
  let eventBus: EventBus;
  let mockJs: any;

  beforeEach(() => {
    eventBus = new EventBus();
    mockJs = {
      publish: jest.fn().mockResolvedValue(undefined),
    };
    
    // Mock the internal js property
    (eventBus as any).js = mockJs;
  });

  describe('publishHRVRawReceived', () => {
    it('should publish HRV raw received event with correct topic and payload', async () => {
      const event: HRVRawReceivedEvent = {
        payload: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          capturedAt: '2024-01-15T08:30:00Z',
          raw: { source: 'oura' }
        }
      };

      await eventBus.publishHRVRawReceived(event);

      expect(mockJs.publish).toHaveBeenCalledWith(
        EVENT_TOPICS.HRV_RAW_RECEIVED,
        expect.any(Uint8Array)
      );

      // Verify the published data
      const publishedData = JSON.parse(
        new TextDecoder().decode(mockJs.publish.mock.calls[0][1])
      );
      expect(publishedData).toEqual(event);
    });

    it('should call validator with correct topic', async () => {
      const { eventValidator } = require('../src/validator.ts');
      
      const event: HRVRawReceivedEvent = {
        payload: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      await eventBus.publishHRVRawReceived(event);

      expect(eventValidator.validateEvent).toHaveBeenCalledWith('hrv_raw_received', event);
    });

    it('should throw error when JetStream not initialized', async () => {
      (eventBus as any).js = null;

      const event: HRVRawReceivedEvent = {
        payload: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      await expect(eventBus.publishHRVRawReceived(event)).rejects.toThrow('JetStream not initialized');
    });
  });

  describe('publishHRVNormalizedStored', () => {
    it('should publish HRV normalized stored event with correct topic and payload', async () => {
      const event: HRVNormalizedStoredEvent = {
        record: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          lnRMSSD: 3.82,
          readinessScore: 75,
          vendor: 'oura',
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      await eventBus.publishHRVNormalizedStored(event);

      expect(mockJs.publish).toHaveBeenCalledWith(
        EVENT_TOPICS.HRV_NORMALIZED_STORED,
        expect.any(Uint8Array)
      );

      // Verify the published data
      const publishedData = JSON.parse(
        new TextDecoder().decode(mockJs.publish.mock.calls[0][1])
      );
      expect(publishedData).toEqual(event);
    });

    it('should call validator with correct topic', async () => {
      const { eventValidator } = require('../src/validator.ts');
      
      const event: HRVNormalizedStoredEvent = {
        record: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          lnRMSSD: 3.82,
          readinessScore: 75,
          vendor: 'oura',
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      await eventBus.publishHRVNormalizedStored(event);

      expect(eventValidator.validateEvent).toHaveBeenCalledWith('hrv_normalized_stored', event);
    });

    it('should throw error when JetStream not initialized', async () => {
      (eventBus as any).js = null;

      const event: HRVNormalizedStoredEvent = {
        record: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          lnRMSSD: 3.82,
          readinessScore: 75,
          vendor: 'oura',
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      await expect(eventBus.publishHRVNormalizedStored(event)).rejects.toThrow('JetStream not initialized');
    });
  });

  describe('validation failure handling', () => {
    it('should handle validation failure for HRV raw received', async () => {
      const { eventValidator } = require('../src/validator.ts');
      eventValidator.validateEvent.mockResolvedValueOnce({
        valid: false,
        errors: ['Invalid date format'],
        message: 'Schema validation failed'
      });

      const event: HRVRawReceivedEvent = {
        payload: {
          userId: 'user123',
          date: 'invalid-date',
          rMSSD: 45.5,
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      await expect(eventBus.publishHRVRawReceived(event)).rejects.toThrow('Schema validation failed');
      expect(mockJs.publish).not.toHaveBeenCalled();
    });

    it('should handle validation failure for HRV normalized stored', async () => {
      const { eventValidator } = require('../src/validator.ts');
      eventValidator.validateEvent.mockResolvedValueOnce({
        valid: false,
        errors: ['Readiness score out of range'],
        message: 'Schema validation failed'
      });

      const event: HRVNormalizedStoredEvent = {
        record: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          lnRMSSD: 3.82,
          readinessScore: 150, // Out of range
          vendor: 'oura',
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      await expect(eventBus.publishHRVNormalizedStored(event)).rejects.toThrow('Schema validation failed');
      expect(mockJs.publish).not.toHaveBeenCalled();
    });
  });
});

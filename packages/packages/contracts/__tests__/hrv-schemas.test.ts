import { describe, it, expect } from '@jest/globals';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { EventSchemas } from '../events/schemas';

const ajv = new Ajv();
addFormats(ajv);

describe('HRV Event Schemas', () => {
  describe('HRVRawReceivedSchema', () => {
    const validate = ajv.compile(EventSchemas.hrv_raw_received);

    it('should validate correct HRV raw received event', () => {
      const validEvent = {
        payload: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          capturedAt: '2024-01-15T08:30:00Z',
          raw: { source: 'oura', device: 'ring' }
        }
      };

      const isValid = validate(validEvent);
      expect(isValid).toBe(true);
      if (!isValid) {
        // Console logging removed - use proper logger instead
      }
    });

    it('should validate event without optional raw field', () => {
      const validEvent = {
        payload: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      const isValid = validate(validEvent);
      expect(isValid).toBe(true);
    });

    it('should reject invalid date format', () => {
      const invalidEvent = {
        payload: {
          userId: 'user123',
          date: '2024/01/15', // Wrong format
          rMSSD: 45.5,
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      const isValid = validate(invalidEvent);
      expect(isValid).toBe(false);
    });

    it('should reject negative rMSSD', () => {
      const invalidEvent = {
        payload: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: -5, // Negative value
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      const isValid = validate(invalidEvent);
      expect(isValid).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidEvent = {
        payload: {
          userId: 'user123',
          // Missing date, rMSSD, capturedAt
        }
      };

      const isValid = validate(invalidEvent);
      expect(isValid).toBe(false);
    });

    it('should reject invalid capturedAt format', () => {
      const invalidEvent = {
        payload: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          capturedAt: 'not-a-datetime'
        }
      };

      const isValid = validate(invalidEvent);
      expect(isValid).toBe(false);
    });
  });

  describe('HRVNormalizedStoredSchema', () => {
    const validate = ajv.compile(EventSchemas.hrv_normalized_stored);

    it('should validate correct HRV normalized stored event', () => {
      const validEvent = {
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

      const isValid = validate(validEvent);
      expect(isValid).toBe(true);
    });

    it('should reject readiness score out of range', () => {
      const invalidEvent = {
        record: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          lnRMSSD: 3.82,
          readinessScore: 150, // Out of range (0-100)
          vendor: 'oura',
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      const isValid = validate(invalidEvent);
      expect(isValid).toBe(false);
    });

    it('should reject invalid vendor', () => {
      const invalidEvent = {
        record: {
          userId: 'user123',
          date: '2024-01-15',
          rMSSD: 45.5,
          lnRMSSD: 3.82,
          readinessScore: 75,
          vendor: 'invalid-vendor', // Invalid vendor
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      const isValid = validate(invalidEvent);
      expect(isValid).toBe(false);
    });

    it('should accept all valid vendors', () => {
      const vendors = ['oura', 'whoop', 'unknown'];
      
      vendors.forEach(vendor => {
        const validEvent = {
          record: {
            userId: 'user123',
            date: '2024-01-15',
            rMSSD: 45.5,
            lnRMSSD: 3.82,
            readinessScore: 75,
            vendor,
            capturedAt: '2024-01-15T08:30:00Z'
          }
        };

        const isValid = validate(validEvent);
        expect(isValid).toBe(true);
      });
    });

    it('should reject missing required fields', () => {
      const invalidEvent = {
        record: {
          userId: 'user123',
          // Missing required fields
        }
      };

      const isValid = validate(invalidEvent);
      expect(isValid).toBe(false);
    });
  });

  describe('EventSchemas registration', () => {
    it('should include HRV schemas in EventSchemas', () => {
      expect(EventSchemas.hrv_raw_received).toBeDefined();
      expect(EventSchemas.hrv_normalized_stored).toBeDefined();
    });

    it('should maintain existing schemas', () => {
      expect(EventSchemas.onboarding_completed).toBeDefined();
      expect(EventSchemas.plan_generation_requested).toBeDefined();
      expect(EventSchemas.plan_generated).toBeDefined();
      expect(EventSchemas.plan_generation_failed).toBeDefined();
    });
  });
});

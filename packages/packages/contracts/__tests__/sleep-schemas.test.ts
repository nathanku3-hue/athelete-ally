import { describe, it, expect } from '@jest/globals';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { EventSchemas } from '../events/schemas';

const ajv = new Ajv();
addFormats(ajv);

describe('Sleep Event Schemas', () => {
  describe('SleepRawReceivedSchema', () => {
    const validate = ajv.compile(EventSchemas.sleep_raw_received);

    it('should validate correct sleep raw received event', () => {
      const validEvent = {
        payload: {
          userId: 'user123',
          date: '2024-01-15',
          durationMinutes: 420,
          capturedAt: '2024-01-15T08:30:00Z',
          raw: { source: 'oura', device: 'ring' }
        }
      };

      const isValid = validate(validEvent);
      expect(isValid).toBe(true);
      if (!isValid) {
        console.log('Validation errors:', validate.errors);
      }
    });

    it('should validate event without optional fields', () => {
      const validEvent = {
        payload: {
          userId: 'user123',
          date: '2024-01-15',
          durationMinutes: 420
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
          durationMinutes: 420,
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      const isValid = validate(invalidEvent);
      expect(isValid).toBe(false);
    });

    it('should reject negative durationMinutes', () => {
      const invalidEvent = {
        payload: {
          userId: 'user123',
          date: '2024-01-15',
          durationMinutes: -5, // Negative value
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      const isValid = validate(invalidEvent);
      expect(isValid).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidEvent = {
        payload: {
          userId: 'user123'
          // Missing date, durationMinutes
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
          durationMinutes: 420,
          capturedAt: 'not-a-datetime'
        }
      };

      const isValid = validate(invalidEvent);
      expect(isValid).toBe(false);
    });

    it('should reject empty userId', () => {
      const invalidEvent = {
        payload: {
          userId: '', // Empty string
          date: '2024-01-15',
          durationMinutes: 420
        }
      };

      const isValid = validate(invalidEvent);
      expect(isValid).toBe(false);
    });

    it('should accept zero durationMinutes', () => {
      const validEvent = {
        payload: {
          userId: 'user123',
          date: '2024-01-15',
          durationMinutes: 0 // Boundary case
        }
      };

      const isValid = validate(validEvent);
      expect(isValid).toBe(true);
    });
  });

  describe('SleepNormalizedStoredSchema', () => {
    const validate = ajv.compile(EventSchemas.sleep_normalized_stored);

    it('should validate correct sleep normalized stored event', () => {
      const validEvent = {
        record: {
          userId: 'user123',
          date: '2024-01-15',
          durationMinutes: 420,
          qualityScore: 75,
          vendor: 'oura',
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      const isValid = validate(validEvent);
      expect(isValid).toBe(true);
    });

    it('should validate event without optional qualityScore', () => {
      const validEvent = {
        record: {
          userId: 'user123',
          date: '2024-01-15',
          durationMinutes: 420,
          vendor: 'oura',
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      const isValid = validate(validEvent);
      expect(isValid).toBe(true);
    });

    it('should reject qualityScore out of range (>100)', () => {
      const invalidEvent = {
        record: {
          userId: 'user123',
          date: '2024-01-15',
          durationMinutes: 420,
          qualityScore: 150, // Out of range (0-100)
          vendor: 'oura',
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      const isValid = validate(invalidEvent);
      expect(isValid).toBe(false);
    });

    it('should reject qualityScore out of range (<0)', () => {
      const invalidEvent = {
        record: {
          userId: 'user123',
          date: '2024-01-15',
          durationMinutes: 420,
          qualityScore: -5, // Out of range (0-100)
          vendor: 'oura',
          capturedAt: '2024-01-15T08:30:00Z'
        }
      };

      const isValid = validate(invalidEvent);
      expect(isValid).toBe(false);
    });

    it('should accept boundary qualityScore values', () => {
      const testCases = [0, 100];

      testCases.forEach(qualityScore => {
        const validEvent = {
          record: {
            userId: 'user123',
            date: '2024-01-15',
            durationMinutes: 420,
            qualityScore,
            vendor: 'oura',
            capturedAt: '2024-01-15T08:30:00Z'
          }
        };

        const isValid = validate(validEvent);
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid vendor', () => {
      const invalidEvent = {
        record: {
          userId: 'user123',
          date: '2024-01-15',
          durationMinutes: 420,
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
            durationMinutes: 420,
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
          userId: 'user123'
          // Missing required fields
        }
      };

      const isValid = validate(invalidEvent);
      expect(isValid).toBe(false);
    });
  });

  describe('EventSchemas registration', () => {
    it('should include Sleep schemas in EventSchemas', () => {
      expect(EventSchemas.sleep_raw_received).toBeDefined();
      expect(EventSchemas.sleep_normalized_stored).toBeDefined();
    });

    it('should maintain existing schemas', () => {
      expect(EventSchemas.onboarding_completed).toBeDefined();
      expect(EventSchemas.plan_generation_requested).toBeDefined();
      expect(EventSchemas.plan_generated).toBeDefined();
      expect(EventSchemas.plan_generation_failed).toBeDefined();
      expect(EventSchemas.hrv_raw_received).toBeDefined();
      expect(EventSchemas.hrv_normalized_stored).toBeDefined();
    });
  });
});

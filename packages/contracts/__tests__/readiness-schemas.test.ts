import { describe, it, expect } from '@jest/globals';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { EventSchemas } from '../events/schemas.js';

const ajv = new Ajv();
addFormats(ajv);

describe('Readiness Event Schemas', () => {
  describe('ReadinessComputedSchema', () => {
    const validate = ajv.compile(EventSchemas.readiness_computed);

    it('validates a correct computed event', () => {
      const event = {
        payload: {
          userId: 'user123',
          date: '20241001',
          score: 90,
          incomplete: false,
          components: { hrvScore: 85, sleepScore: 95, notes: 'ok' }
        }
      };
      expect(validate(event)).toBe(true);
    });

    it('rejects invalid date format (expects YYYYMMDD)', () => {
      const event = {
        payload: {
          userId: 'user123',
          date: '2024-10-01', // wrong format
          score: 90
        }
      };
      expect(validate(event)).toBe(false);
    });

    it('rejects score out of range', () => {
      const eventLow = { payload: { userId: 'u', date: '20241001', score: -1 } };
      const eventHigh = { payload: { userId: 'u', date: '20241001', score: 101 } };
      expect(validate(eventLow)).toBe(false);
      expect(validate(eventHigh)).toBe(false);
    });
  });

  describe('ReadinessStoredSchema', () => {
    const validate = ajv.compile(EventSchemas.readiness_stored);

    it('validates a correct stored event (with capturedAt)', () => {
      const event = {
        record: {
          userId: 'user123',
          date: '20241001',
          score: 72,
          capturedAt: '2024-10-01T08:30:00Z'
        }
      };
      expect(validate(event)).toBe(true);
    });

    it('validates without optional fields', () => {
      const event = {
        record: { userId: 'user123', date: '20241001', score: 50 }
      };
      expect(validate(event)).toBe(true);
    });

    it('rejects invalid date', () => {
      const event = { record: { userId: 'u', date: '2024/10/01', score: 50 } };
      expect(validate(event)).toBe(false);
    });
  });

  describe('EventSchemas registration', () => {
    it('includes readiness schemas in registry', () => {
      expect(EventSchemas.readiness_computed).toBeDefined();
      expect(EventSchemas.readiness_stored).toBeDefined();
    });
  });
});


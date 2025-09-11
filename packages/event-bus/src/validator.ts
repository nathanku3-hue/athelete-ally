import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { config } from './config.js';

export interface ValidationResult {
  valid: boolean;
  message?: string;
  errors?: string[];
}

export class EventValidator {
  private ajv: Ajv;
  private schemaCache: Map<string, any> = new Map();
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor() {
    this.ajv = new Ajv({ 
      allErrors: true,
      strict: false,
      verbose: true
    });
    addFormats(this.ajv);
  }

  async validateEvent(topic: string, event: any): Promise<ValidationResult> {
    if (!config.ENABLE_SCHEMA_VALIDATION) {
      return { valid: true };
    }

    try {
      const schema = await this.getSchema(topic);
      if (!schema) {
        return { valid: true }; // 如果没有schema，跳过验证
      }

      const validate = this.ajv.compile(schema);
      const valid = validate(event);

      if (!valid) {
        const errors = validate.errors?.map(err => 
          `${err.instancePath || 'root'}: ${err.message}`
        ) || [];
        
        return {
          valid: false,
          message: 'Schema validation failed',
          errors
        };
      }

      return { valid: true };
    } catch (error) {
      console.error(`Schema validation error for topic ${topic}:`, error);
      return {
        valid: false,
        message: `Schema validation error: ${(error as Error).message}`,
        errors: [(error as Error).message]
      };
    }
  }

  private async getSchema(topic: string): Promise<any> {
    const cacheKey = `schema:${topic}`;
    
    // 检查缓存
    if (this.schemaCache.has(cacheKey)) {
      this.cacheHits++;
      return this.schemaCache.get(cacheKey);
    }

    this.cacheMisses++;
    
    // 根据topic返回对应的schema
    const schema = this.getTopicSchema(topic);
    
    if (schema) {
      // 缓存schema
      if (this.schemaCache.size >= config.SCHEMA_CACHE_SIZE) {
        // 简单的LRU：删除第一个条目
        const firstKey = this.schemaCache.keys().next().value;
        if (firstKey) {
          this.schemaCache.delete(firstKey);
        }
      }
      this.schemaCache.set(cacheKey, schema);
    }

    return schema;
  }

  private getTopicSchema(topic: string): any {
    // 这里返回对应topic的JSON Schema
    // 在实际项目中，这些schema应该从文件或数据库加载
    const schemas: Record<string, any> = {
      'onboarding_completed': {
        type: 'object',
        required: ['eventId', 'userId', 'timestamp'],
        properties: {
          eventId: { type: 'string' },
          userId: { type: 'string' },
          timestamp: { type: 'number' },
          proficiency: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          season: { type: 'string', enum: ['offseason', 'preseason', 'inseason'] },
          availabilityDays: { type: 'number', minimum: 1, maximum: 7 },
          weeklyGoalDays: { type: 'number', minimum: 1, maximum: 7 },
          equipment: { type: 'array', items: { type: 'string' } }
        }
      },
      'plan_generation_requested': {
        type: 'object',
        required: ['eventId', 'userId', 'timestamp', 'jobId'],
        properties: {
          eventId: { type: 'string' },
          userId: { type: 'string' },
          timestamp: { type: 'number' },
          jobId: { type: 'string' },
          proficiency: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          season: { type: 'string', enum: ['offseason', 'preseason', 'inseason'] },
          availabilityDays: { type: 'number', minimum: 1, maximum: 7 },
          weeklyGoalDays: { type: 'number', minimum: 1, maximum: 7 },
          equipment: { type: 'array', items: { type: 'string' } },
          purpose: { type: 'string' }
        }
      },
      'plan_generated': {
        type: 'object',
        required: ['eventId', 'userId', 'planId', 'timestamp'],
        properties: {
          eventId: { type: 'string' },
          userId: { type: 'string' },
          planId: { type: 'string' },
          timestamp: { type: 'number' },
          planName: { type: 'string' },
          status: { type: 'string', enum: ['completed', 'failed'] },
          version: { type: 'number' }
        }
      },
      'plan_generation_failed': {
        type: 'object',
        required: ['eventId', 'userId', 'jobId', 'timestamp', 'error'],
        properties: {
          eventId: { type: 'string' },
          userId: { type: 'string' },
          jobId: { type: 'string' },
          timestamp: { type: 'number' },
          error: { type: 'string' },
          retryCount: { type: 'number', minimum: 0 }
        }
      }
    };

    return schemas[topic] || null;
  }

  getCacheStatus() {
    return {
      cacheSize: this.schemaCache.size,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
    };
  }

  clearCache() {
    this.schemaCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

export const eventValidator = new EventValidator();

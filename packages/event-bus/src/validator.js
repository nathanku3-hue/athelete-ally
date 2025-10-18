import { createLogger } from '@athlete-ally/logger';
import nodeAdapter from '@athlete-ally/logger/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { config } from './config.js';
import { EventSchemas } from '@athlete-ally/contracts/events/schemas';
const log = createLogger(nodeAdapter, { module: 'validator' });
export class EventValidator {
    constructor() {
        this.schemaCache = new Map();
        this.cacheHits = 0;
        this.cacheMisses = 0;
        // 生产模式使用更严格的校验
        const isProduction = process.env.NODE_ENV === 'production';
        this.ajv = new Ajv({
            allErrors: true,
            strict: isProduction, // 生产模式启用严格模式
            verbose: true,
            removeAdditional: isProduction ? 'all' : false, // 生产模式移除额外属性
            useDefaults: true, // 使用默认值
            coerceTypes: false // 不强制类型转换
        });
        addFormats(this.ajv);
    }
    async validateEvent(topic, event) {
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
                const errors = validate.errors?.map(err => `${err.instancePath || 'root'}: ${err.message}`) || [];
                return {
                    valid: false,
                    message: 'Schema validation failed',
                    errors
                };
            }
            return { valid: true };
        }
        catch (error) {
            log.error(`Schema validation error for topic ${topic}: ${String(error)}`);
            return {
                valid: false,
                message: `Schema validation error: ${error.message}`,
                errors: [error.message]
            };
        }
    }
    async getSchema(topic) {
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
    getTopicSchema(topic) {
        // 使用contracts包中的schema定义作为单一事实源
        const schemaKey = topic;
        return EventSchemas[schemaKey] || null;
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
//# sourceMappingURL=validator.js.map
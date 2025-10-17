export interface ValidationResult {
    valid: boolean;
    message?: string;
    errors?: string[];
}
export declare class EventValidator {
    private ajv;
    private schemaCache;
    private cacheHits;
    private cacheMisses;
    constructor();
    validateEvent(topic: string, event: unknown): Promise<ValidationResult>;
    private getSchema;
    private getTopicSchema;
    getCacheStatus(): {
        cacheSize: number;
        cacheHits: number;
        cacheMisses: number;
        hitRate: number;
    };
    clearCache(): void;
}
export declare const eventValidator: EventValidator;
//# sourceMappingURL=validator.d.ts.map
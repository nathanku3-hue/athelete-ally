import { NodeSDK } from '@opentelemetry/sdk-node';
declare const tracer: import("@opentelemetry/api").Tracer;
declare const meter: import("@opentelemetry/api").Meter;
export declare const businessMetrics: {
    planGenerationRequests: import("@opentelemetry/api").Counter<import("@opentelemetry/api").Attributes>;
    planGenerationDuration: import("@opentelemetry/api").Histogram<import("@opentelemetry/api").Attributes>;
    planGenerationSuccess: import("@opentelemetry/api").Counter<import("@opentelemetry/api").Attributes>;
    planGenerationFailures: import("@opentelemetry/api").Counter<import("@opentelemetry/api").Attributes>;
    llmRequests: import("@opentelemetry/api").Counter<import("@opentelemetry/api").Attributes>;
    llmResponseTime: import("@opentelemetry/api").Histogram<import("@opentelemetry/api").Attributes>;
    llmTokensUsed: import("@opentelemetry/api").Counter<import("@opentelemetry/api").Attributes>;
    databaseQueries: import("@opentelemetry/api").Counter<import("@opentelemetry/api").Attributes>;
    databaseQueryDuration: import("@opentelemetry/api").Histogram<import("@opentelemetry/api").Attributes>;
};
export declare const createBusinessSpan: (name: string, attributes?: Record<string, any>) => import("@opentelemetry/api").Span;
export declare const tracePlanGeneration: (userId: string, planData: any) => import("@opentelemetry/api").Span;
export declare const traceLLMCall: (model: string, promptLength: number, userId: string) => import("@opentelemetry/api").Span;
export declare const traceDatabaseOperation: (operation: string, table: string, userId?: string) => import("@opentelemetry/api").Span;
declare const sdk: NodeSDK;
export { sdk, tracer, meter };
//# sourceMappingURL=telemetry.d.ts.map
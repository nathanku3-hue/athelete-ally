import { NodeSDK } from '@opentelemetry/sdk-node';
declare const tracer: import("@opentelemetry/api").Tracer;
declare const meter: import("@opentelemetry/api").Meter;
export declare const businessMetrics: {
    onboardingRequests: import("@opentelemetry/api").Counter<import("@opentelemetry/api").Attributes>;
    onboardingCompletions: import("@opentelemetry/api").Counter<import("@opentelemetry/api").Attributes>;
    onboardingStepDuration: import("@opentelemetry/api").Histogram<import("@opentelemetry/api").Attributes>;
    planGenerationRequests: import("@opentelemetry/api").Counter<import("@opentelemetry/api").Attributes>;
    planGenerationDuration: import("@opentelemetry/api").Histogram<import("@opentelemetry/api").Attributes>;
    planGenerationSuccess: import("@opentelemetry/api").Counter<import("@opentelemetry/api").Attributes>;
    planGenerationFailures: import("@opentelemetry/api").Counter<import("@opentelemetry/api").Attributes>;
    apiRequests: import("@opentelemetry/api").Counter<import("@opentelemetry/api").Attributes>;
    apiResponseTime: import("@opentelemetry/api").Histogram<import("@opentelemetry/api").Attributes>;
    apiErrors: import("@opentelemetry/api").Counter<import("@opentelemetry/api").Attributes>;
};
export declare const createBusinessSpan: (name: string, attributes?: Record<string, any>) => import("@opentelemetry/api").Span;
export declare const traceOnboardingStep: (stepName: string, userId: string, stepData: any) => import("@opentelemetry/api").Span;
export declare const tracePlanGeneration: (userId: string, planData: any) => import("@opentelemetry/api").Span;
export declare const traceApiRequest: (method: string, path: string, userId?: string) => import("@opentelemetry/api").Span;
declare const sdk: NodeSDK;
export { sdk, tracer, meter };
//# sourceMappingURL=telemetry.d.ts.map
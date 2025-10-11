export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
export interface HealthResponse {
    ok: boolean;
    status: HealthStatus;
    sha: string;
    buildId: string;
    service: string;
    uptimeSec: number;
    timestamp: string;
    version?: string;
    environment?: string;
}
export interface HealthCheckOptions {
    serviceName: string;
    version?: string;
    environment?: string;
    buildInfoPath?: string;
}
export declare function createHealthResponse(options: HealthCheckOptions): HealthResponse;
export declare function createDegradedHealthResponse(options: HealthCheckOptions, reason?: string): HealthResponse & {
    reason?: string;
};
export declare function createUnhealthyHealthResponse(options: HealthCheckOptions, reason?: string): HealthResponse & {
    reason?: string;
};
export declare function createExpressHealthHandler(options: HealthCheckOptions): (_req: unknown, res: {
    status: (code: number) => {
        json: (data: HealthResponse) => void;
    };
}) => void;
export declare function createFastifyHealthHandler(options: HealthCheckOptions): (_request: unknown, reply: {
    status: (code: number) => {
        send: (data: HealthResponse) => void;
    };
}) => Promise<void>;
export declare function createNextHealthHandler(options: HealthCheckOptions): () => Promise<Response>;
export declare function validateHealthResponse(response: unknown): response is HealthResponse;
declare const healthSchema: {
    createHealthResponse: typeof createHealthResponse;
    createDegradedHealthResponse: typeof createDegradedHealthResponse;
    createUnhealthyHealthResponse: typeof createUnhealthyHealthResponse;
    createExpressHealthHandler: typeof createExpressHealthHandler;
    createFastifyHealthHandler: typeof createFastifyHealthHandler;
    createNextHealthHandler: typeof createNextHealthHandler;
    validateHealthResponse: typeof validateHealthResponse;
};
export default healthSchema;
//# sourceMappingURL=index.d.ts.map
export declare const config: {
    NATS_URL: string;
    ENABLE_SCHEMA_VALIDATION: boolean;
    SCHEMA_CACHE_SIZE: number;
    SCHEMA_CACHE_TTL_MS: number;
    MAX_RETRY_ATTEMPTS: number;
    RETRY_DELAY_MS: number;
};
export declare const STREAMS: {
    readonly CORE: "AA_CORE_HOT";
    readonly VENDOR: "AA_VENDOR_HOT";
    readonly DLQ: "AA_DLQ";
    readonly LEGACY: "ATHLETE_ALLY_EVENTS";
};
export type StreamMode = 'single' | 'multi';
export declare const getStreamMode: () => StreamMode;
export declare const getStreamCandidates: () => string[];
export declare const getStreamName: (type: keyof typeof STREAMS) => string;
export type AppStreamConfig = {
    name: string;
    subjects: string[];
    maxAgeMs: number;
    replicas: number;
    storage?: "file" | "memory";
    discard?: "old" | "new";
    duplicateWindowMs?: number;
    compression?: boolean;
};
export declare const nanos: (ms: number) => number;
export declare const getStreamConfigs: () => AppStreamConfig[];
//# sourceMappingURL=config.d.ts.map
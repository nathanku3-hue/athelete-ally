import { z } from 'zod';

const EventBusConfigSchema = z.object({
  NATS_URL: z.string().url().default('nats://localhost:4223'),
  ENABLE_SCHEMA_VALIDATION: z.string().transform((v) => v === 'true').default('true'),
  SCHEMA_CACHE_SIZE: z.string().transform((v) => Number(v)).default('1000'),
  SCHEMA_CACHE_TTL_MS: z.string().transform((v) => Number(v)).default('300000'), // 5 minutes
  MAX_RETRY_ATTEMPTS: z.string().transform((v) => Number(v)).default('3'),
  RETRY_DELAY_MS: z.string().transform((v) => Number(v)).default('1000'),
});

export const config = (() => {
  const parsed = EventBusConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables for event-bus', parsed.error.flatten());
    process.exit(1);
  }
  return parsed.data;
})();

// Multi-stream topology constants
export const STREAMS = {
  CORE: "AA_CORE_HOT",
  VENDOR: "AA_VENDOR_HOT",
  DLQ: "AA_DLQ",
  LEGACY: "ATHLETE_ALLY_EVENTS",  // Backward compatibility
} as const;

export type StreamMode = 'single' | 'multi';

// Environment-based configuration
export const getStreamMode = (): StreamMode => {
  return (process.env.EVENT_STREAM_MODE as StreamMode) || 'multi';
};

export const getStreamName = (type: keyof typeof STREAMS): string => {
  const envMap = {
    CORE: process.env.STREAM_CORE_NAME,
    VENDOR: process.env.STREAM_VENDOR_NAME,
    DLQ: process.env.STREAM_DLQ_NAME,
    LEGACY: process.env.STREAM_LEGACY_NAME,
  };
  return envMap[type] || STREAMS[type];
};

// Stream configuration schema
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

// Helper to convert ms to nanoseconds
export const nanos = (ms: number) => ms * 1_000_000;

// Environment-aware stream configs
export const getStreamConfigs = (): AppStreamConfig[] => {
  const mode = getStreamMode();
  const isProd = process.env.NODE_ENV === "production";
  const replicas = isProd ? 3 : 1;

  if (mode === 'single') {
    // Legacy single-stream topology
    return [
      {
        name: getStreamName('LEGACY'),
        subjects: ["athlete-ally.>", "vendor.>", "sleep.*"],
        maxAgeMs: 24 * 60 * 60 * 1000,  // 24h
        replicas,
        storage: "file",
        discard: "old",
        duplicateWindowMs: 2 * 60 * 1000,
        compression: true,
      }
    ];
  }

  // Multi-stream topology (default)
  return [
    {
      name: getStreamName('CORE'),
      subjects: ["athlete-ally.>", "sleep.*"],
      maxAgeMs: 48 * 60 * 60 * 1000,  // 48h
      replicas,
      storage: "file",
      discard: "old",
      duplicateWindowMs: 2 * 60 * 1000,
      compression: true,
    },
    {
      name: getStreamName('VENDOR'),
      subjects: ["vendor.>"],
      maxAgeMs: 48 * 60 * 60 * 1000,  // 48h
      replicas,
      storage: "file",
      discard: "old",
      duplicateWindowMs: 2 * 60 * 1000,
      compression: true,
    },
    {
      name: getStreamName('DLQ'),
      subjects: ["dlq.>"],
      maxAgeMs: 14 * 24 * 60 * 60 * 1000,  // 14d
      replicas,
      storage: "file",
      discard: "old",
      duplicateWindowMs: 2 * 60 * 1000,
      compression: true,
    },
  ];
};

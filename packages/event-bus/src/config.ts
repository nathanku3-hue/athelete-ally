import { z } from 'zod';

const EventBusConfigSchema = z.object({
  NATS_URL: z.string().url().default('nats://localhost:4222'),
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

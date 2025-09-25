import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().transform((v) => Number(v)).default('4101'),
  PROFILE_DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
});

export const config = (() => {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('Invalid environment variables for profile-onboarding', parsed.error.flatten());
    process.exit(1);
  }
  return parsed.data;
})();



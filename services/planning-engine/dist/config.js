import { z } from 'zod';
const EnvSchema = z.object({
    NODE_ENV: z.string().default('development'),
    PORT: z.string().transform((v) => Number(v)).default('4102'),
    PLANNING_DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    OPENAI_API_KEY: z.string().optional(),
});
export const config = (() => {
    const parsed = EnvSchema.safeParse(process.env);
    if (!parsed.success) {
        // eslint-disable-next-line no-console
        console.error('Invalid environment variables for planning-engine', parsed.error.flatten());
        process.exit(1);
    }
    return parsed.data;
})();
//# sourceMappingURL=config.js.map
import './telemetry.js';
import 'dotenv/config';
import { z } from 'zod';
export declare const PlanGenerateRequest: z.ZodObject<{
    userId: z.ZodString;
    seedPlanId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    seedPlanId?: string | undefined;
}, {
    userId: string;
    seedPlanId?: string | undefined;
}>;
export type PlanGenerateRequest = z.infer<typeof PlanGenerateRequest>;
//# sourceMappingURL=server.d.ts.map
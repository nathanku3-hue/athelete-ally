import { z } from 'zod';
declare const PlanSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    duration: z.ZodNumber;
    microcycles: z.ZodArray<z.ZodObject<{
        weekNumber: z.ZodNumber;
        name: z.ZodString;
        phase: z.ZodEnum<["preparation", "competition", "recovery", "transition"]>;
        sessions: z.ZodArray<z.ZodObject<{
            dayOfWeek: z.ZodNumber;
            name: z.ZodString;
            duration: z.ZodNumber;
            exercises: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                category: z.ZodEnum<["strength", "cardio", "flexibility", "power", "endurance", "mobility"]>;
                sets: z.ZodNumber;
                reps: z.ZodString;
                weight: z.ZodString;
                notes: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                category: "strength" | "cardio" | "flexibility" | "power" | "endurance" | "mobility";
                sets: number;
                reps: string;
                weight: string;
                notes?: string | undefined;
            }, {
                name: string;
                category: "strength" | "cardio" | "flexibility" | "power" | "endurance" | "mobility";
                sets: number;
                reps: string;
                weight: string;
                notes?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            name: string;
            dayOfWeek: number;
            duration: number;
            exercises: {
                name: string;
                category: "strength" | "cardio" | "flexibility" | "power" | "endurance" | "mobility";
                sets: number;
                reps: string;
                weight: string;
                notes?: string | undefined;
            }[];
        }, {
            name: string;
            dayOfWeek: number;
            duration: number;
            exercises: {
                name: string;
                category: "strength" | "cardio" | "flexibility" | "power" | "endurance" | "mobility";
                sets: number;
                reps: string;
                weight: string;
                notes?: string | undefined;
            }[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        weekNumber: number;
        phase: "preparation" | "competition" | "recovery" | "transition";
        sessions: {
            name: string;
            dayOfWeek: number;
            duration: number;
            exercises: {
                name: string;
                category: "strength" | "cardio" | "flexibility" | "power" | "endurance" | "mobility";
                sets: number;
                reps: string;
                weight: string;
                notes?: string | undefined;
            }[];
        }[];
    }, {
        name: string;
        weekNumber: number;
        phase: "preparation" | "competition" | "recovery" | "transition";
        sessions: {
            name: string;
            dayOfWeek: number;
            duration: number;
            exercises: {
                name: string;
                category: "strength" | "cardio" | "flexibility" | "power" | "endurance" | "mobility";
                sets: number;
                reps: string;
                weight: string;
                notes?: string | undefined;
            }[];
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    duration: number;
    description: string;
    microcycles: {
        name: string;
        weekNumber: number;
        phase: "preparation" | "competition" | "recovery" | "transition";
        sessions: {
            name: string;
            dayOfWeek: number;
            duration: number;
            exercises: {
                name: string;
                category: "strength" | "cardio" | "flexibility" | "power" | "endurance" | "mobility";
                sets: number;
                reps: string;
                weight: string;
                notes?: string | undefined;
            }[];
        }[];
    }[];
}, {
    name: string;
    duration: number;
    description: string;
    microcycles: {
        name: string;
        weekNumber: number;
        phase: "preparation" | "competition" | "recovery" | "transition";
        sessions: {
            name: string;
            dayOfWeek: number;
            duration: number;
            exercises: {
                name: string;
                category: "strength" | "cardio" | "flexibility" | "power" | "endurance" | "mobility";
                sets: number;
                reps: string;
                weight: string;
                notes?: string | undefined;
            }[];
        }[];
    }[];
}>;
export type TrainingPlan = z.infer<typeof PlanSchema>;
export interface PlanGenerationRequest {
    userId: string;
    proficiency: string;
    season: string;
    availabilityDays: number;
    weeklyGoalDays?: number;
    equipment: string[];
    purpose?: string;
    competitionDate?: string;
    recoveryHabits?: string[];
    fixedSchedules?: Array<{
        day: string;
        start: string;
        end: string;
    }>;
}
export declare function generateTrainingPlan(request: PlanGenerationRequest): Promise<TrainingPlan>;
export {};
//# sourceMappingURL=llm.d.ts.map
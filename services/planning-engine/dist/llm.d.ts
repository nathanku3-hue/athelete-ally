export interface PlanGenerationRequest {
    userId: string;
    proficiency: string;
    season: string;
    availabilityDays: number;
    weeklyGoalDays?: number;
    equipment: string[];
    fixedSchedules?: Array<{
        day: string;
        start: string;
        end: string;
    }>;
}
export declare function generateTrainingPlan(request: PlanGenerationRequest): Promise<any>;
//# sourceMappingURL=llm.d.ts.map
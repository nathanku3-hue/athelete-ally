export declare const OnboardingCompletedSchema: {
    readonly type: "object";
    readonly required: readonly ["eventId", "userId", "timestamp", "equipment"];
    readonly properties: {
        readonly eventId: {
            readonly type: "string";
        };
        readonly userId: {
            readonly type: "string";
        };
        readonly timestamp: {
            readonly type: "number";
        };
        readonly purpose: {
            readonly type: "string";
            readonly enum: readonly ["general_fitness", "sport_performance", "muscle_building", "weight_loss", "rehabilitation"];
        };
        readonly purposeDetails: {
            readonly type: "string";
        };
        readonly proficiency: {
            readonly type: "string";
            readonly enum: readonly ["beginner", "intermediate", "advanced"];
        };
        readonly season: {
            readonly type: "string";
            readonly enum: readonly ["offseason", "preseason", "inseason"];
        };
        readonly competitionDate: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly availabilityDays: {
            readonly type: "number";
            readonly minimum: 1;
            readonly maximum: 7;
        };
        readonly weeklyGoalDays: {
            readonly type: "number";
            readonly minimum: 1;
            readonly maximum: 7;
        };
        readonly equipment: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly fixedSchedules: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly day: {
                        readonly type: "string";
                    };
                    readonly start: {
                        readonly type: "string";
                    };
                    readonly end: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly recoveryHabits: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly onboardingStep: {
            readonly type: "number";
            readonly minimum: 1;
            readonly maximum: 6;
        };
        readonly isOnboardingComplete: {
            readonly type: "boolean";
        };
    };
};
export declare const PlanGenerationRequestedSchema: {
    readonly type: "object";
    readonly required: readonly ["eventId", "userId", "timestamp", "jobId", "proficiency", "season", "availabilityDays", "weeklyGoalDays", "equipment"];
    readonly properties: {
        readonly eventId: {
            readonly type: "string";
        };
        readonly userId: {
            readonly type: "string";
        };
        readonly timestamp: {
            readonly type: "number";
        };
        readonly jobId: {
            readonly type: "string";
        };
        readonly proficiency: {
            readonly type: "string";
            readonly enum: readonly ["beginner", "intermediate", "advanced"];
        };
        readonly season: {
            readonly type: "string";
            readonly enum: readonly ["offseason", "preseason", "inseason"];
        };
        readonly availabilityDays: {
            readonly type: "number";
            readonly minimum: 1;
            readonly maximum: 7;
        };
        readonly weeklyGoalDays: {
            readonly type: "number";
            readonly minimum: 1;
            readonly maximum: 7;
        };
        readonly equipment: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly purpose: {
            readonly type: "string";
            readonly enum: readonly ["general_fitness", "sport_performance", "muscle_building", "weight_loss", "rehabilitation"];
        };
        readonly competitionDate: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly fixedSchedules: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly day: {
                        readonly type: "string";
                    };
                    readonly start: {
                        readonly type: "string";
                    };
                    readonly end: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly recoveryHabits: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
};
export declare const PlanGeneratedSchema: {
    readonly type: "object";
    readonly required: readonly ["eventId", "userId", "planId", "timestamp", "planName", "status", "version"];
    readonly properties: {
        readonly eventId: {
            readonly type: "string";
        };
        readonly userId: {
            readonly type: "string";
        };
        readonly planId: {
            readonly type: "string";
        };
        readonly timestamp: {
            readonly type: "number";
        };
        readonly planName: {
            readonly type: "string";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["generating", "completed", "failed"];
        };
        readonly version: {
            readonly type: "number";
            readonly minimum: 1;
        };
    };
};
export declare const PlanGenerationFailedSchema: {
    readonly type: "object";
    readonly required: readonly ["eventId", "userId", "jobId", "timestamp", "error", "retryCount"];
    readonly properties: {
        readonly eventId: {
            readonly type: "string";
        };
        readonly userId: {
            readonly type: "string";
        };
        readonly jobId: {
            readonly type: "string";
        };
        readonly timestamp: {
            readonly type: "number";
        };
        readonly error: {
            readonly type: "string";
        };
        readonly retryCount: {
            readonly type: "number";
            readonly minimum: 0;
        };
    };
};
export declare const HRVRawReceivedSchema: {
    readonly type: "object";
    readonly required: readonly ["payload"];
    readonly properties: {
        readonly payload: {
            readonly type: "object";
            readonly required: readonly ["userId", "date", "rMSSD", "capturedAt"];
            readonly properties: {
                readonly userId: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly date: {
                    readonly type: "string";
                    readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
                };
                readonly rMSSD: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly capturedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly raw: {
                    readonly type: "object";
                };
            };
        };
    };
};
export declare const HRVNormalizedStoredSchema: {
    readonly type: "object";
    readonly required: readonly ["record"];
    readonly properties: {
        readonly record: {
            readonly type: "object";
            readonly required: readonly ["userId", "date", "rMSSD", "lnRMSSD", "readinessScore", "vendor", "capturedAt"];
            readonly properties: {
                readonly userId: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly date: {
                    readonly type: "string";
                    readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
                };
                readonly rMSSD: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly lnRMSSD: {
                    readonly type: "number";
                };
                readonly readinessScore: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly maximum: 100;
                };
                readonly vendor: {
                    readonly type: "string";
                    readonly enum: readonly ["oura", "whoop", "unknown"];
                };
                readonly capturedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
            };
        };
    };
};
export declare const SleepRawReceivedSchema: {
    readonly type: "object";
    readonly required: readonly ["payload"];
    readonly properties: {
        readonly payload: {
            readonly type: "object";
            readonly required: readonly ["userId", "date", "durationMinutes"];
            readonly properties: {
                readonly userId: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly date: {
                    readonly type: "string";
                    readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
                };
                readonly durationMinutes: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly capturedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly raw: {
                    readonly type: "object";
                };
            };
        };
    };
};
export declare const SleepNormalizedStoredSchema: {
    readonly type: "object";
    readonly required: readonly ["record"];
    readonly properties: {
        readonly record: {
            readonly type: "object";
            readonly required: readonly ["userId", "date", "durationMinutes", "vendor", "capturedAt"];
            readonly properties: {
                readonly userId: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly date: {
                    readonly type: "string";
                    readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
                };
                readonly durationMinutes: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly qualityScore: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly maximum: 100;
                };
                readonly vendor: {
                    readonly type: "string";
                    readonly enum: readonly ["oura", "whoop", "unknown"];
                };
                readonly capturedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
            };
        };
    };
};
export declare const ReadinessComputedSchema: {
    readonly type: "object";
    readonly required: readonly ["payload"];
    readonly properties: {
        readonly payload: {
            readonly type: "object";
            readonly required: readonly ["userId", "date", "score"];
            readonly properties: {
                readonly userId: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly date: {
                    readonly type: "string";
                    readonly pattern: "^[0-9]{8}$";
                };
                readonly score: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly maximum: 100;
                };
                readonly incomplete: {
                    readonly type: "boolean";
                };
                readonly components: {
                    readonly type: "object";
                    readonly properties: {
                        readonly hrvScore: {
                            readonly type: "number";
                            readonly minimum: 0;
                            readonly maximum: 100;
                        };
                        readonly sleepScore: {
                            readonly type: "number";
                            readonly minimum: 0;
                            readonly maximum: 100;
                        };
                        readonly notes: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
    };
};
export declare const ReadinessStoredSchema: {
    readonly type: "object";
    readonly required: readonly ["record"];
    readonly properties: {
        readonly record: {
            readonly type: "object";
            readonly required: readonly ["userId", "date", "score"];
            readonly properties: {
                readonly userId: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly date: {
                    readonly type: "string";
                    readonly pattern: "^[0-9]{8}$";
                };
                readonly score: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly maximum: 100;
                };
                readonly incomplete: {
                    readonly type: "boolean";
                };
                readonly components: {
                    readonly type: "object";
                    readonly properties: {
                        readonly hrvScore: {
                            readonly type: "number";
                            readonly minimum: 0;
                            readonly maximum: 100;
                        };
                        readonly sleepScore: {
                            readonly type: "number";
                            readonly minimum: 0;
                            readonly maximum: 100;
                        };
                        readonly notes: {
                            readonly type: "string";
                        };
                    };
                };
                readonly capturedAt: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
            };
        };
    };
};
export declare const EventSchemas: {
    readonly onboarding_completed: {
        readonly type: "object";
        readonly required: readonly ["eventId", "userId", "timestamp", "equipment"];
        readonly properties: {
            readonly eventId: {
                readonly type: "string";
            };
            readonly userId: {
                readonly type: "string";
            };
            readonly timestamp: {
                readonly type: "number";
            };
            readonly purpose: {
                readonly type: "string";
                readonly enum: readonly ["general_fitness", "sport_performance", "muscle_building", "weight_loss", "rehabilitation"];
            };
            readonly purposeDetails: {
                readonly type: "string";
            };
            readonly proficiency: {
                readonly type: "string";
                readonly enum: readonly ["beginner", "intermediate", "advanced"];
            };
            readonly season: {
                readonly type: "string";
                readonly enum: readonly ["offseason", "preseason", "inseason"];
            };
            readonly competitionDate: {
                readonly type: "string";
                readonly format: "date-time";
            };
            readonly availabilityDays: {
                readonly type: "number";
                readonly minimum: 1;
                readonly maximum: 7;
            };
            readonly weeklyGoalDays: {
                readonly type: "number";
                readonly minimum: 1;
                readonly maximum: 7;
            };
            readonly equipment: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly fixedSchedules: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly day: {
                            readonly type: "string";
                        };
                        readonly start: {
                            readonly type: "string";
                        };
                        readonly end: {
                            readonly type: "string";
                        };
                    };
                };
            };
            readonly recoveryHabits: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly onboardingStep: {
                readonly type: "number";
                readonly minimum: 1;
                readonly maximum: 6;
            };
            readonly isOnboardingComplete: {
                readonly type: "boolean";
            };
        };
    };
    readonly plan_generation_requested: {
        readonly type: "object";
        readonly required: readonly ["eventId", "userId", "timestamp", "jobId", "proficiency", "season", "availabilityDays", "weeklyGoalDays", "equipment"];
        readonly properties: {
            readonly eventId: {
                readonly type: "string";
            };
            readonly userId: {
                readonly type: "string";
            };
            readonly timestamp: {
                readonly type: "number";
            };
            readonly jobId: {
                readonly type: "string";
            };
            readonly proficiency: {
                readonly type: "string";
                readonly enum: readonly ["beginner", "intermediate", "advanced"];
            };
            readonly season: {
                readonly type: "string";
                readonly enum: readonly ["offseason", "preseason", "inseason"];
            };
            readonly availabilityDays: {
                readonly type: "number";
                readonly minimum: 1;
                readonly maximum: 7;
            };
            readonly weeklyGoalDays: {
                readonly type: "number";
                readonly minimum: 1;
                readonly maximum: 7;
            };
            readonly equipment: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly purpose: {
                readonly type: "string";
                readonly enum: readonly ["general_fitness", "sport_performance", "muscle_building", "weight_loss", "rehabilitation"];
            };
            readonly competitionDate: {
                readonly type: "string";
                readonly format: "date-time";
            };
            readonly fixedSchedules: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly day: {
                            readonly type: "string";
                        };
                        readonly start: {
                            readonly type: "string";
                        };
                        readonly end: {
                            readonly type: "string";
                        };
                    };
                };
            };
            readonly recoveryHabits: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
        };
    };
    readonly plan_generated: {
        readonly type: "object";
        readonly required: readonly ["eventId", "userId", "planId", "timestamp", "planName", "status", "version"];
        readonly properties: {
            readonly eventId: {
                readonly type: "string";
            };
            readonly userId: {
                readonly type: "string";
            };
            readonly planId: {
                readonly type: "string";
            };
            readonly timestamp: {
                readonly type: "number";
            };
            readonly planName: {
                readonly type: "string";
            };
            readonly status: {
                readonly type: "string";
                readonly enum: readonly ["generating", "completed", "failed"];
            };
            readonly version: {
                readonly type: "number";
                readonly minimum: 1;
            };
        };
    };
    readonly plan_generation_failed: {
        readonly type: "object";
        readonly required: readonly ["eventId", "userId", "jobId", "timestamp", "error", "retryCount"];
        readonly properties: {
            readonly eventId: {
                readonly type: "string";
            };
            readonly userId: {
                readonly type: "string";
            };
            readonly jobId: {
                readonly type: "string";
            };
            readonly timestamp: {
                readonly type: "number";
            };
            readonly error: {
                readonly type: "string";
            };
            readonly retryCount: {
                readonly type: "number";
                readonly minimum: 0;
            };
        };
    };
    readonly hrv_raw_received: {
        readonly type: "object";
        readonly required: readonly ["payload"];
        readonly properties: {
            readonly payload: {
                readonly type: "object";
                readonly required: readonly ["userId", "date", "rMSSD", "capturedAt"];
                readonly properties: {
                    readonly userId: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly date: {
                        readonly type: "string";
                        readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
                    };
                    readonly rMSSD: {
                        readonly type: "number";
                        readonly minimum: 0;
                    };
                    readonly capturedAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                    };
                    readonly raw: {
                        readonly type: "object";
                    };
                };
            };
        };
    };
    readonly hrv_normalized_stored: {
        readonly type: "object";
        readonly required: readonly ["record"];
        readonly properties: {
            readonly record: {
                readonly type: "object";
                readonly required: readonly ["userId", "date", "rMSSD", "lnRMSSD", "readinessScore", "vendor", "capturedAt"];
                readonly properties: {
                    readonly userId: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly date: {
                        readonly type: "string";
                        readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
                    };
                    readonly rMSSD: {
                        readonly type: "number";
                        readonly minimum: 0;
                    };
                    readonly lnRMSSD: {
                        readonly type: "number";
                    };
                    readonly readinessScore: {
                        readonly type: "number";
                        readonly minimum: 0;
                        readonly maximum: 100;
                    };
                    readonly vendor: {
                        readonly type: "string";
                        readonly enum: readonly ["oura", "whoop", "unknown"];
                    };
                    readonly capturedAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                    };
                };
            };
        };
    };
    readonly sleep_raw_received: {
        readonly type: "object";
        readonly required: readonly ["payload"];
        readonly properties: {
            readonly payload: {
                readonly type: "object";
                readonly required: readonly ["userId", "date", "durationMinutes"];
                readonly properties: {
                    readonly userId: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly date: {
                        readonly type: "string";
                        readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
                    };
                    readonly durationMinutes: {
                        readonly type: "number";
                        readonly minimum: 0;
                    };
                    readonly capturedAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                    };
                    readonly raw: {
                        readonly type: "object";
                    };
                };
            };
        };
    };
    readonly sleep_normalized_stored: {
        readonly type: "object";
        readonly required: readonly ["record"];
        readonly properties: {
            readonly record: {
                readonly type: "object";
                readonly required: readonly ["userId", "date", "durationMinutes", "vendor", "capturedAt"];
                readonly properties: {
                    readonly userId: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly date: {
                        readonly type: "string";
                        readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
                    };
                    readonly durationMinutes: {
                        readonly type: "number";
                        readonly minimum: 0;
                    };
                    readonly qualityScore: {
                        readonly type: "number";
                        readonly minimum: 0;
                        readonly maximum: 100;
                    };
                    readonly vendor: {
                        readonly type: "string";
                        readonly enum: readonly ["oura", "whoop", "unknown"];
                    };
                    readonly capturedAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                    };
                };
            };
        };
    };
    readonly readiness_computed: {
        readonly type: "object";
        readonly required: readonly ["payload"];
        readonly properties: {
            readonly payload: {
                readonly type: "object";
                readonly required: readonly ["userId", "date", "score"];
                readonly properties: {
                    readonly userId: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly date: {
                        readonly type: "string";
                        readonly pattern: "^[0-9]{8}$";
                    };
                    readonly score: {
                        readonly type: "number";
                        readonly minimum: 0;
                        readonly maximum: 100;
                    };
                    readonly incomplete: {
                        readonly type: "boolean";
                    };
                    readonly components: {
                        readonly type: "object";
                        readonly properties: {
                            readonly hrvScore: {
                                readonly type: "number";
                                readonly minimum: 0;
                                readonly maximum: 100;
                            };
                            readonly sleepScore: {
                                readonly type: "number";
                                readonly minimum: 0;
                                readonly maximum: 100;
                            };
                            readonly notes: {
                                readonly type: "string";
                            };
                        };
                    };
                };
            };
        };
    };
    readonly readiness_stored: {
        readonly type: "object";
        readonly required: readonly ["record"];
        readonly properties: {
            readonly record: {
                readonly type: "object";
                readonly required: readonly ["userId", "date", "score"];
                readonly properties: {
                    readonly userId: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly date: {
                        readonly type: "string";
                        readonly pattern: "^[0-9]{8}$";
                    };
                    readonly score: {
                        readonly type: "number";
                        readonly minimum: 0;
                        readonly maximum: 100;
                    };
                    readonly incomplete: {
                        readonly type: "boolean";
                    };
                    readonly components: {
                        readonly type: "object";
                        readonly properties: {
                            readonly hrvScore: {
                                readonly type: "number";
                                readonly minimum: 0;
                                readonly maximum: 100;
                            };
                            readonly sleepScore: {
                                readonly type: "number";
                                readonly minimum: 0;
                                readonly maximum: 100;
                            };
                            readonly notes: {
                                readonly type: "string";
                            };
                        };
                    };
                    readonly capturedAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                    };
                };
            };
        };
    };
};
export type EventSchemaKey = keyof typeof EventSchemas;
//# sourceMappingURL=schemas.d.ts.map
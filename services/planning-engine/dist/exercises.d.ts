export interface Exercise {
    id: string;
    name: string;
    category: 'strength' | 'conditioning' | 'mobility' | 'cardio';
    equipment: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    muscleGroups: string[];
    description: string;
}
export declare const EXERCISE_LIBRARY: Exercise[];
export declare function getExercisesByCategory(category: string): Exercise[];
export declare function getExercisesByEquipment(availableEquipment: string[]): Exercise[];
export declare function getExercisesByDifficulty(difficulty: string): Exercise[];
export declare function getRecommendedExercises(proficiency: string, equipment: string[], category?: string): Exercise[];
export declare function getExerciseSubstitutes(exerciseId: string, availableEquipment: string[]): Exercise[];
//# sourceMappingURL=exercises.d.ts.map
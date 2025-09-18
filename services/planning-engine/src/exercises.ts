export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'conditioning' | 'mobility' | 'cardio';
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  muscleGroups: string[];
  description: string;
}

export const EXERCISE_LIBRARY: Exercise[] = [
  // Strength exercises
  {
    id: 'push-ups',
    name: 'Push-ups',
    category: 'strength',
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    description: 'Classic upper body strength exercise'
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    category: 'strength',
    equipment: ['pull-up-bar'],
    difficulty: 'intermediate',
    muscleGroups: ['back', 'biceps'],
    description: 'Upper body pulling exercise'
  },
  {
    id: 'squats',
    name: 'Squats',
    category: 'strength',
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    description: 'Fundamental lower body exercise'
  },
  {
    id: 'deadlifts',
    name: 'Deadlifts',
    category: 'strength',
    equipment: ['barbell', 'dumbbells'],
    difficulty: 'advanced',
    muscleGroups: ['hamstrings', 'glutes', 'back'],
    description: 'Hip hinge movement pattern'
  },
  // Conditioning exercises
  {
    id: 'burpees',
    name: 'Burpees',
    category: 'conditioning',
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    muscleGroups: ['full-body'],
    description: 'High-intensity full-body exercise'
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    category: 'conditioning',
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    muscleGroups: ['core', 'shoulders', 'legs'],
    description: 'Dynamic core and cardio exercise'
  },
  // Mobility exercises
  {
    id: 'hip-flexor-stretch',
    name: 'Hip Flexor Stretch',
    category: 'mobility',
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    muscleGroups: ['hip-flexors'],
    description: 'Improve hip mobility and flexibility'
  },
  {
    id: 'shoulder-dislocates',
    name: 'Shoulder Dislocates',
    category: 'mobility',
    equipment: ['resistance-band', 'broomstick'],
    difficulty: 'beginner',
    muscleGroups: ['shoulders'],
    description: 'Improve shoulder mobility'
  }
];

export function getExercisesByCategory(category: string): Exercise[] {
  return EXERCISE_LIBRARY.filter(ex => ex.category === category);
}

export function getExercisesByEquipment(availableEquipment: string[]): Exercise[] {
  return EXERCISE_LIBRARY.filter(ex => 
    ex.equipment.some(eq => availableEquipment.includes(eq))
  );
}

export function getExercisesByDifficulty(difficulty: string): Exercise[] {
  return EXERCISE_LIBRARY.filter(ex => ex.difficulty === difficulty);
}

export function getRecommendedExercises(
  proficiency: string,
  equipment: string[],
  category?: string
): Exercise[] {
  let exercises = getExercisesByEquipment(equipment);
  
  if (category) {
    exercises = exercises.filter(ex => ex.category === category);
  }
  
  // Filter by proficiency level
  const difficultyMap = {
    'beginner': ['beginner'],
    'intermediate': ['beginner', 'intermediate'],
    'advanced': ['beginner', 'intermediate', 'advanced']
  };
  
  const allowedDifficulties = difficultyMap[proficiency as keyof typeof difficultyMap] || ['beginner'];
  exercises = exercises.filter(ex => allowedDifficulties.includes(ex.difficulty));
  
  return exercises;
}

export function getExerciseSubstitutes(exerciseId: string, availableEquipment: string[]): Exercise[] {
  const original = EXERCISE_LIBRARY.find(ex => ex.id === exerciseId);
  if (!original) return [];
  
  return EXERCISE_LIBRARY.filter(ex => 
    ex.id !== exerciseId &&
    ex.category === original.category &&
    ex.muscleGroups.some(mg => original.muscleGroups.includes(mg)) &&
    ex.equipment.some(eq => availableEquipment.includes(eq))
  );
}







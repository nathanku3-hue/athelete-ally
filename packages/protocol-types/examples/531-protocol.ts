// Example: 5/3/1 Protocol Implementation
// This demonstrates how to use the Protocol and Block types

import { 
  Protocol, 
  Block, 
  BlockSession, 
  ExerciseConfiguration,
  BlockParameters,
  BlockRules,
  ProtocolCategory,
  DifficultyLevel,
  BlockPhase,
  IntensityLevel,
  VolumeLevel
} from '../src/index';

// ===========================================
// 5/3/1 PROTOCOL DEFINITION
// ===========================================

export const protocol531: Protocol = {
  id: 'protocol-531',
  name: '5/3/1',
  version: '2.0.0',
  description: 'Jim Wendler\'s 5/3/1 strength training program',
  category: 'strength' as ProtocolCategory,
  difficulty: 'intermediate' as DifficultyLevel,
  duration: 12, // 3 cycles of 4 weeks each
  frequency: 4, // 4 sessions per week
  
  isActive: true,
  isPublic: true,
  createdBy: 'system',
  createdAt: new Date(),
  updatedAt: new Date(),
  
  overview: 'A simple, effective strength training program based on submaximal training with the main lifts: squat, bench press, deadlift, and overhead press.',
  principles: [
    'Start too light',
    'Progress slowly',
    'Focus on the main lifts',
    'Use submaximal training',
    'Emphasize technique over weight'
  ],
  requirements: [
    'Access to barbell and plates',
    'Squat rack or power rack',
    'Bench press setup',
    '4 training days per week',
    'Basic knowledge of main lifts'
  ],
  
  blocks: [] // Will be populated below
};

// ===========================================
// 5/3/1 BLOCKS
// ===========================================

// Base Building Block (Weeks 1-4)
export const baseBuildingBlock: Block = {
  id: 'block-531-base',
  protocolId: 'protocol-531',
  name: 'Base Building',
  description: 'Foundation phase focusing on technique and base strength',
  order: 1,
  duration: 4,
  phase: 'base' as BlockPhase,
  intensity: 'moderate' as IntensityLevel,
  volume: 'high' as VolumeLevel,
  createdAt: new Date(),
  updatedAt: new Date(),
  
  parameters: {
    intensityRange: { min: 0.65, max: 0.85 },
    volumeRange: { min: 15, max: 25 },
    rpeRange: { min: 6, max: 8 },
    exerciseCategories: ['main_lifts', 'assistance'],
    movementPatterns: ['squat', 'hinge', 'push', 'pull'],
    restDays: [3, 6], // Wednesday and Sunday
    deloadFrequency: 4
  } as BlockParameters,
  
  rules: {
    progressionType: 'percentage',
    progressionRate: 2.5, // 2.5% increase per cycle
    deloadTriggers: [
      {
        type: 'week_count',
        threshold: 4,
        action: 'deload'
      }
    ],
    adaptationRules: [
      {
        condition: 'if rpe > 8 for 3 sessions',
        action: 'reduce volume by 10%',
        priority: 8
      }
    ]
  } as BlockRules,
  
  sessions: [] // Will be populated below
};

// Strength Building Block (Weeks 5-8)
export const strengthBuildingBlock: Block = {
  id: 'block-531-strength',
  protocolId: 'protocol-531',
  name: 'Strength Building',
  description: 'Intensity-focused phase for strength development',
  order: 2,
  duration: 4,
  phase: 'build' as BlockPhase,
  intensity: 'high' as IntensityLevel,
  volume: 'moderate' as VolumeLevel,
  createdAt: new Date(),
  updatedAt: new Date(),
  
  parameters: {
    intensityRange: { min: 0.75, max: 0.95 },
    volumeRange: { min: 10, max: 20 },
    rpeRange: { min: 7, max: 9 },
    exerciseCategories: ['main_lifts', 'assistance'],
    movementPatterns: ['squat', 'hinge', 'push', 'pull'],
    restDays: [3, 6],
    deloadFrequency: 4
  } as BlockParameters,
  
  rules: {
    progressionType: 'percentage',
    progressionRate: 2.5,
    deloadTriggers: [
      {
        type: 'week_count',
        threshold: 4,
        action: 'deload'
      }
    ],
    adaptationRules: [
      {
        condition: 'if rpe > 9 for 2 sessions',
        action: 'reduce intensity by 5%',
        priority: 9
      }
    ]
  } as BlockRules,
  
  sessions: []
};

// Peak Block (Weeks 9-12)
export const peakBlock: Block = {
  id: 'block-531-peak',
  protocolId: 'protocol-531',
  name: 'Peak Phase',
  description: 'High intensity phase for peak strength',
  order: 3,
  duration: 4,
  phase: 'peak' as BlockPhase,
  intensity: 'very_high' as IntensityLevel,
  volume: 'low' as VolumeLevel,
  createdAt: new Date(),
  updatedAt: new Date(),
  
  parameters: {
    intensityRange: { min: 0.85, max: 1.0 },
    volumeRange: { min: 5, max: 15 },
    rpeRange: { min: 8, max: 10 },
    exerciseCategories: ['main_lifts'],
    movementPatterns: ['squat', 'hinge', 'push', 'pull'],
    restDays: [3, 6],
    deloadFrequency: 2
  } as BlockParameters,
  
  rules: {
    progressionType: 'percentage',
    progressionRate: 2.5,
    deloadTriggers: [
      {
        type: 'week_count',
        threshold: 2,
        action: 'deload'
      },
      {
        type: 'fatigue_high',
        threshold: 9,
        action: 'deload'
      }
    ],
    adaptationRules: [
      {
        condition: 'if rpe > 9.5 for 1 session',
        action: 'reduce intensity by 10%',
        priority: 10
      }
    ]
  } as BlockRules,
  
  sessions: []
};

// ===========================================
// 5/3/1 SESSIONS
// ===========================================

// Monday: Squat Day
export const squatSession: BlockSession = {
  id: 'session-531-squat',
  blockId: 'block-531-base',
  name: 'Squat Day',
  dayOfWeek: 1, // Monday
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  
  exercises: [
    {
      id: 'squat-main',
      name: 'Back Squat',
      category: 'main_lift',
      movementPattern: 'squat',
      sets: 3,
      reps: '5/3/1', // 5 reps, 3 reps, 1 rep
      weight: '65%/75%/85%', // Percentage of training max
      rest: 300, // 5 minutes
      order: 1,
      notes: 'Main lift - focus on technique'
    },
    {
      id: 'squat-assistance-1',
      name: 'Front Squat',
      category: 'assistance',
      movementPattern: 'squat',
      sets: 3,
      reps: '8-12',
      weight: 'bodyweight',
      rest: 180, // 3 minutes
      order: 2,
      notes: 'Assistance work'
    },
    {
      id: 'squat-assistance-2',
      name: 'Bulgarian Split Squats',
      category: 'assistance',
      movementPattern: 'squat',
      sets: 3,
      reps: '10-15',
      weight: 'bodyweight',
      rest: 120, // 2 minutes
      order: 3,
      notes: 'Single leg work'
    }
  ] as ExerciseConfiguration[],
  
  duration: 75, // 75 minutes
  intensity: 0.75,
  volume: 18,
  rpe: 7.5,
  notes: 'Focus on squat technique and building base strength'
};

// Tuesday: Bench Press Day
export const benchSession: BlockSession = {
  id: 'session-531-bench',
  blockId: 'block-531-base',
  name: 'Bench Press Day',
  dayOfWeek: 2, // Tuesday
  order: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  
  exercises: [
    {
      id: 'bench-main',
      name: 'Bench Press',
      category: 'main_lift',
      movementPattern: 'push',
      sets: 3,
      reps: '5/3/1',
      weight: '65%/75%/85%',
      rest: 300,
      order: 1,
      notes: 'Main lift - focus on technique'
    },
    {
      id: 'bench-assistance-1',
      name: 'Incline Dumbbell Press',
      category: 'assistance',
      movementPattern: 'push',
      sets: 3,
      reps: '8-12',
      weight: 'moderate',
      rest: 180,
      order: 2,
      notes: 'Assistance work'
    },
    {
      id: 'bench-assistance-2',
      name: 'Dips',
      category: 'assistance',
      movementPattern: 'push',
      sets: 3,
      reps: '8-12',
      weight: 'bodyweight',
      rest: 120,
      order: 3,
      notes: 'Bodyweight assistance'
    }
  ] as ExerciseConfiguration[],
  
  duration: 60,
  intensity: 0.75,
  volume: 15,
  rpe: 7.0,
  notes: 'Focus on bench press technique'
};

// Thursday: Deadlift Day
export const deadliftSession: BlockSession = {
  id: 'session-531-deadlift',
  blockId: 'block-531-base',
  name: 'Deadlift Day',
  dayOfWeek: 4, // Thursday
  order: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
  
  exercises: [
    {
      id: 'deadlift-main',
      name: 'Deadlift',
      category: 'main_lift',
      movementPattern: 'hinge',
      sets: 3,
      reps: '5/3/1',
      weight: '65%/75%/85%',
      rest: 300,
      order: 1,
      notes: 'Main lift - focus on technique'
    },
    {
      id: 'deadlift-assistance-1',
      name: 'Romanian Deadlift',
      category: 'assistance',
      movementPattern: 'hinge',
      sets: 3,
      reps: '8-12',
      weight: 'moderate',
      rest: 180,
      order: 2,
      notes: 'Assistance work'
    },
    {
      id: 'deadlift-assistance-2',
      name: 'Pull-ups',
      category: 'assistance',
      movementPattern: 'pull',
      sets: 3,
      reps: '5-10',
      weight: 'bodyweight',
      rest: 120,
      order: 3,
      notes: 'Pulling assistance'
    }
  ] as ExerciseConfiguration[],
  
  duration: 60,
  intensity: 0.80,
  volume: 12,
  rpe: 8.0,
  notes: 'Focus on deadlift technique and posterior chain'
};

// Friday: Overhead Press Day
export const pressSession: BlockSession = {
  id: 'session-531-press',
  blockId: 'block-531-base',
  name: 'Overhead Press Day',
  dayOfWeek: 5, // Friday
  order: 4,
  createdAt: new Date(),
  updatedAt: new Date(),
  
  exercises: [
    {
      id: 'press-main',
      name: 'Overhead Press',
      category: 'main_lift',
      movementPattern: 'push',
      sets: 3,
      reps: '5/3/1',
      weight: '65%/75%/85%',
      rest: 300,
      order: 1,
      notes: 'Main lift - focus on technique'
    },
    {
      id: 'press-assistance-1',
      name: 'Push Press',
      category: 'assistance',
      movementPattern: 'push',
      sets: 3,
      reps: '5-8',
      weight: 'moderate',
      rest: 180,
      order: 2,
      notes: 'Explosive assistance'
    },
    {
      id: 'press-assistance-2',
      name: 'Lateral Raises',
      category: 'assistance',
      movementPattern: 'push',
      sets: 3,
      reps: '12-15',
      weight: 'light',
      rest: 90,
      order: 3,
      notes: 'Isolation work'
    }
  ] as ExerciseConfiguration[],
  
  duration: 45,
  intensity: 0.70,
  volume: 12,
  rpe: 6.5,
  notes: 'Focus on overhead press technique and shoulder stability'
};

// ===========================================
// COMPLETE PROTOCOL ASSEMBLY
// ===========================================

export const complete531Protocol: Protocol = {
  ...protocol531,
  blocks: [
    {
      ...baseBuildingBlock,
      sessions: [squatSession, benchSession, deadliftSession, pressSession]
    },
    strengthBuildingBlock,
    peakBlock
  ]
};

// ===========================================
// USAGE EXAMPLE
// ===========================================

export function create531Execution(userId: string, startDate: Date) {
  return {
    protocolId: 'protocol-531',
    userId,
    status: 'active' as const,
    startDate,
    parameters: {
      adaptations: {
        intensity: 1.0, // No intensity modification
        volume: 1.0,    // No volume modification
        frequency: 4,   // 4 sessions per week
        duration: 12    // 12 weeks total
      },
      equipment: ['barbell', 'plates', 'squat_rack', 'bench'],
      timeConstraints: {
        maxSessionDuration: 90, // 90 minutes max
        preferredDays: [1, 2, 4, 5] // Mon, Tue, Thu, Fri
      }
    }
  };
}

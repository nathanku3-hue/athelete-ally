// 共享的标签映射常量
export const PURPOSE_LABELS: Record<string, string> = {
  general_fitness: 'General Fitness',
  sport_performance: 'Sport Performance',
  body_recomposition: 'Body Recomposition',
  rehabilitation: 'Rehabilitation'
};

export const PROFICIENCY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced'
};

export const SEASON_LABELS: Record<string, string> = {
  offseason: 'Off-Season',
  preseason: 'Pre-Season',
  inseason: 'In-Season'
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  // Full gym access
  full_gym: 'Full Gym Access',
  
  // Home gym equipment (matching equipment page data format)
  yogaMat: 'Yoga Mat',
  dumbbells: 'Dumbbells',
  bands: 'Resistance Bands',
  pullUpBar: 'Pull-up Bar',
  
  // Additional equipment (for future use)
  barbell: 'Barbell',
  kettlebell: 'Kettlebell',
  pullup_bar: 'Pull-up Bar',
  resistance_bands: 'Resistance Bands',
  squat_rack: 'Squat Rack',
  bench: 'Bench',
  cardio_machine: 'Cardio Machine',
  yoga_mat: 'Yoga Mat'
};

export const STEP_LABELS = [
  'Training Purpose',
  'Experience Level', 
  'Training Season',
  'Availability',
  'Equipment'
];

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

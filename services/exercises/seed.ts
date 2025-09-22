import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  // Push Exercises
  {
    name: 'Bench Press',
    description: 'A compound exercise that targets the chest, shoulders, and triceps',
    category: 'Push',
    subcategory: 'Chest',
    equipment: ['barbell', 'bench'],
    setup: 'Lie flat on bench, grip bar slightly wider than shoulders',
    difficulty: 3,
    progression: 'Start with empty bar, add 5-10lbs per week',
    primaryMuscles: ['Pectorals', 'Anterior Deltoids', 'Triceps'],
    secondaryMuscles: ['Serratus Anterior', 'Latissimus Dorsi'],
    instructions: '1. Lie on bench with feet flat on floor\n2. Grip bar with hands slightly wider than shoulders\n3. Lower bar to chest with control\n4. Press bar up explosively\n5. Return to starting position',
    tips: 'Keep core tight, maintain arch in back, don\'t bounce bar off chest',
    videoUrl: 'https://example.com/bench-press',
    imageUrl: 'https://example.com/bench-press.jpg',
    safetyNotes: 'Use spotter for heavy weights, never train to failure alone',
    modifications: [
      { name: 'Incline Bench Press', description: 'Perform on inclined bench' },
      { name: 'Dumbbell Press', description: 'Use dumbbells instead of barbell' },
      { name: 'Push-ups', description: 'Bodyweight alternative' }
    ],
    contraindications: 'Shoulder impingement, wrist injuries',
    tags: ['chest', 'strength', 'compound', 'barbell'],
    popularity: 100
  },
  {
    name: 'Push-ups',
    description: 'A bodyweight exercise that targets the chest, shoulders, and triceps',
    category: 'Push',
    subcategory: 'Chest',
    equipment: ['bodyweight'],
    setup: 'Start in plank position with hands slightly wider than shoulders',
    difficulty: 2,
    progression: 'Start with knees, progress to full push-ups, then add variations',
    primaryMuscles: ['Pectorals', 'Anterior Deltoids', 'Triceps'],
    secondaryMuscles: ['Core', 'Serratus Anterior'],
    instructions: '1. Start in plank position\n2. Lower chest to ground with control\n3. Push back up to starting position\n4. Keep body straight throughout movement',
    tips: 'Keep core tight, don\'t let hips sag, full range of motion',
    videoUrl: 'https://example.com/push-ups',
    imageUrl: 'https://example.com/push-ups.jpg',
    safetyNotes: 'Stop if you feel shoulder or wrist pain',
    modifications: [
      { name: 'Knee Push-ups', description: 'Perform on knees for easier version' },
      { name: 'Incline Push-ups', description: 'Hands on elevated surface' },
      { name: 'Decline Push-ups', description: 'Feet on elevated surface' }
    ],
    contraindications: 'Wrist injuries, shoulder impingement',
    tags: ['chest', 'bodyweight', 'beginner', 'home'],
    popularity: 95
  },
  {
    name: 'Overhead Press',
    description: 'A compound exercise that targets the shoulders and triceps',
    category: 'Push',
    subcategory: 'Shoulders',
    equipment: ['barbell'],
    setup: 'Stand with feet hip-width apart, grip bar at shoulder level',
    difficulty: 3,
    progression: 'Start with empty bar, add 2.5-5lbs per week',
    primaryMuscles: ['Anterior Deltoids', 'Medial Deltoids', 'Triceps'],
    secondaryMuscles: ['Core', 'Upper Trapezius'],
    instructions: '1. Stand with feet hip-width apart\n2. Grip bar at shoulder level\n3. Press bar straight up overhead\n4. Lower with control to starting position',
    tips: 'Keep core tight, don\'t arch back excessively, full range of motion',
    videoUrl: 'https://example.com/overhead-press',
    imageUrl: 'https://example.com/overhead-press.jpg',
    safetyNotes: 'Use proper form, don\'t press behind head',
    modifications: [
      { name: 'Dumbbell Press', description: 'Use dumbbells instead of barbell' },
      { name: 'Seated Press', description: 'Perform seated for stability' },
      { name: 'Pike Push-ups', description: 'Bodyweight alternative' }
    ],
    contraindications: 'Shoulder impingement, lower back issues',
    tags: ['shoulders', 'strength', 'compound', 'barbell'],
    popularity: 85
  },

  // Pull Exercises
  {
    name: 'Pull-ups',
    description: 'A bodyweight exercise that targets the back and biceps',
    category: 'Pull',
    subcategory: 'Back',
    equipment: ['pullup_bar'],
    setup: 'Hang from pull-up bar with overhand grip',
    difficulty: 4,
    progression: 'Start with assisted pull-ups or negatives, progress to full pull-ups',
    primaryMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius'],
    secondaryMuscles: ['Biceps', 'Posterior Deltoids', 'Core'],
    instructions: '1. Hang from bar with overhand grip\n2. Pull body up until chin clears bar\n3. Lower with control to starting position\n4. Repeat for desired reps',
    tips: 'Keep core tight, don\'t swing, full range of motion',
    videoUrl: 'https://example.com/pull-ups',
    imageUrl: 'https://example.com/pull-ups.jpg',
    safetyNotes: 'Stop if you feel shoulder pain, use proper grip',
    modifications: [
      { name: 'Assisted Pull-ups', description: 'Use resistance band or machine assistance' },
      { name: 'Negative Pull-ups', description: 'Focus on lowering phase' },
      { name: 'Chin-ups', description: 'Use underhand grip' }
    ],
    contraindications: 'Shoulder impingement, elbow issues',
    tags: ['back', 'bodyweight', 'advanced', 'pull'],
    popularity: 90
  },
  {
    name: 'Bent-over Rows',
    description: 'A compound exercise that targets the back and biceps',
    category: 'Pull',
    subcategory: 'Back',
    equipment: ['barbell'],
    setup: 'Stand with feet hip-width apart, hinge at hips, grip bar with overhand grip',
    difficulty: 3,
    progression: 'Start with empty bar, add 5-10lbs per week',
    primaryMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius'],
    secondaryMuscles: ['Biceps', 'Posterior Deltoids', 'Core'],
    instructions: '1. Stand with feet hip-width apart\n2. Hinge at hips, keep back straight\n3. Grip bar with overhand grip\n4. Pull bar to lower chest\n5. Lower with control to starting position',
    tips: 'Keep core tight, don\'t round back, squeeze shoulder blades together',
    videoUrl: 'https://example.com/bent-over-rows',
    imageUrl: 'https://example.com/bent-over-rows.jpg',
    safetyNotes: 'Keep back straight, don\'t use momentum',
    modifications: [
      { name: 'Dumbbell Rows', description: 'Use dumbbells instead of barbell' },
      { name: 'Cable Rows', description: 'Use cable machine' },
      { name: 'Inverted Rows', description: 'Bodyweight alternative' }
    ],
    contraindications: 'Lower back issues, shoulder impingement',
    tags: ['back', 'strength', 'compound', 'barbell'],
    popularity: 80
  },

  // Leg Exercises
  {
    name: 'Squats',
    description: 'A compound exercise that targets the legs and glutes',
    category: 'Legs',
    subcategory: 'Quads',
    equipment: ['barbell', 'squat_rack'],
    setup: 'Stand with feet shoulder-width apart, bar on upper back',
    difficulty: 3,
    progression: 'Start with bodyweight, add weight gradually',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core', 'Calves'],
    instructions: '1. Stand with feet shoulder-width apart\n2. Lower body by bending knees and hips\n3. Descend until thighs are parallel to floor\n4. Drive through heels to return to starting position',
    tips: 'Keep chest up, knees track over toes, full range of motion',
    videoUrl: 'https://example.com/squats',
    imageUrl: 'https://example.com/squats.jpg',
    safetyNotes: 'Use proper form, don\'t let knees cave in',
    modifications: [
      { name: 'Bodyweight Squats', description: 'Perform without weight' },
      { name: 'Goblet Squats', description: 'Hold weight at chest' },
      { name: 'Front Squats', description: 'Bar on front of shoulders' }
    ],
    contraindications: 'Knee issues, lower back problems',
    tags: ['legs', 'strength', 'compound', 'squat'],
    popularity: 95
  },
  {
    name: 'Deadlifts',
    description: 'A compound exercise that targets the entire posterior chain',
    category: 'Legs',
    subcategory: 'Posterior Chain',
    equipment: ['barbell'],
    setup: 'Stand with feet hip-width apart, bar over mid-foot',
    difficulty: 4,
    progression: 'Start with empty bar, add weight gradually',
    primaryMuscles: ['Hamstrings', 'Glutes', 'Erector Spinae'],
    secondaryMuscles: ['Trapezius', 'Rhomboids', 'Core'],
    instructions: '1. Stand with feet hip-width apart\n2. Hinge at hips, grip bar just outside legs\n3. Keep back straight, chest up\n4. Drive through heels to stand up\n5. Lower with control to starting position',
    tips: 'Keep bar close to body, don\'t round back, full range of motion',
    videoUrl: 'https://example.com/deadlifts',
    imageUrl: 'https://example.com/deadlifts.jpg',
    safetyNotes: 'Use proper form, don\'t round back, use appropriate weight',
    modifications: [
      { name: 'Romanian Deadlifts', description: 'Focus on hip hinge movement' },
      { name: 'Sumo Deadlifts', description: 'Wide stance variation' },
      { name: 'Trap Bar Deadlifts', description: 'Use trap bar for easier grip' }
    ],
    contraindications: 'Lower back issues, herniated discs',
    tags: ['legs', 'strength', 'compound', 'deadlift'],
    popularity: 85
  },

  // Core Exercises
  {
    name: 'Plank',
    description: 'An isometric exercise that targets the core',
    category: 'Core',
    subcategory: 'Stability',
    equipment: ['bodyweight'],
    setup: 'Start in push-up position, rest on forearms',
    difficulty: 2,
    progression: 'Start with 30 seconds, increase duration gradually',
    primaryMuscles: ['Rectus Abdominis', 'Transverse Abdominis'],
    secondaryMuscles: ['Obliques', 'Shoulders', 'Glutes'],
    instructions: '1. Start in push-up position\n2. Lower to forearms\n3. Keep body straight from head to heels\n4. Hold position for desired time',
    tips: 'Keep core tight, don\'t let hips sag, breathe normally',
    videoUrl: 'https://example.com/plank',
    imageUrl: 'https://example.com/plank.jpg',
    safetyNotes: 'Stop if you feel back pain, maintain proper form',
    modifications: [
      { name: 'Knee Plank', description: 'Perform on knees for easier version' },
      { name: 'Side Plank', description: 'Side-lying variation' },
      { name: 'Plank Up-downs', description: 'Alternate between forearms and hands' }
    ],
    contraindications: 'Lower back issues, shoulder problems',
    tags: ['core', 'stability', 'bodyweight', 'isometric'],
    popularity: 90
  }
];

const categories = [
  {
    name: 'Push',
    description: 'Exercises that involve pushing movements',
    icon: 'push',
    color: '#3B82F6',
    order: 1
  },
  {
    name: 'Pull',
    description: 'Exercises that involve pulling movements',
    icon: 'pull',
    color: '#10B981',
    order: 2
  },
  {
    name: 'Legs',
    description: 'Exercises that target the lower body',
    icon: 'legs',
    color: '#F59E0B',
    order: 3
  },
  {
    name: 'Core',
    description: 'Exercises that target the core muscles',
    icon: 'core',
    color: '#EF4444',
    order: 4
  },
  {
    name: 'Cardio',
    description: 'Cardiovascular exercises',
    icon: 'cardio',
    color: '#8B5CF6',
    order: 5
  }
];

async function main() {
  console.log('🌱 Seeding exercise database...');

  // Create categories
  for (const category of categories) {
    await prisma.exerciseCategory.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
    console.log(`✅ Created category: ${category.name}`);
  }

  // Create exercises
  for (const exercise of exercises) {
    // Check if exercise already exists by name
    const existing = await prisma.exercise.findFirst({
      where: { name: exercise.name }
    });
    
    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: exercise,
      });
      console.log(`✅ Updated exercise: ${exercise.name}`);
    } else {
      await prisma.exercise.create({
        data: exercise,
      });
      console.log(`✅ Created exercise: ${exercise.name}`);
    }
  }

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


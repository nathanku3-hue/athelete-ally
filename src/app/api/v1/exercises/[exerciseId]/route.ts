import { NextRequest, NextResponse } from 'next/server';
import { handleCorsOptions, addCorsHeaders } from '@/lib/cors';

export async function GET(
  request: NextRequest,
  { params }: { params: { exerciseId: string } }
) {
  try {
    const { exerciseId } = params;
    
    if (!exerciseId) {
      return NextResponse.json(
        { error: 'exerciseId is required' },
        { status: 400 }
      );
    }
    
    console.log('Fetching exercise details for exerciseId:', exerciseId);
    
    // 在真实实现中，这里会从数据库获取动作详情
    // 目前使用模拟数据
    const exerciseDetails = {
      id: exerciseId,
      name: getExerciseName(exerciseId),
      description: getExerciseDescription(exerciseId),
      instructions: getExerciseInstructions(exerciseId),
      tips: getExerciseTips(exerciseId),
      muscles: getExerciseMuscles(exerciseId),
      equipment: getExerciseEquipment(exerciseId),
      difficulty: getExerciseDifficulty(exerciseId),
      gifUrl: getExerciseGifUrl(exerciseId),
      videoUrl: getExerciseVideoUrl(exerciseId),
    };
    
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('Returning exercise details:', { id: exerciseId, name: exerciseDetails.name });
    
    return NextResponse.json(exerciseDetails);
    
  } catch (error) {
    console.error('Failed to fetch exercise details:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch exercise details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 辅助函数 - 在真实实现中，这些会从数据库获取
function getExerciseName(exerciseId: string): string {
  const names: Record<string, string> = {
    'ex1': 'Bench Press',
    'ex2': 'Pull Ups',
    'ex3': 'Dumbbell Rows',
    'ex4': 'Barbell Squat',
    'ex5': 'Box Jumps',
    'ex6': 'Leg Press',
    'ex7': 'Deadlift',
    'ex8': 'Overhead Press',
    'ex9': 'Bicep Curls',
    'ex10': 'Foam Rolling',
    'ex11': 'Stretching',
  };
  return names[exerciseId] || 'Unknown Exercise';
}

function getExerciseDescription(exerciseId: string): string {
  const descriptions: Record<string, string> = {
    'ex1': 'A compound upper body exercise that targets the chest, shoulders, and triceps. Performed lying on a bench, pressing a barbell from chest level to full arm extension.',
    'ex2': 'A bodyweight exercise that targets the back, biceps, and shoulders. Performed by hanging from a bar and pulling your body up until your chin clears the bar.',
    'ex3': 'A pulling exercise that targets the latissimus dorsi, rhomboids, and middle trapezius. Performed by pulling dumbbells toward your torso while maintaining a bent-over position.',
    'ex4': 'A compound lower body exercise that targets the quadriceps, glutes, and hamstrings. Performed by squatting down with a barbell across your shoulders.',
    'ex5': 'A plyometric exercise that develops explosive power in the legs. Performed by jumping onto a box or platform and landing softly.',
    'ex6': 'A machine-based exercise that targets the quadriceps and glutes. Performed by pushing weight away from your body using your legs.',
    'ex7': 'A compound full-body exercise that targets the posterior chain. Performed by lifting a barbell from the ground to hip level.',
    'ex8': 'A compound upper body exercise that targets the shoulders and triceps. Performed by pressing a barbell overhead from shoulder level.',
    'ex9': 'An isolation exercise that targets the biceps. Performed by curling dumbbells or a barbell from arm extension to full contraction.',
    'ex10': 'A recovery technique that uses a foam roller to massage and release muscle tension.',
    'ex11': 'Flexibility exercises that improve range of motion and reduce muscle tension.',
  };
  return descriptions[exerciseId] || 'Exercise description not available.';
}

function getExerciseInstructions(exerciseId: string): string[] {
  const instructions: Record<string, string[]> = {
    'ex1': [
      'Lie flat on a bench with your feet firmly planted on the ground',
      'Grip the barbell with hands slightly wider than shoulder-width',
      'Lower the bar to your chest with control',
      'Press the bar up explosively until your arms are fully extended',
      'Keep your core tight and maintain a slight arch in your back'
    ],
    'ex2': [
      'Hang from a pull-up bar with an overhand grip',
      'Engage your core and pull your shoulder blades down and back',
      'Pull your body up until your chin clears the bar',
      'Lower yourself down with control to full arm extension',
      'Maintain tension throughout the entire movement'
    ],
    'ex3': [
      'Stand with feet hip-width apart, holding dumbbells',
      'Hinge at the hips and lean forward about 45 degrees',
      'Keep your back straight and core engaged',
      'Pull the dumbbells toward your lower chest/upper abdomen',
      'Squeeze your shoulder blades together at the top',
      'Lower the weights with control to the starting position'
    ],
    'ex4': [
      'Stand with feet shoulder-width apart, barbell across upper back',
      'Keep your chest up and core tight',
      'Lower your body by bending at the hips and knees',
      'Descend until your thighs are parallel to the ground',
      'Drive through your heels to return to standing position',
      'Keep your knees tracking over your toes throughout'
    ],
    'ex5': [
      'Stand in front of a sturdy box or platform',
      'Start with feet shoulder-width apart',
      'Lower into a quarter squat position',
      'Explosively jump onto the box',
      'Land softly with both feet on the box',
      'Step down carefully and reset for the next rep'
    ],
    'ex6': [
      'Sit in the leg press machine with feet on the platform',
      'Position feet shoulder-width apart, toes slightly pointed out',
      'Lower the weight by bending your knees toward your chest',
      'Stop when your knees reach about 90 degrees',
      'Press through your heels to extend your legs',
      'Keep your back flat against the pad throughout'
    ],
    'ex7': [
      'Stand with feet hip-width apart, barbell over mid-foot',
      'Bend at the hips and knees to grip the bar',
      'Keep your back straight and chest up',
      'Drive through your heels and extend your hips and knees',
      'Stand up tall with the bar at hip level',
      'Lower the bar with control by reversing the movement'
    ],
    'ex8': [
      'Stand with feet shoulder-width apart, barbell at shoulder level',
      'Grip the bar with hands slightly wider than shoulders',
      'Keep your core tight and chest up',
      'Press the bar straight up overhead',
      'Fully extend your arms at the top',
      'Lower the bar with control to shoulder level'
    ],
    'ex9': [
      'Stand with feet hip-width apart, holding dumbbells',
      'Keep your elbows close to your sides',
      'Curl the weights up by flexing your biceps',
      'Squeeze your biceps at the top of the movement',
      'Lower the weights with control to full extension',
      'Avoid swinging or using momentum'
    ],
    'ex10': [
      'Place the foam roller on the ground',
      'Position the target muscle group on the roller',
      'Use your body weight to apply pressure',
      'Roll slowly back and forth over the muscle',
      'Focus on areas of tension or tightness',
      'Breathe deeply and relax into the pressure'
    ],
    'ex11': [
      'Find a comfortable position for the stretch',
      'Move slowly into the stretch until you feel tension',
      'Hold the position for 30-60 seconds',
      'Breathe deeply and relax into the stretch',
      'Avoid bouncing or forcing the stretch',
      'Stop if you feel any sharp pain'
    ],
  };
  return instructions[exerciseId] || ['Instructions not available for this exercise.'];
}

function getExerciseTips(exerciseId: string): string[] {
  const tips: Record<string, string[]> = {
    'ex1': [
      'Keep your shoulder blades retracted throughout the movement',
      'Don\'t bounce the bar off your chest',
      'Use a spotter for heavy weights',
      'Focus on controlled movement rather than maximum weight'
    ],
    'ex2': [
      'Start with assisted pull-ups if needed',
      'Focus on pulling with your back, not just your arms',
      'Keep your body straight and avoid swinging',
      'Use a full range of motion'
    ],
    'ex3': [
      'Keep your core tight to protect your lower back',
      'Pull with your elbows, not your hands',
      'Squeeze your shoulder blades together at the top',
      'Don\'t let your shoulders round forward'
    ],
    'ex4': [
      'Keep your knees tracking over your toes',
      'Don\'t let your knees cave inward',
      'Keep your chest up throughout the movement',
      'Drive through your heels on the way up'
    ],
    'ex5': [
      'Start with a lower box and progress gradually',
      'Land softly to protect your joints',
      'Use your arms to help with momentum',
      'Focus on explosive power, not height'
    ],
    'ex6': [
      'Don\'t let your knees cave inward',
      'Keep your back flat against the pad',
      'Use a full range of motion',
      'Control the weight on both the way down and up'
    ],
    'ex7': [
      'Keep the bar close to your body',
      'Don\'t round your back',
      'Drive through your heels',
      'Keep your chest up throughout the movement'
    ],
    'ex8': [
      'Keep your core tight to protect your lower back',
      'Don\'t arch your back excessively',
      'Press straight up, not forward',
      'Use your legs to help with heavier weights'
    ],
    'ex9': [
      'Keep your elbows stationary',
      'Don\'t swing the weights',
      'Focus on the mind-muscle connection',
      'Use a full range of motion'
    ],
    'ex10': [
      'Start with lighter pressure and gradually increase',
      'Focus on areas of tension',
      'Breathe deeply during the rolling',
      'Don\'t roll over joints or bones'
    ],
    'ex11': [
      'Hold each stretch for at least 30 seconds',
      'Breathe deeply and relax',
      'Don\'t force the stretch',
      'Stretch both sides equally'
    ],
  };
  return tips[exerciseId] || ['Tips not available for this exercise.'];
}

function getExerciseMuscles(exerciseId: string): string[] {
  const muscles: Record<string, string[]> = {
    'ex1': ['Pectoralis Major', 'Anterior Deltoid', 'Triceps Brachii'],
    'ex2': ['Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius', 'Biceps Brachii'],
    'ex3': ['Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius', 'Posterior Deltoid'],
    'ex4': ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    'ex5': ['Quadriceps', 'Glutes', 'Calves', 'Core'],
    'ex6': ['Quadriceps', 'Glutes'],
    'ex7': ['Hamstrings', 'Glutes', 'Erector Spinae', 'Trapezius', 'Rhomboids'],
    'ex8': ['Anterior Deltoid', 'Medial Deltoid', 'Triceps Brachii', 'Core'],
    'ex9': ['Biceps Brachii', 'Brachialis'],
    'ex10': ['Targeted Muscle Group'],
    'ex11': ['Targeted Muscle Group'],
  };
  return muscles[exerciseId] || ['Muscle groups not specified'];
}

function getExerciseEquipment(exerciseId: string): string[] {
  const equipment: Record<string, string[]> = {
    'ex1': ['Barbell', 'Bench', 'Weight Plates'],
    'ex2': ['Pull-up Bar'],
    'ex3': ['Dumbbells'],
    'ex4': ['Barbell', 'Weight Plates', 'Squat Rack'],
    'ex5': ['Box or Platform'],
    'ex6': ['Leg Press Machine'],
    'ex7': ['Barbell', 'Weight Plates'],
    'ex8': ['Barbell', 'Weight Plates'],
    'ex9': ['Dumbbells or Barbell'],
    'ex10': ['Foam Roller'],
    'ex11': ['None (Bodyweight)'],
  };
  return equipment[exerciseId] || ['Equipment not specified'];
}

function getExerciseDifficulty(exerciseId: string): number {
  const difficulty: Record<string, number> = {
    'ex1': 4,
    'ex2': 5,
    'ex3': 3,
    'ex4': 4,
    'ex5': 3,
    'ex6': 2,
    'ex7': 5,
    'ex8': 4,
    'ex9': 2,
    'ex10': 1,
    'ex11': 1,
  };
  return difficulty[exerciseId] || 3;
}

function getExerciseGifUrl(exerciseId: string): string {
  // 在真实实现中，这些会是实际的GIF URL
  return `https://example.com/gifs/${exerciseId}.gif`;
}

function getExerciseVideoUrl(exerciseId: string): string {
  // 在真实实现中，这些会是实际的视频URL
  return `https://example.com/videos/${exerciseId}.mp4`;
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

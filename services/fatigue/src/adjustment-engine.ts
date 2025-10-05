import { prisma } from './db';
import { businessMetrics, traceTrainingAdjustment } from './telemetry';

export interface FatigueData {
  overallFatigue: number;
  physicalFatigue: number;
  mentalFatigue: number;
  sleepQuality: number;
  stressLevel: number;
  timeSinceLastWorkout?: number;
  previousWorkout?: string;
}

export interface TrainingSession {
  exercises: Array<{
    id: string;
    name: string;
    category: string;
    sets: number;
    reps: number;
    weight?: number;
    intensity?: number; // 1-5 scale
  }>;
  totalDuration: number;
  restBetweenSets: number;
}

// TODO: Replace unknown types with proper generics by 2025-01-20
// This is a temporary solution to avoid any types while maintaining type safety.
// Future improvement: TrainingAdjustment<T> with originalValue: T, adjustedValue: T
export interface TrainingAdjustment {
  type: 'intensity' | 'volume' | 'exercise_substitution' | 'rest' | 'warmup';
  originalValue: unknown;
  adjustedValue: unknown;
  reason: string;
  confidence: number;
  exerciseId?: string;
  exerciseName?: string;
}

export class AdjustmentEngine {
  private fatigueThresholds = {
    low: 2,
    high: 4,
  };

  async generateAdjustments(
    userId: string,
    fatigueData: FatigueData,
    session: TrainingSession
  ): Promise<TrainingAdjustment[]> {
    const span = traceTrainingAdjustment(userId, 'generate', 0.8);
    
    try {
      const adjustments: TrainingAdjustment[] = [];
      const overallFatigue = fatigueData.overallFatigue;
      
      // Get user's fatigue profile
      const userProfile = await this.getUserFatigueProfile(userId);
      
      // Calculate adjustment sensitivity
      const sensitivity = userProfile?.adjustmentSensitivity || 0.5;
      const adjustedThreshold = this.fatigueThresholds.high - (sensitivity * 2);
      
      businessMetrics.fatigueAssessments.add(1, {
        'user.id': userId,
        'fatigue.level': overallFatigue.toString(),
      });
      
      businessMetrics.averageFatigueLevel.record(overallFatigue, {
        'user.id': userId,
      });

      // High fatigue adjustments
      if (overallFatigue >= adjustedThreshold) {
        adjustments.push(...this.generateHighFatigueAdjustments(fatigueData, session));
      }
      
      // Low fatigue adjustments (can increase intensity)
      if (overallFatigue <= this.fatigueThresholds.low) {
        adjustments.push(...this.generateLowFatigueAdjustments(fatigueData, session));
      }
      
      // Sleep quality adjustments
      if (fatigueData.sleepQuality <= 2) {
        adjustments.push(...this.generateSleepQualityAdjustments(fatigueData, session));
      }
      
      // Stress level adjustments
      if (fatigueData.stressLevel >= 4) {
        adjustments.push(...this.generateStressAdjustments(fatigueData, session));
      }
      
      // Time since last workout adjustments
      if (fatigueData.timeSinceLastWorkout && fatigueData.timeSinceLastWorkout > 72) {
        adjustments.push(...this.generateReturnAdjustments(fatigueData, session));
      }

      // Save adjustments to database
      for (const adjustment of adjustments) {
        await this.saveAdjustment(userId, adjustment, overallFatigue);
      }

      businessMetrics.trainingAdjustments.add(adjustments.length, {
        'user.id': userId,
        'adjustment.count': adjustments.length.toString(),
      });

      span.setStatus({ code: 1, message: 'Adjustments generated successfully' });
      span.end();
      
      return adjustments;
    } catch (error) {
      span.setStatus({ code: 2, message: 'Failed to generate adjustments' });
      span.end();
      throw error;
    }
  }

  private generateHighFatigueAdjustments(
    fatigueData: FatigueData,
    session: TrainingSession
  ): TrainingAdjustment[] {
    const adjustments: TrainingAdjustment[] = [];
    const fatigueLevel = fatigueData.overallFatigue;

    // Reduce intensity across all exercises
    adjustments.push({
      type: 'intensity',
      originalValue: { intensity: 'moderate' },
      adjustedValue: { intensity: 'reduced', reduction: Math.min(20, fatigueLevel * 5) },
      reason: `High fatigue detected (${fatigueLevel}/5). Reducing intensity by ${Math.min(20, fatigueLevel * 5)}%`,
      confidence: 0.8,
    });

    // Reduce volume (sets)
    adjustments.push({
      type: 'volume',
      originalValue: { sets: 'original' },
      adjustedValue: { sets: 'reduced', reduction: Math.min(25, fatigueLevel * 6) },
      reason: `High fatigue detected. Reducing sets by ${Math.min(25, fatigueLevel * 6)}%`,
      confidence: 0.7,
    });

    // Increase rest between sets
    adjustments.push({
      type: 'rest',
      originalValue: { restTime: session.restBetweenSets },
      adjustedValue: { restTime: session.restBetweenSets * 1.5 },
      reason: 'High fatigue detected. Increasing rest time between sets',
      confidence: 0.6,
    });

    // Substitute high-intensity exercises
    session.exercises.forEach((exercise) => {
      if (exercise.intensity && exercise.intensity >= 4) {
        adjustments.push({
          type: 'exercise_substitution',
          originalValue: { exercise: exercise.name },
          adjustedValue: { exercise: this.getLowIntensityAlternative(exercise.category) },
          reason: `High fatigue detected. Substituting high-intensity ${exercise.name} with lower intensity alternative`,
          confidence: 0.7,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
        });
      }
    });

    return adjustments;
  }

  private generateLowFatigueAdjustments(
    fatigueData: FatigueData,
    session: TrainingSession
  ): TrainingAdjustment[] {
    const adjustments: TrainingAdjustment[] = [];
    const fatigueLevel = fatigueData.overallFatigue;

    // Increase intensity slightly
    adjustments.push({
      type: 'intensity',
      originalValue: { intensity: 'moderate' },
      adjustedValue: { intensity: 'increased', increase: Math.min(10, (3 - fatigueLevel) * 5) },
      reason: `Low fatigue detected (${fatigueLevel}/5). You can push harder!`,
      confidence: 0.6,
    });

    // Add an extra set to compound exercises
    session.exercises.forEach((exercise) => {
      if (['Push', 'Pull', 'Legs'].includes(exercise.category)) {
        adjustments.push({
          type: 'volume',
          originalValue: { sets: exercise.sets },
          adjustedValue: { sets: exercise.sets + 1 },
          reason: `Low fatigue detected. Adding an extra set to ${exercise.name}`,
          confidence: 0.5,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
        });
      }
    });

    return adjustments;
  }

  private generateSleepQualityAdjustments(
    fatigueData: FatigueData,
    session: TrainingSession
  ): TrainingAdjustment[] {
    const adjustments: TrainingAdjustment[] = [];

    // Add extended warmup
    adjustments.push({
      type: 'warmup',
      originalValue: { duration: 10 },
      adjustedValue: { duration: 15 },
      reason: 'Poor sleep quality detected. Adding extended warmup to prepare your body',
      confidence: 0.8,
    });

    // Reduce intensity of first few exercises
    adjustments.push({
      type: 'intensity',
      originalValue: { intensity: 'moderate' },
      adjustedValue: { intensity: 'gradual_increase', startReduction: 15 },
      reason: 'Poor sleep quality detected. Starting with reduced intensity and building up',
      confidence: 0.7,
    });

    return adjustments;
  }

  private generateStressAdjustments(
    fatigueData: FatigueData,
    session: TrainingSession
  ): TrainingAdjustment[] {
    const adjustments: TrainingAdjustment[] = [];

    // Focus on mind-muscle connection exercises
    adjustments.push({
      type: 'exercise_substitution',
      originalValue: { focus: 'power' },
      adjustedValue: { focus: 'mind_muscle_connection' },
      reason: 'High stress detected. Focusing on controlled, mindful movements',
      confidence: 0.6,
    });

    // Add breathing exercises
    adjustments.push({
      type: 'warmup',
      originalValue: { components: ['dynamic_stretching'] },
      adjustedValue: { components: ['breathing_exercises', 'dynamic_stretching'] },
      reason: 'High stress detected. Adding breathing exercises to help you relax',
      confidence: 0.7,
    });

    return adjustments;
  }

  private generateReturnAdjustments(
    fatigueData: FatigueData,
    session: TrainingSession
  ): TrainingAdjustment[] {
    const adjustments: TrainingAdjustment[] = [];

    // Reduce intensity significantly
    adjustments.push({
      type: 'intensity',
      originalValue: { intensity: 'moderate' },
      adjustedValue: { intensity: 'significantly_reduced', reduction: 30 },
      reason: 'Long break detected. Starting with significantly reduced intensity to avoid injury',
      confidence: 0.9,
    });

    // Reduce volume
    adjustments.push({
      type: 'volume',
      originalValue: { sets: 'original' },
      adjustedValue: { sets: 'reduced', reduction: 40 },
      reason: 'Long break detected. Reducing volume to help your body readjust',
      confidence: 0.8,
    });

    return adjustments;
  }

  private getLowIntensityAlternative(category: string): string {
    const alternatives: Record<string, string> = {
      'Push': 'Push-ups (knee variation)',
      'Pull': 'Assisted Pull-ups',
      'Legs': 'Bodyweight Squats',
      'Core': 'Plank (knee variation)',
      'Cardio': 'Walking',
    };
    return alternatives[category] || 'Light movement';
  }

  private async getUserFatigueProfile(userId: string) {
    return await prisma.userFatigueProfile.findUnique({
      where: { userId },
    });
  }

  private async saveAdjustment(
    userId: string,
    adjustment: TrainingAdjustment,
    fatigueLevel: number
  ) {
    await prisma.trainingAdjustment.create({
      data: {
        userId,
        adjustmentType: adjustment.type,
        originalValue: adjustment.originalValue,
        adjustedValue: adjustment.adjustedValue,
        reason: adjustment.reason,
        confidence: adjustment.confidence,
        fatigueLevel,
        exerciseId: adjustment.exerciseId,
        exerciseName: adjustment.exerciseName,
      },
    });
  }

  async recordAdjustmentFeedback(
    adjustmentId: string,
    satisfactionScore: number,
    feedback?: string
  ) {
    const adjustment = await prisma.trainingAdjustment.update({
      where: { id: adjustmentId },
      data: {
        userFeedback: feedback,
        isApplied: true,
        appliedAt: new Date(),
      },
    });

    // Update user satisfaction score
    await this.updateUserSatisfaction(adjustment.userId, satisfactionScore);

    businessMetrics.userSatisfaction.record(satisfactionScore, {
      'user.id': adjustment.userId,
      'adjustment.type': adjustment.adjustmentType,
    });

    return adjustment;
  }

  private async updateUserSatisfaction(userId: string, satisfactionScore: number) {
    const profile = await prisma.userFatigueProfile.findUnique({
      where: { userId },
    });

    if (profile) {
      const currentScore = profile.userSatisfactionScore || 0;
      const totalAdjustments = profile.totalAdjustments + 1;
      const newScore = (currentScore * profile.totalAdjustments + satisfactionScore) / totalAdjustments;

      await prisma.userFatigueProfile.update({
        where: { userId },
        data: {
          userSatisfactionScore: newScore,
          totalAdjustments,
        },
      });
    }
  }
}


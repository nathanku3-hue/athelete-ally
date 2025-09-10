import { prisma } from './db';
import { businessMetrics, tracePersonalRecord, traceWorkoutGoal } from './telemetry';

export interface PersonalRecordData {
  userId: string;
  exerciseId?: string;
  exerciseName: string;
  recordType: 'max_weight' | 'max_reps' | 'max_volume' | 'max_duration';
  value: number;
  unit: string;
  sessionId?: string;
  setNumber?: number;
  notes?: string;
}

export interface WorkoutGoalData {
  userId: string;
  exerciseId?: string;
  exerciseName: string;
  goalType: 'weight' | 'reps' | 'volume' | 'frequency' | 'consistency';
  targetValue: number;
  unit: string;
  startDate: Date;
  targetDate: Date;
  milestones?: Array<{
    value: number;
    date: Date;
    description: string;
  }>;
}

export class AchievementEngine {
  async checkAndUpdatePersonalRecords(sessionId: string, userId: string) {
    const session = await prisma.workoutSession.findFirst({
      where: { 
        id: sessionId,
        userId: userId,
      },
      include: {
        exercises: {
          include: {
            records: true,
          },
        },
      },
    });

    if (!session) return [];

    const newRecords = [];

    for (const exercise of session.exercises) {
      if (!exercise.records.length) continue;

      // Check max weight record
      const maxWeightRecord = exercise.records.reduce((max, record) => {
        if (record.actualWeight && (!max || record.actualWeight > max.actualWeight)) {
          return record;
        }
        return max;
      }, null as any);

      if (maxWeightRecord && maxWeightRecord.actualWeight) {
        const existingRecord = await prisma.personalRecord.findUnique({
          where: {
            userId_exerciseId_recordType: {
              userId: userId,
              exerciseId: exercise.exerciseId || '',
              recordType: 'max_weight',
            },
          },
        });

        if (!existingRecord || maxWeightRecord.actualWeight > existingRecord.value) {
          const newRecord = await this.createPersonalRecord({
            userId,
            exerciseId: exercise.exerciseId || undefined,
            exerciseName: exercise.exerciseName,
            recordType: 'max_weight',
            value: maxWeightRecord.actualWeight,
            unit: 'kg',
            sessionId,
            setNumber: maxWeightRecord.setNumber,
            notes: `Set ${maxWeightRecord.setNumber} of ${exercise.exerciseName}`,
          });
          newRecords.push(newRecord);
        }
      }

      // Check max reps record
      const maxRepsRecord = exercise.records.reduce((max, record) => {
        if (record.actualReps && (!max || record.actualReps > max.actualReps)) {
          return record;
        }
        return max;
      }, null as any);

      if (maxRepsRecord && maxRepsRecord.actualReps) {
        const existingRecord = await prisma.personalRecord.findUnique({
          where: {
            userId_exerciseId_recordType: {
              userId: userId,
              exerciseId: exercise.exerciseId || '',
              recordType: 'max_reps',
            },
          },
        });

        if (!existingRecord || maxRepsRecord.actualReps > existingRecord.value) {
          const newRecord = await this.createPersonalRecord({
            userId,
            exerciseId: exercise.exerciseId || undefined,
            exerciseName: exercise.exerciseName,
            recordType: 'max_reps',
            value: maxRepsRecord.actualReps,
            unit: 'reps',
            sessionId,
            setNumber: maxRepsRecord.setNumber,
            notes: `Set ${maxRepsRecord.setNumber} of ${exercise.exerciseName}`,
          });
          newRecords.push(newRecord);
        }
      }

      // Check max volume record
      if (exercise.totalVolume) {
        const existingRecord = await prisma.personalRecord.findUnique({
          where: {
            userId_exerciseId_recordType: {
              userId: userId,
              exerciseId: exercise.exerciseId || '',
              recordType: 'max_volume',
            },
          },
        });

        if (!existingRecord || exercise.totalVolume > existingRecord.value) {
          const newRecord = await this.createPersonalRecord({
            userId,
            exerciseId: exercise.exerciseId || undefined,
            exerciseName: exercise.exerciseName,
            recordType: 'max_volume',
            value: exercise.totalVolume,
            unit: 'kg',
            sessionId,
            notes: `Total volume for ${exercise.exerciseName}`,
          });
          newRecords.push(newRecord);
        }
      }
    }

    return newRecords;
  }

  async createPersonalRecord(data: PersonalRecordData) {
    const span = tracePersonalRecord(data.userId, data.exerciseName, data.recordType, data.value);
    
    try {
      const record = await prisma.personalRecord.upsert({
        where: {
          userId_exerciseId_recordType: {
            userId: data.userId,
            exerciseId: data.exerciseId || '',
            recordType: data.recordType,
          },
        },
        update: {
          value: data.value,
          unit: data.unit,
          sessionId: data.sessionId,
          setNumber: data.setNumber,
          notes: data.notes,
          isVerified: true,
          verifiedAt: new Date(),
        },
        create: {
          userId: data.userId,
          exerciseId: data.exerciseId,
          exerciseName: data.exerciseName,
          recordType: data.recordType,
          value: data.value,
          unit: data.unit,
          sessionId: data.sessionId,
          setNumber: data.setNumber,
          notes: data.notes,
          isVerified: true,
          verifiedAt: new Date(),
        },
      });

      businessMetrics.personalRecords.add(1, {
        'user.id': data.userId,
        'record.type': data.recordType,
        'exercise.name': data.exerciseName,
      });

      businessMetrics.recordTypes.add(1, {
        'record.type': data.recordType,
      });

      span.setStatus({ code: 1, message: 'Personal record created successfully' });
      span.end();
      
      return record;
    } catch (error) {
      span.setStatus({ code: 2, message: 'Failed to create personal record' });
      span.end();
      throw error;
    }
  }

  async createWorkoutGoal(data: WorkoutGoalData) {
    const span = traceWorkoutGoal(data.userId, data.goalType, 0);
    
    try {
      const goal = await prisma.workoutGoal.create({
        data: {
          userId: data.userId,
          exerciseId: data.exerciseId,
          exerciseName: data.exerciseName,
          goalType: data.goalType,
          targetValue: data.targetValue,
          currentValue: 0,
          unit: data.unit,
          startDate: data.startDate,
          targetDate: data.targetDate,
          milestones: data.milestones || [],
          progress: 0,
        },
      });

      span.setStatus({ code: 1, message: 'Workout goal created successfully' });
      span.end();
      
      return goal;
    } catch (error) {
      span.setStatus({ code: 2, message: 'Failed to create workout goal' });
      span.end();
      throw error;
    }
  }

  async updateGoalProgress(goalId: string, userId: string, currentValue: number) {
    const span = traceWorkoutGoal(userId, 'update', 0);
    
    try {
      const goal = await prisma.workoutGoal.findFirst({
        where: { 
          id: goalId,
          userId: userId,
        },
      });

      if (!goal) {
        throw new Error('Goal not found or access denied');
      }

      const progress = Math.min((currentValue / goal.targetValue) * 100, 100);
      const isAchieved = progress >= 100;

      const updatedGoal = await prisma.workoutGoal.update({
        where: { id: goalId },
        data: {
          currentValue,
          progress,
          isAchieved,
          achievedAt: isAchieved ? new Date() : null,
        },
      });

      span.setAttributes({
        'goal.progress': progress,
        'goal.achieved': isAchieved,
      });

      span.setStatus({ code: 1, message: 'Goal progress updated successfully' });
      span.end();
      
      return updatedGoal;
    } catch (error) {
      span.setStatus({ code: 2, message: 'Failed to update goal progress' });
      span.end();
      throw error;
    }
  }

  async getUserPersonalRecords(userId: string, exerciseId?: string) {
    const records = await prisma.personalRecord.findMany({
      where: {
        userId,
        ...(exerciseId && { exerciseId }),
      },
      orderBy: [
        { exerciseName: 'asc' },
        { recordType: 'asc' },
        { value: 'desc' },
      ],
    });

    return records;
  }

  async getUserGoals(userId: string, status?: 'active' | 'achieved' | 'expired') {
    const now = new Date();
    
    const where: any = { userId };
    
    if (status === 'active') {
      where.isAchieved = false;
      where.targetDate = { gt: now };
    } else if (status === 'achieved') {
      where.isAchieved = true;
    } else if (status === 'expired') {
      where.isAchieved = false;
      where.targetDate = { lte: now };
    }

    const goals = await prisma.workoutGoal.findMany({
      where,
      orderBy: { targetDate: 'asc' },
    });

    return goals;
  }

  async getAchievementStats(userId: string) {
    const [totalRecords, totalGoals, achievedGoals, activeGoals] = await Promise.all([
      prisma.personalRecord.count({ where: { userId } }),
      prisma.workoutGoal.count({ where: { userId } }),
      prisma.workoutGoal.count({ where: { userId, isAchieved: true } }),
      prisma.workoutGoal.count({ 
        where: { 
          userId, 
          isAchieved: false,
          targetDate: { gt: new Date() },
        } 
      }),
    ]);

    const recordTypes = await prisma.personalRecord.groupBy({
      by: ['recordType'],
      where: { userId },
      _count: { recordType: true },
    });

    return {
      totalRecords,
      totalGoals,
      achievedGoals,
      activeGoals,
      recordTypes: recordTypes.map(rt => ({
        type: rt.recordType,
        count: rt._count.recordType,
      })),
    };
  }

  async getRecentAchievements(userId: string, limit: number = 10) {
    const records = await prisma.personalRecord.findMany({
      where: { userId },
      orderBy: { verifiedAt: 'desc' },
      take: limit,
    });

    const goals = await prisma.workoutGoal.findMany({
      where: { 
        userId,
        isAchieved: true,
      },
      orderBy: { achievedAt: 'desc' },
      take: limit,
    });

    return {
      records: records.map(r => ({
        type: 'record',
        id: r.id,
        exerciseName: r.exerciseName,
        recordType: r.recordType,
        value: r.value,
        unit: r.unit,
        achievedAt: r.verifiedAt,
      })),
      goals: goals.map(g => ({
        type: 'goal',
        id: g.id,
        exerciseName: g.exerciseName,
        goalType: g.goalType,
        targetValue: g.targetValue,
        unit: g.unit,
        achievedAt: g.achievedAt,
      })),
    };
  }
}


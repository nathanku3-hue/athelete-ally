import { prisma } from './db';
import { businessMetrics, traceWorkoutSession, traceWorkoutRecord } from './telemetry';

export interface WorkoutSessionData {
  userId: string;
  planId?: string;
  sessionName?: string;
  location?: string;
  weather?: string;
  temperature?: number;
}

export interface WorkoutExerciseData {
  exerciseId?: string;
  exerciseName: string;
  category: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  targetDuration?: number;
  targetRest?: number;
}

export interface WorkoutRecordData {
  setNumber: number;
  targetReps: number;
  actualReps: number;
  targetWeight?: number;
  actualWeight?: number;
  targetDuration?: number;
  actualDuration?: number;
  restTime?: number;
  rpe?: number;
  form?: number;
  difficulty?: number;
  notes?: string;
}

export class WorkoutSessionManager {
  async createSession(data: WorkoutSessionData) {
    const span = traceWorkoutSession(data.userId, 'new', 'create');
    
    try {
      const session = await prisma.workoutSession.create({
        data: {
          userId: data.userId,
          planId: data.planId,
          sessionName: data.sessionName,
          location: data.location,
          weather: data.weather,
          temperature: data.temperature,
          status: 'draft',
          isActive: false,
        },
      });

      businessMetrics.workoutSessions.add(1, {
        'user.id': data.userId,
        'session.status': 'created',
      });

      span.setStatus({ code: 1, message: 'Session created successfully' });
      span.end();
      
      return session;
    } catch (error) {
      span.setStatus({ code: 2, message: 'Failed to create session' });
      span.end();
      throw error;
    }
  }

  async startSession(sessionId: string, userId: string) {
    const span = traceWorkoutSession(userId, sessionId, 'start');
    
    try {
      const session = await prisma.workoutSession.update({
        where: { 
          id: sessionId,
          userId: userId, // Ensure user owns the session
        },
        data: {
          status: 'active',
          isActive: true,
          startedAt: new Date(),
        },
      });

      businessMetrics.workoutSessions.add(1, {
        'user.id': userId,
        'session.status': 'started',
      });

      span.setStatus({ code: 1, message: 'Session started successfully' });
      span.end();
      
      return session;
    } catch (error) {
      span.setStatus({ code: 2, message: 'Failed to start session' });
      span.end();
      throw error;
    }
  }

  async pauseSession(sessionId: string, userId: string) {
    const span = traceWorkoutSession(userId, sessionId, 'pause');
    
    try {
      const session = await prisma.workoutSession.update({
        where: { 
          id: sessionId,
          userId: userId,
        },
        data: {
          status: 'paused',
          isActive: false,
          pausedAt: new Date(),
        },
      });

      businessMetrics.workoutSessions.add(1, {
        'user.id': userId,
        'session.status': 'paused',
      });

      span.setStatus({ code: 1, message: 'Session paused successfully' });
      span.end();
      
      return session;
    } catch (error) {
      span.setStatus({ code: 2, message: 'Failed to pause session' });
      span.end();
      throw error;
    }
  }

  async resumeSession(sessionId: string, userId: string) {
    const span = traceWorkoutSession(userId, sessionId, 'resume');
    
    try {
      const session = await prisma.workoutSession.update({
        where: { 
          id: sessionId,
          userId: userId,
        },
        data: {
          status: 'active',
          isActive: true,
          pausedAt: null,
        },
      });

      businessMetrics.workoutSessions.add(1, {
        'user.id': userId,
        'session.status': 'resumed',
      });

      span.setStatus({ code: 1, message: 'Session resumed successfully' });
      span.end();
      
      return session;
    } catch (error) {
      span.setStatus({ code: 2, message: 'Failed to resume session' });
      span.end();
      throw error;
    }
  }

  async completeSession(sessionId: string, userId: string, sessionData: {
    notes?: string;
    overallRating?: number;
    difficulty?: number;
    energy?: number;
    motivation?: number;
  }) {
    const span = traceWorkoutSession(userId, sessionId, 'complete');
    
    try {
      const session = await prisma.workoutSession.update({
        where: { 
          id: sessionId,
          userId: userId,
        },
        data: {
          status: 'completed',
          isActive: false,
          completedAt: new Date(),
          notes: sessionData.notes,
          overallRating: sessionData.overallRating,
          difficulty: sessionData.difficulty,
          energy: sessionData.energy,
          motivation: sessionData.motivation,
        },
      });

      // Calculate total duration
      if (session.startedAt && session.completedAt) {
        const duration = Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / (1000 * 60));
        await prisma.workoutSession.update({
          where: { id: sessionId },
          data: { totalDuration: duration },
        });

        businessMetrics.sessionDuration.record(duration, {
          'user.id': userId,
        });
      }

      businessMetrics.sessionCompletion.add(1, {
        'user.id': userId,
        'session.rating': sessionData.overallRating?.toString() || '0',
      });

      if (sessionData.overallRating) {
        businessMetrics.sessionRating.record(sessionData.overallRating, {
          'user.id': userId,
        });
      }

      span.setStatus({ code: 1, message: 'Session completed successfully' });
      span.end();
      
      return session;
    } catch (error) {
      span.setStatus({ code: 2, message: 'Failed to complete session' });
      span.end();
      throw error;
    }
  }

  async addExerciseToSession(sessionId: string, userId: string, exerciseData: WorkoutExerciseData) {
    const span = traceWorkoutSession(userId, sessionId, 'add_exercise');
    
    try {
      // Verify session belongs to user and is active
      const session = await prisma.workoutSession.findFirst({
        where: { 
          id: sessionId,
          userId: userId,
        },
      });

      if (!session) {
        throw new Error('Session not found or access denied');
      }

      const exercise = await prisma.workoutExercise.create({
        data: {
          sessionId: sessionId,
          exerciseId: exerciseData.exerciseId,
          exerciseName: exerciseData.exerciseName,
          category: exerciseData.category,
          order: exerciseData.order,
          targetSets: exerciseData.targetSets,
          targetReps: exerciseData.targetReps,
          targetWeight: exerciseData.targetWeight,
          targetDuration: exerciseData.targetDuration,
          targetRest: exerciseData.targetRest,
        },
      });

      span.setStatus({ code: 1, message: 'Exercise added successfully' });
      span.end();
      
      return exercise;
    } catch (error) {
      span.setStatus({ code: 2, message: 'Failed to add exercise' });
      span.end();
      throw error;
    }
  }

  async addRecordToExercise(exerciseId: string, userId: string, recordData: WorkoutRecordData) {
    const span = traceWorkoutRecord(userId, 'exercise', 'add_record');
    
    try {
      // Verify exercise belongs to user's session
      const exercise = await prisma.workoutExercise.findFirst({
        where: { 
          id: exerciseId,
          session: { userId: userId },
        },
        include: { session: true },
      });

      if (!exercise) {
        throw new Error('Exercise not found or access denied');
      }

      const record = await prisma.workoutRecord.create({
        data: {
          sessionId: exercise.sessionId,
          exerciseId: exerciseId,
          setNumber: recordData.setNumber,
          targetReps: recordData.targetReps,
          actualReps: recordData.actualReps,
          targetWeight: recordData.targetWeight,
          actualWeight: recordData.actualWeight,
          targetDuration: recordData.targetDuration,
          actualDuration: recordData.actualDuration,
          restTime: recordData.restTime,
          rpe: recordData.rpe,
          form: recordData.form,
          difficulty: recordData.difficulty,
          notes: recordData.notes,
          startedAt: new Date(),
          completedAt: new Date(),
          isCompleted: true,
        },
      });

      // Update exercise totals
      await this.updateExerciseTotals(exerciseId);

      businessMetrics.workoutRecords.add(1, {
        'user.id': userId,
        'exercise.name': exercise.exerciseName,
      });

      // Calculate accuracy if target values exist
      if (recordData.targetReps && recordData.actualReps) {
        const accuracy = (recordData.actualReps / recordData.targetReps) * 100;
        businessMetrics.recordAccuracy.record(accuracy, {
          'user.id': userId,
          'exercise.name': exercise.exerciseName,
        });
      }

      span.setStatus({ code: 1, message: 'Record added successfully' });
      span.end();
      
      return record;
    } catch (error) {
      span.setStatus({ code: 2, message: 'Failed to add record' });
      span.end();
      throw error;
    }
  }

  private async updateExerciseTotals(exerciseId: string) {
    const exercise = await prisma.workoutExercise.findUnique({
      where: { id: exerciseId },
      include: { records: true },
    });

    if (!exercise) return;

    const records = exercise.records;
    const actualSets = records.length;
    const actualReps = records.reduce((sum, record) => sum + record.actualReps, 0);
    const actualWeight = records.length > 0 ? records.reduce((sum, record) => sum + (record.actualWeight || 0), 0) / records.length : null;
    const totalVolume = actualWeight ? actualWeight * actualReps : null;
    const rpeValues = records.filter(r => r.rpe).map(r => r.rpe!);
    const averageRPE = rpeValues.length > 0 ? rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length : null;
    const maxRPE = rpeValues.length > 0 ? Math.max(...rpeValues) : null;
    const minRPE = rpeValues.length > 0 ? Math.min(...rpeValues) : null;
    const isCompleted = actualSets >= exercise.targetSets;

    await prisma.workoutExercise.update({
      where: { id: exerciseId },
      data: {
        actualSets,
        actualReps,
        actualWeight,
        totalVolume,
        averageRPE,
        maxRPE,
        minRPE,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });
  }

  async getSessionHistory(userId: string, limit: number = 20, offset: number = 0) {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      include: {
        exercises: {
          include: {
            records: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return sessions;
  }

  async getSessionById(sessionId: string, userId: string) {
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
          orderBy: { order: 'asc' },
        },
      },
    });

    return session;
  }

  async getActiveSession(userId: string) {
    const session = await prisma.workoutSession.findFirst({
      where: { 
        userId: userId,
        isActive: true,
      },
      include: {
        exercises: {
          include: {
            records: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return session;
  }
}


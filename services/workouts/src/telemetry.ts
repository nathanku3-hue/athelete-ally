import { initTelemetry, createBusinessSpan, createBusinessMetrics } from '@athlete-ally/otel-preset';

// Initialize telemetry with preset
const telemetry = initTelemetry({
  serviceName: 'workouts-service',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  instanceId: process.env.HOSTNAME || 'workouts-service-1',
  enabled: process.env.TELEMETRY_ENABLED === 'true',
  exporters: {
    jaeger: {
      endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
    },
    prometheus: {
      port: parseInt(process.env.PROMETHEUS_METRICS_PORT || '9469'),
      endpoint: process.env.PROMETHEUS_METRICS_ENDPOINT || '/metrics',
    },
  },
  instrumentations: {
    fs: false,
    http: true,
    express: true,
    fastify: false,
  },
});

// Extract tracer and meter from telemetry instance
const tracer = telemetry.tracer;
const meter = telemetry.meter;

// Create business metrics using preset helper
const baseMetrics = createBusinessMetrics(meter, 'workouts');

// 业务指标定义
export const businessMetrics = {
  // Base API metrics from preset
  ...baseMetrics,
  
  // 训练会话相关指标
  workoutSessions: meter.createCounter('workouts_workout_sessions_total', {
    description: 'Total number of workout sessions',
  }),
  sessionDuration: meter.createHistogram('workouts_workout_session_duration_minutes', {
    description: 'Workout session duration in minutes',
    unit: 'minutes',
  }),
  sessionCompletion: meter.createCounter('workouts_workout_sessions_completed_total', {
    description: 'Number of completed workout sessions',
  }),
  
  // 训练记录相关指标
  workoutRecords: meter.createCounter('workouts_workout_records_total', {
    description: 'Total number of workout records',
  }),
  recordAccuracy: meter.createHistogram('workouts_workout_record_accuracy', {
    description: 'Accuracy of recorded vs target values',
    unit: 'percentage',
  }),
  
  // 个人记录相关指标
  personalRecords: meter.createCounter('workouts_personal_records_total', {
    description: 'Total number of personal records set',
  }),
  recordTypes: meter.createCounter('workouts_personal_record_types_total', {
    description: 'Personal records by type',
  }),
  
  // 用户参与度指标
  userEngagement: meter.createHistogram('workouts_user_workout_frequency', {
    description: 'User workout frequency per week',
    unit: 'workouts_per_week',
  }),
  sessionRating: meter.createHistogram('workouts_workout_session_rating', {
    description: 'User rating of workout sessions',
    unit: '1-5',
  }),
};

// Use preset business span helper
export const createWorkoutSpan = (name: string, attributes: Record<string, any> = {}) => {
  return createBusinessSpan(tracer, name, attributes);
};

// 创建训练会话追踪
export const traceWorkoutSession = (userId: string, sessionId: string, action: string) => {
  return createWorkoutSpan('workout_session', {
    'user.id': userId,
    'session.id': sessionId,
    'session.action': action,
  });
};

// 创建训练记录追踪
export const traceWorkoutRecord = (userId: string, exerciseName: string, recordType: string) => {
  return createWorkoutSpan('workout_record', {
    'user.id': userId,
    'exercise.name': exerciseName,
    'record.type': recordType,
  });
};

// 创建个人记录追踪
export const tracePersonalRecord = (userId: string, exerciseName: string, recordType: string, value: number) => {
  return createWorkoutSpan('personal_record', {
    'user.id': userId,
    'exercise.name': exerciseName,
    'record.type': recordType,
    'record.value': value,
  });
};

// 创建目标追踪
export const traceWorkoutGoal = (userId: string, goalType: string, progress: number) => {
  return createWorkoutSpan('workout_goal', {
    'user.id': userId,
    'goal.type': goalType,
    'goal.progress': progress,
  });
};

// Export telemetry instance and components
export { telemetry, tracer, meter };
export { telemetry as sdk }; // Backward compatibility


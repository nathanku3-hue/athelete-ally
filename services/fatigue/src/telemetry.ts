import { initTelemetry, createBusinessSpan, createBusinessMetrics } from '@athlete-ally/otel-preset';

// Initialize telemetry with preset
const telemetry = initTelemetry({
  serviceName: 'fatigue-service',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  instanceId: process.env.HOSTNAME || 'fatigue-service-1',
  enabled: process.env.TELEMETRY_ENABLED === 'true',
  exporters: {
    jaeger: {
      endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
    },
    prometheus: {
      port: parseInt(process.env.PROMETHEUS_METRICS_PORT || '9468'),
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
const baseMetrics = createBusinessMetrics(meter, 'fatigue');

// 业务指标定义
export const businessMetrics = {
  // Base API metrics from preset
  ...baseMetrics,
  
  // 疲劳评估相关指标
  fatigueAssessments: meter.createCounter('fatigue_fatigue_assessments_total', {
    description: 'Total number of fatigue assessments',
  }),
  averageFatigueLevel: meter.createHistogram('fatigue_fatigue_level_average', {
    description: 'Average fatigue level distribution',
    unit: '1-5',
  }),
  
  // 训练调整相关指标
  trainingAdjustments: meter.createCounter('fatigue_training_adjustments_total', {
    description: 'Total number of training adjustments',
  }),
  adjustmentSuccess: meter.createCounter('fatigue_adjustment_success_total', {
    description: 'Number of successful adjustments',
  }),
  adjustmentRejection: meter.createCounter('fatigue_adjustment_rejection_total', {
    description: 'Number of rejected adjustments',
  }),
  
  // 用户满意度指标
  userSatisfaction: meter.createHistogram('fatigue_user_satisfaction_score', {
    description: 'User satisfaction with adjustments',
    unit: '1-5',
  }),
};

// Use preset business span helper
export const createFatigueSpan = (name: string, attributes: Record<string, any> = {}) => {
  return createBusinessSpan(tracer, name, attributes);
};

// 创建疲劳评估追踪
export const traceFatigueAssessment = (userId: string, fatigueLevel: number, assessmentType: string) => {
  return createFatigueSpan('fatigue_assessment', {
    'user.id': userId,
    'fatigue.level': fatigueLevel,
    'assessment.type': assessmentType,
  });
};

// 创建训练调整追踪
export const traceTrainingAdjustment = (userId: string, adjustmentType: string, confidence: number) => {
  return createFatigueSpan('training_adjustment', {
    'user.id': userId,
    'adjustment.type': adjustmentType,
    'adjustment.confidence': confidence,
  });
};

// 创建用户反馈追踪
export const traceUserFeedback = (userId: string, satisfactionScore: number, adjustmentId: string) => {
  return createFatigueSpan('user_feedback', {
    'user.id': userId,
    'feedback.satisfaction': satisfactionScore,
    'adjustment.id': adjustmentId,
  });
};

// Export telemetry instance and components
export { telemetry, tracer, meter };
export { telemetry as sdk }; // Backward compatibility


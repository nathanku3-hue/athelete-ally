// 引导流程追踪工具
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

// 创建引导流程追踪器
const tracer = trace.getTracer('onboarding-flow', '1.0.0');

export interface OnboardingStepData {
  step: number;
  stepName: string;
  userId?: string;
  data?: any;
  timestamp: number;
  duration?: number;
}

export interface OnboardingError {
  step: number;
  stepName: string;
  error: string;
  userId?: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
}

// 步骤名称映射
export const STEP_NAMES = {
  1: 'purpose_selection',
  2: 'proficiency_assessment', 
  3: 'season_goals',
  4: 'availability_setup',
  5: 'equipment_selection',
  6: 'summary_submit'
} as const;

// 创建引导流程根Span
export function createOnboardingSpan(userId: string, sessionId: string) {
  return tracer.startSpan('onboarding_flow', {
    attributes: {
      'onboarding.user_id': userId,
      'onboarding.session_id': sessionId,
      'onboarding.start_time': Date.now(),
    },
  });
}

// 追踪步骤开始
export function traceStepStart(step: number, userId?: string, data?: any) {
  const stepName = STEP_NAMES[step as keyof typeof STEP_NAMES] || `step_${step}`;
  
  const span = tracer.startSpan(`onboarding_step_${stepName}`, {
    attributes: {
      'onboarding.step': step,
      'onboarding.step_name': stepName,
      'onboarding.user_id': userId || 'anonymous',
      'onboarding.step_start_time': Date.now(),
      'onboarding.user_agent': navigator.userAgent,
      'onboarding.url': window.location.href,
    },
  });

  // 添加步骤数据
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        span.setAttribute(`onboarding.data.${key}`, String(value));
      }
    });
  }

  return span;
}

// 追踪步骤完成
export function traceStepComplete(span: any, step: number, userId?: string, data?: any) {
  const stepName = STEP_NAMES[step as keyof typeof STEP_NAMES] || `step_${step}`;
  const duration = Date.now() - (span.startTime?.[0] || Date.now());
  
  span.setAttributes({
    'onboarding.step_complete_time': Date.now(),
    'onboarding.step_duration_ms': duration,
    'onboarding.step_status': 'completed',
  });

  // 添加完成时的数据
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        span.setAttribute(`onboarding.completion_data.${key}`, String(value));
      }
    });
  }

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}

// 追踪步骤错误
export function traceStepError(span: any, step: number, error: string, userId?: string) {
  const stepName = STEP_NAMES[step as keyof typeof STEP_NAMES] || `step_${step}`;
  
  span.setAttributes({
    'onboarding.step_error_time': Date.now(),
    'onboarding.step_status': 'error',
    'onboarding.error_message': error,
  });

  span.setStatus({ 
    code: SpanStatusCode.ERROR, 
    message: error 
  });
  span.end();

  // 发送错误事件到分析系统
  sendErrorEvent({
    step,
    stepName,
    error,
    userId,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  });
}

// 追踪步骤跳过
export function traceStepSkip(span: any, step: number, reason: string, userId?: string) {
  const stepName = STEP_NAMES[step as keyof typeof STEP_NAMES] || `step_${step}`;
  
  span.setAttributes({
    'onboarding.step_skip_time': Date.now(),
    'onboarding.step_status': 'skipped',
    'onboarding.skip_reason': reason,
  });

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}

// 追踪页面加载时间
export function tracePageLoad(step: number, userId?: string) {
  const stepName = STEP_NAMES[step as keyof typeof STEP_NAMES] || `step_${step}`;
  
  const span = tracer.startSpan(`onboarding_page_load_${stepName}`, {
    attributes: {
      'onboarding.step': step,
      'onboarding.step_name': stepName,
      'onboarding.user_id': userId || 'anonymous',
      'onboarding.page_load_start': Date.now(),
    },
  });

  // 监听页面加载完成
  window.addEventListener('load', () => {
    const loadTime = Date.now() - Date.now(); // Simplified for now
    span.setAttributes({
      'onboarding.page_load_duration_ms': loadTime,
      'onboarding.page_load_complete': Date.now(),
    });
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
  });

  return span;
}

// 追踪API调用
export function traceApiCall(apiName: string, userId?: string) {
  return tracer.startSpan(`onboarding_api_${apiName}`, {
    attributes: {
      'onboarding.api_name': apiName,
      'onboarding.user_id': userId || 'anonymous',
      'onboarding.api_start_time': Date.now(),
    },
  });
}

// 追踪用户行为
export function traceUserAction(action: string, step: number, userId?: string, data?: any) {
  const span = tracer.startSpan(`onboarding_user_action_${action}`, {
    attributes: {
      'onboarding.action': action,
      'onboarding.step': step,
      'onboarding.user_id': userId || 'anonymous',
      'onboarding.action_time': Date.now(),
    },
  });

  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        span.setAttribute(`onboarding.action_data.${key}`, String(value));
      }
    });
  }

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}

// 发送错误事件到分析系统
async function sendErrorEvent(error: OnboardingError) {
  try {
    await fetch('/api/v1/onboarding/error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(error),
    });
  } catch (err) {
    console.error('Failed to send error event:', err);
  }
}

// 发送步骤完成事件到分析系统
export async function sendStepEvent(stepData: OnboardingStepData) {
  try {
    await fetch('/api/v1/onboarding/step', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stepData),
    });
  } catch (err) {
    console.error('Failed to send step event:', err);
  }
}

// 追踪引导流程完成
export function traceOnboardingComplete(span: any, userId: string, totalDuration: number, data?: any) {
  span.setAttributes({
    'onboarding.complete_time': Date.now(),
    'onboarding.total_duration_ms': totalDuration,
    'onboarding.status': 'completed',
  });

  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        span.setAttribute(`onboarding.final_data.${key}`, String(value));
      }
    });
  }

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}

// 追踪引导流程放弃
export function traceOnboardingAbandoned(span: any, userId: string, lastStep: number, reason?: string) {
  span.setAttributes({
    'onboarding.abandon_time': Date.now(),
    'onboarding.last_step': lastStep,
    'onboarding.status': 'abandoned',
    'onboarding.abandon_reason': reason || 'unknown',
  });

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}


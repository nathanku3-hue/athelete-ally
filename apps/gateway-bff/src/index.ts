// Initialize OpenTelemetry first
import './telemetry.js';
import 'dotenv/config';

// 添加全局异常处理器
process.on('uncaughtException', (err, origin) => {
  console.error(`🚨 Uncaught Exception: ${err.message}`, `Origin: ${origin}`);
  console.error('Stack trace:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});
import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { z } from 'zod';
import fetch from 'node-fetch';
import { config } from './config.js';
import { businessMetrics, traceOnboardingStep, tracePlanGeneration, traceApiRequest } from './telemetry.js';
// 暂时注释掉shared包导入，使用本地实现
// import { authMiddleware, ownershipCheckMiddleware, cleanupMiddleware } from '@athlete-ally/shared';
// import { SecureIdGenerator } from '@athlete-ally/shared';

// 本地安全实现
import { randomUUID } from 'crypto';

class SecureIdGenerator {
  static generateJobId(): string {
    return `job_${randomUUID()}`;
  }
  static generatePlanId(): string {
    return `plan_${randomUUID()}`;
  }
}

// 简化的身份验证中间件
async function authMiddleware(request: any, reply: any) {
  // 暂时跳过身份验证（开发环境）
  (request as any).user = { userId: 'dev-user-id' };
}

async function cleanupMiddleware(request: any, reply: any) {
  // 清理逻辑
}
// 简化的 CORS 配置
const corsConfig = {
  origin: true, // 允许所有来源（开发环境）
  credentials: true
};

// 简化的中间件（开发环境）
const rateLimitMiddleware = async () => {};
const metricsMiddleware = async () => {};

const server = Fastify({ logger: true });

// 简化的指标注册（开发环境）
const metricsRegistry = { metrics: () => '# No metrics available in development mode' };

// 使用简化的CORS配置

// 注册CORS插件（开发环境简化配置）
server.register(cors, corsConfig);

// 注册全局中间件
server.addHook('onRequest', metricsMiddleware);
server.addHook('onRequest', rateLimitMiddleware);
server.addHook('onRequest', authMiddleware);
server.addHook('onSend', cleanupMiddleware);

// Swagger configuration
server.register(swagger, {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'Athlete Ally API',
      version: '0.1.0',
      description: 'API for athlete strength & conditioning coaching app'
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Development server' }
    ]
  }
});

server.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
});

// root welcome route
server.get('/', async () => ({ message: 'Welcome to the API!' }));

// 健康检查端点已移至下方，提供更详细的状态信息
// serve contracts for reference
server.get('/contracts/openapi.yaml', async (_req, reply) => {
  const fs = await import('fs');
  const path = await import('path');
  const p = path.resolve(process.cwd(), 'packages/contracts/openapi.yaml');
  const content = fs.readFileSync(p, 'utf8');
  reply.type('text/yaml').send(content);
});

// simple Redoc docs page
server.get('/documentation', async (_req, reply) => {
  const html = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>API Docs</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>body{margin:0;padding:0;} .redoc-wrap{height:100vh;}</style>
    </head>
    <body>
      <redoc spec-url="/contracts/openapi.yaml"></redoc>
      <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
    </body>
  </html>`;
  reply.type('text/html').send(html);
});

const OnboardingPayload = z.object({
  userId: z.string(),
  purpose: z.string().optional(),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  season: z.enum(['offseason', 'preseason', 'inseason']).optional(),
  availabilityDays: z.number().int().min(1).max(7).optional(),
  weeklyGoalDays: z.number().int().min(1).max(7).optional(),
  equipment: z.array(z.string()).optional(),
  fixedSchedules: z
    .array(
      z.object({ day: z.string(), start: z.string(), end: z.string() })
    )
    .optional(),
});

server.post('/v1/onboarding', {
  schema: {
    description: 'Submit onboarding profile data',
    tags: ['onboarding'],
    body: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string' },
        purpose: { type: 'string' },
        proficiency: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
        season: { type: 'string', enum: ['offseason', 'preseason', 'inseason'] },
        availabilityDays: { type: 'number', minimum: 1, maximum: 7 },
        equipment: { type: 'array', items: { type: 'string' } },
        fixedSchedules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              day: { type: 'string' },
              start: { type: 'string' },
              end: { type: 'string' }
            }
          }
        }
      }
    },
    response: {
      202: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
          status: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  
  // 从JWT token获取用户身份，而不是从请求体
  const user = (request as any).user;
  const userId = user.userId;
  
  const span = traceApiRequest('POST', '/v1/onboarding', userId);
  
  try {
    // 记录业务指标
    businessMetrics.onboardingRequests.add(1, {
      'user.id': userId,
      'onboarding.purpose': (request.body as any)?.purpose || 'unknown',
    });

    const parsed = OnboardingPayload.safeParse(request.body);
    if (!parsed.success) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'validation_error' });
      span.setStatus({ code: 2, message: 'Validation failed' });
      span.end();
      return reply.code(400).send({ error: 'invalid_payload' });
    }

    // 安全验证：确保请求体中的userId与JWT token中的userId一致
    if (parsed.data.userId !== userId) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'security_violation' });
      span.setStatus({ code: 2, message: 'User ID mismatch' });
      span.end();
      return reply.code(403).send({ 
        error: 'forbidden', 
        message: 'User ID in request body does not match authenticated user' 
      });
    }

    // 追踪用户引导步骤
    const onboardingSpan = traceOnboardingStep('onboarding_submission', parsed.data.userId, {
      purpose: parsed.data.purpose,
      proficiency: parsed.data.proficiency,
      season: parsed.data.season,
      equipmentCount: parsed.data.equipment?.length || 0,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch(`${config.PROFILE_ONBOARDING_URL}/v1/onboarding`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(parsed.data),
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    let body: unknown = null;
    
    try {
      body = await res.json();
    } catch {
      body = { error: { code: 'UPSTREAM_INVALID_JSON', message: 'invalid upstream json' } };
    }

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/v1/onboarding',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, { 
        'error.type': 'upstream_error',
        'http.status_code': res.status.toString(),
      });
      
      const mapped = res.status === 400
        ? { code: 'UPSTREAM_BAD_REQUEST', http: 400 }
        : res.status >= 500
        ? { code: 'UPSTREAM_ERROR', http: 502 }
        : { code: 'UPSTREAM_ERROR', http: 502 };
      
      span.setStatus({ code: 2, message: 'Upstream error' });
      onboardingSpan.setStatus({ code: 2, message: 'Upstream error' });
      onboardingSpan.end();
      span.end();
      return reply.code(mapped.http).send({ error: { code: mapped.code, message: 'Upstream error' } });
    }

    // 成功完成引导
    businessMetrics.onboardingCompletions.add(1, {
      'user.id': parsed.data.userId,
      'onboarding.purpose': parsed.data.purpose || 'unknown',
    });

    onboardingSpan.setStatus({ code: 1, message: 'Onboarding completed successfully' });
    onboardingSpan.end();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    
    return reply.code(res.status).send(body);
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

// Exercises API endpoints
server.get('/v1/exercises', {
  schema: {
    description: 'Search exercises',
    tags: ['exercises'],
    querystring: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        category: { type: 'string' },
        equipment: { type: 'array', items: { type: 'string' } },
        difficulty: { type: 'number', minimum: 1, maximum: 5 },
        muscles: { type: 'array', items: { type: 'string' } },
        limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
        offset: { type: 'number', minimum: 0, default: 0 }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          exercises: { type: 'array' },
          pagination: { type: 'object' }
        }
      }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  const span = traceApiRequest('GET', '/v1/exercises');
  
  try {
    const queryString = new URLSearchParams(request.query as any).toString();
    const res = await fetch(`${config.EXERCISES_URL}/exercises?${queryString}`, {
      method: 'GET',
      headers: { 'content-type': 'application/json' }
    });
    
    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/v1/exercises',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'upstream_error' });
      span.setStatus({ code: 2, message: 'Upstream error' });
      span.end();
      return reply.code(res.status).send({ error: 'Failed to fetch exercises' });
    }

    const data = await res.json();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    return reply.send(data);
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

server.get('/v1/exercises/:id', {
  schema: {
    description: 'Get exercise by ID',
    tags: ['exercises'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    },
    response: {
      200: { type: 'object' },
      404: { type: 'object', properties: { error: { type: 'string' } } }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  const { id } = request.params as { id: string };
  const span = traceApiRequest('GET', `/v1/exercises/${id}`);
  
  try {
    const res = await fetch(`${config.EXERCISES_URL}/exercises/${id}`, {
      method: 'GET',
      headers: { 'content-type': 'application/json' }
    });
    
    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/v1/exercises/:id',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'upstream_error' });
      span.setStatus({ code: 2, message: 'Upstream error' });
      span.end();
      return reply.code(res.status).send({ error: 'Exercise not found' });
    }

    const data = await res.json();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    return reply.send(data);
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

server.post('/v1/exercises/:id/rate', {
  schema: {
    description: 'Rate an exercise',
    tags: ['exercises'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    },
    body: {
      type: 'object',
      required: ['userId', 'rating', 'difficulty'],
      properties: {
        userId: { type: 'string' },
        rating: { type: 'number', minimum: 1, maximum: 5 },
        difficulty: { type: 'number', minimum: 1, maximum: 5 },
        comment: { type: 'string' }
      }
    },
    response: {
      200: { type: 'object' },
      400: { type: 'object', properties: { error: { type: 'string' } } }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  const { id } = request.params as { id: string };
  const span = traceApiRequest('POST', `/v1/exercises/${id}/rate`);
  
  try {
    const res = await fetch(`${config.EXERCISES_URL}/exercises/${id}/rate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request.body)
    });
    
    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/v1/exercises/:id/rate',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'upstream_error' });
      span.setStatus({ code: 2, message: 'Upstream error' });
      span.end();
      return reply.code(res.status).send({ error: 'Failed to rate exercise' });
    }

    const data = await res.json();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    return reply.send(data);
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

server.get('/v1/exercises/categories', {
  schema: {
    description: 'Get exercise categories',
    tags: ['exercises'],
    response: {
      200: {
        type: 'object',
        properties: {
          categories: { type: 'array' }
        }
      }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  const span = traceApiRequest('GET', '/v1/exercises/categories');
  
  try {
    const res = await fetch(`${config.EXERCISES_URL}/categories`, {
      method: 'GET',
      headers: { 'content-type': 'application/json' }
    });
    
    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/v1/exercises/categories',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'upstream_error' });
      span.setStatus({ code: 2, message: 'Upstream error' });
      span.end();
      return reply.code(res.status).send({ error: 'Failed to fetch categories' });
    }

    const data = await res.json();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    return reply.send(data);
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

// Fatigue Management API endpoints
server.post('/v1/fatigue/assess', {
  schema: {
    description: 'Submit fatigue assessment',
    tags: ['fatigue'],
    body: {
      type: 'object',
      required: ['userId', 'overallFatigue', 'physicalFatigue', 'mentalFatigue', 'sleepQuality', 'stressLevel'],
      properties: {
        userId: { type: 'string' },
        sessionId: { type: 'string' },
        overallFatigue: { type: 'number', minimum: 1, maximum: 5 },
        physicalFatigue: { type: 'number', minimum: 1, maximum: 5 },
        mentalFatigue: { type: 'number', minimum: 1, maximum: 5 },
        sleepQuality: { type: 'number', minimum: 1, maximum: 5 },
        stressLevel: { type: 'number', minimum: 1, maximum: 5 },
        notes: { type: 'string' },
        previousWorkout: { type: 'string' },
        timeSinceLastWorkout: { type: 'number' },
        assessmentType: { type: 'string', enum: ['pre_workout', 'post_workout', 'daily'] }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          assessmentId: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  const span = traceApiRequest('POST', '/v1/fatigue/assess');
  
  try {
    const res = await fetch(`${config.FATIGUE_URL}/fatigue/assess`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request.body)
    });
    
    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/v1/fatigue/assess',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'upstream_error' });
      span.setStatus({ code: 2, message: 'Upstream error' });
      span.end();
      return reply.code(res.status).send({ error: 'Failed to submit fatigue assessment' });
    }

    const data = await res.json();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    return reply.send(data);
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

server.post('/v1/fatigue/adjustments', {
  schema: {
    description: 'Get training adjustments based on fatigue',
    tags: ['fatigue'],
    body: {
      type: 'object',
      required: ['userId', 'fatigueData', 'trainingSession'],
      properties: {
        userId: { type: 'string' },
        fatigueData: {
          type: 'object',
          properties: {
            overallFatigue: { type: 'number' },
            physicalFatigue: { type: 'number' },
            mentalFatigue: { type: 'number' },
            sleepQuality: { type: 'number' },
            stressLevel: { type: 'number' },
            timeSinceLastWorkout: { type: 'number' },
            previousWorkout: { type: 'string' }
          }
        },
        trainingSession: {
          type: 'object',
          properties: {
            exercises: { type: 'array' },
            totalDuration: { type: 'number' },
            restBetweenSets: { type: 'number' }
          }
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          adjustments: { type: 'array' },
          summary: { type: 'object' }
        }
      }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  const span = traceApiRequest('POST', '/v1/fatigue/adjustments');
  
  try {
    const res = await fetch(`${config.FATIGUE_URL}/fatigue/adjustments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request.body)
    });
    
    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/v1/fatigue/adjustments',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'upstream_error' });
      span.setStatus({ code: 2, message: 'Upstream error' });
      span.end();
      return reply.code(res.status).send({ error: 'Failed to get adjustments' });
    }

    const data = await res.json();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    return reply.send(data);
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

server.post('/v1/fatigue/feedback', {
  schema: {
    description: 'Submit adjustment feedback',
    tags: ['fatigue'],
    body: {
      type: 'object',
      required: ['adjustmentId', 'satisfactionScore'],
      properties: {
        adjustmentId: { type: 'string' },
        satisfactionScore: { type: 'number', minimum: 1, maximum: 5 },
        feedback: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  const span = traceApiRequest('POST', '/v1/fatigue/feedback');
  
  try {
    const res = await fetch(`${config.FATIGUE_URL}/fatigue/feedback`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request.body)
    });
    
    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/v1/fatigue/feedback',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'upstream_error' });
      span.setStatus({ code: 2, message: 'Upstream error' });
      span.end();
      return reply.code(res.status).send({ error: 'Failed to submit feedback' });
    }

    const data = await res.json();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    return reply.send(data);
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

// Workouts API endpoints
server.post('/v1/workouts/sessions', {
  schema: {
    description: 'Create a new workout session',
    tags: ['workouts'],
    body: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string' },
        planId: { type: 'string' },
        sessionName: { type: 'string' },
        location: { type: 'string' },
        weather: { type: 'string' },
        temperature: { type: 'number' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          session: { type: 'object' }
        }
      }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  const span = traceApiRequest('POST', '/v1/workouts/sessions');
  
  try {
    const res = await fetch(`${config.WORKOUTS_URL}/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request.body)
    });
    
    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/v1/workouts/sessions',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'upstream_error' });
      span.setStatus({ code: 2, message: 'Upstream error' });
      span.end();
      return reply.code(res.status).send({ error: 'Failed to create session' });
    }

    const data = await res.json();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    return reply.send(data);
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

server.post('/v1/workouts/sessions/:id/start', {
  schema: {
    description: 'Start a workout session',
    tags: ['workouts'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    },
    body: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          session: { type: 'object' }
        }
      }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  const { id } = request.params as { id: string };
  const span = traceApiRequest('POST', `/v1/workouts/sessions/${id}/start`);
  
  try {
    const res = await fetch(`${config.WORKOUTS_URL}/sessions/${id}/start`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request.body)
    });
    
    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/v1/workouts/sessions/:id/start',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'upstream_error' });
      span.setStatus({ code: 2, message: 'Upstream error' });
      span.end();
      return reply.code(res.status).send({ error: 'Failed to start session' });
    }

    const data = await res.json();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    return reply.send(data);
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

server.post('/v1/workouts/sessions/:id/complete', {
  schema: {
    description: 'Complete a workout session',
    tags: ['workouts'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    },
    body: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string' },
        notes: { type: 'string' },
        overallRating: { type: 'number', minimum: 1, maximum: 5 },
        difficulty: { type: 'number', minimum: 1, maximum: 5 },
        energy: { type: 'number', minimum: 1, maximum: 5 },
        motivation: { type: 'number', minimum: 1, maximum: 5 }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          session: { type: 'object' },
          newRecords: { type: 'array' }
        }
      }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  const { id } = request.params as { id: string };
  const span = traceApiRequest('POST', `/v1/workouts/sessions/${id}/complete`);
  
  try {
    const res = await fetch(`${config.WORKOUTS_URL}/sessions/${id}/complete`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request.body)
    });
    
    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/v1/workouts/sessions/:id/complete',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'upstream_error' });
      span.setStatus({ code: 2, message: 'Upstream error' });
      span.end();
      return reply.code(res.status).send({ error: 'Failed to complete session' });
    }

    const data = await res.json();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    return reply.send(data);
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

server.get('/v1/workouts/sessions', {
  schema: {
    description: 'Get workout session history',
    tags: ['workouts'],
    querystring: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string' },
        limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
        offset: { type: 'number', minimum: 0, default: 0 }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          sessions: { type: 'array' }
        }
      }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  const span = traceApiRequest('GET', '/v1/workouts/sessions');
  
  try {
    const queryString = new URLSearchParams(request.query as any).toString();
    const res = await fetch(`${config.WORKOUTS_URL}/sessions?${queryString}`, {
      method: 'GET',
      headers: { 'content-type': 'application/json' }
    });
    
    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/v1/workouts/sessions',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'upstream_error' });
      span.setStatus({ code: 2, message: 'Upstream error' });
      span.end();
      return reply.code(res.status).send({ error: 'Failed to get sessions' });
    }

    const data = await res.json();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    return reply.send(data);
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

server.get('/v1/workouts/sessions/active/:userId', {
  schema: {
    description: 'Get active workout session',
    tags: ['workouts'],
    params: {
      type: 'object',
      properties: {
        userId: { type: 'string' }
      },
      required: ['userId']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          session: { type: 'object' }
        }
      }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  const { userId } = request.params as { userId: string };
  const span = traceApiRequest('GET', `/v1/workouts/sessions/active/${userId}`);
  
  try {
    const res = await fetch(`${config.WORKOUTS_URL}/sessions/active/${userId}`, {
      method: 'GET',
      headers: { 'content-type': 'application/json' }
    });
    
    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/v1/workouts/sessions/active/:userId',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'upstream_error' });
      span.setStatus({ code: 2, message: 'Upstream error' });
      span.end();
      return reply.code(res.status).send({ error: 'Failed to get active session' });
    }

    const data = await res.json();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    return reply.send(data);
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

server.post('/v1/plans/generate', {
  schema: {
    description: 'Trigger plan generation',
    tags: ['plans'],
    body: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string' },
        seedPlanId: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          planId: { type: 'string' },
          version: { type: 'number' },
          status: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  const span = traceApiRequest('POST', '/v1/plans/generate', (request.body as any)?.userId);
  
  try {
    // 记录业务指标
    businessMetrics.planGenerationRequests.add(1, {
      'user.id': (request.body as any)?.userId || 'unknown',
    });

    // 追踪计划生成
    const planSpan = tracePlanGeneration((request.body as any)?.userId, request.body);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch(`${config.PLANNING_ENGINE_URL}/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request.body),
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    let body: unknown = null;
    
    try {
      body = await res.json();
    } catch {
      body = { error: { code: 'UPSTREAM_INVALID_JSON', message: 'invalid upstream json' } };
    }

    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'POST',
      'http.path': '/v1/plans/generate',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.planGenerationFailures.add(1, {
        'user.id': (request.body as any)?.userId || 'unknown',
        'error.type': 'upstream_error',
        'http.status_code': res.status.toString(),
      });
      
      businessMetrics.apiErrors.add(1, { 
        'error.type': 'upstream_error',
        'http.status_code': res.status.toString(),
      });
      
      const mapped = res.status === 400
        ? { code: 'UPSTREAM_BAD_REQUEST', http: 400 }
        : res.status >= 500
        ? { code: 'UPSTREAM_ERROR', http: 502 }
        : { code: 'UPSTREAM_ERROR', http: 502 };
      
      span.setStatus({ code: 2, message: 'Upstream error' });
      planSpan.setStatus({ code: 2, message: 'Plan generation failed' });
      planSpan.end();
      span.end();
      return reply.code(mapped.http).send({ error: { code: mapped.code, message: 'Upstream error' } });
    }

    // 成功生成计划
    businessMetrics.planGenerationSuccess.add(1, {
      'user.id': (request.body as any)?.userId || 'unknown',
    });
    
    businessMetrics.planGenerationDuration.record(responseTime, {
      'user.id': (request.body as any)?.userId || 'unknown',
      'plan.status': 'success',
    });

    planSpan.setStatus({ code: 1, message: 'Plan generated successfully' });
    planSpan.end();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    
    return reply.code(res.status).send(body);
  } catch (error) {
    businessMetrics.planGenerationFailures.add(1, {
      'user.id': (request.body as any)?.userId || 'unknown',
      'error.type': 'internal_error',
    });
    
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

// 查询计划生成状态
server.get('/v1/plans/status', {
  schema: {
    description: 'Get plan generation status',
    tags: ['plans'],
    querystring: {
      type: 'object',
      required: ['jobId'],
      properties: {
        jobId: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
          status: { type: 'string' },
          planId: { type: 'string' },
          message: { type: 'string' }
        }
      },
      404: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const startTime = Date.now();
  const { jobId } = request.query as { jobId: string };
  const span = traceApiRequest('GET', `/v1/plans/status?jobId=${jobId}`);
  
  try {
    const res = await fetch(`${config.PLANNING_ENGINE_URL}/status/${jobId}`, {
      method: 'GET',
      headers: { 'content-type': 'application/json' }
    });
    
    const responseTime = (Date.now() - startTime) / 1000;
    businessMetrics.apiResponseTime.record(responseTime, {
      'http.method': 'GET',
      'http.path': '/v1/plans/status',
      'http.status_code': res.status.toString(),
    });

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, { 'error.type': 'upstream_error' });
      span.setStatus({ code: 2, message: 'Upstream error' });
      span.end();
      return reply.code(res.status).send({ error: 'Failed to get plan status' });
    }

    const data = await res.json();
    span.setStatus({ code: 1, message: 'Success' });
    span.end();
    return reply.send(data);
  } catch (error) {
    businessMetrics.apiErrors.add(1, { 'error.type': 'internal_error' });
    span.setStatus({ code: 2, message: 'Internal error' });
    span.end();
    throw error;
  }
});

// 添加 Prometheus 指标端点
server.get('/metrics', async (request, reply) => {
  reply.type('text/plain');
  return metricsRegistry.metrics();
});

// 添加健康检查端点
server.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  };
});

const port = Number(config.PORT || 4000);
server
  .listen(port, '0.0.0.0')
  .then(() => {
    console.log(`gateway-bff listening on :${port}`);
    console.log(`Server successfully started on port ${port}`);
    
    // 检查Fastify内部状态
    console.log('🔍 Fastify Internal State:');
    console.log('  - Is server ready?', server.ready);
    console.log('  - Is underlying server listening?', server.server.listening);
    console.log('  - Server address:', server.server.address());
    
    const address = server.server.address();
    if (address && typeof address === 'object') {
      console.log(`Server is listening on: http://${address.address}:${address.port}`);
    } else {
      console.log(`Server is listening on: http://localhost:${config.PORT}`);
    }
    
    // 验证端口是否真的在监听
    import('net').then((net) => {
      const testSocket = new net.Socket();
      testSocket.connect(port, '127.0.0.1', () => {
        console.log(`✅ Port ${port} is accessible`);
        testSocket.destroy();
      });
      testSocket.on('error', (err) => {
        console.log(`❌ Port ${port} is NOT accessible:`, err.message);
      });
    });
  })
  .catch((err) => {
    console.error('Server failed to start:', err);
    console.error('Error details:', {
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      address: err.address,
      port: err.port
    });
    process.exit(1);
  });




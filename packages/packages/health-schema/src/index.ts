import { readFileSync } from 'fs';
import { join } from 'path';

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthResponse {
  ok: boolean;
  status: HealthStatus;
  sha: string;
  buildId: string;
  service: string;
  uptimeSec: number;
  timestamp: string;
  version?: string;
  environment?: string;
}

export interface HealthCheckOptions {
  serviceName: string;
  version?: string;
  environment?: string;
  buildInfoPath?: string;
}

/**
 * Read build information from file or environment
 */
function readBuildInfo(buildInfoPath?: string): { sha: string; buildId: string } {
  // Consistent SHA resolution from multiple env sources
  const defaultSha = process.env.GITHUB_SHA || 
    process.env.VERCEL_GIT_COMMIT_SHA || 
    process.env.GIT_SHA || 
    process.env.COMMIT_SHA || 
    'unknown';
    
  // Consistent Build ID resolution from multiple env sources
  const defaultBuildId = process.env.NEXT_BUILD_ID || 
    process.env.BUILD_ID || 
    process.env.BUILD_NUMBER || 
    'unknown';

  if (!buildInfoPath) {
    return { sha: defaultSha, buildId: defaultBuildId };
  }

  try {
    const buildInfo = JSON.parse(readFileSync(buildInfoPath, 'utf8'));
    return {
      sha: buildInfo.sha || defaultSha,
      buildId: buildInfo.buildId || defaultBuildId,
    };
  } catch (error) {
    // Console warning removed - use proper logger instead
    return { sha: defaultSha, buildId: defaultBuildId };
  }
}

/**
 * Create a standardized health response
 */
export function createHealthResponse(options: HealthCheckOptions): HealthResponse {
  const {
    serviceName,
    version = '1.0.0',
    environment = process.env.NODE_ENV || 'development',
    buildInfoPath,
  } = options;

  const { sha, buildId } = readBuildInfo(buildInfoPath);
  const uptimeSec = Math.floor(process.uptime());

  return {
    ok: true,
    status: 'healthy',
    sha,
    buildId,
    service: serviceName,
    uptimeSec,
    timestamp: new Date().toISOString(),
    version,
    environment,
  };
}

/**
 * Create a degraded health response
 */
export function createDegradedHealthResponse(options: HealthCheckOptions, reason?: string): HealthResponse {
  const response = createHealthResponse(options);
  return {
    ...response,
    ok: false,
    status: 'degraded',
    ...(reason && { reason }),
  };
}

/**
 * Create an unhealthy health response
 */
export function createUnhealthyHealthResponse(options: HealthCheckOptions, reason?: string): HealthResponse {
  const response = createHealthResponse(options);
  return {
    ...response,
    ok: false,
    status: 'unhealthy',
    ...(reason && { reason }),
  };
}

/**
 * Express.js health endpoint handler
 */
export function createExpressHealthHandler(options: HealthCheckOptions) {
  return (req: any, res: any) => {
    const health = createHealthResponse(options);
    res.status(health.ok ? 200 : 503).json(health);
  };
}

/**
 * Fastify health endpoint handler
 */
export function createFastifyHealthHandler(options: HealthCheckOptions) {
  return async (request: any, reply: any) => {
    const health = createHealthResponse(options);
    reply.status(health.ok ? 200 : 503).send(health);
  };
}

/**
 * Next.js API route handler
 */
export function createNextHealthHandler(options: HealthCheckOptions) {
  return async () => {
    const health = createHealthResponse(options);
    return new Response(JSON.stringify(health), {
      status: health.ok ? 200 : 503,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  };
}

/**
 * Validate health response schema
 */
export function validateHealthResponse(response: any): response is HealthResponse {
  return (
    typeof response === 'object' &&
    typeof response.ok === 'boolean' &&
    ['healthy', 'degraded', 'unhealthy'].includes(response.status) &&
    typeof response.sha === 'string' &&
    typeof response.buildId === 'string' &&
    typeof response.service === 'string' &&
    typeof response.uptimeSec === 'number' &&
    typeof response.timestamp === 'string'
  );
}

export default {
  createHealthResponse,
  createDegradedHealthResponse,
  createUnhealthyHealthResponse,
  createExpressHealthHandler,
  createFastifyHealthHandler,
  createNextHealthHandler,
  validateHealthResponse,
};

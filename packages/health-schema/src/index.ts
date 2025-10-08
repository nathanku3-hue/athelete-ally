import { readFileSync } from 'fs';

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
    // eslint-disable-next-line no-console
    console.warn(`⚠️ Could not read build info from ${buildInfoPath}:`, error);
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
  return (_req: unknown, res: { status: (code: number) => { json: (data: HealthResponse) => void } }) => {
    const health = createHealthResponse(options);
    res.status(health.ok ? 200 : 503).json(health);
  };
}

/**
 * Fastify health endpoint handler
 */
export function createFastifyHealthHandler(options: HealthCheckOptions) {
  return async (_request: unknown, reply: { status: (code: number) => { send: (data: HealthResponse) => void } }) => {
    const health = createHealthResponse(options);
    reply.status(health.ok ? 200 : 503).send(health);
  };
}

/**
 * Next.js API route handler
 */
export function createNextHealthHandler(options: HealthCheckOptions) {
  return async (): Promise<Response> => {
    const health = createHealthResponse(options);
    
    // Always return a proper Response object for Next.js compatibility
    return new Response(JSON.stringify(health), {
      status: health.ok ? 200 : 503,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  };
}

/**
 * Validate health response schema
 */
export function validateHealthResponse(response: unknown): response is HealthResponse {
  return (
    response !== null &&
    typeof response === 'object' &&
    typeof (response as Record<string, unknown>).ok === 'boolean' &&
    ['healthy', 'degraded', 'unhealthy'].includes((response as Record<string, unknown>).status as string) &&
    typeof (response as Record<string, unknown>).sha === 'string' &&
    typeof (response as Record<string, unknown>).buildId === 'string' &&
    typeof (response as Record<string, unknown>).service === 'string' &&
    typeof (response as Record<string, unknown>).uptimeSec === 'number' &&
    typeof (response as Record<string, unknown>).timestamp === 'string'
  );
}

const healthSchema = {
  createHealthResponse,
  createDegradedHealthResponse,
  createUnhealthyHealthResponse,
  createExpressHealthHandler,
  createFastifyHealthHandler,
  createNextHealthHandler,
  validateHealthResponse,
};

export default healthSchema;

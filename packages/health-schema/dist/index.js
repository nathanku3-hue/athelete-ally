import { createLogger } from '@athlete-ally/logger';
import browserAdapter from '@athlete-ally/logger/browser';
import nodeAdapter from '@athlete-ally/logger/server';
const __adapter = (typeof window !== 'undefined') ? browserAdapter : nodeAdapter;
const __log = createLogger(__adapter, { module: 'health-schema', service: (typeof process !== 'undefined' && process.env && process.env.APP_NAME) || 'package' });
import { readFileSync } from 'fs';
function readBuildInfo(buildInfoPath) {
    const defaultSha = process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_SHA || process.env.COMMIT_SHA || 'unknown';
    const defaultBuildId = process.env.NEXT_BUILD_ID || process.env.BUILD_ID || process.env.BUILD_NUMBER || 'unknown';
    if (!buildInfoPath)
        return { sha: defaultSha, buildId: defaultBuildId };
    try {
        const buildInfo = JSON.parse(readFileSync(buildInfoPath, 'utf8'));
        return { sha: buildInfo.sha || defaultSha, buildId: buildInfo.buildId || defaultBuildId };
    }
    catch (error) {
        __log.warn(`⚠️ Could not read build info from ${buildInfoPath}: ${String(error)}`);
        return { sha: defaultSha, buildId: defaultBuildId };
    }
}
export function createHealthResponse(options) {
    const { serviceName, version = '1.0.0', environment = process.env.NODE_ENV || 'development', buildInfoPath } = options;
    const { sha, buildId } = readBuildInfo(buildInfoPath);
    const uptimeSec = Math.floor(process.uptime());
    return { ok: true, status: 'healthy', sha, buildId, service: serviceName, uptimeSec, timestamp: new Date().toISOString(), version, environment };
}
export function createDegradedHealthResponse(options, reason) {
    const response = createHealthResponse(options);
    return { ...response, ok: false, status: 'degraded', ...(reason && { reason }) };
}
export function createUnhealthyHealthResponse(options, reason) {
    const response = createHealthResponse(options);
    return { ...response, ok: false, status: 'unhealthy', ...(reason && { reason }) };
}
export function createExpressHealthHandler(options) {
    return (_req, res) => {
        const health = createHealthResponse(options);
        res.status(health.ok ? 200 : 503).json(health);
    };
}
export function createFastifyHealthHandler(options) {
    return async (_request, reply) => {
        const health = createHealthResponse(options);
        reply.status(health.ok ? 200 : 503).send(health);
    };
}
export function createNextHealthHandler(options) {
    return async () => {
        const health = createHealthResponse(options);
        return new Response(JSON.stringify(health), { status: health.ok ? 200 : 503, headers: { 'content-type': 'application/json; charset=utf-8' } });
    };
}
export function validateHealthResponse(response) {
    return (response !== null && typeof response === 'object' &&
        typeof response.ok === 'boolean' &&
        ['healthy', 'degraded', 'unhealthy'].includes(response.status) &&
        typeof response.sha === 'string' &&
        typeof response.buildId === 'string' &&
        typeof response.service === 'string' &&
        typeof response.uptimeSec === 'number' &&
        typeof response.timestamp === 'string');
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
//# sourceMappingURL=index.js.map
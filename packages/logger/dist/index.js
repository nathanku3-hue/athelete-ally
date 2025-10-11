import { sanitizeText, filterAndSanitizeContext } from './sanitize.js';
function baseEvent(level, service, moduleName, env, msg, ctx, errObj) {
    const { text, hashes } = sanitizeText(msg);
    const { context, hashes: ctxHashes } = filterAndSanitizeContext(ctx);
    const evt = { level, msg: text, ts: new Date().toISOString(), service, module: moduleName || 'unknown', env, context, pii_hashes: [...hashes, ...ctxHashes] };
    if (errObj) {
        evt.error = { name: errObj.name, message: errObj.message, stack: errObj.stack };
    }
    return evt;
}
export function createLogger(adapter, opts = {}) {
    const env = opts.env || (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || 'production';
    const service = opts.service || (typeof process !== 'undefined' && process.env && (process.env.APP_NAME || process.env.npm_package_name)) || 'frontend';
    const moduleName = opts.module || 'unknown';
    const sampler = { info: 0.1, debug: 0.0, ...(opts.sampler || {}) };
    function shouldSample(level) { if (env !== 'production')
        return true; if (level === 'error' || level === 'warn')
        return true; if (level === 'info')
        return Math.random() < sampler.info; if (level === 'debug')
        return Math.random() < sampler.debug; return true; }
    function emit(level, msg, ctx, errMaybe) { const err = (msg instanceof Error) ? msg : errMaybe; const text = (msg instanceof Error) ? (msg.message || String(msg)) : String(msg); const event = baseEvent(level, service, moduleName, env, text, ctx, err || undefined); if (!shouldSample(level)) {
        event.sampled = false;
        return;
    } event.sampled = true; try {
        void adapter.emit(event);
    }
    catch { } }
    return { debug: (m, c) => emit('debug', m, c), info: (m, c) => emit('info', m, c), warn: (m, c) => emit('warn', m, c), error: (m, c) => emit('error', m, c, m instanceof Error ? m : undefined) };
}
export { sanitizeText, filterAndSanitizeContext };
//# sourceMappingURL=index.js.map
// Logger facade (environment-agnostic). Consumers should import either `@athlete-ally/logger/server` or `/browser`.
import { sanitizeText, filterAndSanitizeContext, type LogContext } from './sanitize';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogEvent = {
  level: LogLevel;
  msg: string;
  ts: string; // ISO string
  service: string;
  module: string;
  env: string;
  requestId?: string;
  release?: string;
  commit?: string;
  error?: { name?: string; message?: string; stack?: string };
  code?: string | number;
  status?: number;
  route?: string;
  sampled?: boolean;
  context?: Record<string, unknown>;
  pii_hashes?: string[];
};

export interface LogAdapter {
  emit: (event: LogEvent) => void | Promise<void>;
}

export interface Logger {
  debug: (msg: string, ctx?: LogContext) => void;
  info: (msg: string, ctx?: LogContext) => void;
  warn: (msg: string, ctx?: LogContext) => void;
  error: (msg: string | Error, ctx?: LogContext & { error?: unknown }) => void;
}

export type CreateLoggerOptions = {
  service?: string; // defaults to APP_NAME or 'frontend'
  env?: string; // defaults to process.env.NODE_ENV
  module?: string; // required in browser; server can derive caller
  sampler?: { info: number; debug: number }; // 0..1
};

function baseEvent(level: LogLevel, service: string, moduleName: string, env: string, msg: string, ctx?: LogContext, errObj?: Error): LogEvent {
  const { text, hashes } = sanitizeText(msg);
  const { context, hashes: ctxHashes } = filterAndSanitizeContext(ctx);
  const evt: LogEvent = {
    level,
    msg: text,
    ts: new Date().toISOString(),
    service,
    module: moduleName || 'unknown',
    env,
    context,
    pii_hashes: [...hashes, ...ctxHashes],
  };
  if (errObj) {
    evt.error = { name: errObj.name, message: errObj.message, stack: errObj.stack };
  }
  return evt;
}

export function createLogger(adapter: LogAdapter, opts: CreateLoggerOptions = {}): Logger {
  const env = opts.env || (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || 'production';
  const service = opts.service || (typeof process !== 'undefined' && process.env && (process.env.APP_NAME || process.env.npm_package_name)) || 'frontend';
  const moduleName = opts.module || 'unknown';
  const sampler = { info: 0.1, debug: 0.0, ...(opts.sampler || {}) };

  function shouldSample(level: LogLevel): boolean {
    if (env !== 'production') return true; // dev: keep DX
    if (level === 'error' || level === 'warn') return true;
    if (level === 'info') return Math.random() < sampler.info;
    if (level === 'debug') return Math.random() < sampler.debug;
    return true;
  }

  function emit(level: LogLevel, msg: string | Error, ctx?: LogContext, errMaybe?: Error) {
    const err = (msg instanceof Error) ? msg : errMaybe;
    const text = (msg instanceof Error) ? (msg.message || String(msg)) : String(msg);
    const event = baseEvent(level, service, moduleName, env, text, ctx, err || undefined);
    if (!shouldSample(level)) {
      event.sampled = false;
      return; // drop silently
    }
    event.sampled = true;
    try {
      void adapter.emit(event);
    } catch (_e) {
      // Facade must never throw; swallow to protect callers
    }
  }

  return {
    debug: (m, c) => emit('debug', m, c),
    info: (m, c) => emit('info', m, c),
    warn: (m, c) => emit('warn', m, c),
    error: (m, c) => emit('error', m, c, m instanceof Error ? m : undefined),
  };
}

export type { LogContext };\nexport { sanitizeText, filterAndSanitizeContext } from './sanitize';\n
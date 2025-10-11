import { sanitizeText, filterAndSanitizeContext, type LogContext } from './sanitize';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogEvent = {
    level: LogLevel;
    msg: string;
    ts: string;
    service: string;
    module: string;
    env: string;
    requestId?: string;
    release?: string;
    commit?: string;
    error?: {
        name?: string;
        message?: string;
        stack?: string;
    };
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
    error: (msg: string | Error, ctx?: LogContext & {
        error?: unknown;
    }) => void;
}
export type CreateLoggerOptions = {
    service?: string;
    env?: string;
    module?: string;
    sampler?: {
        info: number;
        debug: number;
    };
};
export declare function createLogger(adapter: LogAdapter, opts?: CreateLoggerOptions): Logger;
export type { LogContext };
export { sanitizeText, filterAndSanitizeContext };
//# sourceMappingURL=index.d.ts.map
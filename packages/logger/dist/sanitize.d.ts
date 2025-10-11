export type SanitizeResult = {
    text: string;
    hashes: string[];
};
export declare function sanitizeText(input: unknown): SanitizeResult;
export type LogContext = Partial<Record<'field' | 'value' | 'environment' | 'route' | 'requestId', string> & {
    status: number;
}> & Record<string, unknown>;
export declare function filterAndSanitizeContext(ctx: LogContext | undefined): {
    context: Record<string, unknown> | undefined;
    hashes: string[];
};
//# sourceMappingURL=sanitize.d.ts.map
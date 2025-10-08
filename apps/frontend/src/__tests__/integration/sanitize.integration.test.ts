import { sanitizeText, filterAndSanitizeContext } from '@athlete-ally/logger';

describe('sanitize', () => {
  it('scrubs email and emits hashes', () => {
    process.env.LOGS_HASH_SALT = 's';
    const res = sanitizeText('contact me at john.doe@example.com');
    expect(res.text).toContain('[REDACTED]');
    expect(res.hashes.length).toBeGreaterThan(0);
  });

  it('filters context keys to allowlist', () => {
    const { context } = filterAndSanitizeContext({ field: 'f', value: 'v', secret: 'x' } as any);
    expect(context).toBeDefined();
    expect((context as any).secret).toBeUndefined();
  });
});

\nimport type {} from 'jest';\n

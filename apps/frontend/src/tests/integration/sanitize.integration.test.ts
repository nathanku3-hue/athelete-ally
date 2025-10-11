import { sanitizeText, filterAndSanitizeContext } from '@athlete-ally/logger';

describe('sanitize', () => {
  it('scrubs common PII and emits hashes', () => {
    process.env.LOGS_HASH_SALT = 's';
    const inputs = [
      'email john.doe@example.com',
      'phone +1-202-555-1234',
      'ipv4 192.168.1.1',
      'ipv6 2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      'jwt eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      'uuid 123e4567-e89b-12d3-a456-426614174000',
      'ssn 123-45-6789'
    ];
    for (const text of inputs) {
      const res = sanitizeText(text);
      expect(res.text).toContain('[REDACTED]');
      expect(res.hashes.length).toBeGreaterThan(0);
    }
  });

  it('filters context keys to allowlist', () => {
    const { context } = filterAndSanitizeContext({ field: 'f', value: 'john@example.com', secret: 'x' } as any);
    expect(context).toBeDefined();
    expect((context as any).field).toBe('[REDACTED]');
    expect((context as any).secret).toBeUndefined();
  });
});


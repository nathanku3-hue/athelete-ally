import { computeSignature, verifySignature } from '../oura';

const SECRET = 'test-secret';

describe('Oura webhook utils', () => {
  it('computes stable HMAC-SHA256 in hex', () => {
    const payload = '{"hello":"world"}';
    const sig = computeSignature(SECRET, payload);
    expect(sig).toHaveLength(64);
    expect(sig).toMatch(/^[a-f0-9]{64}$/);
  });

  it('verifies header with or without sha256= prefix', () => {
    const payload = '{"n":1}';
    const sig = computeSignature(SECRET, payload);
    expect(verifySignature({ secret: SECRET, rawBody: payload, headerSignature: sig })).toBe(true);
    expect(verifySignature({ secret: SECRET, rawBody: payload, headerSignature: `sha256=${sig}` })).toBe(true);
    expect(verifySignature({ secret: SECRET, rawBody: payload, headerSignature: sig.slice(0, 60) + 'dead' })).toBe(false);
  });
});
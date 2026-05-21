process.env.ADMIN_USERNAME = 'testuser';
process.env.ADMIN_PASSWORD = 'testpass';
process.env.SESSION_SECRET = 'a'.repeat(32);

import { verifyCredentials, createSessionToken, verifySessionToken } from '../lib/auth';

describe('verifyCredentials', () => {
  it('returns true for correct credentials', () => {
    expect(verifyCredentials('testuser', 'testpass')).toBe(true);
  });

  it('returns false for wrong password', () => {
    expect(verifyCredentials('testuser', 'wrong')).toBe(false);
  });

  it('returns false for wrong username', () => {
    expect(verifyCredentials('wrong', 'testpass')).toBe(false);
  });
});

describe('createSessionToken and verifySessionToken', () => {
  it('creates a token that can be verified', async () => {
    const token = await createSessionToken();
    const result = await verifySessionToken(token);
    expect(result).toBe(true);
  });

  it('rejects invalid token', async () => {
    const result = await verifySessionToken('invalid.token.here');
    expect(result).toBe(false);
  });
});

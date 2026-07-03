process.env.ADMIN_USERNAME = 'testuser';
process.env.ADMIN_PASSWORD = 'testpass';
process.env.SESSION_SECRET = 'a'.repeat(32);

import { jest } from '@jest/globals';

const mockIsLockedOut = jest.fn();
const mockRecordFailedAttempt = jest.fn();
const mockResetAttempts = jest.fn();
const mockCookieSet = jest.fn();
const mockRedirect = jest.fn(() => { throw new Error('REDIRECT'); });

jest.unstable_mockModule('../lib/rateLimiter', () => ({
  isLockedOut: mockIsLockedOut,
  recordFailedAttempt: mockRecordFailedAttempt,
  resetAttempts: mockResetAttempts,
}));

jest.unstable_mockModule('next/headers', () => ({
  cookies: () => ({ set: mockCookieSet, delete: jest.fn() }),
}));

jest.unstable_mockModule('next/navigation', () => ({
  redirect: mockRedirect,
}));

const { loginAction } = await import('../app/admin/actions');

beforeEach(() => {
  jest.clearAllMocks();
  mockIsLockedOut.mockResolvedValue(false);
});

function formData(username: string, password: string): FormData {
  const fd = new FormData();
  fd.set('username', username);
  fd.set('password', password);
  return fd;
}

describe('loginAction', () => {
  it('returns a lockout error without checking credentials when locked out', async () => {
    mockIsLockedOut.mockResolvedValue(true);
    const result = await loginAction(formData('testuser', 'testpass'));
    expect(result?.error).toMatch(/intentos/i);
    expect(mockCookieSet).not.toHaveBeenCalled();
  });

  it('records a failed attempt on wrong credentials', async () => {
    const result = await loginAction(formData('testuser', 'wrong'));
    expect(result?.error).toBeDefined();
    expect(mockRecordFailedAttempt).toHaveBeenCalledWith('testuser');
  });

  it('resets attempts and sets a session cookie on success', async () => {
    await expect(loginAction(formData('testuser', 'testpass'))).rejects.toThrow('REDIRECT');
    expect(mockResetAttempts).toHaveBeenCalledWith('testuser');
    expect(mockCookieSet).toHaveBeenCalledWith('admin_session', expect.any(String), expect.any(Object));
  });
});

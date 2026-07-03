import { jest } from '@jest/globals';

const mockMaybeSingle = jest.fn();
const mockUpsert = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();

jest.unstable_mockModule('../lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}));

function setupChain() {
  mockFrom.mockReturnValue({
    select: mockSelect,
    upsert: mockUpsert,
    delete: mockDelete,
  });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle, eq: mockEq });
  mockDelete.mockReturnValue({ eq: mockEq });
  mockUpsert.mockResolvedValue({ error: null });
}

const { isLockedOut, recordFailedAttempt, resetAttempts } = await import('../lib/rateLimiter');

beforeEach(() => {
  jest.clearAllMocks();
  setupChain();
});

describe('isLockedOut', () => {
  it('returns false when there is no record', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });
    expect(await isLockedOut('admin')).toBe(false);
  });

  it('returns false when bloqueado_hasta is in the past', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { bloqueado_hasta: new Date(Date.now() - 60_000).toISOString() },
    });
    expect(await isLockedOut('admin')).toBe(false);
  });

  it('returns true when bloqueado_hasta is in the future', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { bloqueado_hasta: new Date(Date.now() + 60_000).toISOString() },
    });
    expect(await isLockedOut('admin')).toBe(true);
  });
});

describe('recordFailedAttempt', () => {
  it('upserts intentos=1 and no lockout on first failure', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });
    await recordFailedAttempt('admin');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: 'admin', intentos: 1, bloqueado_hasta: null })
    );
  });

  it('sets bloqueado_hasta after the 5th failed attempt', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { intentos: 4 } });
    await recordFailedAttempt('admin');
    const call = mockUpsert.mock.calls[0][0] as { intentos: number; bloqueado_hasta: string | null };
    expect(call.intentos).toBe(5);
    expect(call.bloqueado_hasta).not.toBeNull();
  });
});

describe('resetAttempts', () => {
  it('deletes the record for the identifier', async () => {
    mockEq.mockResolvedValue({ error: null });
    await resetAttempts('admin');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('identifier', 'admin');
  });
});

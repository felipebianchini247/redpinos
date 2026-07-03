import { jest } from '@jest/globals';

// Mock the Supabase module to handle WebSocket issue in Node.js 20
jest.unstable_mockModule('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn((url: string, key: string, options: any) => ({
      from: jest.fn(),
      auth: {},
      realtime: null,
    })),
  };
});

describe('getSupabaseAdmin', () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  afterEach(() => {
    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    jest.resetModules();
  });

  it('throws if SUPABASE_URL is missing', async () => {
    delete process.env.SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    jest.resetModules();
    const { getSupabaseAdmin } = await import('../lib/supabase');
    expect(() => getSupabaseAdmin()).toThrow('SUPABASE_URL');
  });

  it('throws if SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    jest.resetModules();
    const { getSupabaseAdmin } = await import('../lib/supabase');
    expect(() => getSupabaseAdmin()).toThrow('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('returns a client when both env vars are set', async () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    jest.resetModules();
    const { getSupabaseAdmin } = await import('../lib/supabase');
    const client = getSupabaseAdmin();
    expect(client).toBeDefined();
    expect(typeof client.from).toBe('function');
  });
});

import { jest } from '@jest/globals';

const mockSingle = jest.fn();
const mockMaybeSingle = jest.fn();
const mockOrder = jest.fn();
const mockEqForNovedades = jest.fn();
const mockEqForPages = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();

jest.unstable_mockModule('../lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}));

function setupPagesChain(content: unknown) {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'pages') {
      return {
        select: () => ({ eq: () => ({ single: mockSingle }) }),
      };
    }
    if (table === 'novedades') {
      return {
        select: () => ({
          order: mockOrder,
          eq: () => ({ maybeSingle: mockMaybeSingle }),
        }),
      };
    }
    throw new Error(`Unexpected table ${table}`);
  });
  mockSingle.mockResolvedValue({ data: { content }, error: null });
}

const {
  getHomeContent,
  getQuienesSomosContent,
  getNovedades,
  getNoticiaBySlug,
} = await import('../lib/content');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getHomeContent', () => {
  it('returns the content column for slug "home"', async () => {
    setupPagesChain({ heroTitulo: 'Test', quienesSomosBreve: 'Texto' });
    const result = await getHomeContent();
    expect(result.heroTitulo).toBe('Test');
    expect(result.quienesSomosBreve).toBe('Texto');
  });
});

describe('getQuienesSomosContent', () => {
  it('returns the content column for slug "quienes-somos"', async () => {
    setupPagesChain({ h1: 'Acerca de nosotros', aniofundacion: '2021' });
    const result = await getQuienesSomosContent();
    expect(result.h1).toBe('Acerca de nosotros');
    expect(result.aniofundacion).toBe('2021');
  });
});

describe('getNovedades', () => {
  it('returns novedades ordered by fecha descending', async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ order: mockOrder }),
    }));
    mockOrder.mockResolvedValue({
      data: [
        { id: '2', slug: 'new', titulo: 'New', texto: '', imagen: '', fecha: '2026-01-01', creado_en: '' },
        { id: '1', slug: 'old', titulo: 'Old', texto: '', imagen: '', fecha: '2025-01-01', creado_en: '' },
      ],
      error: null,
    });
    const result = await getNovedades();
    expect(result[0].slug).toBe('new');
    expect(result[1].slug).toBe('old');
    expect(mockOrder).toHaveBeenCalledWith('fecha', { ascending: false });
  });
});

describe('getNoticiaBySlug', () => {
  it('returns the matching noticia', async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }),
    }));
    mockMaybeSingle.mockResolvedValue({
      data: { id: '1', slug: 'mi-noticia', titulo: 'Mi Noticia', texto: '', imagen: '', fecha: '2026-01-01', creado_en: '' },
      error: null,
    });
    const result = await getNoticiaBySlug('mi-noticia');
    expect(result?.titulo).toBe('Mi Noticia');
  });

  it('returns undefined for an unknown slug', async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }),
    }));
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    const result = await getNoticiaBySlug('nonexistent');
    expect(result).toBeUndefined();
  });
});

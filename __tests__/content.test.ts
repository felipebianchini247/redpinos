import fs from 'fs';
import { getHomeContent, getNovedades, getNoticiaBySlug, getQuienesSomosContent } from '../lib/content';

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('getHomeContent', () => {
  it('parses home.json correctly', () => {
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({ heroTitulo: 'Test', quienesSomosBreve: 'Texto' }) as any
    );
    const result = getHomeContent();
    expect(result.heroTitulo).toBe('Test');
    expect(result.quienesSomosBreve).toBe('Texto');
  });
});

describe('getNovedades', () => {
  it('returns novedades sorted newest first', () => {
    mockFs.readFileSync.mockReturnValue(JSON.stringify([
      { id: '1', slug: 'old', titulo: 'Old', texto: '', imagen: '', fecha: '2025-01-01', creadoEn: '' },
      { id: '2', slug: 'new', titulo: 'New', texto: '', imagen: '', fecha: '2026-01-01', creadoEn: '' },
    ]) as any);
    const result = getNovedades();
    expect(result[0].slug).toBe('new');
    expect(result[1].slug).toBe('old');
  });
});

describe('getNoticiaBySlug', () => {
  it('returns matching noticia', () => {
    mockFs.readFileSync.mockReturnValue(JSON.stringify([
      { id: '1', slug: 'mi-noticia', titulo: 'Mi Noticia', texto: '', imagen: '', fecha: '2026-01-01', creadoEn: '' },
    ]) as any);
    const result = getNoticiaBySlug('mi-noticia');
    expect(result?.titulo).toBe('Mi Noticia');
  });

  it('returns undefined for unknown slug', () => {
    mockFs.readFileSync.mockReturnValue(JSON.stringify([]) as any);
    const result = getNoticiaBySlug('nonexistent');
    expect(result).toBeUndefined();
  });
});

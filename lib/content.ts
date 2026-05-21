import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'content');

export interface HomeContent {
  heroTitulo: string;
  quienesSomosBreve: string;
}

export interface QuienesSomosContent {
  aniofundacion: string;
  campaniasExitosas: string;
  focosDetectados: string;
  textoIntegrantes: string;
}

export interface Noticia {
  id: string;
  slug: string;
  titulo: string;
  texto: string;
  imagen: string;
  fecha: string;
  creadoEn: string;
}

export function getHomeContent(): HomeContent {
  const raw = fs.readFileSync(path.join(contentDir, 'home.json'), 'utf-8');
  return JSON.parse(raw) as HomeContent;
}

export function getQuienesSomosContent(): QuienesSomosContent {
  const raw = fs.readFileSync(path.join(contentDir, 'quienesSomos.json'), 'utf-8');
  return JSON.parse(raw) as QuienesSomosContent;
}

export function getNovedades(): Noticia[] {
  const raw = fs.readFileSync(path.join(contentDir, 'novedades.json'), 'utf-8');
  const list = JSON.parse(raw) as Noticia[];
  return list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export function getNoticiaBySlug(slug: string): Noticia | undefined {
  return getNovedades().find((n) => n.slug === slug);
}

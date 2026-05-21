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

export interface ObjetivosContent {
  introTexto: string;
}

export interface ComoParticiparContent {
  introTexto: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ContactoContent {
  whatsapp: string;
  whatsappNota: string;
  email: string;
  direccion: string;
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

export function getObjetivosContent(): ObjetivosContent {
  const raw = fs.readFileSync(path.join(contentDir, 'objetivos.json'), 'utf-8');
  return JSON.parse(raw) as ObjetivosContent;
}

export function getComoParticiparContent(): ComoParticiparContent {
  const raw = fs.readFileSync(path.join(contentDir, 'comoParticipar.json'), 'utf-8');
  return JSON.parse(raw) as ComoParticiparContent;
}

export function getFaqContent(): FaqItem[] {
  const raw = fs.readFileSync(path.join(contentDir, 'faq.json'), 'utf-8');
  return JSON.parse(raw) as FaqItem[];
}

export function getContactoContent(): ContactoContent {
  const raw = fs.readFileSync(path.join(contentDir, 'contacto.json'), 'utf-8');
  return JSON.parse(raw) as ContactoContent;
}

export function getNovedades(): Noticia[] {
  const raw = fs.readFileSync(path.join(contentDir, 'novedades.json'), 'utf-8');
  const list = JSON.parse(raw) as Noticia[];
  return list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export function getNoticiaBySlug(slug: string): Noticia | undefined {
  return getNovedades().find((n) => n.slug === slug);
}

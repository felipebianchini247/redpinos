import { getSupabaseAdmin } from './supabase';

export interface CardIcon { icon: string; title: string; text: string }
export interface CardImg { img: string; title: string; text: string }
export interface StepItem { icon: string; label: string }
export interface FaqItem { q: string; a: string }

export interface HomeContent {
  heroTitulo: string;
  quienesSomosBreve: string;
  deQueSeTrataTitulo: string;
  deQueSeTrata: CardIcon[];
  entendiendoElDesafioTitulo: string;
  entendiendoElDesafioIntro: string;
  entendiendoElDesafio: CardImg[];
  registroCiudadanoTitulo: string;
  registroCiudadano: StepItem[];
  voluntarioTitulo: string;
  voluntarioTexto: string;
}

export interface QuienesSomosContent {
  h1: string;
  subtitulo: string;
  aniofundacion: string;
  campaniasExitosas: string;
  focosDetectados: string;
  integrantesTitulo: string;
  textoIntegrantes: string;
}

export interface ObjetivosContent {
  h1: string;
  lineaBaseTitulo: string;
  introTexto: string;
  items: CardIcon[];
  pasos: StepItem[];
}

export interface ComoParticiparContent {
  h1: string;
  subtitulo: string;
  introTexto: string;
  items: CardImg[];
}

export interface FaqContent {
  h1: string;
  items: FaqItem[];
}

export interface ContactoContent {
  h1: string;
  subtitulo: string;
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

async function getPageContent<T>(slug: string): Promise<T> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('pages').select('content').eq('slug', slug).single();
  if (error || !data) throw new Error(`Failed to load content for page "${slug}": ${error?.message}`);
  return data.content as T;
}

export async function getHomeContent(): Promise<HomeContent> {
  return getPageContent<HomeContent>('home');
}

export async function getQuienesSomosContent(): Promise<QuienesSomosContent> {
  return getPageContent<QuienesSomosContent>('quienes-somos');
}

export async function getObjetivosContent(): Promise<ObjetivosContent> {
  return getPageContent<ObjetivosContent>('objetivos');
}

export async function getComoParticiparContent(): Promise<ComoParticiparContent> {
  return getPageContent<ComoParticiparContent>('como-participar');
}

export async function getFaqContent(): Promise<FaqContent> {
  return getPageContent<FaqContent>('faq');
}

export async function getContactoContent(): Promise<ContactoContent> {
  return getPageContent<ContactoContent>('contacto');
}

function mapNoticiaRow(row: Record<string, unknown>): Noticia {
  return {
    id: row.id as string,
    slug: row.slug as string,
    titulo: row.titulo as string,
    texto: row.texto as string,
    imagen: row.imagen as string,
    fecha: row.fecha as string,
    creadoEn: row.creado_en as string,
  };
}

export async function getNovedades(): Promise<Noticia[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('novedades').select('*').order('fecha', { ascending: false });
  if (error) throw new Error(`Failed to load novedades: ${error.message}`);
  return (data ?? []).map(mapNoticiaRow);
}

export async function getNoticiaBySlug(slug: string): Promise<Noticia | undefined> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('novedades').select('*').eq('slug', slug).maybeSingle();
  if (error || !data) return undefined;
  return mapNoticiaRow(data);
}

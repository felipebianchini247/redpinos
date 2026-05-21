'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyCredentials, createSessionToken } from '@/lib/auth';
import { getFileFromGitHub, updateFileInGitHub, uploadFileToGitHub } from '@/lib/github';
import { slugify } from '@/lib/slugify';
import type { Noticia, HomeContent, QuienesSomosContent, ObjetivosContent, ComoParticiparContent, FaqItem, ContactoContent } from '@/lib/content';

// AUTH
export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!verifyCredentials(username, password)) {
    return { error: 'Usuario o contraseña incorrectos' };
  }

  const token = await createSessionToken();
  cookies().set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  redirect('/admin/dashboard');
}

export async function logoutAction() {
  cookies().delete('admin_session');
  redirect('/admin');
}

// NOVEDADES
export async function saveNoticiaAction(formData: FormData) {
  const id = formData.get('id') as string | null;
  const titulo = formData.get('titulo') as string;
  const texto = formData.get('texto') as string;
  const fecha = formData.get('fecha') as string;
  const imagenExistente = (formData.get('imagenExistente') as string) || '';
  const imagenFile = formData.get('imagen') as File | null;

  const { content: rawJson, sha } = await getFileFromGitHub('content/novedades.json');
  const novedades: Noticia[] = JSON.parse(rawJson);

  let imagenPath = imagenExistente;
  if (imagenFile && imagenFile.size > 0) {
    const ext = imagenFile.name.split('.').pop() ?? 'jpg';
    const filename = `${Date.now()}.${ext}`;
    const bytes = await imagenFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    await uploadFileToGitHub(`public/uploads/${filename}`, base64);
    imagenPath = `/uploads/${filename}`;
  }

  if (id) {
    const idx = novedades.findIndex((n) => n.id === id);
    if (idx >= 0) {
      novedades[idx] = { ...novedades[idx], titulo, texto, fecha, imagen: imagenPath };
    }
  } else {
    const newNoticia: Noticia = {
      id: crypto.randomUUID(),
      slug: slugify(titulo),
      titulo,
      texto,
      imagen: imagenPath,
      fecha,
      creadoEn: new Date().toISOString(),
    };
    novedades.unshift(newNoticia);
  }

  await updateFileInGitHub('content/novedades.json', JSON.stringify(novedades, null, 2), sha);
  return { success: true };
}

export async function deleteNoticiaAction(id: string) {
  const { content: rawJson, sha } = await getFileFromGitHub('content/novedades.json');
  const novedades: Noticia[] = JSON.parse(rawJson);
  const updated = novedades.filter((n) => n.id !== id);
  await updateFileInGitHub('content/novedades.json', JSON.stringify(updated, null, 2), sha);
  return { success: true };
}

// HOME
export async function saveHomeAction(formData: FormData) {
  const data: HomeContent = {
    heroTitulo: formData.get('heroTitulo') as string,
    quienesSomosBreve: formData.get('quienesSomosBreve') as string,
  };
  const { sha } = await getFileFromGitHub('content/home.json');
  await updateFileInGitHub('content/home.json', JSON.stringify(data, null, 2), sha);
  return { success: true };
}

// QUIENES SOMOS
export async function saveQuienesSomosAction(formData: FormData) {
  const data: QuienesSomosContent = {
    aniofundacion: formData.get('aniofundacion') as string,
    campaniasExitosas: formData.get('campaniasExitosas') as string,
    focosDetectados: formData.get('focosDetectados') as string,
    textoIntegrantes: formData.get('textoIntegrantes') as string,
  };
  const { sha } = await getFileFromGitHub('content/quienesSomos.json');
  await updateFileInGitHub('content/quienesSomos.json', JSON.stringify(data, null, 2), sha);
  return { success: true };
}

// OBJETIVOS
export async function saveObjetivosAction(formData: FormData) {
  const data: ObjetivosContent = {
    introTexto: formData.get('introTexto') as string,
  };
  const { sha } = await getFileFromGitHub('content/objetivos.json');
  await updateFileInGitHub('content/objetivos.json', JSON.stringify(data, null, 2), sha);
  return { success: true };
}

// COMO PARTICIPAR
export async function saveComoParticiparAction(formData: FormData) {
  const data: ComoParticiparContent = {
    introTexto: formData.get('introTexto') as string,
  };
  const { sha } = await getFileFromGitHub('content/comoParticipar.json');
  await updateFileInGitHub('content/comoParticipar.json', JSON.stringify(data, null, 2), sha);
  return { success: true };
}

// FAQ
export async function saveFaqAction(items: FaqItem[]) {
  const { sha } = await getFileFromGitHub('content/faq.json');
  await updateFileInGitHub('content/faq.json', JSON.stringify(items, null, 2), sha);
  return { success: true };
}

// CONTACTO
export async function saveContactoAction(formData: FormData) {
  const data: ContactoContent = {
    whatsapp: formData.get('whatsapp') as string,
    whatsappNota: formData.get('whatsappNota') as string,
    email: formData.get('email') as string,
    direccion: formData.get('direccion') as string,
  };
  const { sha } = await getFileFromGitHub('content/contacto.json');
  await updateFileInGitHub('content/contacto.json', JSON.stringify(data, null, 2), sha);
  return { success: true };
}

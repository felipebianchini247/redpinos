'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyCredentials, createSessionToken } from '@/lib/auth';
import { isLockedOut, recordFailedAttempt, resetAttempts } from '@/lib/rateLimiter';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Noticia } from '@/lib/content';

type PageSlug = 'home' | 'quienes-somos' | 'objetivos' | 'como-participar' | 'faq' | 'contacto';

// AUTH
export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (await isLockedOut(username)) {
    return { error: 'Demasiados intentos fallidos. Probá de nuevo en unos minutos.' };
  }

  if (!verifyCredentials(username, password)) {
    await recordFailedAttempt(username);
    return { error: 'Usuario o contraseña incorrectos' };
  }

  await resetAttempts(username);

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

// GENERIC PAGE CONTENT (home, quienes-somos, objetivos, como-participar, faq, contacto)
export async function saveContentAction(slug: PageSlug, patch: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const { data: existing, error: fetchError } = await supabase
    .from('pages')
    .select('content')
    .eq('slug', slug)
    .single();
  if (fetchError || !existing) return { success: false };

  const content = { ...(existing.content as Record<string, unknown>), ...patch };
  const { error } = await supabase
    .from('pages')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('slug', slug);

  return { success: !error };
}

// NOVEDADES
export async function saveNoticiaAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  const id = formData.get('id') as string | null;
  const titulo = formData.get('titulo') as string;
  const texto = formData.get('texto') as string;
  const fecha = formData.get('fecha') as string;
  const imagenExistente = (formData.get('imagenExistente') as string) || '';
  const imagenFile = formData.get('imagen') as File | null;

  let imagenPath = imagenExistente;
  if (imagenFile && imagenFile.size > 0) {
    const ext = imagenFile.name.split('.').pop() ?? 'jpg';
    const filename = `${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filename, imagenFile, { contentType: imagenFile.type });
    if (uploadError) return { success: false };
    const { data: publicUrl } = supabase.storage.from('uploads').getPublicUrl(filename);
    imagenPath = publicUrl.publicUrl;
  }

  if (id) {
    const { error } = await supabase
      .from('novedades')
      .update({ titulo, texto, fecha, imagen: imagenPath })
      .eq('id', id);
    return { success: !error };
  }

  const { slugify } = await import('@/lib/slugify');
  const { error } = await supabase.from('novedades').insert({
    slug: slugify(titulo),
    titulo,
    texto,
    imagen: imagenPath,
    fecha,
  });
  return { success: !error };
}

export async function deleteNoticiaAction(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('novedades').delete().eq('id', id);
  return { success: !error };
}

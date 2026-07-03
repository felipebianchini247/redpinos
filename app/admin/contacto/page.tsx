// app/admin/contacto/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { saveContentAction } from '../actions';
import type { ContactoContent } from '@/lib/content';

const empty: ContactoContent = { h1: '', subtitulo: '', whatsapp: '', whatsappNota: '', email: '', direccion: '' };

export default function AdminContactoPage() {
  const [form, setForm] = useState<ContactoContent>(empty);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/contacto').then((r) => r.json()).then(setForm);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await saveContentAction('contacto', form as unknown as Record<string, unknown>);
    setMessage(result.success
      ? { type: 'success', text: 'Guardado.' }
      : { type: 'error', text: 'Error al guardar.' }
    );
    setPending(false);
  }

  return (
    <AdminLayout title="Editar Contacto">
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título de la página (H1)</label>
          <input value={form.h1} onChange={(e) => setForm({ ...form, h1: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Subtítulo</label>
          <input value={form.subtitulo} onChange={(e) => setForm({ ...form, subtitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>WhatsApp</label>
          <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Nota de WhatsApp (ej: Solo mensajes de texto y fotos)</label>
          <input value={form.whatsappNota} onChange={(e) => setForm({ ...form, whatsappNota: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Dirección</label>
          <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} required />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </AdminLayout>
  );
}

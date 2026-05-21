// app/admin/inicio/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { saveHomeAction } from '../actions';
import type { HomeContent } from '@/lib/content';

export default function AdminInicioPage() {
  const [form, setForm] = useState<HomeContent>({ heroTitulo: '', quienesSomosBreve: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/inicio').then((r) => r.json()).then(setForm);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await saveHomeAction(new FormData(e.currentTarget));
    setMessage(result.success
      ? { type: 'success', text: 'Guardado. El sitio se actualizará en ~30 segundos.' }
      : { type: 'error', text: 'Error al guardar.' }
    );
    setPending(false);
  }

  return (
    <AdminLayout title="Editar Inicio">
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título del Hero</label>
          <input name="heroTitulo" value={form.heroTitulo} onChange={(e) => setForm({ ...form, heroTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto "Quiénes Somos" (en la home)</label>
          <textarea name="quienesSomosBreve" value={form.quienesSomosBreve} onChange={(e) => setForm({ ...form, quienesSomosBreve: e.target.value })} required rows={6} />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </AdminLayout>
  );
}

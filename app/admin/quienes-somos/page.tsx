// app/admin/quienes-somos/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { saveQuienesSomosAction } from '../actions';
import type { QuienesSomosContent } from '@/lib/content';

const empty: QuienesSomosContent = { aniofundacion: '', campaniasExitosas: '', focosDetectados: '', textoIntegrantes: '' };

export default function AdminQuienesSomosPage() {
  const [form, setForm] = useState<QuienesSomosContent>(empty);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/quienes-somos').then((r) => r.json()).then(setForm);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await saveQuienesSomosAction(new FormData(e.currentTarget));
    setMessage(result.success
      ? { type: 'success', text: 'Guardado. El sitio se actualizará en ~30 segundos.' }
      : { type: 'error', text: 'Error al guardar.' }
    );
    setPending(false);
  }

  return (
    <AdminLayout title="Editar Quiénes Somos">
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Año de fundación (ej: 2021)</label>
          <input name="aniofundacion" value={form.aniofundacion} onChange={(e) => setForm({ ...form, aniofundacion: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Campañas exitosas (ej: 7)</label>
          <input name="campaniasExitosas" value={form.campaniasExitosas} onChange={(e) => setForm({ ...form, campaniasExitosas: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Focos de invasión detectados (ej: +100)</label>
          <input name="focosDetectados" value={form.focosDetectados} onChange={(e) => setForm({ ...form, focosDetectados: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto de Integrantes</label>
          <textarea name="textoIntegrantes" value={form.textoIntegrantes} onChange={(e) => setForm({ ...form, textoIntegrantes: e.target.value })} required rows={8} />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </AdminLayout>
  );
}

// app/admin/objetivos/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { saveObjetivosAction } from '../actions';
import type { ObjetivosContent } from '@/lib/content';

const empty: ObjetivosContent = { introTexto: '' };

export default function AdminObjetivosPage() {
  const [form, setForm] = useState<ObjetivosContent>(empty);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/objetivos').then((r) => r.json()).then(setForm);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await saveObjetivosAction(new FormData(e.currentTarget));
    setMessage(result.success
      ? { type: 'success', text: 'Guardado. El sitio se actualizará en ~30 segundos.' }
      : { type: 'error', text: 'Error al guardar.' }
    );
    setPending(false);
  }

  return (
    <AdminLayout title="Editar Objetivos">
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Texto introductorio</label>
          <textarea
            name="introTexto"
            value={form.introTexto}
            onChange={(e) => setForm({ ...form, introTexto: e.target.value })}
            required
            rows={6}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </AdminLayout>
  );
}

// app/admin/como-participar/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ItemListEditor from '@/components/admin/ItemListEditor';
import { saveContentAction } from '../actions';
import type { ComoParticiparContent } from '@/lib/content';

const empty: ComoParticiparContent = { h1: '', subtitulo: '', introTexto: '', items: [] };

export default function AdminComoParticiparPage() {
  const [content, setContent] = useState<ComoParticiparContent>(empty);
  const [form, setForm] = useState({ h1: '', subtitulo: '', introTexto: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/como-participar')
      .then((r) => r.json())
      .then((data: ComoParticiparContent) => {
        setContent(data);
        setForm({ h1: data.h1, subtitulo: data.subtitulo, introTexto: data.introTexto });
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await saveContentAction('como-participar', form);
    setMessage(result.success
      ? { type: 'success', text: 'Guardado.' }
      : { type: 'error', text: 'Error al guardar.' }
    );
    setPending(false);
  }

  return (
    <AdminLayout title="Editar Cómo Participar">
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
          <label>Texto introductorio</label>
          <textarea value={form.introTexto} onChange={(e) => setForm({ ...form, introTexto: e.target.value })} required rows={6} />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <h2 style={{ marginTop: 40 }}>Formas de participar (tarjetas)</h2>
      <ItemListEditor
        fields={[
          { name: 'img', label: 'Imagen (nombre de archivo en /public/images)', type: 'text' },
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'text', label: 'Texto', type: 'textarea' },
        ]}
        items={content.items}
        onSave={(items) => saveContentAction('como-participar', { items })}
        previewTitle={(item) => item.title}
        previewSubtitle={(item) => item.text.slice(0, 100)}
      />
    </AdminLayout>
  );
}

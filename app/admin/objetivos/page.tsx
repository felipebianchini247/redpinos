// app/admin/objetivos/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ItemListEditor from '@/components/admin/ItemListEditor';
import { saveContentAction } from '../actions';
import type { ObjetivosContent } from '@/lib/content';

const empty: ObjetivosContent = { h1: '', lineaBaseTitulo: '', introTexto: '', items: [], pasos: [] };

export default function AdminObjetivosPage() {
  const [content, setContent] = useState<ObjetivosContent>(empty);
  const [form, setForm] = useState({ h1: '', lineaBaseTitulo: '', introTexto: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/objetivos')
      .then((r) => r.json())
      .then((data: ObjetivosContent) => {
        setContent(data);
        setForm({ h1: data.h1, lineaBaseTitulo: data.lineaBaseTitulo, introTexto: data.introTexto });
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await saveContentAction('objetivos', form);
    setMessage(result.success
      ? { type: 'success', text: 'Guardado.' }
      : { type: 'error', text: 'Error al guardar.' }
    );
    setPending(false);
  }

  return (
    <AdminLayout title="Editar Objetivos">
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título de la página (H1)</label>
          <input value={form.h1} onChange={(e) => setForm({ ...form, h1: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Título &ldquo;Línea de base&rdquo;</label>
          <input value={form.lineaBaseTitulo} onChange={(e) => setForm({ ...form, lineaBaseTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto introductorio</label>
          <textarea value={form.introTexto} onChange={(e) => setForm({ ...form, introTexto: e.target.value })} required rows={6} />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <h2 style={{ marginTop: 40 }}>Objetivos (tarjetas)</h2>
      <ItemListEditor
        fields={[
          { name: 'icon', label: 'Ícono (clase Font Awesome)', type: 'text' },
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'text', label: 'Descripción', type: 'textarea' },
        ]}
        items={content.items}
        onSave={(items) => saveContentAction('objetivos', { items })}
        previewTitle={(item) => item.title}
        previewSubtitle={(item) => item.text.slice(0, 100)}
      />

      <h2 style={{ marginTop: 40 }}>Pasos</h2>
      <ItemListEditor
        fields={[
          { name: 'icon', label: 'Ícono (clase, ej: icon-telescope)', type: 'text' },
          { name: 'label', label: 'Texto', type: 'text' },
        ]}
        items={content.pasos}
        onSave={(items) => saveContentAction('objetivos', { pasos: items })}
        previewTitle={(item) => item.label}
      />
    </AdminLayout>
  );
}

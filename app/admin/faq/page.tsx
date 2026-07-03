// app/admin/faq/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ItemListEditor from '@/components/admin/ItemListEditor';
import { saveContentAction } from '../actions';
import type { FaqContent } from '@/lib/content';

const empty: FaqContent = { h1: '', items: [] };

export default function AdminFaqPage() {
  const [content, setContent] = useState<FaqContent>(empty);
  const [h1, setH1] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/faq')
      .then((r) => r.json())
      .then((data: FaqContent) => {
        setContent(data);
        setH1(data.h1);
      });
  }, []);

  async function handleH1Submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await saveContentAction('faq', { h1 });
    setMessage(result.success
      ? { type: 'success', text: 'Guardado.' }
      : { type: 'error', text: 'Error al guardar.' }
    );
    setPending(false);
  }

  return (
    <AdminLayout title="Editar Preguntas Frecuentes">
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleH1Submit}>
        <div className="form-group">
          <label>Título de la página (H1)</label>
          <input value={h1} onChange={(e) => setH1(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar título'}
        </button>
      </form>

      <h2 style={{ marginTop: 40 }}>Preguntas ({content.items.length})</h2>
      <ItemListEditor
        fields={[
          { name: 'q', label: 'Pregunta', type: 'text' },
          { name: 'a', label: 'Respuesta', type: 'textarea' },
        ]}
        items={content.items}
        onSave={(items) => saveContentAction('faq', { items })}
        previewTitle={(item) => item.q}
        previewSubtitle={(item) => item.a.slice(0, 100)}
      />
    </AdminLayout>
  );
}

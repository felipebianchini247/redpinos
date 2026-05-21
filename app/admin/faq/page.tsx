// app/admin/faq/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { saveFaqAction } from '../actions';
import type { FaqItem } from '@/lib/content';

const emptyItem = (): FaqItem => ({ q: '', a: '' });

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<FaqItem>(emptyItem());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/faq').then((r) => r.json()).then(setItems);
  }, []);

  async function save(updated: FaqItem[]) {
    setPending(true);
    setMessage(null);
    const result = await saveFaqAction(updated);
    if (result.success) {
      setItems(updated);
      setMessage({ type: 'success', text: 'Guardado. El sitio se actualizará en ~30 segundos.' });
      cancelEdit();
    } else {
      setMessage({ type: 'error', text: 'Error al guardar.' });
    }
    setPending(false);
  }

  function startEdit(i: number) {
    setEditIndex(i);
    setForm({ ...items[i] });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditIndex(null);
    setForm(emptyItem());
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editIndex !== null) {
      const updated = items.map((item, i) => (i === editIndex ? form : item));
      await save(updated);
    } else {
      await save([...items, form]);
    }
  }

  async function handleDelete(i: number) {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    await save(items.filter((_, idx) => idx !== i));
  }

  async function moveItem(i: number, dir: -1 | 1) {
    const updated = [...items];
    const target = i + dir;
    if (target < 0 || target >= updated.length) return;
    [updated[i], updated[target]] = [updated[target], updated[i]];
    await save(updated);
  }

  return (
    <AdminLayout title="Editar Preguntas Frecuentes">
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit}>
        <h3 style={{ marginTop: 0 }}>{editIndex !== null ? 'Editar pregunta' : 'Nueva pregunta'}</h3>
        <div className="form-group">
          <label>Pregunta *</label>
          <input
            value={form.q}
            onChange={(e) => setForm({ ...form, q: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Respuesta *</label>
          <textarea
            value={form.a}
            onChange={(e) => setForm({ ...form, a: e.target.value })}
            required
            rows={5}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? 'Guardando...' : editIndex !== null ? 'Actualizar' : 'Agregar'}
          </button>
          {editIndex !== null && (
            <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancelar</button>
          )}
        </div>
      </form>

      {items.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3>Preguntas ({items.length})</h3>
          {items.map((item, i) => (
            <div key={i} className="faq-item">
              <div className="faq-number">{i + 1}</div>
              <div className="faq-item-text">
                <strong>{item.q}</strong>
                <span>{item.a.slice(0, 100)}{item.a.length > 100 ? '…' : ''}</span>
              </div>
              <div className="faq-item-actions">
                <button className="btn-secondary" onClick={() => moveItem(i, -1)} disabled={i === 0 || pending} title="Subir">↑</button>
                <button className="btn-secondary" onClick={() => moveItem(i, 1)} disabled={i === items.length - 1 || pending} title="Bajar">↓</button>
                <button className="btn-secondary" onClick={() => startEdit(i)}>Editar</button>
                <button className="btn-danger" onClick={() => handleDelete(i)} disabled={pending}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

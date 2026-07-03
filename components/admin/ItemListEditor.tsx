'use client';
import { useState } from 'react';

export interface ListField {
  name: string;
  label: string;
  type: 'text' | 'textarea';
}

interface ItemListEditorProps<T extends Record<string, string>> {
  fields: ListField[];
  items: T[];
  onSave: (items: T[]) => Promise<{ success: boolean }>;
  previewTitle: (item: T) => string;
  previewSubtitle?: (item: T) => string;
}

export default function ItemListEditor<T extends Record<string, string>>({
  fields,
  items: initialItems,
  onSave,
  previewTitle,
  previewSubtitle,
}: ItemListEditorProps<T>) {
  const emptyItem = (): T =>
    fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {} as T);

  const [items, setItems] = useState<T[]>(initialItems);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<T>(emptyItem());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function persist(updated: T[]) {
    setPending(true);
    setMessage(null);
    const result = await onSave(updated);
    if (result.success) {
      setItems(updated);
      setMessage({ type: 'success', text: 'Guardado.' });
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
  }

  function cancelEdit() {
    setEditIndex(null);
    setForm(emptyItem());
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editIndex !== null) {
      const updated = items.map((item, i) => (i === editIndex ? form : item));
      await persist(updated);
    } else {
      await persist([...items, form]);
    }
  }

  async function handleDelete(i: number) {
    if (!confirm('¿Eliminar este elemento?')) return;
    await persist(items.filter((_, idx) => idx !== i));
  }

  async function moveItem(i: number, dir: -1 | 1) {
    const target = i + dir;
    if (target < 0 || target >= items.length) return;
    const updated = [...items];
    [updated[i], updated[target]] = [updated[target], updated[i]];
    await persist(updated);
  }

  return (
    <div>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <h3 style={{ marginTop: 0 }}>{editIndex !== null ? 'Editar elemento' : 'Nuevo elemento'}</h3>
        {fields.map((f) => (
          <div className="form-group" key={f.name}>
            <label>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value } as T)}
                required
                rows={4}
              />
            ) : (
              <input
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value } as T)}
                required
              />
            )}
          </div>
        ))}
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
          {items.map((item, i) => (
            <div key={i} className="faq-item">
              <div className="faq-number">{i + 1}</div>
              <div className="faq-item-text">
                <strong>{previewTitle(item)}</strong>
                {previewSubtitle && <span>{previewSubtitle(item)}</span>}
              </div>
              <div className="faq-item-actions">
                <button type="button" className="btn-secondary" onClick={() => moveItem(i, -1)} disabled={i === 0 || pending} title="Subir">↑</button>
                <button type="button" className="btn-secondary" onClick={() => moveItem(i, 1)} disabled={i === items.length - 1 || pending} title="Bajar">↓</button>
                <button type="button" className="btn-secondary" onClick={() => startEdit(i)}>Editar</button>
                <button type="button" className="btn-danger" onClick={() => handleDelete(i)} disabled={pending}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

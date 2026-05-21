// app/admin/novedades/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { saveNoticiaAction, deleteNoticiaAction } from '../actions';
import type { Noticia } from '@/lib/content';

type FormState = {
  id?: string;
  titulo: string;
  texto: string;
  fecha: string;
  imagen: string;
};

const emptyForm = (): FormState => ({
  titulo: '',
  texto: '',
  fecha: new Date().toISOString().split('T')[0],
  imagen: '',
});

export default function AdminNovedadesPage() {
  const [novedades, setNovedades] = useState<Noticia[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load novedades on mount
  useEffect(() => {
    fetch('/api/admin/novedades')
      .then((r) => r.json())
      .then(setNovedades)
      .catch(() => {});
  }, []);

  function startEdit(noticia: Noticia) {
    setForm({ id: noticia.id, titulo: noticia.titulo, texto: noticia.texto, fecha: noticia.fecha, imagen: noticia.imagen });
    setImagePreview(noticia.imagen);
    setEditing(true);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setForm(emptyForm());
    setEditing(false);
    setImagePreview(null);
    setMessage(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta noticia?')) return;
    setPending(true);
    const result = await deleteNoticiaAction(id);
    if (result.success) {
      setNovedades((prev) => prev.filter((n) => n.id !== id));
      setMessage({ type: 'success', text: 'Noticia eliminada. El sitio se actualizará en ~30 segundos.' });
    }
    setPending(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    if (form.id) formData.set('id', form.id);
    formData.set('imagenExistente', form.imagen);

    const result = await saveNoticiaAction(formData);
    if (result.success) {
      setMessage({ type: 'success', text: `Noticia ${form.id ? 'actualizada' : 'creada'}. El sitio se actualizará en ~30 segundos.` });
      cancelEdit();
      // Reload list
      fetch('/api/admin/novedades').then((r) => r.json()).then(setNovedades);
    } else {
      setMessage({ type: 'error', text: 'Error al guardar. Verificá la configuración de GitHub.' });
    }
    setPending(false);
  }

  return (
    <AdminLayout title="Novedades">
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <h3 style={{ marginTop: 0 }}>{editing ? 'Editar noticia' : 'Nueva noticia'}</h3>
        <div className="form-group">
          <label>Título *</label>
          <input name="titulo" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Fecha *</label>
          <input name="fecha" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Imagen {editing ? '(dejar vacío para conservar la actual)' : '*'}</label>
          <input
            name="imagen"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setImagePreview(URL.createObjectURL(file));
            }}
            {...(!editing && { required: true })}
          />
          {imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreview} alt="Preview" className="preview-image" />
          )}
        </div>
        <div className="form-group">
          <label>Texto *</label>
          <textarea name="texto" value={form.texto} onChange={(e) => setForm({ ...form, texto: e.target.value })} required rows={8} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? 'Guardando...' : editing ? 'Actualizar' : 'Publicar'}
          </button>
          {editing && (
            <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancelar</button>
          )}
        </div>
      </form>

      {/* List */}
      {novedades.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3>Noticias publicadas</h3>
          {novedades.map((n) => (
            <div key={n.id} className="noticia-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {n.imagen && <img src={n.imagen} alt={n.titulo} />}
              <div className="noticia-item-info">
                <h3>{n.titulo}</h3>
                <span>{new Date(n.fecha + 'T12:00:00').toLocaleDateString('es-AR')}</span>
              </div>
              <div className="noticia-item-actions">
                <button className="btn-secondary" onClick={() => startEdit(n)}>Editar</button>
                <button className="btn-danger" onClick={() => handleDelete(n.id)} disabled={pending}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

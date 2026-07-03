// app/admin/inicio/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ItemListEditor from '@/components/admin/ItemListEditor';
import { saveContentAction } from '../actions';
import type { HomeContent, CardIcon, CardImg, StepItem } from '@/lib/content';

const empty: HomeContent = {
  heroTitulo: '',
  quienesSomosBreve: '',
  deQueSeTrataTitulo: '',
  deQueSeTrata: [],
  entendiendoElDesafioTitulo: '',
  entendiendoElDesafioIntro: '',
  entendiendoElDesafio: [],
  registroCiudadanoTitulo: '',
  registroCiudadano: [],
  voluntarioTitulo: '',
  voluntarioTexto: '',
};

type HomeSingletonFields = Omit<HomeContent, 'deQueSeTrata' | 'entendiendoElDesafio' | 'registroCiudadano'>;

const emptySingletons: HomeSingletonFields = {
  heroTitulo: '',
  quienesSomosBreve: '',
  deQueSeTrataTitulo: '',
  entendiendoElDesafioTitulo: '',
  entendiendoElDesafioIntro: '',
  registroCiudadanoTitulo: '',
  voluntarioTitulo: '',
  voluntarioTexto: '',
};

export default function AdminInicioPage() {
  const [content, setContent] = useState<HomeContent>(empty);
  const [form, setForm] = useState<HomeSingletonFields>(emptySingletons);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/inicio')
      .then((r) => r.json())
      .then((data: HomeContent) => {
        setContent(data);
        setForm({
          heroTitulo: data.heroTitulo,
          quienesSomosBreve: data.quienesSomosBreve,
          deQueSeTrataTitulo: data.deQueSeTrataTitulo,
          entendiendoElDesafioTitulo: data.entendiendoElDesafioTitulo,
          entendiendoElDesafioIntro: data.entendiendoElDesafioIntro,
          registroCiudadanoTitulo: data.registroCiudadanoTitulo,
          voluntarioTitulo: data.voluntarioTitulo,
          voluntarioTexto: data.voluntarioTexto,
        });
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await saveContentAction('home', form);
    setMessage(result.success
      ? { type: 'success', text: 'Guardado.' }
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
          <input value={form.heroTitulo} onChange={(e) => setForm({ ...form, heroTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto &ldquo;Quiénes Somos&rdquo; (en la home)</label>
          <textarea value={form.quienesSomosBreve} onChange={(e) => setForm({ ...form, quienesSomosBreve: e.target.value })} required rows={6} />
        </div>
        <div className="form-group">
          <label>Título de la sección &ldquo;De qué se trata&rdquo;</label>
          <input value={form.deQueSeTrataTitulo} onChange={(e) => setForm({ ...form, deQueSeTrataTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Título de la sección &ldquo;Entendiendo el desafío&rdquo;</label>
          <input value={form.entendiendoElDesafioTitulo} onChange={(e) => setForm({ ...form, entendiendoElDesafioTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto introductorio de &ldquo;Entendiendo el desafío&rdquo;</label>
          <textarea value={form.entendiendoElDesafioIntro} onChange={(e) => setForm({ ...form, entendiendoElDesafioIntro: e.target.value })} required rows={3} />
        </div>
        <div className="form-group">
          <label>Título de la sección &ldquo;Registro Ciudadano&rdquo;</label>
          <input value={form.registroCiudadanoTitulo} onChange={(e) => setForm({ ...form, registroCiudadanoTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Título de la sección &ldquo;Voluntario&rdquo;</label>
          <input value={form.voluntarioTitulo} onChange={(e) => setForm({ ...form, voluntarioTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto de la sección &ldquo;Voluntario&rdquo;</label>
          <textarea value={form.voluntarioTexto} onChange={(e) => setForm({ ...form, voluntarioTexto: e.target.value })} required rows={4} />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <h2 style={{ marginTop: 40 }}>De qué se trata</h2>
      <ItemListEditor
        fields={[
          { name: 'icon', label: 'Ícono (clase Font Awesome, ej: fa fa-tree)', type: 'text' },
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'text', label: 'Texto', type: 'textarea' },
        ]}
        items={content.deQueSeTrata as (CardIcon & Record<string, string>)[]}
        onSave={(items) => saveContentAction('home', { deQueSeTrata: items })}
        previewTitle={(item) => item.title}
        previewSubtitle={(item) => item.text.slice(0, 100)}
      />

      <h2 style={{ marginTop: 40 }}>Entendiendo el desafío</h2>
      <ItemListEditor
        fields={[
          { name: 'img', label: 'Imagen (nombre de archivo en /public/images, ej: InvasionesGPT.png)', type: 'text' },
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'text', label: 'Texto', type: 'textarea' },
        ]}
        items={content.entendiendoElDesafio as (CardImg & Record<string, string>)[]}
        onSave={(items) => saveContentAction('home', { entendiendoElDesafio: items })}
        previewTitle={(item) => item.title}
        previewSubtitle={(item) => item.text.slice(0, 100)}
      />

      <h2 style={{ marginTop: 40 }}>Registro Ciudadano</h2>
      <ItemListEditor
        fields={[
          { name: 'icon', label: 'Ícono (clase Font Awesome)', type: 'text' },
          { name: 'label', label: 'Texto', type: 'text' },
        ]}
        items={content.registroCiudadano as (StepItem & Record<string, string>)[]}
        onSave={(items) => saveContentAction('home', { registroCiudadano: items })}
        previewTitle={(item) => item.label}
      />
    </AdminLayout>
  );
}

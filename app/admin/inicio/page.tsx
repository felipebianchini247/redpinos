// app/admin/inicio/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ItemListEditor from '@/components/admin/ItemListEditor';
import { saveContentAction } from '../actions';
import type { HomeContent } from '@/lib/content';

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

type Message = { type: 'success' | 'error'; text: string } | null;

export default function AdminInicioPage() {
  const [content, setContent] = useState<HomeContent>(empty);

  const [heroForm, setHeroForm] = useState({ heroTitulo: '', quienesSomosBreve: '' });
  const [heroPending, setHeroPending] = useState(false);
  const [heroMessage, setHeroMessage] = useState<Message>(null);

  const [deQueSeTrataForm, setDeQueSeTrataForm] = useState({ deQueSeTrataTitulo: '' });
  const [deQueSeTrataPending, setDeQueSeTrataPending] = useState(false);
  const [deQueSeTrataMessage, setDeQueSeTrataMessage] = useState<Message>(null);

  const [entendiendoForm, setEntendiendoForm] = useState({ entendiendoElDesafioTitulo: '', entendiendoElDesafioIntro: '' });
  const [entendiendoPending, setEntendiendoPending] = useState(false);
  const [entendiendoMessage, setEntendiendoMessage] = useState<Message>(null);

  const [registroForm, setRegistroForm] = useState({ registroCiudadanoTitulo: '' });
  const [registroPending, setRegistroPending] = useState(false);
  const [registroMessage, setRegistroMessage] = useState<Message>(null);

  const [voluntarioForm, setVoluntarioForm] = useState({ voluntarioTitulo: '', voluntarioTexto: '' });
  const [voluntarioPending, setVoluntarioPending] = useState(false);
  const [voluntarioMessage, setVoluntarioMessage] = useState<Message>(null);

  useEffect(() => {
    fetch('/api/admin/inicio')
      .then((r) => r.json())
      .then((data: HomeContent) => {
        setContent(data);
        setHeroForm({ heroTitulo: data.heroTitulo, quienesSomosBreve: data.quienesSomosBreve });
        setDeQueSeTrataForm({ deQueSeTrataTitulo: data.deQueSeTrataTitulo });
        setEntendiendoForm({ entendiendoElDesafioTitulo: data.entendiendoElDesafioTitulo, entendiendoElDesafioIntro: data.entendiendoElDesafioIntro });
        setRegistroForm({ registroCiudadanoTitulo: data.registroCiudadanoTitulo });
        setVoluntarioForm({ voluntarioTitulo: data.voluntarioTitulo, voluntarioTexto: data.voluntarioTexto });
      });
  }, []);

  async function handleHeroSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHeroPending(true);
    setHeroMessage(null);
    const result = await saveContentAction('home', heroForm);
    setHeroMessage(result.success ? { type: 'success', text: 'Guardado.' } : { type: 'error', text: 'Error al guardar.' });
    setHeroPending(false);
  }

  async function handleDeQueSeTrataSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDeQueSeTrataPending(true);
    setDeQueSeTrataMessage(null);
    const result = await saveContentAction('home', deQueSeTrataForm);
    setDeQueSeTrataMessage(result.success ? { type: 'success', text: 'Guardado.' } : { type: 'error', text: 'Error al guardar.' });
    setDeQueSeTrataPending(false);
  }

  async function handleEntendiendoSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEntendiendoPending(true);
    setEntendiendoMessage(null);
    const result = await saveContentAction('home', entendiendoForm);
    setEntendiendoMessage(result.success ? { type: 'success', text: 'Guardado.' } : { type: 'error', text: 'Error al guardar.' });
    setEntendiendoPending(false);
  }

  async function handleRegistroSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRegistroPending(true);
    setRegistroMessage(null);
    const result = await saveContentAction('home', registroForm);
    setRegistroMessage(result.success ? { type: 'success', text: 'Guardado.' } : { type: 'error', text: 'Error al guardar.' });
    setRegistroPending(false);
  }

  async function handleVoluntarioSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setVoluntarioPending(true);
    setVoluntarioMessage(null);
    const result = await saveContentAction('home', voluntarioForm);
    setVoluntarioMessage(result.success ? { type: 'success', text: 'Guardado.' } : { type: 'error', text: 'Error al guardar.' });
    setVoluntarioPending(false);
  }

  return (
    <AdminLayout title="Editar Inicio">
      {/* Hero */}
      <h2 style={{ marginTop: 0 }}>Hero</h2>
      {heroMessage && <div className={`alert alert-${heroMessage.type}`}>{heroMessage.text}</div>}
      <form onSubmit={handleHeroSubmit}>
        <div className="form-group">
          <label>Título del Hero</label>
          <input value={heroForm.heroTitulo} onChange={(e) => setHeroForm({ ...heroForm, heroTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto &ldquo;Quiénes Somos&rdquo; (en la home)</label>
          <textarea value={heroForm.quienesSomosBreve} onChange={(e) => setHeroForm({ ...heroForm, quienesSomosBreve: e.target.value })} required rows={6} />
        </div>
        <button type="submit" className="btn-primary" disabled={heroPending}>
          {heroPending ? 'Guardando...' : 'Guardar'}
        </button>
      </form>

      {/* De qué se trata */}
      <h2 style={{ marginTop: 40 }}>De qué se trata</h2>
      {deQueSeTrataMessage && <div className={`alert alert-${deQueSeTrataMessage.type}`}>{deQueSeTrataMessage.text}</div>}
      <form onSubmit={handleDeQueSeTrataSubmit}>
        <div className="form-group">
          <label>Título de la sección</label>
          <input value={deQueSeTrataForm.deQueSeTrataTitulo} onChange={(e) => setDeQueSeTrataForm({ deQueSeTrataTitulo: e.target.value })} required />
        </div>
        <button type="submit" className="btn-primary" disabled={deQueSeTrataPending}>
          {deQueSeTrataPending ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
      <ItemListEditor
        fields={[
          { name: 'icon', label: 'Ícono (clase Font Awesome, ej: fa fa-tree)', type: 'text' },
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'text', label: 'Texto', type: 'textarea' },
        ]}
        items={content.deQueSeTrata}
        onSave={(items) => saveContentAction('home', { deQueSeTrata: items })}
        previewTitle={(item) => item.title}
        previewSubtitle={(item) => item.text.slice(0, 100)}
      />

      {/* Entendiendo el desafío */}
      <h2 style={{ marginTop: 40 }}>Entendiendo el desafío</h2>
      {entendiendoMessage && <div className={`alert alert-${entendiendoMessage.type}`}>{entendiendoMessage.text}</div>}
      <form onSubmit={handleEntendiendoSubmit}>
        <div className="form-group">
          <label>Título de la sección</label>
          <input value={entendiendoForm.entendiendoElDesafioTitulo} onChange={(e) => setEntendiendoForm({ ...entendiendoForm, entendiendoElDesafioTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto introductorio</label>
          <textarea value={entendiendoForm.entendiendoElDesafioIntro} onChange={(e) => setEntendiendoForm({ ...entendiendoForm, entendiendoElDesafioIntro: e.target.value })} required rows={3} />
        </div>
        <button type="submit" className="btn-primary" disabled={entendiendoPending}>
          {entendiendoPending ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
      <ItemListEditor
        fields={[
          { name: 'img', label: 'Imagen (nombre de archivo en /public/images, ej: InvasionesGPT.png)', type: 'text' },
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'text', label: 'Texto', type: 'textarea' },
        ]}
        items={content.entendiendoElDesafio}
        onSave={(items) => saveContentAction('home', { entendiendoElDesafio: items })}
        previewTitle={(item) => item.title}
        previewSubtitle={(item) => item.text.slice(0, 100)}
      />

      {/* Registro Ciudadano */}
      <h2 style={{ marginTop: 40 }}>Registro Ciudadano</h2>
      {registroMessage && <div className={`alert alert-${registroMessage.type}`}>{registroMessage.text}</div>}
      <form onSubmit={handleRegistroSubmit}>
        <div className="form-group">
          <label>Título de la sección</label>
          <input value={registroForm.registroCiudadanoTitulo} onChange={(e) => setRegistroForm({ registroCiudadanoTitulo: e.target.value })} required />
        </div>
        <button type="submit" className="btn-primary" disabled={registroPending}>
          {registroPending ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
      <ItemListEditor
        fields={[
          { name: 'icon', label: 'Ícono (clase Font Awesome)', type: 'text' },
          { name: 'label', label: 'Texto', type: 'text' },
        ]}
        items={content.registroCiudadano}
        onSave={(items) => saveContentAction('home', { registroCiudadano: items })}
        previewTitle={(item) => item.label}
      />

      {/* Voluntario */}
      <h2 style={{ marginTop: 40 }}>Voluntario</h2>
      {voluntarioMessage && <div className={`alert alert-${voluntarioMessage.type}`}>{voluntarioMessage.text}</div>}
      <form onSubmit={handleVoluntarioSubmit}>
        <div className="form-group">
          <label>Título de la sección</label>
          <input value={voluntarioForm.voluntarioTitulo} onChange={(e) => setVoluntarioForm({ ...voluntarioForm, voluntarioTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto de la sección</label>
          <textarea value={voluntarioForm.voluntarioTexto} onChange={(e) => setVoluntarioForm({ ...voluntarioForm, voluntarioTexto: e.target.value })} required rows={4} />
        </div>
        <button type="submit" className="btn-primary" disabled={voluntarioPending}>
          {voluntarioPending ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </AdminLayout>
  );
}

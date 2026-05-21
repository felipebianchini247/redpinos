'use client';
import { useState } from 'react';
import { loginAction } from '@/app/admin/actions';

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="login-box">
      <h1>Red PINOS<br /><small style={{ fontSize: 14, fontWeight: 400 }}>Backoffice</small></h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuario</label>
          <input id="username" name="username" type="text" required autoComplete="username" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={pending}>
          {pending ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <a href="/" style={{ fontSize: 13, color: '#777' }}>← Volver al sitio</a>
      </div>
    </div>
  );
}

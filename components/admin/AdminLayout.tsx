// components/admin/AdminLayout.tsx
import { logoutAction } from '@/app/admin/actions';

export default function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <>
      <link rel="stylesheet" href="/css/admin.css" />
      <div className="admin-body" style={{ minHeight: '100vh' }}>
        <header className="admin-header">
          <h1>Red PINOS — Backoffice</h1>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <a href="/" target="_blank">Ver sitio ↗</a>
            <form action={logoutAction} style={{ display: 'inline' }}>
              <button type="submit" style={{ background: 'none', border: '1px solid #555', color: '#ccc', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
                Salir
              </button>
            </form>
          </div>
        </header>
        <div className="admin-container">
          <div className="admin-card">
            <h2>{title}</h2>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

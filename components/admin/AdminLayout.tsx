// components/admin/AdminLayout.tsx
import Link from 'next/link';
import { logoutAction } from '@/app/admin/actions';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="admin-header-brand">
          <Link href="/admin/dashboard" className="admin-brand-link">Red PINOS</Link>
          <span className="admin-brand-tag">Backoffice</span>
        </div>
        <div className="admin-header-actions">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-view-site">
            Ver sitio ↗
          </a>
          <form action={logoutAction}>
            <button type="submit" className="admin-logout-btn">Salir</button>
          </form>
        </div>
      </header>
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div className="admin-page-header">
            <h1 className="admin-page-title">{title}</h1>
          </div>
          <div className="admin-card">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

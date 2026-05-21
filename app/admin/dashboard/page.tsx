// app/admin/dashboard/page.tsx
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';

export default function DashboardPage() {
  const cards = [
    { href: '/admin/novedades', icon: '📰', title: 'Novedades', desc: 'Agregar, editar y eliminar noticias' },
    { href: '/admin/inicio', icon: '🏠', title: 'Inicio', desc: 'Editar textos de la página principal' },
    { href: '/admin/quienes-somos', icon: '👥', title: 'Quiénes Somos', desc: 'Editar integrantes y estadísticas' },
  ];

  return (
    <AdminLayout title="Panel de administración">
      <p style={{ color: '#777', marginBottom: 24 }}>
        Los cambios se publican automáticamente en el sitio en aproximadamente 30 segundos.
      </p>
      <div className="dashboard-grid">
        {cards.map(({ href, icon, title, desc }) => (
          <Link key={href} href={href} className="dashboard-card">
            <div className="icon">{icon}</div>
            <h3>{title}</h3>
            <p style={{ fontSize: 13, color: '#777', margin: '4px 0 0' }}>{desc}</p>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}

// app/admin/dashboard/page.tsx
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';

export default function DashboardPage() {
  const cards = [
    { href: '/admin/inicio', icon: '🏠', title: 'Inicio', desc: 'Hero y texto principal' },
    { href: '/admin/quienes-somos', icon: '👥', title: 'Quiénes Somos', desc: 'Integrantes y estadísticas' },
    { href: '/admin/objetivos', icon: '🎯', title: 'Objetivos', desc: 'Texto introductorio' },
    { href: '/admin/como-participar', icon: '🤝', title: 'Cómo Participar', desc: 'Texto introductorio' },
    { href: '/admin/faq', icon: '❓', title: 'Preguntas Frecuentes', desc: 'Agregar, editar y eliminar preguntas' },
    { href: '/admin/contacto', icon: '📬', title: 'Contacto', desc: 'WhatsApp, email y dirección' },
    { href: '/admin/novedades', icon: '📰', title: 'Novedades', desc: 'Publicar y gestionar noticias' },
  ];

  return (
    <AdminLayout title="Panel de administración">
      <p style={{ color: 'var(--admin-text-muted, #777)', marginBottom: 24, fontSize: 14 }}>
        Los cambios se publican automáticamente en el sitio de forma instantánea.
      </p>
      <div className="dashboard-grid">
        {cards.map(({ href, icon, title, desc }) => (
          <Link key={href} href={href} className="dashboard-card">
            <span className="icon">{icon}</span>
            <h3>{title}</h3>
            <p className="desc">{desc}</p>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}

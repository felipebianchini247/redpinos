'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/inicio', label: 'Inicio' },
  { href: '/admin/quienes-somos', label: 'Quiénes Somos' },
  { href: '/admin/objetivos', label: 'Objetivos' },
  { href: '/admin/como-participar', label: 'Cómo Participar' },
  { href: '/admin/faq', label: 'Preguntas Frecuentes' },
  { href: '/admin/contacto', label: 'Contacto' },
  { href: '/admin/novedades', label: 'Novedades' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="admin-sidebar">
      {navItems.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`admin-sidebar-link${pathname === href ? ' active' : ''}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

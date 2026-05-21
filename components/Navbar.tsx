'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/quienes-somos', label: 'Quiénes Somos' },
  { href: '/objetivos', label: 'Objetivos' },
  { href: '/como-participar', label: 'Cómo Participar' },
  { href: '/novedades', label: 'Novedades' },
  { href: '/preguntas-frecuentes', label: 'Preguntas Frecuentes' },
  { href: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navClass = `main-nav dark stick-fixed${scrolled ? ' small-height' : ' transparent'}`;

  return (
    <nav className={navClass}>
      <div className="full-wrapper relative clearfix">
        <div className="nav-logo-wrap local-scroll">
          <Link href="/" className="logo">
            <Image src="/images/logoRed2.png" alt="Red PINOS" width={156} height={72} priority />
          </Link>
        </div>
        <div
          className="mobile-nav"
          role="button"
          tabIndex={0}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
          onKeyDown={(e) => e.key === 'Enter' && setMobileOpen((o) => !o)}
        >
          <i className="fa fa-bars" />
          <span className="sr-only">Menu</span>
        </div>
        <div className={`inner-nav desktop-nav${mobileOpen ? ' mobile-on' : ''}`}>
          <ul className="clearlist local-scroll">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={
                    pathname === href || (href !== '/' && pathname.startsWith(href))
                      ? 'active'
                      : ''
                  }
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

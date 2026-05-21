// app/(site)/layout.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageLoader from '@/components/PageLoader';

export const metadata: Metadata = {
  title: 'Red PINOS',
  description: 'Red PINOS — Protejamos la Patagonia de la invasión de pinos',
  icons: { icon: '/images/logoRed1.jpg' },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <head>
        <link rel="stylesheet" href="/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/style-responsive.css" />
        <link rel="stylesheet" href="/css/animate.min.css" />
        <link rel="stylesheet" href="/css/vertical-rhythm.min.css" />
        <link rel="stylesheet" href="/css/owl.carousel.css" />
        <link rel="stylesheet" href="/css/magnific-popup.css" />
        <link rel="stylesheet" href="/css/et-line.css" />
        <script src="https://kit.fontawesome.com/a77c6ebfcb.js" crossOrigin="anonymous" async />
      </head>
      <body className="appear-animate">
        <PageLoader />
        <a href="#main" className="btn skip-to-content">
          Skip to Content
        </a>
        <div className="page" id="top">
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </div>
        <Script
          src="/js/wow.min.js"
          strategy="afterInteractive"
          onLoad={() => {
            // @ts-ignore
            if (typeof WOW !== 'undefined') new WOW({ offset: 50, mobile: false }).init();
          }}
        />
      </body>
    </>
  );
}

'use client';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function WowScript() {
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (typeof window !== 'undefined' && win.WOW) {
      new win.WOW({ offset: 50, mobile: false }).init();
    }
  }, [pathname]);

  return (
    <Script
      src="/js/wow.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        // @ts-expect-error — WOW is loaded via script tag
        if (typeof WOW !== 'undefined') new WOW({ offset: 50, mobile: false }).init();
      }}
    />
  );
}

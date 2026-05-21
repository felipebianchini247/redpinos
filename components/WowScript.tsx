'use client';
import Script from 'next/script';

export default function WowScript() {
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

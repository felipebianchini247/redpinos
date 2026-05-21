// app/admin/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — Red PINOS',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <head>
        <link rel="stylesheet" href="/css/admin.css" />
      </head>
      <body>
        {children}
      </body>
    </>
  );
}

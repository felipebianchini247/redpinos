// app/(site)/novedades/[slug]/page.tsx
import { getNovedades, getNoticiaBySlug } from '@/lib/content';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const novedades = await getNovedades();
  return novedades.map((n) => ({ slug: n.slug }));
}

export default async function NoticiaPage({ params }: { params: { slug: string } }) {
  const noticia = await getNoticiaBySlug(params.slug);
  if (!noticia) notFound();

  return (
    <>
      <section
        className="page-section bg-dark-alfa-30"
        style={{ backgroundImage: "url('/images/invasionPinos2.png')" }}
      >
        <div className="relative container align-left">
          <div className="row">
            <div className="col-md-10">
              <h1 className="hs-line-11 font-alt mb-20 mb-xs-0">{noticia.titulo}</h1>
              <div className="hs-line-4 font-alt">
                {new Date(noticia.fecha + 'T12:00:00').toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container relative">
          <div className="row">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              {noticia.imagen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={noticia.imagen}
                  alt={noticia.titulo}
                  style={{ width: '100%', borderRadius: 4, marginBottom: 32 }}
                />
              )}
              <div className="section-text" style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {noticia.texto}
              </div>
              <div style={{ marginTop: 40 }}>
                <Link href="/novedades" className="btn btn-mod btn-round btn-large">
                  ← Volver a Novedades
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

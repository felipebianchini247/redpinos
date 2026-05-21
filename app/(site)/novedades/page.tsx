// app/(site)/novedades/page.tsx
import Link from 'next/link';
import { getNovedades } from '@/lib/content';

export default function NovedadesPage() {
  const novedades = getNovedades();

  return (
    <>
      <section
        className="page-section bg-dark-alfa-30"
        style={{ backgroundImage: "url('/images/invasionPinos2.png')" }}
      >
        <div className="relative container align-left">
          <div className="row">
            <div className="col-md-8">
              <h1 className="hs-line-11 font-alt mb-20 mb-xs-0">Novedades</h1>
              <div className="hs-line-4 font-alt">Actividades y noticias de la Red PINOS</div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container relative">
          {novedades.length === 0 ? (
            <div className="align-center section-text">
              <p>Próximamente publicaremos nuestras novedades aquí.</p>
            </div>
          ) : (
            <div className="row multi-columns-row mb-20 mb-xs-10">
              {novedades.map((noticia) => (
                <div key={noticia.id} className="col-sm-6 col-md-4 col-lg-4 mb-40 wow fadeIn">
                  <div className="post-prev-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={noticia.imagen} alt={noticia.titulo} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
                  </div>
                  <div className="post-prev-title font-alt">
                    <Link href={`/novedades/${noticia.slug}`}>{noticia.titulo}</Link>
                  </div>
                  <div className="post-prev-info font-alt" style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>
                    {new Date(noticia.fecha + 'T12:00:00').toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="post-prev-text" style={{ WebkitLineClamp: 3, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                    {noticia.texto}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Link href={`/novedades/${noticia.slug}`} className="btn btn-mod btn-small btn-round">
                      Leer más
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

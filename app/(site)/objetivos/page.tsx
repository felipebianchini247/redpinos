// app/(site)/objetivos/page.tsx
import { getObjetivosContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function ObjetivosPage() {
  const { h1, lineaBaseTitulo, introTexto, items, pasos } = await getObjetivosContent();

  return (
    <>
      <section
        className="page-section bg-dark-alfa-30"
        style={{ backgroundImage: "url('/images/invasionPinos2.png')" }}
      >
        <div className="relative container align-left">
          <div className="row">
            <div className="col-md-8">
              <h1 className="hs-line-11 font-alt mb-20 mb-xs-0">{h1}</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section" id="expertise">
        <div className="container relative">
          <div className="row mb-60 mb-xs-40">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <div className="section-text align-center">
                <h3>{lineaBaseTitulo}</h3>
                {introTexto}
              </div>
            </div>
          </div>
          <hr className="mt-0 mb-80 mb-xs-40" />
          <div className="row multi-columns-row alt-features-grid">
            {items.map(({ icon, title, text }, i) => (
              <div key={i} className="col-sm-6 col-md-4 col-lg-4">
                <div className="alt-features-item align-center">
                  <div className="mb-10"><i className={icon} /></div>
                  <h3 className="alt-features-title font-alt">{title}</h3>
                  <div className="alt-features-descr">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="page-section bg-dark-lighter"
        style={{ backgroundImage: "url('/images/objetivos.png')" }}
      >
        <div className="container relative">
          <div className="row alt-features-grid font-alt">
            {pasos.map(({ icon, label }, i) => (
              <div key={i} className="col-sm-4 wow fadeInRight" data-wow-delay={`${(i + 1) * 0.1}s`}>
                <div className="alt-features-item align-center">
                  <div className="alt-features-icon white"><span className={icon} /></div>
                  <h3 className="alt-features-title">{label}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// app/(site)/quienes-somos/page.tsx
import { getQuienesSomosContent } from '@/lib/content';

export default function QuienesSomosPage() {
  const { aniofundacion, campaniasExitosas, focosDetectados, textoIntegrantes } =
    getQuienesSomosContent();

  return (
    <>
      <section
        className="page-section bg-dark-alfa-30"
        style={{ backgroundImage: "url('/images/invasionPinos2.png')" }}
      >
        <div className="relative container align-left">
          <div className="row">
            <div className="col-md-8">
              <h1 className="hs-line-11 font-alt mb-20 mb-xs-0">Acerca de nosotros</h1>
              <div className="hs-line-4 font-alt">Juntos somos +</div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container relative">
          <div className="row multi-columns-row features-grid">
            {[
              { value: aniofundacion, label: 'Creación Red PINOS' },
              { value: campaniasExitosas, label: 'Campañas exitosas' },
              { value: focosDetectados, label: 'focos de invasión detectados' },
            ].map(({ value, label }) => (
              <div key={label} className="col-sm-6 col-md-4 col-lg-4">
                <div className="features-item align-center">
                  <div className="count-number">{value}</div>
                  <h3 className="alt-features-title font-alt">{label}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="split-section bg-gray-lighter">
        <div className="clearfix relative">
          <div className="split-section-headings right">
            <div className="ssh-table">
              <div
                className="ssh-cell page-section bg-scroll"
                style={{ backgroundImage: "url('/images/nosotros.png')" }}
              />
            </div>
          </div>
          <div className="split-section-content small-section pt-100 pb-100 pt-sm-50 pb-sm-50">
            <div className="split-section-wrapper left">
              <div className="text">
                <h2 className="font-alt mt-0 mb-50 mb-xxs-20">Integrantes</h2>
                <div className="row">
                  <div className="col">
                    <div className="alt-service-item mt-0 mb-20">
                      <div className="alt-service-icon">
                        <i className="fa-solid fa-people-group fa-lg" />
                      </div>
                      {textoIntegrantes}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// app/(site)/objetivos/page.tsx
export default function ObjetivosPage() {
  const items = [
    { icon: 'fa-solid fa-building-columns fa-2xl', title: 'Línea de Base', desc: 'Establecer la línea de base socio ambiental vinculada a las invasiones de pinos dentro de las áreas de intervención.' },
    { icon: 'fa-solid fa-tree fa-2xl', title: 'Valoración', desc: 'Promover la valoración relativa de especies arbóreas autóctonas vs. exóticas, dentro de San Carlos de Bariloche y alrededores.' },
    { icon: 'fa-solid fa-tree-city fa-2xl', title: 'Detección', desc: 'Promover la detección y registro de focos de invasión en forma participativa.' },
    { icon: 'fa-solid fa-hand-fist fa-2xl', title: 'Remoción', desc: 'Organizar la remoción manual de renovales silvestres de pino con la participación de voluntarios, registrando las extracciones para ponderar la gravedad de cada caso. Impulsar el corte de ejemplares semilleros con la autorización y el apoyo de las autoridades correspondientes.' },
    { icon: 'fa-solid fa-handshake fa-2xl', title: 'Convenios de cooperación', desc: 'Promover la realización de convenios de cooperación entre los sectores, instituciones y jurisdicciones involucrados.' },
    { icon: 'fa-solid fa-chart-line fa-2xl', title: 'Análisis', desc: 'Analizar la eficacia de etapas tempranas de la gobernanza colaborativa de invasiones por pinos y transferir la experiencia a otros casos con problemáticas similares.' },
  ];

  return (
    <>
      <section
        className="page-section bg-dark-alfa-30"
        style={{ backgroundImage: "url('/images/invasionPinos2.png')" }}
      >
        <div className="relative container align-left">
          <div className="row">
            <div className="col-md-8">
              <h1 className="hs-line-11 font-alt mb-20 mb-xs-0">Objetivos</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section" id="expertise">
        <div className="container relative">
          <div className="row mb-60 mb-xs-40">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <div className="section-text align-center">
                <h3>LÍNEA DE BASE</h3>
                La Red PINOS trabaja para reducir el impacto ecológico y ambiental de las invasiones de pinos, impulsando la colaboración interinstitucional y la participación ciudadana en la identificación, el registro y la remoción de estas especies en procesos de invasión. Con este objetivo, busca construir un modelo de gobernanza ambiental que promueva soluciones sostenibles para proteger la biodiversidad y mejorar el bienestar de la sociedad.
              </div>
            </div>
          </div>
          <hr className="mt-0 mb-80 mb-xs-40" />
          <div className="row multi-columns-row alt-features-grid">
            {items.map(({ icon, title, desc }) => (
              <div key={title} className="col-sm-6 col-md-4 col-lg-4">
                <div className="alt-features-item align-center">
                  <div className="mb-10"><i className={icon} /></div>
                  <h3 className="alt-features-title font-alt">{title}</h3>
                  <div className="alt-features-descr">{desc}</div>
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
            {[
              { icon: 'icon-telescope', label: 'Paso 1', delay: '0.1s' },
              { icon: 'icon-presentation', label: 'Paso 2', delay: '0.2s' },
              { icon: 'icon-piechart', label: 'Paso 3', delay: '0.3s' },
            ].map(({ icon, label, delay }) => (
              <div key={label} className="col-sm-4 wow fadeInRight" data-wow-delay={delay}>
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

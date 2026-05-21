// app/(site)/como-participar/page.tsx
const items = [
  { img: 'sensibilizacion.png', title: 'Sensibilización', delay: '0.1s', text: 'Compartí información sobre las invasiones de pinos y actividades de la Red con tu círculo y redes sociales, utilizando materiales, contenidos y novedades de la Red PINOS.\nParticipá en charlas, talleres y eventos organizados por la Red PINOS.' },
  { img: 'controlyrestauracion.png', title: 'Control y Restauración', delay: '0.3s', text: 'Unite a las campañas de remoción manual de plántulas y renovales de pinos invasores.\nParticipá en talleres de capacitación: aprendé sobre las mejores prácticas para la identificación, la remoción de pinos invasores y la gestión de áreas intervenidas.' },
  { img: 'monitoreoyregistro.png', title: 'Monitoreo y Registro', delay: '0.2s', text: 'Participá en evaluaciones del impacto de las intervenciones. Colaborá en el mapeo participativo de focos de invasiones, identificando, registrando y compartiendo fotos y ubicaciones.' },
  { img: 'gobernanzaycolaboracion.png', title: 'Gobernanza y Colaboración', delay: '0.1s', text: 'La Red PINOS conecta y articula personas e instituciones, promoviendo el intercambio de conocimientos e información, la colaboración, y la resolución de conflictos. Participá en la toma de decisiones y en la planificación de las acciones de la Red PINOS.' },
  { img: 'formacioneinvestigacion.png', title: 'Formación e Investigación', delay: '0.2s', text: 'Realizá estudios de investigación y tesis, profundizando en las diferentes líneas de trabajo de la Red. Colaborá con equipos de investigación en la recopilación de datos, análisis de información y desarrollo de estudios sobre las invasiones de pinos.' },
];

export default function ComoParticiparPage() {
  return (
    <>
      <section
        className="page-section bg-dark-alfa-30"
        style={{ backgroundImage: "url('/images/invasionPinos2.png')" }}
      >
        <div className="relative container align-left">
          <div className="row">
            <div className="col-md-8">
              <h1 className="hs-line-11 font-alt mb-20 mb-xs-0">Cómo participar</h1>
              <div className="hs-line-4 font-alt">Convertite en voluntario de Red PINOS y ayudanos a cuidar el bosque.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container relative">
          <div className="row">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <div className="section-text align-center mb-70 mb-xs-40">
                Convertite en voluntario de Red PINOS y ayudanos a cuidar el bosque.<br />
                ¿Te apasiona la naturaleza y querés contribuir a su protección? La Red PINOS te invita a formar parte de la solución, trabajando juntos para controlar las invasiones de pinos. Tenemos un montón de actividades en las que te podés sumar:
              </div>
            </div>
          </div>
          <div className="row multi-columns-row mb-20 mb-xs-10">
            {items.map(({ img, title, delay, text }) => (
              <div key={title} className="col-sm-6 col-md-4 col-lg-4 mb-20 wow fadeIn" data-wow-delay={delay} data-wow-duration="2s">
                <div className="post-prev-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/images/${img}`} alt={title} />
                </div>
                <div className="post-prev-title font-alt"><a>{title}</a></div>
                <div className="post-prev-text" style={{ whiteSpace: 'pre-line' }}>{text}</div>
              </div>
            ))}
          </div>
          <div className="align-center">
            <a href="https://www.instagram.com/red.pinos/" target="_blank" rel="noopener noreferrer" className="btn btn-mod btn-round btn-large">SUMARME</a>
          </div>
        </div>
      </section>
    </>
  );
}

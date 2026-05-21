// app/(site)/page.tsx
import { getHomeContent } from '@/lib/content';

export default function HomePage() {
  const { heroTitulo, quienesSomosBreve } = getHomeContent();

  return (
    <>
      {/* Hero Section */}
      <section
        className="home-section bg-dark bg-dark-alfa-30"
        id="home"
        style={{ backgroundImage: "url('/images/invasionPinos.png')" }}
      >
        <div className="js-height-full container">
          <div className="home-content">
            <div className="home-text">
              <div className="row">
                <div className="col-md-4 offset-md-1 align-center pt-20 mb-sm-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="hidden-sm d-none d-sm-inline-block"
                    src="/images/logoRed2.png"
                    style={{ maxWidth: 230 }}
                    alt="Red PINOS"
                  />
                </div>
                <div className="col-md-7 align-left">
                  <h1 className="font-alt">{heroTitulo}</h1>
                  <div>
                    <a href="#about" className="btn btn-mod btn-gray btn-round btn-large">
                      CONOCER MÁS
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiénes Somos Section */}
      <section className="page-section" id="about">
        <div className="container relative">
          <h2 className="section-title font-alt mb-70 mb-sm-40">QUIÉNES SOMOS</h2>
          <div className="row mb-60">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <div className="section-text align-center">{quienesSomosBreve}</div>
            </div>
          </div>
          <div className="align-center">
            <a href="/quienes-somos" className="btn btn-mod btn-round btn-large">
              MÁS ACERCA DE NOSOTROS
            </a>
          </div>
        </div>
      </section>

      {/* De Qué Se Trata — Split Section */}
      <section className="split-section bg-gray-lighter">
        <div className="clearfix relative">
          <div className="split-section-headings right">
            <div className="ssh-table">
              <div
                className="ssh-cell page-section bg-scroll"
                style={{ backgroundImage: "url('/images/dequesetrata1000x810.png')" }}
              />
            </div>
          </div>
          <div className="split-section-content small-section pt-100 pb-100 pt-sm-50 pb-sm-50">
            <div className="split-section-wrapper left">
              <div className="text">
                <h2 className="font-alt mt-0 mb-50 mb-xxs-20">DE QUÉ SE TRATA</h2>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="alt-service-item mt-0 mb-20">
                      <div className="alt-service-icon"><i className="fa fa-question" /></div>
                      <h3 className="alt-services-title font-alt">¿Qué es la gobernanza ambiental?</h3>
                      La gobernanza ambiental representa un intento de solución a problemas ambientales complejos, a través de la articulación de esfuerzos gubernamentales con iniciativas desde la sociedad civil.
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="alt-service-item mt-0 mb-20">
                      <div className="alt-service-icon"><i className="fa fa-users" /></div>
                      <h3 className="alt-services-title font-alt">La importancia de la participación ciudadana</h3>
                      Esa gobernanza ambiental es participativa, cuando parte de la premisa de que el conocimiento y el involucramiento de los actores sociales promueve la legitimidad y efectividad de las decisiones, y ofrece los mecanismos adecuados para ese involucramiento en procesos colaborativos.
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="alt-service-item mt-0 mb-20">
                      <div className="alt-service-icon"><i className="fa fa-tree" /></div>
                      <h3 className="alt-services-title font-alt">El origen de la Red PINOS</h3>
                      Los procesos colaborativos en torno a problemas ambientales pueden darse por iniciativa de cualquiera de las partes. En nuestro caso, un grupo de investigadores de la Fundación Bariloche y del INIBIOMA iniciaron la construcción de esta Red en septiembre de 2021, en el marco de la Agenda Bosque Bariloche (ABB), de la Agenda Científica Participativa (ACP).
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="alt-service-item mt-0 mb-20">
                      <div className="alt-service-icon"><i className="fa fa-line-chart" /></div>
                      <h3 className="alt-services-title font-alt">Un crecimiento basado en la colaboración</h3>
                      Desde entonces, la Red PINOS ha ido creciendo y hoy nuclea participantes de 8 instituciones gubernamentales y no gubernamentales, así como un número en constante crecimiento de voluntarios, seguidores y colaboradores en las distintas líneas de trabajo de la Red.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Entendiendo el Desafío */}
      <section className="page-section">
        <div className="container relative">
          <h2 className="section-title font-alt mb-70 mb-sm-40">Entendiendo el desafío</h2>
          <div className="row">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <div className="section-text align-center mb-70 mb-xs-40">
                Conocé el problema, sus consecuencias y cómo trabajamos para solucionarlo.
              </div>
            </div>
          </div>
          <div className="row multi-columns-row mb-20 mb-xs-10">
            {[
              { img: 'InvasionesGPT.png', title: 'Invasiones', text: 'Los pinos exóticos avanzan sobre áreas naturales y periurbanas de la Patagonia, desplazando a la vegetación nativa y alterando los ecosistemas. Su expansión es rápida y, si no se controla, amenaza la salud de nuestros bosques y paisajes.' },
              { img: 'problemaGPT.png', title: 'El Problema', text: 'La invasión de pinos genera pérdida de biodiversidad, aumento del riesgo de incendios y cambios en el paisaje que afectan la economía, la seguridad y la calidad de vida. Cuanto más tardemos en actuar, más costosa y difícil será la solución.' },
              { img: 'nuestraVisionGPT.png', title: 'Nuestra Visión', text: 'Creemos que la solución está en la colaboración: unir ciencia, ciudadanía e instituciones para actuar de manera temprana y efectiva. Buscamos un modelo de gobernanza ambiental participativa que proteja la Patagonia para las generaciones futuras.' },
            ].map(({ img, title, text }, i) => (
              <div key={title} className="col-sm-6 col-md-4 col-lg-4 mb-20 wow fadeIn" data-wow-delay={`${(i + 1) * 0.1}s`} data-wow-duration="2s">
                <div className="post-prev-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/images/${img}`} alt={title} />
                </div>
                <div className="post-prev-title font-alt"><a>{title}</a></div>
                <div className="post-prev-text">{text}</div>
              </div>
            ))}
          </div>
          <div className="align-center">
            <a href="/objetivos" className="btn btn-mod btn-round btn-large">SABER MÁS</a>
          </div>
        </div>
      </section>

      {/* Registro Ciudadano */}
      <section
        className="page-section bg-dark-lighter"
        style={{ backgroundImage: "url('/images/invasionPinos2.png')" }}
      >
        <div className="container relative">
          <h2 className="section-title font-alt mb-70 mb-sm-40">REGISTRO CIUDADANO DE PINOS</h2>
          <div className="row alt-features-grid font-alt">
            {[
              { icon: 'fa-solid fa-person-hiking fa-2xl', label: 'Salís a pasear', delay: '0.1s' },
              { icon: 'fa-solid fa-tree fa-2xl', label: 'Ves un pinito', delay: '0.2s' },
              { icon: 'fa-solid fa-camera fa-2xl', label: 'Enviás foto y ubicación', delay: '0.3s' },
            ].map(({ icon, label, delay }) => (
              <div key={label} className="col-sm-4 wow fadeInRight" data-wow-delay={delay}>
                <div className="alt-features-item align-center">
                  <i className={icon} />
                  <h3 className="alt-features-title">{label}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voluntario */}
      <section className="page-section" id="voluntario">
        <div className="container relative">
          <h2 className="section-title font-alt mb-70 mb-sm-40">Convertite en voluntario</h2>
          <div className="row mb-60">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <div className="section-text align-center">
                Sumate a la Red PINOS y ayudanos a proteger la biodiversidad de la Patagonia. Participar es sencillo y tu aporte hace la diferencia en la detección y control de pinos invasores. ¡Tu acción es clave para conservar nuestros bosques!
              </div>
            </div>
          </div>
          <div className="align-center">
            <a href="/como-participar" className="btn btn-mod btn-round btn-large">ANOTARME</a>
          </div>
        </div>
      </section>

      <hr className="mt-0 mb-80 mb-xs-40" />

      {/* Contacto */}
      <section className="page-section" id="contact">
        <div className="container relative">
          <h2 className="section-title font-alt mb-70 mb-sm-40">Contacto</h2>
          <div className="row">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <div className="row">
                <div className="col-sm-6 col-lg-4 pt-20 pb-20 pb-xs-0">
                  <div className="contact-item">
                    <div className="ci-icon"><i className="fa fa-whatsapp" /></div>
                    <div className="ci-title font-alt">Whatsapp</div>
                    <div className="ci-text">+54 9 294 413-0948</div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 pt-20 pb-20 pb-xs-0">
                  <div className="contact-item">
                    <div className="ci-icon"><i className="fa fa-map-marker" /></div>
                    <div className="ci-title font-alt">Dirección</div>
                    <div className="ci-text">Bariloche, Rio Negro, Argentina</div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 pt-20 pb-20 pb-xs-0">
                  <div className="contact-item">
                    <div className="ci-icon"><i className="fa fa-envelope" /></div>
                    <div className="ci-title font-alt">Email</div>
                    <div className="ci-text">
                      <a href="mailto:redpinosgobernanza@gmail.com">redpinosgobernanza@gmail.com</a>
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

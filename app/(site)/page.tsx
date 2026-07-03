// app/(site)/page.tsx
import { getHomeContent, getContactoContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [
    { heroTitulo, quienesSomosBreve, deQueSeTrataTitulo, deQueSeTrata, entendiendoElDesafioTitulo, entendiendoElDesafioIntro, entendiendoElDesafio, registroCiudadanoTitulo, registroCiudadano, voluntarioTitulo, voluntarioTexto },
    { whatsapp, direccion, email },
  ] = await Promise.all([getHomeContent(), getContactoContent()]);

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
                <h2 className="font-alt mt-0 mb-50 mb-xxs-20">{deQueSeTrataTitulo}</h2>
                <div className="row">
                  {deQueSeTrata.map(({ icon, title, text }, i) => (
                    <div key={i} className="col-sm-6">
                      <div className="alt-service-item mt-0 mb-20">
                        <div className="alt-service-icon"><i className={icon} /></div>
                        <h3 className="alt-services-title font-alt">{title}</h3>
                        {text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Entendiendo el Desafío */}
      <section className="page-section">
        <div className="container relative">
          <h2 className="section-title font-alt mb-70 mb-sm-40">{entendiendoElDesafioTitulo}</h2>
          <div className="row">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <div className="section-text align-center mb-70 mb-xs-40">
                {entendiendoElDesafioIntro}
              </div>
            </div>
          </div>
          <div className="row multi-columns-row mb-20 mb-xs-10">
            {entendiendoElDesafio.map(({ img, title, text }, i) => (
              <div key={i} className="col-sm-6 col-md-4 col-lg-4 mb-20 wow fadeIn" data-wow-delay={`${(i + 1) * 0.1}s`} data-wow-duration="2s">
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
            <a href="/herramientas" className="btn btn-mod btn-round btn-large">SABER MÁS</a>
          </div>
        </div>
      </section>

      {/* Registro Ciudadano */}
      <section
        className="page-section bg-dark-lighter"
        style={{ backgroundImage: "url('/images/invasionPinos2.png')" }}
      >
        <div className="container relative">
          <h2 className="section-title font-alt mb-70 mb-sm-40">{registroCiudadanoTitulo}</h2>
          <div className="row alt-features-grid font-alt">
            {registroCiudadano.map(({ icon, label }, i) => (
              <div key={i} className="col-sm-4 wow fadeInRight" data-wow-delay={`${(i + 1) * 0.1}s`}>
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
          <h2 className="section-title font-alt mb-70 mb-sm-40">{voluntarioTitulo}</h2>
          <div className="row mb-60">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <div className="section-text align-center">
                {voluntarioTexto}
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
                    <div className="ci-text">{whatsapp}</div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 pt-20 pb-20 pb-xs-0">
                  <div className="contact-item">
                    <div className="ci-icon"><i className="fa fa-map-marker" /></div>
                    <div className="ci-title font-alt">Dirección</div>
                    <div className="ci-text">{direccion}</div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 pt-20 pb-20 pb-xs-0">
                  <div className="contact-item">
                    <div className="ci-icon"><i className="fa fa-envelope" /></div>
                    <div className="ci-title font-alt">Email</div>
                    <div className="ci-text">
                      <a href={`mailto:${email}`}>{email}</a>
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

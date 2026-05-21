// app/(site)/contacto/page.tsx
import { getContactoContent } from '@/lib/content';

export default function ContactoPage() {
  const { whatsapp, whatsappNota, email, direccion } = getContactoContent();

  return (
    <>
      <section
        className="page-section bg-dark-alfa-30"
        style={{ backgroundImage: "url('/images/invasionPinos2.png')" }}
      >
        <div className="relative container align-left">
          <div className="row">
            <div className="col-md-8">
              <h1 className="hs-line-11 font-alt mb-20 mb-xs-0">Contacto</h1>
              <div className="hs-line-4 font-alt">Ponete en contacto con nosotros</div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section" id="contact">
        <div className="container relative">
          <h2 className="section-title font-alt mb-70 mb-sm-40">Contacto</h2>
          <div className="row mb-60 mb-xs-40">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <div className="row">
                <div className="col-sm-6 col-lg-4 pt-20 pb-20 pb-xs-0">
                  <div className="contact-item">
                    <div className="ci-icon"><i className="fa fa-whatsapp" /></div>
                    <div className="ci-title font-alt">Whatsapp</div>
                    <div className="ci-text">{whatsapp}</div>
                    {whatsappNota && <div className="ci-text2">{whatsappNota}</div>}
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

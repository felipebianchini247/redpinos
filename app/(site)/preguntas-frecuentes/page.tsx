// app/(site)/preguntas-frecuentes/page.tsx
import { getFaqContent } from '@/lib/content';
import FAQAccordion from '@/components/FAQAccordion';

export default function PreguntasFrecuentesPage() {
  const faqs = getFaqContent();

  return (
    <>
      <section
        className="page-section bg-dark-alfa-30"
        style={{ backgroundImage: "url('/images/invasionPinos2.png')" }}
      >
        <div className="relative container align-left">
          <div className="row">
            <div className="col-md-8">
              <h1 className="hs-line-11 font-alt mb-20 mb-xs-0">Preguntas Frecuentes</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container relative">
          <div className="row section-text">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <FAQAccordion faqs={faqs} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

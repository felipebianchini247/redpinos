// app/(site)/preguntas-frecuentes/page.tsx
import { getFaqContent } from '@/lib/content';
import FAQAccordion from '@/components/FAQAccordion';

export const dynamic = 'force-dynamic';

export default async function PreguntasFrecuentesPage() {
  const { h1, items } = await getFaqContent();

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

      <section className="page-section">
        <div className="container relative">
          <div className="row section-text">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <FAQAccordion faqs={items} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

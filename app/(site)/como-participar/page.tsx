// app/(site)/como-participar/page.tsx
import { getComoParticiparContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function ComoParticiparPage() {
  const { h1, subtitulo, introTexto, items } = await getComoParticiparContent();

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
              <div className="hs-line-4 font-alt">{subtitulo}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container relative">
          <div className="row">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <div className="section-text align-center mb-70 mb-xs-40" style={{ whiteSpace: 'pre-line' }}>
                {introTexto}
              </div>
            </div>
          </div>
          <div className="row multi-columns-row mb-20 mb-xs-10">
            {items.map(({ img, title, text }, i) => (
              <div key={i} className="col-sm-6 col-md-4 col-lg-4 mb-20 wow fadeIn" data-wow-delay={`${((i % 3) + 1) * 0.1}s`} data-wow-duration="2s">
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

// app/(site)/preguntas-frecuentes/page.tsx
'use client';
import { useState } from 'react';

const faqs = [
  { q: '¿Qué es la Red PINOS?', a: 'La Red PINOS es una iniciativa colaborativa que reúne a investigadores, técnicos, organizaciones gubernamentales y no gubernamentales, y ciudadanos comprometidos con la gestión sostenible de las coníferas exóticas invasoras en la Patagonia. Buscamos generar conocimiento, promover la participación ciudadana y desarrollar estrategias efectivas para proteger el bosque nativo y la biodiversidad.' },
  { q: '¿Cuál es el objetivo principal de la Red PINOS?', a: 'Nuestro objetivo principal es mitigar los impactos negativos de las invasiones de pinos en los ecosistemas patagónicos, contribuyendo a la conservación de la biodiversidad, la protección de los recursos hídricos y la prevención de incendios forestales.' },
  { q: '¿Quiénes pueden formar parte de la Red PINOS?', a: 'La Red está abierta a todas las personas e instituciones interesadas en la problemática de las invasiones biológicas de especies vegetales en Bariloche y sus alrededores, desde investigadores y técnicos hasta organizaciones ambientales y ciudadanos comprometidos con la conservación del bosque nativo.' },
  { q: '¿Cómo puedo unirme a la Red PINOS?', a: 'Puedes ponerte en contacto con nosotros a través de nuestro email (redpinosgobernanza@gmail.com), nuestro whatsapp (+54 9 2944 13-0948) o nuestras redes sociales (ver en www.linktr.ee/Red.PINOS).' },
  { q: '¿Cómo se financia la Red PINOS?', a: 'La Red Pinos se sostiene a través de una combinación de fuentes, incluyendo proyectos de investigación, donaciones de organizaciones y privados, y sobre todo, de la dedicación ad honorem de sus miembros y voluntarios. Estamos siempre buscando nuevas fuentes de financiamiento para ampliar nuestro trabajo.' },
  { q: '¿Dónde puedo encontrar más información sobre las actividades de la Red PINOS?', a: 'Te invitamos a seguirnos en nuestras redes sociales (ver www.linktr.ee/Red.PINOS) para estar al tanto de las últimas novedades.' },
  { q: '¿Qué son las coníferas exóticas invasoras y por qué son un problema?', a: 'Las coníferas exóticas invasoras son especies de pinos originarias de otras regiones del mundo que se han introducido en la Patagonia y se propagan rápidamente, desplazando a las especies nativas, alterando el ecosistema y aumentando el riesgo de incendios forestales.' },
  { q: '¿Cómo afectan los pinos invasores al bosque nativo?', a: 'Los pinos invasores compiten por recursos (agua, luz, nutrientes) con las especies vegetales nativas, impiden su regeneración, modifican las propiedades del suelo, reducen o eliminan refugios y nichos ecológicos de la fauna nativa, aumentan la inflamabilidad del bosque y reducen la disponibilidad de agua.' },
  { q: '¿Cómo aumentan los pinos el riesgo e intensidad de incendios?', a: 'Los pinos son altamente combustibles debido a su alto contenido de resina. Además, crean una capa de hojarasca seca que facilita la propagación del fuego y aumentan la intensidad de los incendios. La coexistencia de pinos de distintas edades promueve la continuidad vertical del combustible y la generación de fuego de copa.' },
  { q: '¿Dónde se encuentran principalmente los pinos invasores en la Patagonia?', a: 'Los pinos invasores se encuentran en diversas zonas de la Patagonia Andina, principalmente en los bosques de la Cordillera y el ecotono con la estepa de Precordillera. Las invasiones se concentran especialmente en áreas perturbadas de las interfases natural-urbana.' },
  { q: '¿Es cierto que los pinos no tienen ningún valor?', a: 'Si bien las invasiones de pinos exóticos causan graves problemas, los pinos representan una fuente de madera y leña. La región patagónica ofrece oportunidades para el cultivo de varias especies de pinos de valor forestal, con potencial para la producción de madera en sitios que actualmente carecen de cobertura boscosa.' },
  { q: '¿Qué acciones se están llevando a cabo para controlar la invasión de pinos?', a: 'Se están implementando diversas estrategias de control, incluyendo la remoción manual de plántulas y árboles jóvenes, el volteo de árboles adultos, el "anillado" o remoción de corteza, y la restauración del bosque nativo con especies autóctonas.' },
  { q: '¿Cómo puedo participar en las acciones de control de la Red PINOS?', a: 'Puedes participar como voluntario en las jornadas de remoción, difundiendo información sobre la problemática, apoyando a la Red a través de tus capacidades, o participando en la toma de decisiones.' },
  { q: '¿Qué puedo hacer en mi propiedad si tengo pinos invasores?', a: 'Si en tu propiedad existe una masa forestal importante, te recomendamos contactar con un técnico forestal para elaborar un plan de manejo adaptado a tus necesidades y recursos. En el Servicio Forestal Andino (Pje. Gutiérrez 983 - 0294 443-1113) podés solicitar autorización para crear cortafuegos y reforestar con especies nativas.' },
  { q: '¿El control de pinos es costoso?', a: 'Sí, el control de la invasión de pinos puede ser muy costoso, especialmente en áreas extensas y densamente invadidas. Sin embargo, los costos de no actuar pueden ser aún mayores, incluyendo la pérdida de biodiversidad, la disminución de los recursos hídricos y el aumento del riesgo de incendios.' },
  { q: '¿La Red PINOS tiene como objetivo erradicar los pinos exóticos en áreas invadidas de Bariloche?', a: 'Debido al estado avanzado del proceso de invasión, la erradicación es prácticamente inviable. La Red PINOS está enfocada en el control de las invasiones en áreas prioritarias, concentrando esfuerzos y recursos escasos en sitios donde las tareas de remoción produzcan altos beneficios ecológicos y sociales.' },
  { q: '¿Cómo se promueve la gobernanza ambiental participativa en la gestión de las invasiones de pinos?', a: 'La Red PINOS promueve la participación de diversos actores (organizaciones gubernamentales y no gubernamentales, investigadores, productores, comunidades locales) en la toma de decisiones y la implementación de acciones de control y restauración.' },
  { q: '¿Qué tipo de políticas públicas son necesarias para abordar la problemática de las invasiones de pinos?', a: 'Se necesitan políticas que promuevan las buenas prácticas en la gestión de las plantaciones comerciales, que fomenten la conservación de bosques nativos, que regulen la introducción de especies invasoras, y que promuevan la educación ambiental. Desde la Red PINOS consideramos que la gobernanza también requiere del involucramiento de organizaciones de base y de la comunidad en general.' },
];

export default function PreguntasFrecuentesPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
              <dl className="accordion">
                {faqs.map(({ q, a }, i) => (
                  <div key={q}>
                    <dt>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); setOpenIndex(openIndex === i ? null : i); }}
                      >
                        {q}
                      </a>
                    </dt>
                    <dd style={{ display: openIndex === i ? 'block' : 'none' }}>{a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

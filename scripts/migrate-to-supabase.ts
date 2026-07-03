import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
const supabase = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
});

const contentDir = path.join(process.cwd(), 'content');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

function readJson<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(path.join(contentDir, filename), 'utf-8')) as T;
}

async function upsertPage(slug: string, content: Record<string, unknown>) {
  const { error } = await supabase.from('pages').upsert({ slug, content, updated_at: new Date().toISOString() });
  if (error) throw new Error(`Failed to upsert page "${slug}": ${error.message}`);
  console.log(`✓ page "${slug}"`);
}

async function migratePages() {
  const home = readJson<{ heroTitulo: string; quienesSomosBreve: string }>('home.json');
  await upsertPage('home', {
    heroTitulo: home.heroTitulo,
    quienesSomosBreve: home.quienesSomosBreve,
    deQueSeTrataTitulo: 'DE QUÉ SE TRATA',
    deQueSeTrata: [
      { icon: 'fa fa-question', title: '¿Qué es la gobernanza ambiental?', text: 'La gobernanza ambiental representa un intento de solución a problemas ambientales complejos, a través de la articulación de esfuerzos gubernamentales con iniciativas desde la sociedad civil.' },
      { icon: 'fa fa-users', title: 'La importancia de la participación ciudadana', text: 'Esa gobernanza ambiental es participativa, cuando parte de la premisa de que el conocimiento y el involucramiento de los actores sociales promueve la legitimidad y efectividad de las decisiones, y ofrece los mecanismos adecuados para ese involucramiento en procesos colaborativos.' },
      { icon: 'fa fa-tree', title: 'El origen de la Red PINOS', text: 'Los procesos colaborativos en torno a problemas ambientales pueden darse por iniciativa de cualquiera de las partes. En nuestro caso, un grupo de investigadores de la Fundación Bariloche y del INIBIOMA iniciaron la construcción de esta Red en septiembre de 2021, en el marco de la Agenda Bosque Bariloche (ABB), de la Agenda Científica Participativa (ACP).' },
      { icon: 'fa fa-line-chart', title: 'Un crecimiento basado en la colaboración', text: 'Desde entonces, la Red PINOS ha ido creciendo y hoy nuclea participantes de 8 instituciones gubernamentales y no gubernamentales, así como un número en constante crecimiento de voluntarios, seguidores y colaboradores en las distintas líneas de trabajo de la Red.' },
    ],
    entendiendoElDesafioTitulo: 'Entendiendo el desafío',
    entendiendoElDesafioIntro: 'Conocé el problema, sus consecuencias y cómo trabajamos para solucionarlo.',
    entendiendoElDesafio: [
      { img: 'InvasionesGPT.png', title: 'Invasiones', text: 'Los pinos exóticos avanzan sobre áreas naturales y periurbanas de la Patagonia, desplazando a la vegetación nativa y alterando los ecosistemas. Su expansión es rápida y, si no se controla, amenaza la salud de nuestros bosques y paisajes.' },
      { img: 'problemaGPT.png', title: 'El Problema', text: 'La invasión de pinos genera pérdida de biodiversidad, aumento del riesgo de incendios y cambios en el paisaje que afectan la economía, la seguridad y la calidad de vida. Cuanto más tardemos en actuar, más costosa y difícil será la solución.' },
      { img: 'nuestraVisionGPT.png', title: 'Nuestra Visión', text: 'Creemos que la solución está en la colaboración: unir ciencia, ciudadanía e instituciones para actuar de manera temprana y efectiva. Buscamos un modelo de gobernanza ambiental participativa que proteja la Patagonia para las generaciones futuras.' },
    ],
    registroCiudadanoTitulo: 'REGISTRO CIUDADANO DE PINOS',
    registroCiudadano: [
      { icon: 'fa-solid fa-person-hiking fa-2xl', label: 'Salís a pasear' },
      { icon: 'fa-solid fa-tree fa-2xl', label: 'Ves un pinito' },
      { icon: 'fa-solid fa-camera fa-2xl', label: 'Enviás foto y ubicación' },
    ],
    voluntarioTitulo: 'Convertite en voluntario',
    voluntarioTexto: 'Sumate a la Red PINOS y ayudanos a proteger la biodiversidad de la Patagonia. Participar es sencillo y tu aporte hace la diferencia en la detección y control de pinos invasores. ¡Tu acción es clave para conservar nuestros bosques!',
  });

  const quienesSomos = readJson<{ aniofundacion: string; campaniasExitosas: string; focosDetectados: string; textoIntegrantes: string }>('quienesSomos.json');
  await upsertPage('quienes-somos', {
    h1: 'Acerca de nosotros',
    subtitulo: 'Juntos somos +',
    aniofundacion: quienesSomos.aniofundacion,
    campaniasExitosas: quienesSomos.campaniasExitosas,
    focosDetectados: quienesSomos.focosDetectados,
    integrantesTitulo: 'Integrantes',
    textoIntegrantes: quienesSomos.textoIntegrantes,
  });

  const objetivos = readJson<{ introTexto: string }>('objetivos.json');
  await upsertPage('objetivos', {
    h1: 'Objetivos',
    lineaBaseTitulo: 'LÍNEA DE BASE',
    introTexto: objetivos.introTexto,
    items: [
      { icon: 'fa-solid fa-building-columns fa-2xl', title: 'Línea de Base', text: 'Establecer la línea de base socio ambiental vinculada a las invasiones de pinos dentro de las áreas de intervención.' },
      { icon: 'fa-solid fa-tree fa-2xl', title: 'Valoración', text: 'Promover la valoración relativa de especies arbóreas autóctonas vs. exóticas, dentro de San Carlos de Bariloche y alrededores.' },
      { icon: 'fa-solid fa-tree-city fa-2xl', title: 'Detección', text: 'Promover la detección y registro de focos de invasión en forma participativa.' },
      { icon: 'fa-solid fa-hand-fist fa-2xl', title: 'Remoción', text: 'Organizar la remoción manual de renovales silvestres de pino con la participación de voluntarios, registrando las extracciones para ponderar la gravedad de cada caso. Impulsar el corte de ejemplares semilleros con la autorización y el apoyo de las autoridades correspondientes.' },
      { icon: 'fa-solid fa-handshake fa-2xl', title: 'Convenios de cooperación', text: 'Promover la realización de convenios de cooperación entre los sectores, instituciones y jurisdicciones involucrados.' },
      { icon: 'fa-solid fa-chart-line fa-2xl', title: 'Análisis', text: 'Analizar la eficacia de etapas tempranas de la gobernanza colaborativa de invasiones por pinos y transferir la experiencia a otros casos con problemáticas similares.' },
    ],
    pasos: [
      { icon: 'icon-telescope', label: 'Paso 1' },
      { icon: 'icon-presentation', label: 'Paso 2' },
      { icon: 'icon-piechart', label: 'Paso 3' },
    ],
  });

  const comoParticipar = readJson<{ introTexto: string }>('comoParticipar.json');
  await upsertPage('como-participar', {
    h1: 'Cómo participar',
    subtitulo: 'Convertite en voluntario de Red PINOS y ayudanos a cuidar el bosque.',
    introTexto: comoParticipar.introTexto,
    items: [
      { img: 'sensibilizacion.png', title: 'Sensibilización', text: 'Compartí información sobre las invasiones de pinos y actividades de la Red con tu círculo y redes sociales, utilizando materiales, contenidos y novedades de la Red PINOS.\nParticipá en charlas, talleres y eventos organizados por la Red PINOS.' },
      { img: 'controlyrestauracion.png', title: 'Control y Restauración', text: 'Unite a las campañas de remoción manual de plántulas y renovales de pinos invasores.\nParticipá en talleres de capacitación: aprendé sobre las mejores prácticas para la identificación, la remoción de pinos invasores y la gestión de áreas intervenidas.' },
      { img: 'monitoreoyregistro.png', title: 'Monitoreo y Registro', text: 'Participá en evaluaciones del impacto de las intervenciones. Colaborá en el mapeo participativo de focos de invasiones, identificando, registrando y compartiendo fotos y ubicaciones.' },
      { img: 'gobernanzaycolaboracion.png', title: 'Gobernanza y Colaboración', text: 'La Red PINOS conecta y articula personas e instituciones, promoviendo el intercambio de conocimientos e información, la colaboración, y la resolución de conflictos. Participá en la toma de decisiones y en la planificación de las acciones de la Red PINOS.' },
      { img: 'formacioneinvestigacion.png', title: 'Formación e Investigación', text: 'Realizá estudios de investigación y tesis, profundizando en las diferentes líneas de trabajo de la Red. Colaborá con equipos de investigación en la recopilación de datos, análisis de información y desarrollo de estudios sobre las invasiones de pinos.' },
    ],
  });

  const faq = readJson<{ q: string; a: string }[]>('faq.json');
  await upsertPage('faq', { h1: 'Preguntas Frecuentes', items: faq });

  const contacto = readJson<{ whatsapp: string; whatsappNota: string; email: string; direccion: string }>('contacto.json');
  await upsertPage('contacto', {
    h1: 'Contacto',
    subtitulo: 'Ponete en contacto con nosotros',
    whatsapp: contacto.whatsapp,
    whatsappNota: contacto.whatsappNota,
    email: contacto.email,
    direccion: contacto.direccion,
  });
}

async function migrateUploadsAndNovedades() {
  const uploadedFilenames = fs.existsSync(uploadsDir)
    ? fs.readdirSync(uploadsDir).filter((f) => f !== '.gitkeep')
    : [];

  const urlByFilename = new Map<string, string>();
  for (const filename of uploadedFilenames) {
    const filePath = path.join(uploadsDir, filename);
    const fileBuffer = fs.readFileSync(filePath);
    const ext = filename.split('.').pop() ?? '';
    const contentType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/octet-stream';
    const { error } = await supabase.storage.from('uploads').upload(filename, fileBuffer, { contentType, upsert: true });
    if (error) throw new Error(`Failed to upload ${filename}: ${error.message}`);
    const { data } = supabase.storage.from('uploads').getPublicUrl(filename);
    urlByFilename.set(filename, data.publicUrl);
    console.log(`✓ uploaded ${filename}`);
  }

  type NovedadJson = { id: string; slug: string; titulo: string; texto: string; imagen: string; fecha: string; creadoEn: string };
  const novedades = readJson<NovedadJson[]>('novedades.json');

  for (const n of novedades) {
    let imagen = n.imagen;
    if (imagen.startsWith('/uploads/')) {
      const filename = imagen.replace('/uploads/', '');
      imagen = urlByFilename.get(filename) ?? imagen;
    }
    const { error } = await supabase.from('novedades').upsert({
      slug: n.slug,
      titulo: n.titulo,
      texto: n.texto,
      imagen,
      fecha: n.fecha,
      creado_en: n.creadoEn,
    }, { onConflict: 'slug' });
    if (error) throw new Error(`Failed to upsert noticia "${n.slug}": ${error.message}`);
    console.log(`✓ noticia "${n.slug}"`);
  }
}

async function main() {
  await migratePages();
  await migrateUploadsAndNovedades();
  console.log('Migration complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

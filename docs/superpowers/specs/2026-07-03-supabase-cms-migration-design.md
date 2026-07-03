# Migración a Supabase: CMS totalmente editable

## Contexto y motivación

Hoy el contenido del sitio vive en archivos JSON dentro de `content/`, y el
backoffice (`/admin/*`) "guarda" cambios haciendo un commit directo al repo de
GitHub vía la API (`lib/github.ts`). Esto dispara un redeploy completo en
Vercel cada vez que se edita cualquier cosa — incluso crear una novedad tarda
30s-2min en verse reflejada, y cada imagen subida infla el historial de git
para siempre.

Además, solo una fracción del texto del sitio es editable hoy. Mucho
contenido está hardcodeado directamente en los archivos `.tsx` de cada
página (títulos, tarjetas de "De qué se trata", los 6 objetivos, los 5 items
de "Cómo participar", etc.), lo que obliga a pedir ayuda de desarrollo para
cambios de texto simples.

Objetivo: mover todo el contenido a Supabase (Postgres + Storage), de forma
que **todo texto visible del sitio sea editable desde el backoffice sin
necesidad de un redeploy**, y agregar un límite de intentos de login ya que
se toca el sistema de auth de todos modos.

## Arquitectura

- **Lectura** (páginas públicas): Server Components de Next.js consultan
  Supabase directamente en cada request. Las páginas se marcan
  `dynamic = 'force-dynamic'` para evitar contenido cacheado/viejo.
- **Escritura** (backoffice): las Server Actions en `app/admin/actions.ts`
  escriben directo a Postgres vía Supabase (Service Role Key, solo
  server-side, nunca expuesta al cliente). Se elimina `lib/github.ts` y la
  dependencia de `GITHUB_TOKEN` para contenido.
- **Imágenes**: bucket público `uploads` en Supabase Storage reemplaza
  `public/uploads/` + commits a GitHub. Las imágenes existentes se migran al
  bucket.
- **Auth del backoffice**: se mantiene el esquema actual (usuario/contraseña
  fijos en env vars + JWT firmado en cookie httpOnly). No se introduce
  Supabase Auth — sería complejidad innecesaria para un solo admin. Se agrega
  rate-limiting de intentos de login (ver más abajo).

## Modelo de datos (Supabase / Postgres)

### Tabla `pages`
Una fila por página, contenido en JSONB para poder crecer sin migraciones de
schema nuevas cada vez que se agrega un campo editable.

| columna      | tipo        | notas                                        |
|--------------|-------------|-----------------------------------------------|
| `slug`       | text PK     | `home`, `quienes-somos`, `objetivos`, `como-participar`, `contacto`, `faq` |
| `content`    | jsonb       | todo el contenido editable de esa página     |
| `updated_at` | timestamptz | se actualiza en cada save                    |

El contenido de cada `slug` incluye tanto los campos "singleton" que ya
existían (ej. `heroTitulo`) como los arrays de tarjetas que hoy están
hardcodeados en el código (ej. `deQueSeTrata: [{icon, title, text}, ...]`).
Los arrays se editan reemplazando el array completo en cada save — mismo
patrón que ya usa `saveFaqAction` hoy, solo que ahora contra Postgres en vez
de un archivo en GitHub.

Cobertura completa por página (todo lo hoy hardcodeado pasa a `content`):

- **home**: `heroTitulo`, `quienesSomosBreve`, `deQueSeTrataTitulo`,
  `deQueSeTrata[]` ({icon, title, text}), `entendiendoElDesafioTitulo`,
  `entendiendoElDesafioIntro`, `entendiendoElDesafio[]` ({img, title, text}),
  `registroCiudadanoTitulo`, `registroCiudadano[]` ({icon, label}),
  `voluntarioTitulo`, `voluntarioTexto`. El bloque de contacto del home deja
  de tener whatsapp/dirección/email hardcodeados y pasa a leer de la página
  `contacto` (elimina la duplicación actual).
- **quienes-somos**: `h1`, `subtitulo`, `aniofundacion`, `campaniasExitosas`,
  `focosDetectados`, `integrantesTitulo`, `textoIntegrantes`.
- **objetivos**: `h1`, `lineaBaseTitulo`, `introTexto`, `items[]` ({icon,
  title, desc}), `pasos[]` ({icon, label}).
- **como-participar**: `h1`, `subtitulo`, `introTexto`, `items[]` ({img,
  title, text}).
- **faq**: `h1`, `items[]` ({q, a}) — mismo array que ya existe hoy.
- **contacto**: `h1`, `subtitulo`, `whatsapp`, `whatsappNota`, `email`,
  `direccion`.

### Tabla `novedades`
Se mantiene como tabla relacional propia (no JSONB) porque ya funciona bien
así y crece de forma indefinida en el tiempo:

`id uuid PK`, `slug text unique`, `titulo text`, `texto text`, `imagen text`,
`fecha date`, `creado_en timestamptz`.

### Tabla `login_attempts`
Para el rate-limiting del login del backoffice:

`identifier text PK`, `intentos int`, `bloqueado_hasta timestamptz null`,
`ultimo_intento timestamptz`.

`identifier` es el username intentado (no la IP): como solo existe un
usuario admin válido, alcanza para frenar fuerza bruta y evita depender de
headers de IP que se pueden falsificar.

Regla: 5 intentos fallidos → bloqueo de 5 minutos. Se resetea el contador en
un login exitoso.

### Storage
Bucket público `uploads` para imágenes de novedades. Las imágenes existentes
en `public/uploads/` se suben al bucket durante la migración y las rutas en
`novedades.imagen` se actualizan a la URL pública de Supabase Storage.

### RLS (Row Level Security)
- `pages` y `novedades`: `SELECT` público habilitado (contenido público del
  sitio).
- Todas las escrituras (`INSERT`/`UPDATE`/`DELETE`) solo vía Service Role Key
  desde las Server Actions — el cliente anónimo no tiene permiso de
  escritura en ninguna tabla.
- `login_attempts`: sin acceso público, solo Service Role Key.

## Componentes y archivos afectados

- **Nuevo** `lib/supabase.ts`: cliente de Supabase server-side (Service Role
  Key) para lecturas y escrituras desde Server Components/Actions.
- **`lib/content.ts`**: mismo contrato de funciones exportadas
  (`getHomeContent`, `getObjetivosContent`, etc.) pero implementadas contra
  Supabase en vez de `fs`. Se agregan los campos nuevos a cada interfaz
  TypeScript.
- **`app/admin/actions.ts`**: reemplaza `getFileFromGitHub`/
  `updateFileInGitHub`/`uploadFileToGitHub` por operaciones de Supabase
  (`.from('pages').update()`, `.storage.from('uploads').upload()`). Se
  agregan actions para guardar los arrays de tarjetas nuevos por página.
- **`app/(site)/*/page.tsx`**: los arrays hoy hardcodeados (`items`,
  secciones de tarjetas) pasan a venir del `content` de Supabase. Se agrega
  `export const dynamic = 'force-dynamic'` para evitar cache de contenido
  viejo.
- **`app/admin/*/page.tsx`**: se expanden los formularios existentes y se
  agregan editores de lista (reutilizando el patrón agregar/editar/
  borrar/reordenar de `admin/faq/page.tsx`) para: tarjetas de Home (2
  secciones), items de Objetivos, pasos de Objetivos, items de Cómo
  Participar.
- **`lib/auth.ts`** / **`components/admin/LoginForm.tsx`** /
  **`app/admin/actions.ts`** (`loginAction`): se agrega la verificación
  contra `login_attempts` antes de validar credenciales.
- **Se elimina** `lib/github.ts`.
- **`app/api/admin/*/route.ts`**: se actualizan para leer de Supabase en vez
  de `fs` (mismo contrato de respuesta).

## Migración de datos existentes

Script puntual `scripts/migrate-to-supabase.ts` (se corre una vez, se puede
borrar después):

1. Lee los 7 JSON actuales de `content/`.
2. Completa cada página con el texto que hoy está hardcodeado en el `.tsx`
   correspondiente (títulos H1, arrays de tarjetas), para no perder ningún
   contenido existente.
3. Inserta todo en `pages` (`INSERT ... ON CONFLICT (slug) DO UPDATE`) y en
   `novedades` (una fila por noticia existente).
4. Sube cada archivo de `public/uploads/` al bucket `uploads` de Storage y
   actualiza `novedades.imagen` con la nueva URL pública.

Resultado esperado: el sitio se ve exactamente igual después de la
migración, pero cada texto pasa a ser editable.

## Testing

- `__tests__/content.test.ts`: se actualiza para mockear el cliente de
  Supabase en vez de `fs`.
- `__tests__/github.test.ts`: se elimina (ya no existe `lib/github.ts`).
- Nuevo `__tests__/login-rate-limit.test.ts`: cubre el bloqueo tras 5
  intentos fallidos y el reset tras un login exitoso.
- `__tests__/auth.test.ts`: se mantiene sin cambios (la lógica de
  JWT/credenciales no cambia).

## Fuera de alcance

- No se migra a Supabase Auth (se mantiene login fijo usuario/contraseña).
- No se agrega selector visual de íconos — el campo ícono en las tarjetas
  sigue siendo texto libre (clase de Font Awesome o similar).
- No se versiona historial de cambios de contenido (a diferencia de git, un
  UPDATE en Postgres no deja rastro de la versión anterior). Si en el futuro
  hace falta un "deshacer", es un proyecto aparte.

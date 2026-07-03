# Supabase CMS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all site content from GitHub-committed JSON files to Supabase (Postgres + Storage), make every text block on every public page editable from the backoffice, and add login rate-limiting.

**Architecture:** Public pages become dynamic Server Components that read from a `pages` table (one row per page, JSONB `content` column) and a `novedades` table, via a server-only Supabase client. Admin Server Actions write directly to Postgres/Storage using the service role key — no more GitHub commits, no more redeploys to see a content change. A generic `ItemListEditor` component is reused for every repeating-card section (De qué se trata, Objetivos, Cómo participar, FAQ) instead of copy-pasting the add/edit/delete/reorder logic per page.

**Tech Stack:** Next.js 14 App Router, TypeScript, `@supabase/supabase-js`, Jest + ts-jest.

**Reference spec:** `docs/superpowers/specs/2026-07-03-supabase-cms-migration-design.md`

**Supabase project:** `redpinos` (ref `hxnmwcwjgzgljxxvugzf`, region `us-east-2`), already linked locally via `supabase link`. Credentials already written to `.env.local` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) — that file is gitignored, never commit it.

---

## Final content model (source of truth for every task below)

```typescript
// lib/content.ts — types
export interface CardIcon { icon: string; title: string; text: string }
export interface CardImg { img: string; title: string; text: string }
export interface StepItem { icon: string; label: string }
export interface FaqItem { q: string; a: string }

export interface HomeContent {
  heroTitulo: string;
  quienesSomosBreve: string;
  deQueSeTrataTitulo: string;
  deQueSeTrata: CardIcon[];
  entendiendoElDesafioTitulo: string;
  entendiendoElDesafioIntro: string;
  entendiendoElDesafio: CardImg[];
  registroCiudadanoTitulo: string;
  registroCiudadano: StepItem[];
  voluntarioTitulo: string;
  voluntarioTexto: string;
}

export interface QuienesSomosContent {
  h1: string;
  subtitulo: string;
  aniofundacion: string;
  campaniasExitosas: string;
  focosDetectados: string;
  integrantesTitulo: string;
  textoIntegrantes: string;
}

export interface ObjetivosContent {
  h1: string;
  lineaBaseTitulo: string;
  introTexto: string;
  items: CardIcon[];
  pasos: StepItem[];
}

export interface ComoParticiparContent {
  h1: string;
  subtitulo: string;
  introTexto: string;
  items: CardImg[];
}

export interface FaqContent {
  h1: string;
  items: FaqItem[];
}

export interface ContactoContent {
  h1: string;
  subtitulo: string;
  whatsapp: string;
  whatsappNota: string;
  email: string;
  direccion: string;
}

export interface Noticia {
  id: string;
  slug: string;
  titulo: string;
  texto: string;
  imagen: string;
  fecha: string;
  creadoEn: string;
}
```

`pages` table rows use these `slug` values: `home`, `quienes-somos`, `objetivos`,
`como-participar`, `faq`, `contacto`. `novedades` stays a proper relational
table, unchanged shape.

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install the Supabase client and dotenv**

Run:
```bash
npm install @supabase/supabase-js
npm install -D dotenv
```
Expected: both added to `package.json` (`@supabase/supabase-js` under
`dependencies`, `dotenv` under `devDependencies`), `package-lock.json`
updated.

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @supabase/supabase-js and dotenv dependencies"
```

---

### Task 2: Create the Supabase schema

**Files:**
- Create: `supabase/migrations/0001_init_schema.sql`

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/0001_init_schema.sql`:

```sql
create extension if not exists pgcrypto;

create table if not exists pages (
  slug text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table pages enable row level security;

create policy "Public read access on pages"
  on pages for select
  using (true);

create table if not exists novedades (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  texto text not null,
  imagen text not null default '',
  fecha date not null,
  creado_en timestamptz not null default now()
);

alter table novedades enable row level security;

create policy "Public read access on novedades"
  on novedades for select
  using (true);

create table if not exists login_attempts (
  identifier text primary key,
  intentos int not null default 0,
  bloqueado_hasta timestamptz,
  ultimo_intento timestamptz not null default now()
);

alter table login_attempts enable row level security;

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "Public read access on uploads bucket"
  on storage.objects for select
  using (bucket_id = 'uploads');
```

- [ ] **Step 2: Apply it to the linked Supabase project**

Run (uses the Personal Access Token already exported for this session; the
Management API runs SQL directly, no DB password needed):

```bash
curl -s -X POST "https://api.supabase.com/v1/projects/hxnmwcwjgzgljxxvugzf/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @- <<'EOF' | python3 -m json.tool
{"query": $(python3 -c "import json,sys; print(json.dumps(open('supabase/migrations/0001_init_schema.sql').read()))")}
EOF
```

If `SUPABASE_ACCESS_TOKEN` isn't set in the shell, export it first:
`export SUPABASE_ACCESS_TOKEN="<personal access token from supabase.com/dashboard/account/tokens>"`.

Expected: a JSON response with no `"error"` key (an empty array or similar
success payload).

- [ ] **Step 3: Verify the tables exist**

```bash
curl -s -X POST "https://api.supabase.com/v1/projects/hxnmwcwjgzgljxxvugzf/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"select table_name from information_schema.tables where table_schema='"'"'public'"'"' order by table_name;"}'
```
Expected: `pages`, `novedades`, `login_attempts` in the result.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0001_init_schema.sql
git commit -m "feat: add Supabase schema for pages, novedades, login_attempts"
```

---

### Task 3: Supabase client wrapper

**Files:**
- Create: `lib/supabase.ts`
- Test: `__tests__/supabase.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/supabase.test.ts`:

```typescript
describe('getSupabaseAdmin', () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  afterEach(() => {
    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    jest.resetModules();
  });

  it('throws if SUPABASE_URL is missing', async () => {
    delete process.env.SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    jest.resetModules();
    const { getSupabaseAdmin } = await import('../lib/supabase');
    expect(() => getSupabaseAdmin()).toThrow('SUPABASE_URL');
  });

  it('throws if SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    jest.resetModules();
    const { getSupabaseAdmin } = await import('../lib/supabase');
    expect(() => getSupabaseAdmin()).toThrow('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('returns a client when both env vars are set', async () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    jest.resetModules();
    const { getSupabaseAdmin } = await import('../lib/supabase');
    const client = getSupabaseAdmin();
    expect(client).toBeDefined();
    expect(typeof client.from).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/supabase.test.ts`
Expected: FAIL with "Cannot find module '../lib/supabase'"

- [ ] **Step 3: Write the implementation**

Create `lib/supabase.ts`:

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('SUPABASE_URL env var is required');
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY env var is required');
  return createClient(url, key, { auth: { persistSession: false } });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- __tests__/supabase.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/supabase.ts __tests__/supabase.test.ts
git commit -m "feat: add Supabase admin client wrapper"
```

---

### Task 4: Login rate limiter

**Files:**
- Create: `lib/rateLimiter.ts`
- Test: `__tests__/rateLimiter.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/rateLimiter.test.ts`:

```typescript
import { jest } from '@jest/globals';

const mockMaybeSingle = jest.fn();
const mockUpsert = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();

jest.unstable_mockModule('../lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}));

function setupChain() {
  mockFrom.mockReturnValue({
    select: mockSelect,
    upsert: mockUpsert,
    delete: mockDelete,
  });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle, eq: mockEq });
  mockDelete.mockReturnValue({ eq: mockEq });
  mockUpsert.mockResolvedValue({ error: null });
}

const { isLockedOut, recordFailedAttempt, resetAttempts } = await import('../lib/rateLimiter');

beforeEach(() => {
  jest.clearAllMocks();
  setupChain();
});

describe('isLockedOut', () => {
  it('returns false when there is no record', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });
    expect(await isLockedOut('admin')).toBe(false);
  });

  it('returns false when bloqueado_hasta is in the past', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { bloqueado_hasta: new Date(Date.now() - 60_000).toISOString() },
    });
    expect(await isLockedOut('admin')).toBe(false);
  });

  it('returns true when bloqueado_hasta is in the future', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { bloqueado_hasta: new Date(Date.now() + 60_000).toISOString() },
    });
    expect(await isLockedOut('admin')).toBe(true);
  });
});

describe('recordFailedAttempt', () => {
  it('upserts intentos=1 and no lockout on first failure', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });
    await recordFailedAttempt('admin');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: 'admin', intentos: 1, bloqueado_hasta: null })
    );
  });

  it('sets bloqueado_hasta after the 5th failed attempt', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { intentos: 4 } });
    await recordFailedAttempt('admin');
    const call = mockUpsert.mock.calls[0][0] as { intentos: number; bloqueado_hasta: string | null };
    expect(call.intentos).toBe(5);
    expect(call.bloqueado_hasta).not.toBeNull();
  });
});

describe('resetAttempts', () => {
  it('deletes the record for the identifier', async () => {
    mockEq.mockResolvedValue({ error: null });
    await resetAttempts('admin');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('identifier', 'admin');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/rateLimiter.test.ts`
Expected: FAIL with "Cannot find module '../lib/rateLimiter'"

- [ ] **Step 3: Write the implementation**

Create `lib/rateLimiter.ts`:

```typescript
import { getSupabaseAdmin } from './supabase';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 5;

export async function isLockedOut(identifier: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('login_attempts')
    .select('bloqueado_hasta')
    .eq('identifier', identifier)
    .maybeSingle();
  if (!data?.bloqueado_hasta) return false;
  return new Date(data.bloqueado_hasta).getTime() > Date.now();
}

export async function recordFailedAttempt(identifier: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('login_attempts')
    .select('intentos')
    .eq('identifier', identifier)
    .maybeSingle();
  const intentos = (data?.intentos ?? 0) + 1;
  const bloqueado_hasta =
    intentos >= MAX_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString()
      : null;
  await supabase.from('login_attempts').upsert({
    identifier,
    intentos,
    bloqueado_hasta,
    ultimo_intento: new Date().toISOString(),
  });
}

export async function resetAttempts(identifier: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from('login_attempts').delete().eq('identifier', identifier);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- __tests__/rateLimiter.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/rateLimiter.ts __tests__/rateLimiter.test.ts
git commit -m "feat: add login rate limiter backed by Supabase"
```

---

### Task 5: Rewrite `lib/content.ts` against Supabase

**Files:**
- Modify: `lib/content.ts`
- Modify: `__tests__/content.test.ts`

- [ ] **Step 1: Write the failing test (replaces the old fs-based test file)**

Replace the full contents of `__tests__/content.test.ts`:

```typescript
import { jest } from '@jest/globals';

const mockSingle = jest.fn();
const mockMaybeSingle = jest.fn();
const mockOrder = jest.fn();
const mockEqForNovedades = jest.fn();
const mockEqForPages = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();

jest.unstable_mockModule('../lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}));

function setupPagesChain(content: unknown) {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'pages') {
      return {
        select: () => ({ eq: () => ({ single: mockSingle }) }),
      };
    }
    if (table === 'novedades') {
      return {
        select: () => ({
          order: mockOrder,
          eq: () => ({ maybeSingle: mockMaybeSingle }),
        }),
      };
    }
    throw new Error(`Unexpected table ${table}`);
  });
  mockSingle.mockResolvedValue({ data: { content }, error: null });
}

const {
  getHomeContent,
  getQuienesSomosContent,
  getNovedades,
  getNoticiaBySlug,
} = await import('../lib/content');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getHomeContent', () => {
  it('returns the content column for slug "home"', async () => {
    setupPagesChain({ heroTitulo: 'Test', quienesSomosBreve: 'Texto' });
    const result = await getHomeContent();
    expect(result.heroTitulo).toBe('Test');
    expect(result.quienesSomosBreve).toBe('Texto');
  });
});

describe('getQuienesSomosContent', () => {
  it('returns the content column for slug "quienes-somos"', async () => {
    setupPagesChain({ h1: 'Acerca de nosotros', aniofundacion: '2021' });
    const result = await getQuienesSomosContent();
    expect(result.h1).toBe('Acerca de nosotros');
    expect(result.aniofundacion).toBe('2021');
  });
});

describe('getNovedades', () => {
  it('returns novedades ordered by fecha descending', async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ order: mockOrder },),
    }));
    mockOrder.mockResolvedValue({
      data: [
        { id: '2', slug: 'new', titulo: 'New', texto: '', imagen: '', fecha: '2026-01-01', creado_en: '' },
        { id: '1', slug: 'old', titulo: 'Old', texto: '', imagen: '', fecha: '2025-01-01', creado_en: '' },
      ],
      error: null,
    });
    const result = await getNovedades();
    expect(result[0].slug).toBe('new');
    expect(result[1].slug).toBe('old');
    expect(mockOrder).toHaveBeenCalledWith('fecha', { ascending: false });
  });
});

describe('getNoticiaBySlug', () => {
  it('returns the matching noticia', async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }),
    }));
    mockMaybeSingle.mockResolvedValue({
      data: { id: '1', slug: 'mi-noticia', titulo: 'Mi Noticia', texto: '', imagen: '', fecha: '2026-01-01', creado_en: '' },
      error: null,
    });
    const result = await getNoticiaBySlug('mi-noticia');
    expect(result?.titulo).toBe('Mi Noticia');
  });

  it('returns undefined for an unknown slug', async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }),
    }));
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    const result = await getNoticiaBySlug('nonexistent');
    expect(result).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/content.test.ts`
Expected: FAIL (current `lib/content.ts` still uses `fs`, return types are
sync not async, `getQuienesSomosContent` lacks `h1`)

- [ ] **Step 3: Replace `lib/content.ts`**

Replace the full contents of `lib/content.ts`:

```typescript
import { getSupabaseAdmin } from './supabase';

export interface CardIcon { icon: string; title: string; text: string }
export interface CardImg { img: string; title: string; text: string }
export interface StepItem { icon: string; label: string }
export interface FaqItem { q: string; a: string }

export interface HomeContent {
  heroTitulo: string;
  quienesSomosBreve: string;
  deQueSeTrataTitulo: string;
  deQueSeTrata: CardIcon[];
  entendiendoElDesafioTitulo: string;
  entendiendoElDesafioIntro: string;
  entendiendoElDesafio: CardImg[];
  registroCiudadanoTitulo: string;
  registroCiudadano: StepItem[];
  voluntarioTitulo: string;
  voluntarioTexto: string;
}

export interface QuienesSomosContent {
  h1: string;
  subtitulo: string;
  aniofundacion: string;
  campaniasExitosas: string;
  focosDetectados: string;
  integrantesTitulo: string;
  textoIntegrantes: string;
}

export interface ObjetivosContent {
  h1: string;
  lineaBaseTitulo: string;
  introTexto: string;
  items: CardIcon[];
  pasos: StepItem[];
}

export interface ComoParticiparContent {
  h1: string;
  subtitulo: string;
  introTexto: string;
  items: CardImg[];
}

export interface FaqContent {
  h1: string;
  items: FaqItem[];
}

export interface ContactoContent {
  h1: string;
  subtitulo: string;
  whatsapp: string;
  whatsappNota: string;
  email: string;
  direccion: string;
}

export interface Noticia {
  id: string;
  slug: string;
  titulo: string;
  texto: string;
  imagen: string;
  fecha: string;
  creadoEn: string;
}

async function getPageContent<T>(slug: string): Promise<T> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('pages').select('content').eq('slug', slug).single();
  if (error || !data) throw new Error(`Failed to load content for page "${slug}": ${error?.message}`);
  return data.content as T;
}

export async function getHomeContent(): Promise<HomeContent> {
  return getPageContent<HomeContent>('home');
}

export async function getQuienesSomosContent(): Promise<QuienesSomosContent> {
  return getPageContent<QuienesSomosContent>('quienes-somos');
}

export async function getObjetivosContent(): Promise<ObjetivosContent> {
  return getPageContent<ObjetivosContent>('objetivos');
}

export async function getComoParticiparContent(): Promise<ComoParticiparContent> {
  return getPageContent<ComoParticiparContent>('como-participar');
}

export async function getFaqContent(): Promise<FaqContent> {
  return getPageContent<FaqContent>('faq');
}

export async function getContactoContent(): Promise<ContactoContent> {
  return getPageContent<ContactoContent>('contacto');
}

function mapNoticiaRow(row: Record<string, unknown>): Noticia {
  return {
    id: row.id as string,
    slug: row.slug as string,
    titulo: row.titulo as string,
    texto: row.texto as string,
    imagen: row.imagen as string,
    fecha: row.fecha as string,
    creadoEn: row.creado_en as string,
  };
}

export async function getNovedades(): Promise<Noticia[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('novedades').select('*').order('fecha', { ascending: false });
  if (error) throw new Error(`Failed to load novedades: ${error.message}`);
  return (data ?? []).map(mapNoticiaRow);
}

export async function getNoticiaBySlug(slug: string): Promise<Noticia | undefined> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('novedades').select('*').eq('slug', slug).maybeSingle();
  if (error || !data) return undefined;
  return mapNoticiaRow(data);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- __tests__/content.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/content.ts __tests__/content.test.ts
git commit -m "feat: read all page content from Supabase instead of fs"
```

---

### Task 6: Generic list editor for admin card sections

**Files:**
- Create: `components/admin/ItemListEditor.tsx`

- [ ] **Step 1: Write the component**

Create `components/admin/ItemListEditor.tsx`:

```tsx
'use client';
import { useState } from 'react';

export interface ListField {
  name: string;
  label: string;
  type: 'text' | 'textarea';
}

interface ItemListEditorProps<T extends Record<string, string>> {
  fields: ListField[];
  items: T[];
  onSave: (items: T[]) => Promise<{ success: boolean }>;
  previewTitle: (item: T) => string;
  previewSubtitle?: (item: T) => string;
}

export default function ItemListEditor<T extends Record<string, string>>({
  fields,
  items: initialItems,
  onSave,
  previewTitle,
  previewSubtitle,
}: ItemListEditorProps<T>) {
  const emptyItem = (): T =>
    fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {} as T);

  const [items, setItems] = useState<T[]>(initialItems);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<T>(emptyItem());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function persist(updated: T[]) {
    setPending(true);
    setMessage(null);
    const result = await onSave(updated);
    if (result.success) {
      setItems(updated);
      setMessage({ type: 'success', text: 'Guardado.' });
      cancelEdit();
    } else {
      setMessage({ type: 'error', text: 'Error al guardar.' });
    }
    setPending(false);
  }

  function startEdit(i: number) {
    setEditIndex(i);
    setForm({ ...items[i] });
    setMessage(null);
  }

  function cancelEdit() {
    setEditIndex(null);
    setForm(emptyItem());
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editIndex !== null) {
      const updated = items.map((item, i) => (i === editIndex ? form : item));
      await persist(updated);
    } else {
      await persist([...items, form]);
    }
  }

  async function handleDelete(i: number) {
    if (!confirm('¿Eliminar este elemento?')) return;
    await persist(items.filter((_, idx) => idx !== i));
  }

  async function moveItem(i: number, dir: -1 | 1) {
    const target = i + dir;
    if (target < 0 || target >= items.length) return;
    const updated = [...items];
    [updated[i], updated[target]] = [updated[target], updated[i]];
    await persist(updated);
  }

  return (
    <div>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <h3 style={{ marginTop: 0 }}>{editIndex !== null ? 'Editar elemento' : 'Nuevo elemento'}</h3>
        {fields.map((f) => (
          <div className="form-group" key={f.name}>
            <label>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value } as T)}
                required
                rows={4}
              />
            ) : (
              <input
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value } as T)}
                required
              />
            )}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? 'Guardando...' : editIndex !== null ? 'Actualizar' : 'Agregar'}
          </button>
          {editIndex !== null && (
            <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancelar</button>
          )}
        </div>
      </form>

      {items.length > 0 && (
        <div style={{ marginTop: 32 }}>
          {items.map((item, i) => (
            <div key={i} className="faq-item">
              <div className="faq-number">{i + 1}</div>
              <div className="faq-item-text">
                <strong>{previewTitle(item)}</strong>
                {previewSubtitle && <span>{previewSubtitle(item)}</span>}
              </div>
              <div className="faq-item-actions">
                <button type="button" className="btn-secondary" onClick={() => moveItem(i, -1)} disabled={i === 0 || pending} title="Subir">↑</button>
                <button type="button" className="btn-secondary" onClick={() => moveItem(i, 1)} disabled={i === items.length - 1 || pending} title="Bajar">↓</button>
                <button type="button" className="btn-secondary" onClick={() => startEdit(i)}>Editar</button>
                <button type="button" className="btn-danger" onClick={() => handleDelete(i)} disabled={pending}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `ItemListEditor.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/admin/ItemListEditor.tsx
git commit -m "feat: add generic ItemListEditor for repeating card sections"
```

---

### Task 7: `app/admin/actions.ts` — Supabase-backed actions, rate-limited login

**Files:**
- Modify: `app/admin/actions.ts`
- Delete: `lib/github.ts`
- Delete: `__tests__/github.test.ts`
- Create: `__tests__/loginAction.test.ts`

- [ ] **Step 1: Write the failing test for rate-limited login**

Create `__tests__/loginAction.test.ts`:

```typescript
process.env.ADMIN_USERNAME = 'testuser';
process.env.ADMIN_PASSWORD = 'testpass';
process.env.SESSION_SECRET = 'a'.repeat(32);

import { jest } from '@jest/globals';

const mockIsLockedOut = jest.fn();
const mockRecordFailedAttempt = jest.fn();
const mockResetAttempts = jest.fn();
const mockCookieSet = jest.fn();
const mockRedirect = jest.fn(() => { throw new Error('REDIRECT'); });

jest.unstable_mockModule('../lib/rateLimiter', () => ({
  isLockedOut: mockIsLockedOut,
  recordFailedAttempt: mockRecordFailedAttempt,
  resetAttempts: mockResetAttempts,
}));

jest.unstable_mockModule('next/headers', () => ({
  cookies: () => ({ set: mockCookieSet, delete: jest.fn() }),
}));

jest.unstable_mockModule('next/navigation', () => ({
  redirect: mockRedirect,
}));

const { loginAction } = await import('../app/admin/actions');

beforeEach(() => {
  jest.clearAllMocks();
  mockIsLockedOut.mockResolvedValue(false);
});

function formData(username: string, password: string): FormData {
  const fd = new FormData();
  fd.set('username', username);
  fd.set('password', password);
  return fd;
}

describe('loginAction', () => {
  it('returns a lockout error without checking credentials when locked out', async () => {
    mockIsLockedOut.mockResolvedValue(true);
    const result = await loginAction(formData('testuser', 'testpass'));
    expect(result?.error).toMatch(/intentos/i);
    expect(mockCookieSet).not.toHaveBeenCalled();
  });

  it('records a failed attempt on wrong credentials', async () => {
    const result = await loginAction(formData('testuser', 'wrong'));
    expect(result?.error).toBeDefined();
    expect(mockRecordFailedAttempt).toHaveBeenCalledWith('testuser');
  });

  it('resets attempts and sets a session cookie on success', async () => {
    await expect(loginAction(formData('testuser', 'testpass'))).rejects.toThrow('REDIRECT');
    expect(mockResetAttempts).toHaveBeenCalledWith('testuser');
    expect(mockCookieSet).toHaveBeenCalledWith('admin_session', expect.any(String), expect.any(Object));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/loginAction.test.ts`
Expected: FAIL (`loginAction` doesn't call `isLockedOut`/`recordFailedAttempt`/`resetAttempts` yet)

- [ ] **Step 3: Replace `app/admin/actions.ts`**

Replace the full contents of `app/admin/actions.ts`:

```typescript
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyCredentials, createSessionToken } from '@/lib/auth';
import { isLockedOut, recordFailedAttempt, resetAttempts } from '@/lib/rateLimiter';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Noticia } from '@/lib/content';

type PageSlug = 'home' | 'quienes-somos' | 'objetivos' | 'como-participar' | 'faq' | 'contacto';

// AUTH
export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (await isLockedOut(username)) {
    return { error: 'Demasiados intentos fallidos. Probá de nuevo en unos minutos.' };
  }

  if (!verifyCredentials(username, password)) {
    await recordFailedAttempt(username);
    return { error: 'Usuario o contraseña incorrectos' };
  }

  await resetAttempts(username);

  const token = await createSessionToken();
  cookies().set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  redirect('/admin/dashboard');
}

export async function logoutAction() {
  cookies().delete('admin_session');
  redirect('/admin');
}

// GENERIC PAGE CONTENT (home, quienes-somos, objetivos, como-participar, faq, contacto)
export async function saveContentAction(slug: PageSlug, patch: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const { data: existing, error: fetchError } = await supabase
    .from('pages')
    .select('content')
    .eq('slug', slug)
    .single();
  if (fetchError || !existing) return { success: false };

  const content = { ...(existing.content as Record<string, unknown>), ...patch };
  const { error } = await supabase
    .from('pages')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('slug', slug);

  return { success: !error };
}

// NOVEDADES
export async function saveNoticiaAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  const id = formData.get('id') as string | null;
  const titulo = formData.get('titulo') as string;
  const texto = formData.get('texto') as string;
  const fecha = formData.get('fecha') as string;
  const imagenExistente = (formData.get('imagenExistente') as string) || '';
  const imagenFile = formData.get('imagen') as File | null;

  let imagenPath = imagenExistente;
  if (imagenFile && imagenFile.size > 0) {
    const ext = imagenFile.name.split('.').pop() ?? 'jpg';
    const filename = `${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filename, imagenFile, { contentType: imagenFile.type });
    if (uploadError) return { success: false };
    const { data: publicUrl } = supabase.storage.from('uploads').getPublicUrl(filename);
    imagenPath = publicUrl.publicUrl;
  }

  if (id) {
    const { error } = await supabase
      .from('novedades')
      .update({ titulo, texto, fecha, imagen: imagenPath })
      .eq('id', id);
    return { success: !error };
  }

  const { slugify } = await import('@/lib/slugify');
  const { error } = await supabase.from('novedades').insert({
    slug: slugify(titulo),
    titulo,
    texto,
    imagen: imagenPath,
    fecha,
  });
  return { success: !error };
}

export async function deleteNoticiaAction(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('novedades').delete().eq('id', id);
  return { success: !error };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- __tests__/loginAction.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Delete the GitHub client and its test**

```bash
rm lib/github.ts __tests__/github.test.ts
```

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: PASS, no references to `lib/github` remain (grep to confirm: `grep -rn "lib/github" --include=*.ts --include=*.tsx . ` should return nothing outside `node_modules`)

- [ ] **Step 7: Commit**

```bash
git add app/admin/actions.ts __tests__/loginAction.test.ts
git add -u lib/github.ts __tests__/github.test.ts
git commit -m "feat: move admin actions to Supabase, add login rate limiting"
```

---

### Task 8: One-off content migration script

**Files:**
- Create: `scripts/migrate-to-supabase.ts`

- [ ] **Step 1: Write the migration script**

Create `scripts/migrate-to-supabase.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
const supabase = createClient(url, key, { auth: { persistSession: false } });

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
```

- [ ] **Step 2: Run the migration**

Run: `npx ts-node --project tsconfig.json --compiler-options '{"module":"commonjs"}' scripts/migrate-to-supabase.ts`
Expected: a line per page (`✓ page "home"`, etc.), a line per uploaded file, a
line per noticia, ending with `Migration complete.`

- [ ] **Step 3: Verify the data landed correctly**

```bash
export SUPABASE_ACCESS_TOKEN="<personal access token>"
curl -s -X POST "https://api.supabase.com/v1/projects/hxnmwcwjgzgljxxvugzf/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"select slug from pages order by slug; select count(*) from novedades;"}'
```
Expected: 6 page slugs (`home`, `quienes-somos`, `objetivos`,
`como-participar`, `faq`, `contacto`) and `novedades` count matching
`content/novedades.json` (4).

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-to-supabase.ts
git commit -m "feat: add one-off content migration script to Supabase"
```

---

### Task 9: Home page — read from Supabase, render dynamic sections, fix contact duplication

**Files:**
- Modify: `app/(site)/page.tsx`

- [ ] **Step 1: Replace the file**

Replace the full contents of `app/(site)/page.tsx`:

```tsx
// app/(site)/page.tsx
import { getHomeContent, getContactoContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { heroTitulo, quienesSomosBreve, deQueSeTrataTitulo, deQueSeTrata, entendiendoElDesafioTitulo, entendiendoElDesafioIntro, entendiendoElDesafio, registroCiudadanoTitulo, registroCiudadano, voluntarioTitulo, voluntarioTexto } = await getHomeContent();
  const { whatsapp, direccion, email } = await getContactoContent();

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
                  {deQueSeTrata.map(({ icon, title, text }) => (
                    <div key={title} className="col-sm-6">
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
          <h2 className="section-title font-alt mb-70 mb-sm-40">{registroCiudadanoTitulo}</h2>
          <div className="row alt-features-grid font-alt">
            {registroCiudadano.map(({ icon, label }, i) => (
              <div key={label} className="col-sm-4 wow fadeInRight" data-wow-delay={`${(i + 1) * 0.1}s`}>
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
```

- [ ] **Step 2: Commit**

```bash
git add "app/(site)/page.tsx"
git commit -m "feat: render home page from Supabase content, dedupe contact info"
```

---

### Task 10: Quiénes Somos page

**Files:**
- Modify: `app/(site)/quienes-somos/page.tsx`

- [ ] **Step 1: Replace the file**

Replace the full contents of `app/(site)/quienes-somos/page.tsx`:

```tsx
// app/(site)/quienes-somos/page.tsx
import { getQuienesSomosContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function QuienesSomosPage() {
  const { h1, subtitulo, aniofundacion, campaniasExitosas, focosDetectados, integrantesTitulo, textoIntegrantes } =
    await getQuienesSomosContent();

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
          <div className="row multi-columns-row features-grid">
            {[
              { value: aniofundacion, label: 'Creación Red PINOS' },
              { value: campaniasExitosas, label: 'Campañas exitosas' },
              { value: focosDetectados, label: 'focos de invasión detectados' },
            ].map(({ value, label }) => (
              <div key={label} className="col-sm-6 col-md-4 col-lg-4">
                <div className="features-item align-center">
                  <div className="count-number">{value}</div>
                  <h3 className="alt-features-title font-alt">{label}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="split-section bg-gray-lighter">
        <div className="clearfix relative">
          <div className="split-section-headings right">
            <div className="ssh-table">
              <div
                className="ssh-cell page-section bg-scroll"
                style={{ backgroundImage: "url('/images/nosotros.png')" }}
              />
            </div>
          </div>
          <div className="split-section-content small-section pt-100 pb-100 pt-sm-50 pb-sm-50">
            <div className="split-section-wrapper left">
              <div className="text">
                <h2 className="font-alt mt-0 mb-50 mb-xxs-20">{integrantesTitulo}</h2>
                <div className="row">
                  <div className="col">
                    <div className="alt-service-item mt-0 mb-20">
                      <div className="alt-service-icon">
                        <i className="fa-solid fa-people-group fa-lg" />
                      </div>
                      {textoIntegrantes}
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
```

- [ ] **Step 2: Commit**

```bash
git add "app/(site)/quienes-somos/page.tsx"
git commit -m "feat: render quienes-somos page from Supabase content"
```

---

### Task 11: Objetivos page

**Files:**
- Modify: `app/(site)/objetivos/page.tsx`

- [ ] **Step 1: Replace the file**

Replace the full contents of `app/(site)/objetivos/page.tsx`:

```tsx
// app/(site)/objetivos/page.tsx
import { getObjetivosContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function ObjetivosPage() {
  const { h1, lineaBaseTitulo, introTexto, items, pasos } = await getObjetivosContent();

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

      <section className="page-section" id="expertise">
        <div className="container relative">
          <div className="row mb-60 mb-xs-40">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <div className="section-text align-center">
                <h3>{lineaBaseTitulo}</h3>
                {introTexto}
              </div>
            </div>
          </div>
          <hr className="mt-0 mb-80 mb-xs-40" />
          <div className="row multi-columns-row alt-features-grid">
            {items.map(({ icon, title, text }) => (
              <div key={title} className="col-sm-6 col-md-4 col-lg-4">
                <div className="alt-features-item align-center">
                  <div className="mb-10"><i className={icon} /></div>
                  <h3 className="alt-features-title font-alt">{title}</h3>
                  <div className="alt-features-descr">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="page-section bg-dark-lighter"
        style={{ backgroundImage: "url('/images/objetivos.png')" }}
      >
        <div className="container relative">
          <div className="row alt-features-grid font-alt">
            {pasos.map(({ icon, label }, i) => (
              <div key={label} className="col-sm-4 wow fadeInRight" data-wow-delay={`${(i + 1) * 0.1}s`}>
                <div className="alt-features-item align-center">
                  <div className="alt-features-icon white"><span className={icon} /></div>
                  <h3 className="alt-features-title">{label}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(site)/objetivos/page.tsx"
git commit -m "feat: render objetivos page from Supabase content"
```

---

### Task 12: Cómo Participar page

**Files:**
- Modify: `app/(site)/como-participar/page.tsx`

- [ ] **Step 1: Replace the file**

Replace the full contents of `app/(site)/como-participar/page.tsx`:

```tsx
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
              <div key={title} className="col-sm-6 col-md-4 col-lg-4 mb-20 wow fadeIn" data-wow-delay={`${((i % 3) + 1) * 0.1}s`} data-wow-duration="2s">
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
```

- [ ] **Step 2: Commit**

```bash
git add "app/(site)/como-participar/page.tsx"
git commit -m "feat: render como-participar page from Supabase content"
```

---

### Task 13: Preguntas Frecuentes page

**Files:**
- Modify: `app/(site)/preguntas-frecuentes/page.tsx`

- [ ] **Step 1: Replace the file**

Replace the full contents of `app/(site)/preguntas-frecuentes/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add "app/(site)/preguntas-frecuentes/page.tsx"
git commit -m "feat: render preguntas-frecuentes page from Supabase content"
```

---

### Task 14: Contacto page

**Files:**
- Modify: `app/(site)/contacto/page.tsx`

- [ ] **Step 1: Replace the file**

Replace the full contents of `app/(site)/contacto/page.tsx`:

```tsx
// app/(site)/contacto/page.tsx
import { getContactoContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function ContactoPage() {
  const { h1, subtitulo, whatsapp, whatsappNota, email, direccion } = await getContactoContent();

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
```

- [ ] **Step 2: Commit**

```bash
git add "app/(site)/contacto/page.tsx"
git commit -m "feat: render contacto page from Supabase content"
```

---

### Task 15: Novedades list + detail pages (async only, no content-model change)

**Files:**
- Modify: `app/(site)/novedades/page.tsx`
- Modify: `app/(site)/novedades/[slug]/page.tsx`

- [ ] **Step 1: Update the list page**

In `app/(site)/novedades/page.tsx`, add `export const dynamic = 'force-dynamic';`
after the imports, change `export default function NovedadesPage()` to
`export default async function NovedadesPage()`, and change
`const novedades = getNovedades();` to `const novedades = await getNovedades();`.
No other lines change.

- [ ] **Step 2: Update the detail page**

Replace the full contents of `app/(site)/novedades/[slug]/page.tsx`:

```tsx
// app/(site)/novedades/[slug]/page.tsx
import { getNovedades, getNoticiaBySlug } from '@/lib/content';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const novedades = await getNovedades();
  return novedades.map((n) => ({ slug: n.slug }));
}

export default async function NoticiaPage({ params }: { params: { slug: string } }) {
  const noticia = await getNoticiaBySlug(params.slug);
  if (!noticia) notFound();

  return (
    <>
      <section
        className="page-section bg-dark-alfa-30"
        style={{ backgroundImage: "url('/images/invasionPinos2.png')" }}
      >
        <div className="relative container align-left">
          <div className="row">
            <div className="col-md-10">
              <h1 className="hs-line-11 font-alt mb-20 mb-xs-0">{noticia.titulo}</h1>
              <div className="hs-line-4 font-alt">
                {new Date(noticia.fecha + 'T12:00:00').toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container relative">
          <div className="row">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              {noticia.imagen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={noticia.imagen}
                  alt={noticia.titulo}
                  style={{ width: '100%', borderRadius: 4, marginBottom: 32 }}
                />
              )}
              <div className="section-text" style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {noticia.texto}
              </div>
              <div style={{ marginTop: 40 }}>
                <Link href="/novedades" className="btn btn-mod btn-round btn-large">
                  ← Volver a Novedades
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/(site)/novedades/page.tsx" "app/(site)/novedades/[slug]/page.tsx"
git commit -m "feat: make novedades pages async against Supabase-backed content"
```

---

### Task 16: Admin API GET routes — add `await`

**Files:**
- Modify: `app/api/admin/como-participar/route.ts`
- Modify: `app/api/admin/contacto/route.ts`
- Modify: `app/api/admin/faq/route.ts`
- Modify: `app/api/admin/inicio/route.ts`
- Modify: `app/api/admin/novedades/route.ts`
- Modify: `app/api/admin/objetivos/route.ts`
- Modify: `app/api/admin/quienes-somos/route.ts`

- [ ] **Step 1: Add `await` to each route's content call**

Each file's `GET` handler calls one `getXContent()` function synchronously
inside `NextResponse.json(...)`. In each of the 7 files, change:

```typescript
  return NextResponse.json(getComoParticiparContent());
```
to:
```typescript
  return NextResponse.json(await getComoParticiparContent());
```

(same pattern for `getContactoContent`, `getFaqContent`, `getHomeContent`,
`getNovedades`, `getObjetivosContent`, `getQuienesSomosContent` in their
respective files — one `await` added per file, nothing else changes).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors in `app/api/admin/**`

- [ ] **Step 3: Commit**

```bash
git add app/api/admin
git commit -m "fix: await async content getters in admin API routes"
```

---

### Task 17: Admin — Inicio page (hero fields + 3 list sections)

**Files:**
- Modify: `app/admin/inicio/page.tsx`

- [ ] **Step 1: Replace the file**

Replace the full contents of `app/admin/inicio/page.tsx`:

```tsx
// app/admin/inicio/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ItemListEditor from '@/components/admin/ItemListEditor';
import { saveContentAction } from '../actions';
import type { HomeContent } from '@/lib/content';

const empty: HomeContent = {
  heroTitulo: '',
  quienesSomosBreve: '',
  deQueSeTrataTitulo: '',
  deQueSeTrata: [],
  entendiendoElDesafioTitulo: '',
  entendiendoElDesafioIntro: '',
  entendiendoElDesafio: [],
  registroCiudadanoTitulo: '',
  registroCiudadano: [],
  voluntarioTitulo: '',
  voluntarioTexto: '',
};

type HomeSingletonFields = Omit<HomeContent, 'deQueSeTrata' | 'entendiendoElDesafio' | 'registroCiudadano'>;

const emptySingletons: HomeSingletonFields = {
  heroTitulo: '',
  quienesSomosBreve: '',
  deQueSeTrataTitulo: '',
  entendiendoElDesafioTitulo: '',
  entendiendoElDesafioIntro: '',
  registroCiudadanoTitulo: '',
  voluntarioTitulo: '',
  voluntarioTexto: '',
};

export default function AdminInicioPage() {
  const [content, setContent] = useState<HomeContent>(empty);
  const [form, setForm] = useState<HomeSingletonFields>(emptySingletons);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/inicio')
      .then((r) => r.json())
      .then((data: HomeContent) => {
        setContent(data);
        setForm({
          heroTitulo: data.heroTitulo,
          quienesSomosBreve: data.quienesSomosBreve,
          deQueSeTrataTitulo: data.deQueSeTrataTitulo,
          entendiendoElDesafioTitulo: data.entendiendoElDesafioTitulo,
          entendiendoElDesafioIntro: data.entendiendoElDesafioIntro,
          registroCiudadanoTitulo: data.registroCiudadanoTitulo,
          voluntarioTitulo: data.voluntarioTitulo,
          voluntarioTexto: data.voluntarioTexto,
        });
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await saveContentAction('home', form);
    setMessage(result.success
      ? { type: 'success', text: 'Guardado.' }
      : { type: 'error', text: 'Error al guardar.' }
    );
    setPending(false);
  }

  return (
    <AdminLayout title="Editar Inicio">
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título del Hero</label>
          <input value={form.heroTitulo} onChange={(e) => setForm({ ...form, heroTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto &ldquo;Quiénes Somos&rdquo; (en la home)</label>
          <textarea value={form.quienesSomosBreve} onChange={(e) => setForm({ ...form, quienesSomosBreve: e.target.value })} required rows={6} />
        </div>
        <div className="form-group">
          <label>Título de la sección &ldquo;De qué se trata&rdquo;</label>
          <input value={form.deQueSeTrataTitulo} onChange={(e) => setForm({ ...form, deQueSeTrataTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Título de la sección &ldquo;Entendiendo el desafío&rdquo;</label>
          <input value={form.entendiendoElDesafioTitulo} onChange={(e) => setForm({ ...form, entendiendoElDesafioTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto introductorio de &ldquo;Entendiendo el desafío&rdquo;</label>
          <textarea value={form.entendiendoElDesafioIntro} onChange={(e) => setForm({ ...form, entendiendoElDesafioIntro: e.target.value })} required rows={3} />
        </div>
        <div className="form-group">
          <label>Título de la sección &ldquo;Registro Ciudadano&rdquo;</label>
          <input value={form.registroCiudadanoTitulo} onChange={(e) => setForm({ ...form, registroCiudadanoTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Título de la sección &ldquo;Voluntario&rdquo;</label>
          <input value={form.voluntarioTitulo} onChange={(e) => setForm({ ...form, voluntarioTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto de la sección &ldquo;Voluntario&rdquo;</label>
          <textarea value={form.voluntarioTexto} onChange={(e) => setForm({ ...form, voluntarioTexto: e.target.value })} required rows={4} />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <h2 style={{ marginTop: 40 }}>De qué se trata</h2>
      <ItemListEditor
        fields={[
          { name: 'icon', label: 'Ícono (clase Font Awesome, ej: fa fa-tree)', type: 'text' },
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'text', label: 'Texto', type: 'textarea' },
        ]}
        items={content.deQueSeTrata}
        onSave={(items) => saveContentAction('home', { deQueSeTrata: items })}
        previewTitle={(item) => item.title}
        previewSubtitle={(item) => item.text.slice(0, 100)}
      />

      <h2 style={{ marginTop: 40 }}>Entendiendo el desafío</h2>
      <ItemListEditor
        fields={[
          { name: 'img', label: 'Imagen (nombre de archivo en /public/images, ej: InvasionesGPT.png)', type: 'text' },
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'text', label: 'Texto', type: 'textarea' },
        ]}
        items={content.entendiendoElDesafio}
        onSave={(items) => saveContentAction('home', { entendiendoElDesafio: items })}
        previewTitle={(item) => item.title}
        previewSubtitle={(item) => item.text.slice(0, 100)}
      />

      <h2 style={{ marginTop: 40 }}>Registro Ciudadano</h2>
      <ItemListEditor
        fields={[
          { name: 'icon', label: 'Ícono (clase Font Awesome)', type: 'text' },
          { name: 'label', label: 'Texto', type: 'text' },
        ]}
        items={content.registroCiudadano}
        onSave={(items) => saveContentAction('home', { registroCiudadano: items })}
        previewTitle={(item) => item.label}
      />
    </AdminLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/inicio/page.tsx
git commit -m "feat: make home page card sections editable in admin"
```

---

### Task 18: Admin — Quiénes Somos page (add h1, subtitulo, integrantesTitulo)

**Files:**
- Modify: `app/admin/quienes-somos/page.tsx`

- [ ] **Step 1: Replace the file**

Replace the full contents of `app/admin/quienes-somos/page.tsx`:

```tsx
// app/admin/quienes-somos/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { saveContentAction } from '../actions';
import type { QuienesSomosContent } from '@/lib/content';

const empty: QuienesSomosContent = {
  h1: '', subtitulo: '', aniofundacion: '', campaniasExitosas: '', focosDetectados: '', integrantesTitulo: '', textoIntegrantes: '',
};

export default function AdminQuienesSomosPage() {
  const [form, setForm] = useState<QuienesSomosContent>(empty);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/quienes-somos').then((r) => r.json()).then(setForm);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await saveContentAction('quienes-somos', form);
    setMessage(result.success
      ? { type: 'success', text: 'Guardado.' }
      : { type: 'error', text: 'Error al guardar.' }
    );
    setPending(false);
  }

  return (
    <AdminLayout title="Editar Quiénes Somos">
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título de la página (H1)</label>
          <input value={form.h1} onChange={(e) => setForm({ ...form, h1: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Subtítulo</label>
          <input value={form.subtitulo} onChange={(e) => setForm({ ...form, subtitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Año de fundación (ej: 2021)</label>
          <input value={form.aniofundacion} onChange={(e) => setForm({ ...form, aniofundacion: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Campañas exitosas (ej: 7)</label>
          <input value={form.campaniasExitosas} onChange={(e) => setForm({ ...form, campaniasExitosas: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Focos de invasión detectados (ej: +100)</label>
          <input value={form.focosDetectados} onChange={(e) => setForm({ ...form, focosDetectados: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Título de la sección Integrantes</label>
          <input value={form.integrantesTitulo} onChange={(e) => setForm({ ...form, integrantesTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto de Integrantes</label>
          <textarea value={form.textoIntegrantes} onChange={(e) => setForm({ ...form, textoIntegrantes: e.target.value })} required rows={8} />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </AdminLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/quienes-somos/page.tsx
git commit -m "feat: make quienes-somos H1/subtitulo/integrantesTitulo editable"
```

---

### Task 19: Admin — Objetivos page (add h1, lineaBaseTitulo, items, pasos)

**Files:**
- Modify: `app/admin/objetivos/page.tsx`

- [ ] **Step 1: Replace the file**

Replace the full contents of `app/admin/objetivos/page.tsx`:

```tsx
// app/admin/objetivos/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ItemListEditor from '@/components/admin/ItemListEditor';
import { saveContentAction } from '../actions';
import type { ObjetivosContent } from '@/lib/content';

const empty: ObjetivosContent = { h1: '', lineaBaseTitulo: '', introTexto: '', items: [], pasos: [] };

export default function AdminObjetivosPage() {
  const [content, setContent] = useState<ObjetivosContent>(empty);
  const [form, setForm] = useState({ h1: '', lineaBaseTitulo: '', introTexto: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/objetivos')
      .then((r) => r.json())
      .then((data: ObjetivosContent) => {
        setContent(data);
        setForm({ h1: data.h1, lineaBaseTitulo: data.lineaBaseTitulo, introTexto: data.introTexto });
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await saveContentAction('objetivos', form);
    setMessage(result.success
      ? { type: 'success', text: 'Guardado.' }
      : { type: 'error', text: 'Error al guardar.' }
    );
    setPending(false);
  }

  return (
    <AdminLayout title="Editar Objetivos">
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título de la página (H1)</label>
          <input value={form.h1} onChange={(e) => setForm({ ...form, h1: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Título &ldquo;Línea de base&rdquo;</label>
          <input value={form.lineaBaseTitulo} onChange={(e) => setForm({ ...form, lineaBaseTitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto introductorio</label>
          <textarea value={form.introTexto} onChange={(e) => setForm({ ...form, introTexto: e.target.value })} required rows={6} />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <h2 style={{ marginTop: 40 }}>Objetivos (tarjetas)</h2>
      <ItemListEditor
        fields={[
          { name: 'icon', label: 'Ícono (clase Font Awesome)', type: 'text' },
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'text', label: 'Descripción', type: 'textarea' },
        ]}
        items={content.items}
        onSave={(items) => saveContentAction('objetivos', { items })}
        previewTitle={(item) => item.title}
        previewSubtitle={(item) => item.text.slice(0, 100)}
      />

      <h2 style={{ marginTop: 40 }}>Pasos</h2>
      <ItemListEditor
        fields={[
          { name: 'icon', label: 'Ícono (clase, ej: icon-telescope)', type: 'text' },
          { name: 'label', label: 'Texto', type: 'text' },
        ]}
        items={content.pasos}
        onSave={(items) => saveContentAction('objetivos', { pasos: items })}
        previewTitle={(item) => item.label}
      />
    </AdminLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/objetivos/page.tsx
git commit -m "feat: make objetivos H1, items and pasos editable"
```

---

### Task 20: Admin — Cómo Participar page (add h1, subtitulo, items)

**Files:**
- Modify: `app/admin/como-participar/page.tsx`

- [ ] **Step 1: Replace the file**

Replace the full contents of `app/admin/como-participar/page.tsx`:

```tsx
// app/admin/como-participar/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ItemListEditor from '@/components/admin/ItemListEditor';
import { saveContentAction } from '../actions';
import type { ComoParticiparContent } from '@/lib/content';

const empty: ComoParticiparContent = { h1: '', subtitulo: '', introTexto: '', items: [] };

export default function AdminComoParticiparPage() {
  const [content, setContent] = useState<ComoParticiparContent>(empty);
  const [form, setForm] = useState({ h1: '', subtitulo: '', introTexto: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/como-participar')
      .then((r) => r.json())
      .then((data: ComoParticiparContent) => {
        setContent(data);
        setForm({ h1: data.h1, subtitulo: data.subtitulo, introTexto: data.introTexto });
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await saveContentAction('como-participar', form);
    setMessage(result.success
      ? { type: 'success', text: 'Guardado.' }
      : { type: 'error', text: 'Error al guardar.' }
    );
    setPending(false);
  }

  return (
    <AdminLayout title="Editar Cómo Participar">
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título de la página (H1)</label>
          <input value={form.h1} onChange={(e) => setForm({ ...form, h1: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Subtítulo</label>
          <input value={form.subtitulo} onChange={(e) => setForm({ ...form, subtitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Texto introductorio</label>
          <textarea value={form.introTexto} onChange={(e) => setForm({ ...form, introTexto: e.target.value })} required rows={6} />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <h2 style={{ marginTop: 40 }}>Formas de participar (tarjetas)</h2>
      <ItemListEditor
        fields={[
          { name: 'img', label: 'Imagen (nombre de archivo en /public/images)', type: 'text' },
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'text', label: 'Texto', type: 'textarea' },
        ]}
        items={content.items}
        onSave={(items) => saveContentAction('como-participar', { items })}
        previewTitle={(item) => item.title}
        previewSubtitle={(item) => item.text.slice(0, 100)}
      />
    </AdminLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/como-participar/page.tsx
git commit -m "feat: make como-participar H1, subtitulo and items editable"
```

---

### Task 21: Admin — Contacto page (add h1, subtitulo)

**Files:**
- Modify: `app/admin/contacto/page.tsx`

- [ ] **Step 1: Replace the file**

Replace the full contents of `app/admin/contacto/page.tsx`:

```tsx
// app/admin/contacto/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { saveContentAction } from '../actions';
import type { ContactoContent } from '@/lib/content';

const empty: ContactoContent = { h1: '', subtitulo: '', whatsapp: '', whatsappNota: '', email: '', direccion: '' };

export default function AdminContactoPage() {
  const [form, setForm] = useState<ContactoContent>(empty);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/contacto').then((r) => r.json()).then(setForm);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await saveContentAction('contacto', form);
    setMessage(result.success
      ? { type: 'success', text: 'Guardado.' }
      : { type: 'error', text: 'Error al guardar.' }
    );
    setPending(false);
  }

  return (
    <AdminLayout title="Editar Contacto">
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título de la página (H1)</label>
          <input value={form.h1} onChange={(e) => setForm({ ...form, h1: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Subtítulo</label>
          <input value={form.subtitulo} onChange={(e) => setForm({ ...form, subtitulo: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>WhatsApp</label>
          <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Nota de WhatsApp (ej: Solo mensajes de texto y fotos)</label>
          <input value={form.whatsappNota} onChange={(e) => setForm({ ...form, whatsappNota: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Dirección</label>
          <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} required />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </AdminLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/contacto/page.tsx
git commit -m "feat: make contacto H1 and subtitulo editable"
```

---

### Task 22: Admin — FAQ page (refactor to ItemListEditor, add h1)

**Files:**
- Modify: `app/admin/faq/page.tsx`

- [ ] **Step 1: Replace the file**

Replace the full contents of `app/admin/faq/page.tsx`:

```tsx
// app/admin/faq/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ItemListEditor from '@/components/admin/ItemListEditor';
import { saveContentAction } from '../actions';
import type { FaqContent } from '@/lib/content';

const empty: FaqContent = { h1: '', items: [] };

export default function AdminFaqPage() {
  const [content, setContent] = useState<FaqContent>(empty);
  const [h1, setH1] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch('/api/admin/faq')
      .then((r) => r.json())
      .then((data: FaqContent) => {
        setContent(data);
        setH1(data.h1);
      });
  }, []);

  async function handleH1Submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await saveContentAction('faq', { h1 });
    setMessage(result.success
      ? { type: 'success', text: 'Guardado.' }
      : { type: 'error', text: 'Error al guardar.' }
    );
    setPending(false);
  }

  return (
    <AdminLayout title="Editar Preguntas Frecuentes">
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleH1Submit}>
        <div className="form-group">
          <label>Título de la página (H1)</label>
          <input value={h1} onChange={(e) => setH1(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar título'}
        </button>
      </form>

      <h2 style={{ marginTop: 40 }}>Preguntas ({content.items.length})</h2>
      <ItemListEditor
        fields={[
          { name: 'q', label: 'Pregunta', type: 'text' },
          { name: 'a', label: 'Respuesta', type: 'textarea' },
        ]}
        items={content.items}
        onSave={(items) => saveContentAction('faq', { items })}
        previewTitle={(item) => item.q}
        previewSubtitle={(item) => item.a.slice(0, 100)}
      />
    </AdminLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/faq/page.tsx
git commit -m "refactor: use ItemListEditor for FAQ admin, add H1 field"
```

---

### Task 23: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests PASS (auth, supabase, rateLimiter, content, loginAction)

- [ ] **Step 2: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds with no errors. (Pages using
`dynamic = 'force-dynamic'` will show as `ƒ (Dynamic)` in the route summary
— that's expected, not an error.)

- [ ] **Step 4: Confirm no leftover GitHub-content references**

Run: `grep -rn "GITHUB_TOKEN\|lib/github\|getFileFromGitHub" --include=*.ts --include=*.tsx app lib components scripts`
Expected: no output.

- [ ] **Step 5: Manual smoke test**

Start the dev server (`npm run dev`), then in a browser:
1. Visit `/` and confirm the hero title, "De qué se trata" cards, and
   contact block (whatsapp/dirección/email) render.
2. Visit `/objetivos`, `/quienes-somos`, `/como-participar`,
   `/preguntas-frecuentes`, `/contacto`, `/novedades` — confirm each H1
   renders and no page 500s.
3. Log in at `/admin` (use the credentials from `.env.local`), edit the
   Home "De qué se trata" list — add a test card, confirm it appears
   instantly on `/` after saving (no redeploy wait), then delete the test
   card.
4. Try 5 wrong-password login attempts on `/admin` from a logged-out
   session; confirm the 6th attempt (even with the correct password) is
   rejected with the lockout message.

- [ ] **Step 6: Remind the user about production env vars**

Tell the user: add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the
Vercel project's Environment Variables (Production), and remove
`GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` since they're no longer used.
This must be done manually in the Vercel dashboard — no CLI is linked in
this environment.

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

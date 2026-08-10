-- ELYSIUM — Event CMS схем (docs/supabase-init.sql-тэй ижил)

create table if not exists public.events (
  id         uuid        primary key,
  slug       text        unique not null,
  name       text        not null,
  status     text        not null default 'draft',
  content    jsonb       not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_slug_idx    on public.events (slug);
create index if not exists events_updated_idx on public.events (updated_at desc);

alter table public.events drop constraint if exists events_status_check;
alter table public.events add  constraint events_status_check
  check (status in ('draft', 'published'));

-- Апп зөвхөн service_role key-ээр ханддаг тул policy шаардлагагүй.
alter table public.events enable row level security;

-- Зургийн public bucket.
insert into storage.buckets (id, name, public)
values ('elysium-media', 'elysium-media', true)
on conflict (id) do update set public = true;

drop policy if exists "elysium_media_public_read" on storage.objects;
create policy "elysium_media_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'elysium-media');

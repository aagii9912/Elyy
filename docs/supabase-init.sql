-- ============================================================
-- ELYSIUM — Supabase бүрэн тохиргоо
-- Supabase Dashboard → SQL Editor → бүхэлд нь paste → Run
-- Дахин ажиллуулахад аюулгүй (idempotent).
-- ============================================================

-- ── 1. events хүснэгт ───────────────────────────────────────
create table if not exists public.events (
  id         uuid        primary key,
  slug       text        unique not null,
  name       text        not null,
  status     text        not null default 'draft',
  content    jsonb       not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_slug_idx   on public.events (slug);
create index if not exists events_updated_idx on public.events (updated_at desc);

-- status зөвхөн draft | published
alter table public.events drop constraint if exists events_status_check;
alter table public.events add  constraint events_status_check
  check (status in ('draft', 'published'));

-- ── 1b. event_leads хүснэгт (бүртгэл / хүсэлт) ──────────────
-- Google Sheet-ийн ЗЭРЭГЦЭЭ хадгална. Sheet тохируулаагүй эсвэл
-- эвдэрсэн ч хүсэлт алдагдахгүй байх нөөц.
-- event_id NULL = үндсэн сайтын холбоо барих маягтаас ирсэн.
create table if not exists public.event_leads (
  id         uuid        primary key default gen_random_uuid(),
  event_id   uuid        references public.events(id) on delete set null,
  event_slug text,
  event_name text,
  name       text        not null,
  phone      text,
  email      text,
  message    text,
  source     text,
  created_at timestamptz not null default now()
);

create index if not exists event_leads_event_idx   on public.event_leads (event_id, created_at desc);
create index if not exists event_leads_created_idx on public.event_leads (created_at desc);

alter table public.event_leads enable row level security;

-- ── 2. RLS ──────────────────────────────────────────────────
-- Апп зөвхөн service_role key-ээр (сервер талаас) ханддаг.
-- service_role нь RLS-ийг тойрдог тул policy шаардлагагүй.
-- RLS асаалттай = anon/publishable key-ээр гаднаас хандах боломжгүй.
alter table public.events enable row level security;

-- ── 3. Storage bucket (зураг) ───────────────────────────────
-- Public bucket — зургийн URL landing page дээр шууд харагдана.
insert into storage.buckets (id, name, public)
values ('elysium-media', 'elysium-media', true)
on conflict (id) do update set public = true;

-- Бүх хүнд унших эрх (public bucket-ийн хувьд). Хуулах/устгах нь
-- зөвхөн service_role-оор явна.
drop policy if exists "elysium_media_public_read" on storage.objects;
create policy "elysium_media_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'elysium-media');

-- ── 4. Шалгах ───────────────────────────────────────────────
select
  (select count(*) from public.events)                                        as events_count,
  (select count(*) from public.event_leads)                                   as leads_count,
  (select relrowsecurity from pg_class where oid = 'public.events'::regclass)      as rls_on,
  (select relrowsecurity from pg_class where oid = 'public.event_leads'::regclass) as leads_rls_on,
  (select public from storage.buckets where id = 'elysium-media')             as bucket_public;

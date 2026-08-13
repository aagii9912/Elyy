-- ELYSIUM — Мэдээ / нийтлэл (админаас удирдагдана, public: /news)

create table if not exists public.news (
  id         uuid        primary key,
  slug       text        unique not null,
  title      text        not null,
  excerpt    text        not null default '',
  cover      text        not null default '',
  tag        text        not null default '',
  date       text        not null default '',
  body       text        not null default '',
  status     text        not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_slug_idx on public.news (slug);
create index if not exists news_date_idx on public.news (date desc, created_at desc);

alter table public.news drop constraint if exists news_status_check;
alter table public.news add  constraint news_status_check
  check (status in ('draft', 'published'));

-- Апп зөвхөн service_role key-ээр ханддаг тул policy шаардлагагүй.
alter table public.news enable row level security;

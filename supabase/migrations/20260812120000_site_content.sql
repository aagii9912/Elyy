-- ELYSIUM — Үндсэн сайтын контент (админаас засварлагдана)
-- Ганц мөр (id = 'main') дотор бүтэн JSON хадгална. Дутуу/танихгүй
-- талбарыг апп тал `mergeSiteContent`-оор өгөгдмөл дээр давхарлана.

create table if not exists public.site_content (
  id         text        primary key,
  content    jsonb       not null,
  updated_at timestamptz not null default now()
);

-- Апп зөвхөн service_role key-ээр ханддаг тул policy шаардлагагүй.
alter table public.site_content enable row level security;

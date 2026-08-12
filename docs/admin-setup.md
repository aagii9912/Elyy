# Админ — Тохируулгын заавар

Энэ баримт нь `/admin` хэсэг (сайтын контентын засварлагч + эвентийн
landing page generator)-ыг production-д (Vercel) ажиллуулах тохиргоог
тайлбарлана.

## Товч тойм

- **`/admin`** — нэг нууц үгээр хамгаалагдсан удирдлагын самбар.
- **`/admin/site`** — **үндсэн сайтын (`elysium.mn/`) бүх текст, зургийн
  засварлагч.** Толгой цэс, hero, бүх хэсгийн гарчиг/тайлбар, өрөөний
  типүүд, өмнөх төслүүд, зургийн цомог, байршил, холбоо барих, менежерүүд,
  FAQ, хөл хэсэг, чатбот, SEO мета — бүгд эндээс засагдана.
- **Эвент үүсгэх** → `/admin` дээрээс нэр өгөөд үүсгэнэ. Public хаяг нь `elysium.mn/<slug>`.
- **Lead capture** — эвентийн маягт нь одоо байгаа `/api/contact` → Google Sheet рүү очно.
  Sheet-д `Эх сурвалж = event/<slug>`, `Эвент = <нэр>` гэж бичигдэнэ.
- **Хадгалалт** — Supabase (Postgres + Storage). Тохируулаагүй бол локалд файлаар ажиллана.

## 1. Локал хөгжүүлэлт (Supabase-гүйгээр)

Юу ч тохируулахгүйгээр шууд ажиллана:

```bash
npm run dev
```

- Нээх: `http://localhost:3000/admin`
- Өгөгдөл: `.data/events.json`, `.data/site.json`, зураг: `public/uploads/`
  (git-д орохгүй).
- `ADMIN_PASSWORD` тохируулаагүй тул нэвтрэлт идэвхгүй (локалд зүгээр).

> ⚠️ Локал горим зөвхөн хөгжүүлэлтэд. Vercel дээр файл систем read-only тул
> эвент/зураг **хадгалагдахгүй** — production-д заавал Supabase хэрэгтэй.

## 2. Supabase тохируулах (production)

### 2.1 Project + хүснэгт

1. [supabase.com](https://supabase.com) дээр үнэгүй project үүсгэ.
2. **SQL Editor** → доорхыг ажиллуул:

Хамгийн хялбар нь **`docs/supabase-init.sql`**-ийг бүхэлд нь paste хийж
ажиллуулах (idempotent — дахин ажиллуулж болно). Гар аргаар хийвэл:

```sql
create table if not exists public.events (
  id uuid primary key,
  slug text unique not null,
  name text not null,
  status text not null default 'draft',
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_slug_idx on public.events (slug);

-- Үндсэн сайтын контент — ганц мөр (id = 'main').
create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

-- RLS-ийг асаана. Бүх хандалт service_role key-ээр (server талаас) явна.
alter table public.events enable row level security;
alter table public.site_content enable row level security;
```

> Тайлбар: Апп нь зөвхөн **service role key**-ээр (сервер талаас) хандана.
> Тиймээс public policy шаардлагагүй — RLS асаалттай байхад аюулгүй.

### 2.2 Storage bucket (зураг)

1. **Storage** → **New bucket** → нэр: `elysium-media`, **Public** сонголтыг ✓.
   (Public bucket — зургийн URL landing page дээр шууд харагдана.)

### 2.3 API түлхүүр

**Project Settings → API** хэсгээс:

- `Project URL` → `SUPABASE_URL`
- `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`  ⚠️ нууц, зөвхөн серверт.

## 3. Environment хувьсагч (Vercel)

Vercel → Project → **Settings → Environment Variables**:

| Нэр | Утга |
| --- | --- |
| `ADMIN_PASSWORD` | Админд нэвтрэх нууц үг |
| `ADMIN_SESSION_SECRET` | `openssl rand -hex 32` (заавал биш) |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role secret |
| `SUPABASE_MEDIA_BUCKET` | `elysium-media` (заавал биш) |

Локалд туршихын тулд `.env.local`-д мөн адил нэмж болно.

## 4. Google Sheet — Эвент багана

Lead-ийн мөр одоо **7 баганатай**:

```
Огноо | Нэр | Утас | И-мэйл | Мессеж | Эх сурвалж | Эвент
```

Sheet-ийн эхний мөрөнд гарчгаа тааруулж (сонголтоор) нэмээрэй. Тохируулга
өөрчлөх шаардлагагүй — шинэ багана автоматаар бичигдэнэ.

## 5. Ашиглах урсгал

### 5.1 Үндсэн сайтын текст засах

1. `/admin` → **Сайтын контент** (эсвэл шууд `/admin/site`).
2. Зүүн талаас хэсгээ сонгоод талбаруудаа засна.
3. Жагсаалттай хэсгүүдэд (өрөөний тип, төсөл, FAQ, менежер, ойролцоох
   цэг, сошиал холбоос г.м.) мөр **нэмэх / зөөх (↑↓) / устгах (✕)** боломжтой.
4. Зурагтай талбарт **Зураг оруулах** → Supabase Storage (эсвэл локалд
   `public/uploads/`) руу байршуулж URL-ыг автоматаар холбоно.
5. **Хадгалах** → өөрчлөлт нийтийн сайт дээр шууд харагдана
   (сервер тал `/` хуудсыг дахин үүсгэнэ).
6. Санамсаргүй эвдвэл **“Энэ хэсгийг өгөгдмөл рүү буцаах”** товчоор
   тухайн хэсгийг кодон дахь анхны утга руу нь буцаана (Хадгалах хүртэл
   эцэслэгдэхгүй).

> Хадгалаагүй өөрчлөлттэй үед хуудсыг хаах гэвэл браузер анхааруулна.
> Хадгалаагүй бол сайт дээр юу ч өөрчлөгдөхгүй.

### 5.2 Эвент үүсгэх

1. `/admin` → нэвтрэх.
2. Нэр өгөөд **Эвент үүсгэх** → засварлагч нээгдэнэ.
3. Hero текст/зураг, хэсгүүд (нэмэх / дараалал өөрчлөх / устгах), маягт, өнгө тохируулах.
4. **Урьдчилж үзэх** (ноорог) → `/<slug>?preview=1`.
5. **Хэвлэх** → эвент нийтэд `elysium.mn/<slug>` дээр нээлттэй болно.
6. Бүртгэлүүд Google Sheet-д `event/<slug>` эх сурвалжтайгаар ирнэ.

## 6. Санамж

- Slug давхцвал автоматаар `-2`, `-3` залгана. `admin`, `api`, `final`, `mono`
  зэрэг системийн нэрсийг ашиглах боломжгүй.
- Ноорог эвентийг зөвхөн `?preview=1`-тэй үзнэ, хайлтын системд индекслэгдэхгүй.
- Сайтын контентын **өгөгдмөл утга** нь `src/lib/site-content.ts` дотор.
  Хадгалсан өгөгдөл дээр давхарлагддаг тул:
  - `site_content` мөр байхгүй/устсан ч сайт өгөгдмөл текстээрээ ажиллана,
  - код дээр шинэ талбар нэмэхэд хуучин хадгалсан контент эвдрэхгүй,
  - хадгалахын өмнө танихгүй талбар, буруу төрлийг сервер тал цэвэрлэнэ.

# Дизайн удирдлага (Theme) — Төлөвлөгөө

> Зорилго: **`/admin` дээрээс сайтын дэвсгэр өнгө, градиент, дэвсгэр зургийг
> бүх хэсэгт нь удирдах.** Одоо контент (текст/зураг) бүрэн удирдагддаг ч
> ӨНГӨ нь кодод хатуу бичигдсэн байгаа — үүнийг мөн адил админд гаргана.

Салбар: `claude/background-gradient-design-8umqze`.

## Хэрэгжилтийн байдал

| Phase | Ажил | Байдал |
|---|---|---|
| 0 | Tailwind `var()` таамаглалыг баталгаажуулах | ✅ Баталгаажсан — `bg-ground` → `background-color:var(--color-ground)` |
| 1 | Глобал палитр (7 өнгө) + админы «Дизайн» самбар | ✅ Хийгдсэн |
| 2 | Хэсэг тус бүрийн дэвсгэр — өнгө / градиент / зураг / хөшиг | ✅ Хийгдсэн (15 хэсэг) |
| 3 | Бичгийн горим (tone), тодролын сануулга | ✅ Хийгдсэн |
| 4 | Эвент хуудас, амьд preview (iframe) | ⬜ Хийгдээгүй |
| 5 | Media сан, видео дэвсгэр, авто солилт | ⬜ Хийгдээгүй |

**Хийгдсэн хэсгийн файлууд:** `src/lib/site-content.ts` (`ThemeContent`),
`src/lib/theme-css.ts` (CSS үүсгэгч + шүүлтүүр), `src/components/SiteTheme.tsx`,
`src/components/admin/DesignFields.tsx`, `src/app/globals.css` (семантик
`fg` токен), mono хэсгүүдэд `data-bg` / `data-tone`.

**Явцад өөрчлөгдсөн шийдлүүд** (доорх төлөвлөгөөнөөс ялгаатай):

1. **Хэсгийн өгөгдмөл нь `token: "auto"`** — CSS огт үүсэхгүй. Тиймээс
   шинэчлэлт орсны дараа сайт нэг ч пиксел хөдлөөгүй.
2. **Хөшгийг псевдо элементээр биш, олон давхаргат `background-image`-ээр**
   хийсэн — `z-index` зөрчил үүсэхгүй, контентыг дарахгүй.
   (Зөвхөн бүдгэрүүлсэн зураг л `::before` ашиглана.)
3. **Карт бүр бичгийн өнгөө өөрөө шийднэ** — `.bg-surface`/`.bg-white`/
   `.bg-night` классаар CSS-д бэхэлсэн тул 24 компонентын карт бүрд гараар
   `data-tone` бичих шаардлагагүй болсон.

---

## 1. Одоогийн байдал (шалгасан үр дүн)

### 1.1 Өнгө хаана амьдардаг вэ

| Давхарга | Файл | Тайлбар |
|---|---|---|
| Дизайн токен | `src/app/globals.css` → `@theme { … }` | `--color-ground`, `--color-surface`, `--color-night`, `--color-lime`, `--color-moss` г.м. **хатуу hex** |
| Хэрэглээ | `src/components/mono/*.tsx` (24 файл) | `bg-ground`, `bg-surface`, `bg-night`, `text-night`, `border-night/10` … Tailwind утилит |
| Хатуу утга | `MonoApartments.tsx` | `bg-[#dbe3ef]` — токен биш, шууд hex |
| Градиент | `MonoHero`, `MonoScrollStory`, `MonoVr`, `MonoDeveloper` | `bg-gradient-to-b`, `bg-[radial-gradient(…)]` — бүгд кодод |
| Эвент хуудас | `src/lib/events.ts` → `content.accent`, `content.theme` | **Ганц accent өнгө + light/dark** админаас удирдагддаг (`--accent` CSS хувьсагчаар) |

**Дүгнэлт:** эвент хуудсанд `--accent`-ийг inline `style`-аар дамжуулдаг
ажиллаж байгаа загвар аль хэдийн бий. Үндсэн сайтад мөн энэ зарчмыг,
харин бүрэн палитр + хэсэг тус бүрийн дэвсгэрийн хэмжээнд өргөтгөнө.

### 1.2 Яагаад энэ нь хялбар вэ (гол давуу тал)

Tailwind v4 дээр `@theme`-д зарласан өнгө нь утилит дотроо
`background-color: var(--color-ground)` болж хөрвөдөг. Тиймээс
**`--color-ground` хувьсагчийн утгыг ажиллах үед дарж бичихэд бүх хуудас
шинэ өнгө рүү шилжинэ** — 24 компонентыг дахин бичих шаардлагагүй.
Мөн `bg-night/10` зэрэг тунгалагтай хувилбар нь `color-mix(… var(--color-night) …)`
болдог тул мөн адил дагана.

> ⚠️ Энэ таамаглалыг **Phase 0-д заавал баталгаажуулна** (доор 6.1-ийг үз).
> Хэрэв Tailwind утилит нь hex-ийг шууд шингээж байвал (`@theme static`
> байдал) → нөөц зам: `@theme inline`-аар токен бүрийг өөрийн хувьсагч руу
> холбоно (`--color-ground: var(--ely-ground)`).

### 1.3 Одоо байгаа дэд бүтэц (дахин ашиглана)

- **Хадгалалт:** `site_content` (Supabase, `jsonb`) эсвэл `.data/site.json`.
  `theme` талбарыг `SiteContent`-д нэмэхэд **шинэ хүснэгт/migration
  шаардлагагүй** — `mergeSiteContent` дутуу талбарыг өгөгдмөлөөр дүүргэнэ.
- **Хадгалах API:** `PUT /api/admin/site` → `mergeSiteContent` + `revalidatePath("/")`.
- **Зураг оруулах:** `ImageField` + `/api/admin/upload` (жижиг) /
  `/api/admin/upload/sign` (3.5MB-аас том → Storage руу шууд). Browser дээр
  автоматаар шахдаг. **Дэвсгэр зурагт үүнийг шууд ашиглана.**
- **Админы UI блокууд:** `components/admin/ui.tsx` (`Field`, `Card`,
  `ImageField`, `Select`, `Toggle`, `Button`).
- **Өнгө сонгогч жишээ:** `EventEditor.tsx:220` дээр `<input type="color">`.

---

## 2. Хамрах хүрээ

**Орно:**

1. **Глобал палитр** — 8 үндсэн өнгө (дэвсгэр, гадаргуу, бичиг, accent…).
2. **Хэсэг тус бүрийн дэвсгэр** — 15 хэсэг: өнгө / градиент / зураг / хөшиг.
3. **Градиент зохиогч** — төрөл (linear/radial/conic), өнцөг, олон зогсоол.
4. **Дэвсгэр зураг** — upload, байрлал, хэмжээ, давталт, бүдгэрүүлэлт, хөшиг.
5. **Бичгийн өнгөний горим** (light/dark tone) — дэвсгэр харлахад бичиг цайрна.
6. **Бэлэн загварууд (preset)** + "өгөгдмөл рүү буцаах".
7. **Тодролын (contrast) сануулга** — уншигдахгүй хослолыг админд анхааруулна.
8. **Эвент landing болон `/news`** — мөн ижил удирдлагад орно.

**Орохгүй:** `/final`, `/v2`, `/classic`, `/arcsphere`, `/daylight`, `/find`
(демо/архив route-ууд). Шаардлагатай бол дараа нь нэмнэ.

---

## 3. Архитектур

```
                 ┌──────────────────────────┐
   Админ  ─────▶ │ SiteContent.theme (jsonb)│   ← Supabase site_content
                 └────────────┬─────────────┘
                              │  loadSiteContent()
                              ▼
                 ┌──────────────────────────┐
                 │ buildThemeCss(theme)     │   ← цэвэр функц + sanitizer
                 └────────────┬─────────────┘
                              │  <style id="site-theme">
                              ▼
   :root/.mono-page { --color-ground: …; --fg: …; }
   .mono-page [data-bg="elys"] { background: linear-gradient(…); }
                              │
                              ▼
              Tailwind утилитууд (bg-ground, text-fg…) шинэ утгыг өвлөнө
```

**Гол зарчим 3:**

1. **Нэг эх сурвалж** — өнгө зөвхөн `theme` объектод. Компонентод hex бичихгүй.
2. **CSS хувьсагчаар дамжина** — компонентын класс өөрчлөгдөхгүй, зөвхөн
   хувьсагчийн утга солигдоно. Тиймээс refactor хамгийн бага.
3. **Server-side inject** — `<style>`-ийг SSR-ээр гаргана → анивчихгүй (FOUC
   байхгүй), JS-гүй ч ажиллана.

> **Cascade layer-ийн ашиг:** Tailwind утилитууд `@layer utilities` дотор
> байдаг. Бидний оруулах `<style>` нь layer-гүй тул **үргэлж дээгүүр
> ялна** — `!important` хэрэггүй.

---

## 4. Өгөгдлийн загвар

`src/lib/site-content.ts`-д нэмэх (client-safe, server код байхгүй):

```ts
/** Градиентийн нэг зогсоол. `at` = 0–100 (%). */
export type ColorStop = { color: string; at: number };

export type BackgroundKind = "token" | "solid" | "gradient" | "image";

/** Нэг гадаргуугийн дэвсгэрийн бүрэн тодорхойлолт. */
export type Background = {
  /** token — палитрын нэрээр (ground/surface/dark/transparent) */
  kind: BackgroundKind;
  token: string;                 // kind="token"
  color: string;                 // kind="solid"  → hex
  gradient: {                    // kind="gradient"
    type: string;                // linear | radial | conic
    angle: number;               // 0–360 (linear/conic)
    shape: string;               // radial: "ellipse 80% 60% at 50% 40%"
    stops: ColorStop[];          // ≥2
  };
  image: {                       // kind="image"
    url: string;
    position: string;            // center | top | bottom | …
    size: string;                // cover | contain | auto
    repeat: string;              // no-repeat | repeat
    attachment: string;          // scroll | fixed
    blur: number;                // 0–24 px
  };
  /** Зураг/градиент дээр давхарлах хөшиг (бичиг уншигдахуйц болгоно). */
  overlay: { color: string; opacity: number; soft: boolean };
  /** Бичгийн горим. auto = дэвсгэрийн гэрэлтэлтээс автоматаар. */
  tone: string;                  // light | dark | auto
};

export type ThemeContent = {
  /** Глобал палитр — CSS токен руу шууд буудаг. */
  palette: {
    ground: string;      // --color-ground   хуудасны дэвсгэр
    surface: string;     // --color-surface  карт/өргөгдсөн гадаргуу
    dark: string;        // --color-night    хар хэсэг + үндсэн бичиг
    ink: string;         // үндсэн бичгийн өнгө (гэрэлтэй дэвсгэр дээр)
    inkMuted: string;    // --color-mist     бүдэг бичиг
    accent: string;      // --color-lime     тодруулга
    accentDeep: string;  // --color-moss     гүн тодруулга
    line: string;        // хилийн шугам
  };
  /** Хуудасны суурь дэвсгэр (overscroll бүсэд ч харагдана). */
  page: Background;
  /** Хэсэг тус бүрийн дэвсгэр. Түлхүүр = `data-bg` утга. */
  sections: {
    header: Background;   hero: Background;      stats: Background;
    elys: Background;     equip: Background;     marquee: Background;
    apartments: Background; developer: Background; gallery: Background;
    vr: Background;       location: Background;  contact: Background;
    managers: Background; faq: Background;       footer: Background;
  };
};
```

`SiteContent`-д `theme: ThemeContent;` нэмнэ.

### 4.1 `mergeSiteContent`-ийн 2 занга (заавал анхаарах)

`mergeValue` нь:

- **`typeof` таарахгүй бол өгөгдмөл рүү буцаана** → `kind`, `tone`, `type`
  зэргийг `string` гэж зарлана (union literal нь runtime-д шалгагдахгүй) →
  **утгын шалгалтыг server талд өөрсдөө хийнэ** (5.2-ыг үз).
- **Массивын дутуу түлхүүрийг ЭХНИЙ өгөгдмөл элементээс нөхнө** →
  `stops`-ын өгөгдмөл нь `[{color:"#…",at:0},{color:"#…",at:100}]` гэж
  **бүрэн 2 элемент** байх ёстой. (`equip.items[].image`-ийн тайлбарт
  бичсэн зангатай ижил.)
- **`sections` нь `Record<string, …>` БАЙЖ БОЛОХГҮЙ** — merge нь зөвхөн
  өгөгдмөлд байгаа түлхүүрийг гүйдэг. Тиймээс 15 хэсгийг **нэр бүрээр нь
  тодорхой** бичнэ (дээрх шиг).

---

## 5. Рендер (public тал)

### 5.1 Шинэ файлууд

| Файл | Үүрэг |
|---|---|
| `src/lib/theme-css.ts` | `buildThemeCss(theme): string` — цэвэр функц, sanitizer-үүд, unit-test хийхэд амархан |
| `src/components/SiteTheme.tsx` | Server component: `<style id="site-theme">{css}</style>` |

Оруулах газар: `src/app/page.tsx`, `src/app/news/page.tsx`,
`src/app/news/[slug]/page.tsx` (`.mono-page` wrapper-ийн дотор эхэнд).

### 5.2 Аюулгүй байдал — CSS injection-оос хамгаалах ⚠️

`<style>` руу хадгалсан утгыг **шууд оруулж БОЛОХГҮЙ**. Админаар нэвтэрсэн
хэн боловч `}</style><script>…` гэх мэт утга хадгалж чадна. Тиймээс
`theme-css.ts` дотор бүх утгыг **whitelist-ээр дахин бүтээнэ**:

```ts
const hex = (v: string, fb: string) => /^#[0-9a-f]{3,8}$/i.test(v.trim()) ? v.trim() : fb;
const num = (v: number, lo: number, hi: number, fb: number) =>
  Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fb;
const pick = (v: string, allowed: string[], fb: string) => (allowed.includes(v) ? v : fb);
/** Зөвхөн `/…` эсвэл `https://…`; хаалт, хашилт, зай агуулсныг хаяна. */
const url = (v: string) =>
  /^(\/[^\s"'()\\]*|https:\/\/[^\s"'()\\]+)$/.test(v.trim()) ? v.trim() : "";
```

`shape` талбарыг чөлөөт текстээр биш, **сонголтын жагсаалтаас** (ellipse
80% 60% at 50% 40% г.м. 5–6 бэлэн хувилбар) авна — гараар CSS бичүүлэхгүй.

Нэмж: `PUT /api/admin/site`-д `sanitizeTheme(content.theme)` дуудаж
**хадгалахаасаа өмнө** цэвэрлэнэ (хоёр давхар хамгаалалт).

### 5.3 Гаралтын CSS-ийн бүтэц

```css
/* 1) палитр */
:root, .mono-page {
  --color-ground:#f4f4f1; --color-surface:#fff; --color-night:#151717;
  --color-mist:#8a8d8c;  --color-lime:#b4d656; --color-moss:#3f6a33;
  --ely-line:#15171719;
}
/* 2) хуудасны суурь — overscroll бүс ч мөн адил */
html { background-color:#f4f4f1; }

/* 3) хэсэг тус бүр */
.mono-page [data-bg="elys"]{ background:linear-gradient(180deg,#fff 0%,#f4f4f1 100%); }
.mono-page [data-bg="equip"]{
  background-image:url("/uploads/…jpg"); background-size:cover;
  background-position:center; background-repeat:no-repeat;
}
/* 4) хөшиг — псевдо элементээр (зураг дээр бичиг уншигдахуйц болгоно) */
.mono-page [data-bg="equip"]::before{
  content:""; position:absolute; inset:0; pointer-events:none; z-index:0;
  background:linear-gradient(180deg, #15171773 0%, #151717bf 100%);
}
/* 5) бичгийн горим */
.mono-page [data-tone="dark"]{ --fg:#fff; --fg-muted:#ffffff99; --ely-line:#ffffff26; }
```

**Анхаарах:** хөшиг ажиллахын тулд тухайн `<section>` нь `relative`
байх ёстой, мөн дотоод контент нь `z-10`. Одоо `MonoEquip`, `MonoHero`,
`MonoDeveloper` нь `relative` — бусдад нэмнэ (Phase 2).

### 5.4 Хэсгүүдийг тэмдэглэх

Хэсэг бүрийн үндсэн элементэд `data-bg` + `data-tone` нэмнэ. `bg-ground`
класс нь **үлдэнэ** (JS-гүй/style ачаалагдаагүй үеийн нөөц утга):

```tsx
// MonoElys.tsx
<section id="elys" data-bg="elys" data-tone={tone}
         className="relative border-b border-night/10 bg-ground text-night">
```

`data-tone`-ийг server талд `theme.sections.elys.tone` (эсвэл `auto` үед
дэвсгэрийн гэрэлтэлтээс тооцоод) бодож өгнө.

### 5.5 Revalidate

`PUT /api/admin/site` дотор одоо `revalidatePath("/")` байгаа. Нэмнэ:

```ts
revalidatePath("/");
revalidatePath("/news");
revalidatePath("/news/[slug]", "page");
```

---

## 6. Ажлын үе шатууд

### Phase 0 — Баталгаажуулалт (0.5 өдөр)

1. `npm ci && npm run build`
2. `grep -o "\.bg-ground{[^}]*}" .next/static/css/*.css`
   - `background-color:var(--color-ground)` гарвал → **үндсэн зам**.
   - hex шууд гарвал → `globals.css`-ийг `@theme inline`-д шилжүүлж,
     токен бүрийг өөрийн хувьсагч руу холбоно.
3. `bg-night/10`-ийн гаралтыг мөн шалгах (`color-mix` мөн эсэх).

**Гарц:** аль зам явахаа бататгасан 1 догол мөр тэмдэглэл.

---

### Phase 1 — Глобал палитр (1–1.5 өдөр)

**Код:**
- `site-content.ts`: `ThemeContent`, `Background` төрөл + `DEFAULT_SITE_CONTENT.theme`
  (өгөгдмөл нь **яг одоогийн** hex-үүд — өөрчлөлт харагдахгүй байх ёстой).
- `src/lib/theme-css.ts`: sanitizer + `buildThemeCss` (палитрын хэсэг л).
- `src/components/SiteTheme.tsx`.
- `src/app/page.tsx`, `news/*`: `<SiteTheme theme={site.theme} />`.
- `api/admin/site/route.ts`: `sanitizeTheme` + нэмэлт `revalidatePath`.
- **Админ:** `SECTIONS`-ийн ЭХЭНД `{ id:"design", label:"Дизайн / Өнгө" }`;
  `src/components/admin/DesignFields.tsx` → `ColorField` (color input + hex
  бичих + swatch) × 8, preset сонголт, "Өгөгдмөл рүү буцаах".

**Хүлээн авах шалгуур:** `/admin/site → Дизайн` дээр `ground`-ыг өөрчилж
хадгалахад `/` дээрх бүх цайвар хэсэг шинэ өнгө болно. Хуучин хадгалсан
өгөгдөлтэй сайт эвдрэхгүй.

---

### Phase 2 — Хэсгийн дэвсгэр: өнгө / градиент / зураг (1.5–2 өдөр)

**Код:**
- `theme-css.ts`: `bgToCss(bg)` — token/solid/gradient/image + overlay.
- 15 mono компонентод `data-bg` + `relative` (+ хэрэгтэй газар `z-10`).
- **Админ — `BackgroundField`** (шинэ):
  - Дээд талд 4 таб: **Токен · Өнгө · Градиент · Зураг**
  - *Градиент:* төрөл сонгох, өнцгийн слайдер (0–360, 8 бэлэн өнцөг товч),
    зогсоолын жагсаалт (нэмэх/устгах/зөөх, өнгө + %), **амьд preview зурвас**,
    "CSS хуулах" товч.
  - *Зураг:* одоо байгаа `ImageField`-ийг ашиглана (`maxEdge: 2400`,
    `ratio: "16/9"`), + байрлал/хэмжээ/давталт select, бүдгэрүүлэлт слайдер.
  - *Хөшиг:* өнгө + тунгалаг байдал (0–100%) + "зөөлөн (дээрээс доош)" toggle.
  - *Tone:* Гэрэлтэй / Хар / Авто.
  - Доор нь **тухайн хэсгийн жижиг preview карт** (бодит CSS-ээр).
- Хэсэг тус бүрийн одоо байгаа самбарын дээд талд "🎨 Дэвсгэр" гэсэн
  нээгддэг блок болгож мөн оруулна (Дизайн хэсэгт бүгд нэг дор, энд
  контекстоороо — хоёулаа нэг өгөгдөл рүү бичнэ).

**Хүлээн авах шалгуур:** `equip` хэсэгт зураг оруулж, дээр нь 60% хар
хөшиг тавихад сайт дээр шууд гарна; `elys`-д 2 өнгийн градиент тавихад
хэсгийн дэвсгэр градиент болно.

---

### Phase 3 — Бичгийн тодрол (tone) (1–1.5 өдөр)

Дэвсгэр харлахад бичиг цайрахгүй бол уншигдахгүй. Тиймээс семантик токен:

```css
/* globals.css */
@theme inline {
  --color-fg: var(--ely-fg);
  --color-fg-muted: var(--ely-fg-muted);
  --color-line: var(--ely-line);
}
.mono-page { --ely-fg: var(--color-night); --ely-fg-muted: var(--color-mist); }
```

Дараа нь mono компонентуудад **гар аргаар** (sed-ээр БИШ) солино:

| Хуучин | Шинэ | Тайлбар |
|---|---|---|
| `text-night` (бичиг) | `text-fg` | tone-оос хамаарч эргэнэ |
| `text-night/50` | `text-fg-muted` | |
| `text-white` (хар хэсэгт) | `text-fg` | `data-tone="dark"` дор автоматаар цагаан |
| `border-night/10` | `border-line` | |
| `bg-white` (карт) | `bg-surface` | |
| `bg-night/5` (чимэглэл) | **хэвээр** | бичиг биш → эргэх шаардлагагүй |

> ⚠️ `bg-night/…`-ийн зарим хэрэглээ нь **чимэглэл** (хөшиг, зураас,
> hover) — эдгээрийг эргүүлж болохгүй. Тиймээс автомат орлуулга хийхгүй,
> файл тус бүрээр нүдээр шалгана (24 файл, ~120 хэрэглээ).

Мөн `MonoApartments.tsx`-ийн `bg-[#dbe3ef]`-ийг токен болгоно.

**Админд:** `contrastRatio(fg,bg)` тооцоолж, 4.5:1-ээс бага бол шар,
3:1-ээс бага бол улаан сануулга + "автоматаар засах" санал.

---

### Phase 4 — Эвент, мэдээ, урьдчилан харах (1 өдөр)

1. **Эвент хуудас:** `EventContent`-д `accent`, `theme` дээр нэмж
   `background: Background` (hero + хуудасны суурь). `EventEditor`-т
   ижил `BackgroundField`-ийг дахин ашиглана. Хуучин `accent`/`theme`
   талбар хэвээр (буцаж нийцтэй).
2. **`/news`:** `SiteTheme` + `data-bg="news"` (`sections`-д нэмэх).
3. **Амьд preview:** `/admin/preview` route (`force-dynamic`,
   `robots: noindex`) — `/`-ийн бүрэлдэхүүнийг рендерлэнэ; админы
   засварлагч `<iframe>`-д `postMessage`-ээр ноорог theme илгээж,
   preview доторх жижиг client компонент `<style>`-ийг шинэчилнэ →
   **хадгалахаас өмнө** шууд харна.

---

### Phase 5 — Нэмэлт (сонголтоор)

- `/admin/media` — Storage дахь зургийн сан (жагсаах/устгах). `Store`-д
  `listMedia()` нэмнэ.
- Видео дэвсгэр (одоо `STRUCTURE_CLIPS` дэд бүтэц бий).
- Хөдөлгөөнт градиент (удаан шилжих) — `prefers-reduced-motion` хамгаалалттай.
- Улирлын preset-ийг товлосон хугацаанд автоматаар солих.

---

## 7. Бэлэн загварууд (preset)

Нэг товчоор бүх палитр + хэсгийн дэвсгэрийг сольдог:

| Нэр | Тайлбар |
|---|---|
| **Mono (одоогийн)** | `#f4f4f1` суурь, цагаан карт, `#151717` хар хэсэг |
| **Гүн ногоон** | Брэндийн `#2a5124` / `#16280f`, лаймтай accent |
| **Шөнө** | Бүхэлдээ хар суурь, цайвар бичиг |
| **Цаас** | Дулаан цагаан `#faf8f3`, бор accent |
| **Градиент** | Хэсэг бүр зөөлөн 2 өнгийн шилжилттэй |

Preset нь зөвхөн **эхлэлийн цэг** — дараа нь гараар засаж болно.
"Өгөгдмөл рүү буцаах" товч палитр бүхэлд нь болон хэсэг тус бүрд байна.

---

## 8. Эрсдэл ба анхаарах зүйл

| # | Эрсдэл | Хамгаалалт |
|---|---|---|
| 1 | Tailwind утилит `var()` ашиглахгүй байх | **Phase 0-д баталгаажуулна**; нөөц зам: `@theme inline` |
| 2 | CSS injection (`}</style><script>`) | Бүх утгыг whitelist-ээр дахин бүтээнэ; server талд бас sanitize |
| 3 | Уншигдахгүй хослол (цагаан дээр цагаан) | Contrast тооцоолол + сануулга; tone горим |
| 4 | `mergeValue`-ийн массив template занга | `stops`-ын өгөгдмөлийг бүрэн 2 элементээр; `sections`-ийг нэр бүрээр |
| 5 | Хуучин хадгалсан өгөгдөл эвдрэх | `theme`-ийн өгөгдмөл = **яг одоогийн өнгө** → шинэчлэлт нүдэнд харагдахгүй |
| 6 | Том дэвсгэр зураг → LCP муудна | Upload-д `maxEdge: 2400` + WebP шахалт (одоо байгаа); hero-д зураг өгөхгүй байхыг санал болгоно |
| 7 | `background-attachment: fixed` iOS дээр гацна | Мобайлд `scroll` руу автоматаар буулгана (`@media (max-width:767px)`) |
| 8 | Хөшиг контентыг дарах | `pointer-events:none` + `z-index` эмх цэгц (Phase 2-т хэсэг бүрийг шалгана) |
| 9 | Админ санамсаргүй бүх сайтыг эвдэх | Preview (Phase 4) + "Өгөгдмөл рүү буцаах" + сүүлийн 5 хадгалалтыг `theme_history`-д хадгалах (сонголт) |

---

## 9. Туршилтын жагсаалт

- [ ] `npm run build` + `npm run lint` цэвэр
- [ ] `theme` хадгалаагүй үед сайт **яг одоогийнхтой ижил** харагдана
- [ ] Палитрын өнгө солиход `/`, `/news`, `/news/<slug>` бүгд дагана
- [ ] Хэсэг бүрд: солид → градиент → зураг → буцаад токен шилжилт ажиллана
- [ ] Хар дэвсгэр дээр бүх бичиг уншигдана (tone=dark)
- [ ] Дэвсгэр зураг мобайл дээр зөв (fixed биш, cover)
- [ ] Хортой утга (`#f4f4f1;}</style>`) хадгалахад CSS эвдрэхгүй
- [ ] Supabase-гүй локал горимд ажиллана (`.data/site.json`)
- [ ] `prefers-reduced-motion` дээр нэмэлт хөдөлгөөн унтарна
- [ ] Lighthouse: LCP урьдын түвшинд хэвээр

---

## 10. Хугацааны төлөв

| Phase | Ажил | Хугацаа |
|---|---|---|
| 0 | Баталгаажуулалт | 0.5 өдөр |
| 1 | Глобал палитр | 1–1.5 өдөр |
| 2 | Хэсгийн дэвсгэр (өнгө/градиент/зураг) | 1.5–2 өдөр |
| 3 | Tone / тодрол + refactor | 1–1.5 өдөр |
| 4 | Эвент + мэдээ + preview | 1 өдөр |
| **Нийт** | **Phase 0–4** | **5–6.5 өдөр** |
| 5 | Нэмэлт (media сан, видео, авто) | сонголтоор |

**Хамгийн бага ашигтай хувилбар (MVP):** Phase 0 + 1 + 2 → ~3.5 өдөр.
Үүгээр л "дэвсгэр өнгө, градиент, зураг бүх газар удирдах" гэсэн үндсэн
шаардлага биелнэ. Phase 3 нь чанарын (уншигдац) баталгаа.

---

## 11. Тодруулах асуултууд

1. **Хэн ашиглах вэ?** — Дизайнер (бүрэн эрх, олон зогсоолтой градиент) уу,
   эсвэл маркетингийн ажилтан (зөвхөн preset + 1-2 өнгө) юу? Хариултаас
   хамаарч UI-г энгийн/дэлгэрэнгүй болгоно.
2. **Хэсэг тус бүр үнэхээр хэрэгтэй юү**, эсвэл "цайвар / хар" гэсэн 2
   бүлгээр удирдах нь хангалттай юу? (2 бүлэг бол ажил 2 дахин бага.)
3. **Preview заавал уу?** — Phase 4 дээр байгаа, MVP-д ороогүй.
4. **Хувилбарын түүх** (буцаах боломж) хэрэгтэй юү?
5. Демо route-уудыг (`/final`, `/v2`…) хамруулах уу?

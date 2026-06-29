# Elysium — Luxury Residence Website / Build Plan

> Reference сайтууд: [Elyse Residence](https://elyse-residence-dev.webflow.io/) · [Lagom Development](https://lagom-development.com/) · [Find Real Estate](https://findrealestate.com/)
> Stack: **Next.js (App Router) + GSAP + Lenis** · Scope: **бүрэн multi-page сайт** · Deploy: **Vercel**

---

## 0. Гол зорилго

Elyse Residence шиг "holistic luxury in perfect harmony" сэтгэгдэл төрүүлэх, cinematic motion-той, Awwwards чанарт ойртсон luxury residence сайт. Reference 3 сайтын **motion graphics**-ийг нэгтгэж, Next.js дээр custom кодоор бүрэн хяналттай хийнэ.

---

## 1. Reference сайтуудын Motion Graphics судалгаа (нэгтгэл)

3 сайт бүгд **Lenis smooth-scroll + GSAP ScrollTrigger** маягийн cinematic паттернтай. Доорх motion-уудыг Elysium-д тусгана:

| # | Motion паттерн | Хаанаас (reference) | Elysium-д хэрэглэх газар |
|---|----------------|---------------------|--------------------------|
| 1 | **Smooth/inertia scroll (Lenis)** | 3 сайт бүгд | Бүх сайтын суурь — global wrapper |
| 2 | **Hero mask/clip-path reveal** — зураг scale-down, текст mask-аас доошоо гарч ирэх line-by-line | Elyse, Find | Hero бүрд |
| 3 | **Scroll-reveal (fade + translateY, stagger)** | 3 сайт бүгд | Бараг бүх section-ы элемент |
| 4 | **Parallax depth layers** — арын зураг/утаа/үүл удаан хөдлөх | Find (smoke/clouds), Lagom (nature) | Hero, residence зураг, footer |
| 5 | **Pinned section + horizontal scroll** — residence gallery pin хийгдэж текст гүйх | Elyse living-types | Residences gallery, amenities |
| 6 | **Image clip-path reveal** — зураг expanding mask-аар нээгдэх | Elyse, Find | Бүх том зураг |
| 7 | **Number counter** — статистик 0-оос тоологдох | Elyse (60%, 30, 150k), Lagom (33k m², 140) | Stats / facts блок |
| 8 | **Custom magnetic cursor** — линк/зураг дээр томрох, soft follow | Find, premium tier | Global cursor |
| 9 | **Page transition overlay** — хуудас солигдоход wipe/fade | Multi-page сайтын стандарт | Бүх route шилжилт |
| 10 | **Sticky navbar** — transparent→solid, scroll-down нуух / up гаргах | 3 сайт бүгд | Global header |
| 11 | **Card hover** — scale + overlay + текст shift | 3 сайт бүгд | Residence/amenity картууд |
| 12 | **Infinite marquee** — текст/лого тасралтгүй гүйх | Premium паттерн | Beliefs/quote band |
| 13 | **Scroll progress + section index** | Premium | Header дор нимгэн progress bar |
| 14 | **FAQ accordion** — softly expand height + opacity | Elyse FAQ | FAQ section |

**Дүгнэлт:** Гол ялгаа нь *жижиг micro-motion-уудын чанар* — easing (custom cubic-bezier / `power3.out`), stagger timing, mask reveal, parallax depth. Эдгээрийг GSAP-аар нарийн хянана.

---

## 2. Tech Stack & Architecture

```
Framework      : Next.js 15 (App Router, TypeScript, React Server Components)
Styling        : Tailwind CSS v4 + CSS custom properties (design tokens)
Motion (core)  : GSAP 3 + @gsap/react (useGSAP) + ScrollTrigger
Smooth scroll  : Lenis (lenis/react)  ← GSAP ticker-т холбоно
Optional WebGL : Three.js / OGL (Find-style atmospheric smoke/grain) — Phase 2
Text reveal    : SplitText (GSAP) эсвэл split-type
Images         : next/image (AVIF/WebP, blur placeholder)
Fonts          : next/font (Display serif + clean sans)
Forms          : React Hook Form + Zod + API route → email/CRM
CMS (optional) : Sanity / local MDX (residence content) — Phase 2
Deploy/Render  : Vercel (SSG + ISR), edge-optimized
Animation lib  : awwwards-animations skill-ийн pattern библиотек
```

**Render стратеги:**
- **SSG (Static)** — landing, residence detail, amenities, about → `generateStaticParams`, бүх контент build үед үүснэ (хамгийн хурдан, SEO сайн).
- **ISR** — residence жагсаалт/CMS контентод (хэрэв CMS холбовол) `revalidate`.
- **Client islands** — зөвхөн motion (GSAP/Lenis) + form нь `"use client"`. Бусад нь server-rendered → анхны load хурдан, motion JS дараа нь hydrate.
- **next/image** — бүх зураг optimize, lazy + blur-up.

---

## 3. Сайтын бүтэц (Multi-page sitemap)

```
/                       Home / cinematic landing
/residences             Бүх residence-ийн overview (pinned gallery)
/residences/lumiere     Lumière Duplex (detail)
/residences/crown       Crown Penthouse (detail)
/residences/aurelia     Aurelia Garden Suites (detail)
/amenities              Wellness / art / nature amenities
/about                  Vision + 5 beliefs + team
/gallery                Зургийн галерей (masonry + lightbox)
/contact                Book a Visit form + location/map
/(legal)/privacy        Privacy policy
```

Global: Header (sticky), Footer, Page-transition overlay, Custom cursor, Lenis provider.

---

## 4. Контент — Хуудас тус бүрийн мэдээлэл (web-д орох текст/блок)

### `/` Home (section-by-section + motion)

| Section | Контент | Motion |
|---------|---------|--------|
| **Hero** | "Holistic luxury in perfect harmony" + sub + `Book a Visit` CTA, fullscreen зураг/видео | Clip-path image reveal, line-mask текст stagger, scroll-down indicator |
| **Intro / About** | Богино философи: timeless design + wellness living | Scroll-reveal текст, parallax зураг |
| **Stats band** | `60%` green spaces · `30` residences · `150k` sq ft green · `24/7` concierge | Number counters, stagger |
| **Living Types** | 3 residence карт: Lumière Duplex · Crown Penthouse · Aurelia Suites | Pinned horizontal scroll эсвэл sticky stack, card hover scale |
| **Beliefs** | 5 итгэл: holistic well-being · discretion & exclusivity · cultural enrichment · community & connection · sustainable elegance | Marquee эсвэл step-reveal, line mask |
| **Amenities** | Fitness, spa, meditation lounge, rooftop garden, walking paths | Parallax зураг + reveal |
| **Gallery teaser** | 4-6 зураг preview → `/gallery` | Clip-path grid reveal |
| **FAQ** | Түгээмэл асуултууд | Accordion expand |
| **CTA / Contact** | `Book a Visit` form + location | Reveal, focus states |
| **Footer** | Хаяг, утас, и-мэйл, social, navigation | Big text reveal, parallax |

### `/residences/[slug]` (residence бүрд)
Hero зураг + нэр · тайлбар (Lumière = 2 давхар private terrace; Crown = panoramic penthouse; Aurelia = private garden suite) · spec-үүд (m², өрөө, онцлог) · floor plan зураг · галерей · "Book a Visit" CTA.

### `/about`
Vision narrative · 5 beliefs (дэлгэрэнгүй) · 60% green / sustainability story · (optional) team.

### `/amenities`
Wellness center · spa · meditation · rooftop gardens · walking paths · art program — тус бүр зураг + тайлбар + parallax.

### `/contact`
Booking form (нэр, и-мэйл, утас, residence сонголт, огноо, мессеж) · байршил + газрын зураг (Mapbox/Google embed) · concierge утас/и-мэйл.

> **Шаардлагатай asset-ууд:** өндөр чанарын зураг (hero, residence, amenity, gallery), floor plan, лого, (optional) hero видео, favicon, OG image. Placeholder-аар эхэлж, дараа нь бодит зургаар солино.

---

## 5. Design System (tokens)

```
Палитр  : --bone #F4F1EA · --sand #E3DCCD · --stone #9A9486 · --charcoal #1C1A17
          accent --moss #5A6650 (sustainable green) · --gold #B89B6E (luxury accent)
Type    : Display = serif (ж: Canela / Fraunces / Cormorant) — гарчиг
          Body    = clean sans (ж: Inter / Suisse / Neue Haas) — текст
Scale   : clamp()-based fluid type (mobile→desktop)
Spacing : 8px grid, том vertical rhythm (luxury = их whitespace)
Radius  : бараг тэгш өнцөгт (0–4px), luxury minimalist
Motion  : easing --ease-out: cubic-bezier(.16,1,.3,1); duration 0.8–1.2s reveal
Grid    : 12-col, том margin, max-width ~1440px
```

---

## 6. Motion Implementation Plan (GSAP + Lenis)

**Суурь:**
1. `LenisProvider` (client) — Lenis-ийг GSAP `ScrollTrigger.update`-тэй sync, `gsap.ticker`-аар RAF.
2. `useGSAP` hook (`@gsap/react`) — бүх анимэйшн scoped + автомат cleanup.
3. Reusable motion components:
   - `<RevealText>` — SplitText line/word mask reveal
   - `<RevealImage>` — clip-path expand + scale
   - `<Parallax speed>` — `y` transform ScrollTrigger scrub
   - `<Counter to>` — number count-up
   - `<PinnedSection>` — pin + horizontal scroll
   - `<MagneticCursor>` + `<MagneticButton>`
   - `<PageTransition>` — route overlay (App Router + framer-motion эсвэл GSAP)
   - `<Marquee>` — infinite loop
4. **Performance:** `will-change`, transform/opacity-only анимэйшн, `prefers-reduced-motion` дэмжих, mobile дээр motion хялбарчлах, ScrollTrigger `invalidateOnRefresh`.

**Ашиглах skill-ууд:**
- `awwwards-animations` — useGSAP, Lenis, custom cursor, text/scroll/page-transition pattern.
- `gsap-framer-scroll-animation` — ScrollTrigger pin/scrub/snap, horizontal scroll, matchMedia.
- `premium-frontend-design` — design философи, "no AI slop" чанар, WebGL/shader.
- `landing-page-design` — hero/CTA конверс, above-the-fold формул.

---

## 7. Phased Roadmap (milestone-ууд)

**Phase 0 — Setup (суурь)**
- `create-next-app` (TS, Tailwind, App Router), git init, Vercel холболт
- Design tokens, fonts, Tailwind theme, layout shell (Header/Footer)
- Lenis + GSAP суулгах, `LenisProvider`, ScrollTrigger sync

**Phase 1 — Home landing (cinematic)**
- Hero (clip-path + text mask), sticky navbar, custom cursor
- Stats counter, Living Types pinned gallery, Beliefs marquee
- Amenities parallax, FAQ accordion, CTA form, footer
- Reusable motion components бэлэн болгох

**Phase 2 — Multi-page**
- `/residences` overview + 3 detail хуудас (SSG, `generateStaticParams`)
- `/about`, `/amenities`, `/gallery` (lightbox), `/contact` (form + map)
- Page-transition overlay бүх route-д

**Phase 3 — Polish & render**
- Бодит зураг/контент оруулах, next/image optimize
- WebGL grain/smoke (optional, Find-style), micro-interactions
- `prefers-reduced-motion`, mobile motion tuning
- SEO (metadata, OG, sitemap, robots), Lighthouse 90+ зорилт
- Form backend (API route → email/CRM), validation
- Vercel deploy (SSG+ISR), preview/prod

**Phase 4 — (optional)**
- CMS (Sanity) холболт — контентыг editor-аас засах
- Multi-language (mn/en), analytics

---

## 8. Render / Deployment товч

- **Build:** `next build` → бараг бүх хуудас static HTML (SSG) болж prerender.
- **Hosting:** Vercel — edge CDN, automatic image optimization, ISR.
- **Motion JS:** client island-аар hydrate, анхны paint хурдан.
- **Зорилт:** LCP < 2.5s, CLS ~0, smooth 60fps motion.

---

## 9. Дараагийн алхам (танаас баталгаажуулах)

1. Энэ plan-ийг батлах эсвэл засах.
2. Бодит контент/зураг байгаа эсэх (эсвэл placeholder-аар эхлэх үү).
3. Сайтын нэр/брэнд — "Elysium" эцсийн нэр мөн үү, лого байгаа юу.
4. Батлах юм бол **Phase 0 (setup) + Phase 1 (Home landing)**-ийг шууд кодлож эхэлнэ.

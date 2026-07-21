# godaylight.com → Elysium /daylight — Page Topology

Doc height ~16000px @1440x900. Stack: Next.js + Tailwind v4 (1px spacing base) + Lenis (lerp 0.12, wheelMultiplier 1) + GSAP (ScrollTrigger + SplitText) + Rive (canvas anims) + Mux video. Fonts: aeonikPro(sans)/socialMono(mono)/featureDeck(serif display, class adds uppercase — headings override with normal-case).

**Elysium adaptation**: route `/daylight`, Elysium bilingual content (MN default/EN), fonts: Gilroy(sans)/JetBrains Mono(mono)/Lora(serif). Palette kept identical to original. All Daylight media replaced with Elysium renders/video (`public/images/*`, `public/video/hero-source.mp4`). CTAs → booking (`#booking` on /final or tel link) instead of external qualify app.

## Global fixed elements
1. `<nav>` skip-link (a11y) — fixed top-20 left-20 z-1001, hidden via -translate-y-150 until focus.
2. `<header class="daylight-header">` fixed top-12 lg:top-22, z-100, w-full, initial `-translate-y-[150%]`, animates in after intro. Hide-on-scroll-down / show-on-scroll-up (translate, ~300ms ease).
   - Desktop: centered white pill (mx-auto w-fit, bg-white, rounded-8px, padding 6px 6px 6px 16px, gap-28px, h-57px): logo-main.svg (link) + nav links (Product/Partners/About/Brand → Elysium: Нийтлэл/Өрөөний сонголт/Давуу тал/Гадаадаас) 14px sans, hover:opacity-60 + "Get started" (→ "Уулзалт товлох") CTA: rounded-4px h-45px px-24 white text 15px medium, **video bg** (orange waves loop) + `backdrop-blur-sm` layer + text z-2.
   - Mobile: full-width white bar: logo + hamburger (2 svg icons toggle); expanding menu with links + CTA.
3. Grain overlay (global, pointer-events-none): bg-image `/grain-2.jpg` via image-set, `animation: shiftBackground 1s steps(10) infinite` (background-position 0 0 → 1000px 1000px). Covers entire viewport, subtle opacity, mix normal.
4. Custom scrollbar: thin, dark thumb on beige (≈4px wide, black/40 thumb).

## Main sections (in order)

### S1 · HERO "intro" (h-svh, overflow-clip) — component `DlHero`
- Inner container `.containerRef` relative isolate overflow-clip [clip-path:border-box] h-svh.
- Layers:
  - Media layer (abs inset-0): waves video (Elysium: `hero-source.mp4`) + poster. Initially FULLSCREEN (clip inset 0), after intro clipped to window `inset(30% 15% 30% 67.15%)` desktop / `inset(26% 32% 57% 41%)`… (see BEHAVIORS: desktop steps [30,15,30,67.15]→scroll-out [35,20,35,72]; mobile [22.29,28.27,53.83,36]→[26,32,57,41]).
  - White 1px/30% border lines hugging the clip window edges (4 abs divs translating with clip).
  - Wordmark layer: big "Daylight" logo center (Elysium wordmark svg / text) + Rive sun icon (Elysium: logo mark with CSS-driven spin scrub) — slides off (x 40%, y -40%) as intro→scroll.
  - Info widgets (mono, text-beige, uppercase):
    - `.intro-info-top` labels top area: "kWh generated" (text-8/lg:11) / value "8.2kWh - 9.5kWh" (text-10/lg:12, medium) → Elysium: "Ногоон орчин" / "85% нийтийн эзэмшил".
    - `.intro-info-right` block (abs right, p-13, text-12): "Backup stored" + progress bar (h-4 w-75 lg:h-10 w-100, bg-beige/40, inner bg-beige origin-left scaleX 0.4→1) + "Thermostat" + snowflake icon + "68°F" → Elysium: "Зогсоол 513" bar + "Дулаан хангамж" + "24/7".
  - Text slot (grid col, z above): kicker small mono text-12 white uppercase "Power you control" → "ELYSIUM · УЛААНБААТАР"; h1 serif text-40/lg:85 text-beige 2 lines; p text-14/lg:20 span-w-10/8; CTA row mt-24: inline address form (original) → Elysium: primary CTA "Уулзалт товлох" + secondary "Өрөөний сонголт".
- Preloader phase (before intro): fullscreen waves + centered Rive sun + wordmark typing in; scroll LOCKED 2s; intro timeline then clips video to window and reveals text (see BEHAVIORS).

### S2 · USP (`w-full overflow-clip`) — component `DlUsp`
- `<ul>` relative flex-col, lg:pt-180 lg:pb-180, with **vertical grid lines**: before/after pseudo span-w-6 borders (border-beige-dark) left+right columns (z-10).
- 3 `<li class="usp-item">` lg:grid cols [6col | 1fr | 6col], margin-px-1, border-b beige-dark (first also border-t):
  - Center col: `.usp-content-N` — on lg: `fixed inset-0` flex-col center gap-28, opacity/y driven by master scrub timeline; contains `.usp-surtitle-N` (mono text-12 grey-txt uppercase) + `.usp-title-N` h2 (text-35 lg:text-50 medium, 2 lines).
  - Right col (alternates? all right in original): figure with `.usp-media-wrapper-N` (span-w-8 lg:span-w-6, aspect 220/275 mobile) clip-reveal + inner `.usp-media-N` img scale 1.8→1; horizontal border lines `.usp-line-N-1/2`.
- Elysium content: 1) "Хэмнэлт" / "Ашиглалтын зардлаа 20% хүртэл бууруул" (exterior-lowangle-towers) 2) "Хамгаалалт" / "Өвлийн хүйтэнд ч дулаан, найдвартай орчин" (exterior-snow-courtyard) 3) "Хяналт" / "Бүгдийг Elysium апп-аас хяна" (aerial-courtyard-promenade).

### S3 · HOW IT WORKS (`[clip-path:border-box]`) — components `DlHowIntro` + `DlSteps` (+ `DlStep1Phone`, `DlStep2Media`, `DlStep3Chart`)
Wrapper `HowItWorksMotion`: relative overflow-clip; `.hiw-bg` FIXED inset-0 z-2 bg-beige opacity-0 (fades in via scrub as steps stack).
1. Intro full-bleed: sticky top-0 z-1 h-lvh; parallax media (bg image + overlay 30) `-300px` translate range; center overlay: `.fb-surtitle` mono 12 + `.fb-title` serif 40/85 (2 lines) + `.fb-text` 14/20 + CTA (secondary bg-beige). All SplitText line-mask reveals (once, top center/35%).
2. Steps: 3 `.hiw-item-N` each `sticky top-0 h-[220lvh] px-6 pt-(--nav-height) pb-6`, stacking; scale-down+fade as next covers (see BEHAVIORS). Inner panel h-[calc(100lvh-6px-nav)] — dark rounded cards (bg differs per step: 1 black w/ phone right, 2 media, 3 beige w/ chart).
   - Step1: left text (surtitle "step 1" mono, title "Subscribe to Daylight" → "Урьдчилсан захиалга", subtitle pill "A lower bill..." → "САРЫН УЯН ТӨЛБӨР", text, CTA "Get your estimate" → "Үнийн санал авах"), right: phone `DlStep1Phone` — lg:span-w-5 aspect 175/380 rounded-2xl clip-path animates from `inset(34.5% 12.29% 28% 12.29% round 1rem)` → `inset(0 round 1rem)`; `.step-logo` scale 3.1→1; `.step-title` lines; `.step-top` chip; `.step-bottom` toggle w/ `.step-bottom-rect` slide (xPercent 109) + color swap.
   - Step2: media panel (Rive install anim → Elysium: exterior render w/ scale parallax), lg:span-w-12 absolute h-[calc(100lvh-2*margin)], text left.
   - Step3: beige panel; left text; right `DlStep3Chart`: "Energy/Earnings" tabs → "Үнэ цэнэ/Өгөөж"; card aspect 460/360 rounded-xl border brown/15 bg-beige p-24; big serif counter 0→9.5 (→ Elysium 0→85, suffix %) + sub kWh label; SVG 700x320 curve (#F66F00 3px) clip-reveal width 0→700; second dashed-ish curve opacity 0.3; vertical marker line at x=0.5*700 opacity@0.45; day labels grid-cols-7 mono text-10 (НЯ ДА МЯ ЛХ ПҮ БА БЯ, 4th highlighted).

### S4 · WHY (3 fullscreen panels) — component `DlWhy`
Each `article.js-item` h-(--screen-height-max) grid overlay-center:
- bg video (Elysium: image w/ slow scale) in Parallax wrapper (distance 0.75 viewportRatio), overlay 30-50%; first panel `.js-video` scale 0.8→1 scrub-in.
- content z-10 text-beige: surtitle mono 12 uppercase (h1/h2) + title `.js-title` — layout "center": serif text-40/lg:85 or 70, yPercent 150 reveal; layout "left" (panel 2): sans 3 lines text-20/lg:45, lines from xPercent ∓15 alternating (L/R/C aligned), expo.out 1.6s stagger 0.1.
- Elysium: 1) center "ЯАГААД ELYSIUM" / "Хотын шуугианаас ангид, өөрийн гэсэн орчин" (aerial-park-playground) 2) left "ТУЛГАМДСАН АСУУДАЛ" / 3 мөр: агаарын бохирдол / түгжрэл / ногоон орчны хомсдол (exterior-path-moody) 3) center "НЭГ ХОТХОН, НЭГ АМЬДРАЛ" / "506 айл нэг дор — өөрийн гэсэн тайван хороолол" (amenity-canal-golden). CTA after panels (primary, white hover overlay).

### S5 · NETWORK (`pt-140 pb-60 lg:pt-150`) — component `DlNetwork`
Centered col gap-24 text-black: `.nw-text` small mono 12 + h2 serif 40/85 2 lines + p 14/20 + CTA primary. All SplitText line reveals @ top 90%. Below: Rive network anim (Elysium: custom canvas dots-network growing, scrubbed 0→1.3 by ScrollTrigger top-center, span-w-14, h-300/lg:max(37.5rem,50vw)).
- Elysium: "ӨСӨН ТЭЛЖ БУЙ ХОТХОН" / "Айл бүр хотхоныг илүү хүчирхэг болгоно" / масterplan цэгэн сүлжээ анимаци (aerial-masterplan суурьтай).

### S6 · DIPTYCH CTA (bg-purple #C8B2FF, lg:h-lvh grid-cols-2) — component `DlDiptych`
- Left: big title serif text-40/lg:text-120 leading-[1.22] text-purple-dark (#321F61) 2 lines ("Step into Daylight" → "Elysium-д тавтай морил"), logo icon, subtitle mono 12 uppercase ("The future is bright" → "ИРЭЭДҮЙ ГЭРЭЛТЭЙ"), text 20 medium, CTA primary (hover overlay white, text→purple-dark).
- Right: sticky media (Elysium: amenity-canal-golden portrait) with **animated inset mask** stepping through keyframes (desktop [7.5,9.57,65.8,42.67]→[31.6,29.15,39.3,15.36]→[52.5,16.33,10.7,46.9], sine.inOut, scrub 0.5, trigger 75%→25%) + white/30 1px edge lines + **mouse parallax** (±25px, lerp 0.1) on the window.
- All text lines mask-reveal power4.out 0.8s stagger 0.1.

### FOOTER (min-h-lvh grid overlay) — component `DlFooter`
- bg video full (Elysium: hero-source.mp4 or exterior-dusk still) + dark overlay; text-beige.
- Center row (justify-around): logo full wordmark (Elysium logo svg, span-w-5) + links col (span-w-4, gap-y-27): `[ Blog ]`-style bracket links mono 12 uppercase: Elysium: [Нийтлэл] [Танилцуулга PDF] [Байршил] [Холбоо барих] [Нууцлалын бодлого]; brackets `.bracket-l/r` separate spans (hover: brackets expand outward).
- `More Power` h2 (text-35 lg:text-50) → "Дэлгэрэнгүй мэдээлэл" — likely near top.
- Bottom row (mt-auto mb-24, mono 12 uppercase, flex-row justify-between): socials [x/instagram/…] → Elysium FB/IG/YouTube + © line.

## Assembly (page.tsx)
`.dl` wrapper (tokens scope, bg-beige text-black min-h-screen): Grain + Header + main(S1..S6) + Footer. Uses root SmoothScroll (Lenis) from layout; hero intro locks scroll via lenis.stop()/start(). All sections client components (GSAP), content via `daylight-content.ts` dict keyed by lang from LangProvider.

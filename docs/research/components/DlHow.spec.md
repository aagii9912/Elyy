# DlHow — "How it works" scrollytelling (intro full-bleed + 3 sticky stacking step panels)

Target: `src/components/daylight/DlHow.tsx` (client). Imports the media trio from `./DlStepsMedia` (`DlStep1Phone`, `DlStep2Media`, `DlStep3Chart` — built by another agent; import them by name; assume props: none, they read lang internally. If module missing at your build time, create a TEMPORARY `./DlStepsMedia.d.ts`? NO — instead import with `// @ts-expect-error` ONLY if missing; preferred: they will exist; write code assuming they exist).

## Imports
`useLang`; `DL_DICT[lang].how` = {surtitle, titleLines, text, cta, steps[3]{surtitle,title,subtitle,text,cta?}, phone, chart}; `DL_MEDIA.howIntroImage`; `gsap, ScrollTrigger, useGSAP, DlButton, DlParallax` from `./shared`. Arbitrary px only; dl-text-N/dl-mono/dl-serif; vars --dl-*.

## Layout
`<section id="about" ref=rootRef class="relative" style={{clipPath:'border-box'}}>` wrapper `relative overflow-clip`:
1. `.dl-hiw-bg`: `fixed inset-0 z-[2] h-lvh w-full bg-[var(--dl-beige)] opacity-0 pointer-events-none` (fades in over the intro as steps arrive).
2. **Intro block** (child 1): `sticky top-0 z-[1] h-lvh` —
   - Media: DlParallax distance 300 wrapping `<img src={howIntroImage} class="h-[calc(100lvh+300px)] w-full object-cover"/>` + overlay `absolute inset-0 bg-black/30`.
   - Overlay content `ref=introContent`: `absolute inset-0 z-[1] flex flex-col items-center justify-center gap-[24px] text-center text-[var(--dl-beige)] dl-container`:
     - small `.dl-fb-surtitle` dl-mono dl-text-12
     - h2 `.dl-fb-title` dl-serif dl-text-40 lg:dl-text-85 leading-[0.95] — 2 masked lines (titleLines)
     - p `.dl-fb-text` dl-text-14 lg:dl-text-20 max-w-[calc(12*var(--column)+11*var(--gutter))] mt-[24px] lg:mt-[36px]
     - CTA mt-[36px]: DlButton secondary (bg beige, text black) href="/final#booking" {cta}
   - Content block translates 0→-200px across section scroll (ST scrub on the sticky wrap).
3. **Step panels** (z above intro, after it in flow): for i in 0..2 `article .dl-hiw-item .dl-hiw-item-{i}`: `sticky top-0 h-[220lvh] px-[6px] pb-[6px] pt-[var(--nav-height)]` + transform-origin: items 0,1 `origin-top`, item 2 `origin-center lg:origin-bottom`.
   - Inner panel: `relative flex h-[calc(100lvh-0.375rem-var(--nav-height))] flex-col overflow-clip rounded-[16px]` — per step:
     - **Step 0** bg `bg-[var(--dl-black)] text-[var(--dl-beige)]`: grid lg:grid-cols-2 h-full items-center; LEFT text col `pl-[calc(var(--column)+var(--gutter))] pr-[24px] flex flex-col gap-[20px] max-lg:px-[24px] max-lg:pt-[48px]`: surtitle dl-mono dl-text-12 opacity-70; h3 title (split \n → 2 masked lines) dl-serif dl-text-40 lg:dl-text-70; subtitle chip: inline-flex rounded-full border border-white/25 px-[14px] py-[6px] dl-mono dl-text-11; p text dl-text-14 lg:dl-text-16 opacity-80 max-w-[46ch]; optional CTA (DlButton secondary) if steps[0].cta.
       RIGHT: `<DlStep1Phone/>` (absolute right half on lg: `relative lg:absolute lg:top-0 lg:right-0 lg:left-1/2 lg:h-full flex items-center justify-center`).
     - **Step 1** bg image panel: `<img src={DL_MEDIA.step2Image} class="absolute inset-0 h-full w-full object-cover"/>` + overlay bg-black/35 + same LEFT text col (text-[var(--dl-beige)]) + `<DlStep2Media/>` on right (it renders its own media card).
     - **Step 2** bg `bg-[#f6ecd9]` (warm beige panel) text-[var(--dl-brown)]: LEFT text col; RIGHT `<DlStep3Chart/>` (lg:absolute lg:left-1/2 lg:w-1/2 h-full flex items-center justify-center).

## Behaviors
- Intro SplitText-like masked reveals (once): surtitle line y100→0 0.4s power3.out ST{trigger intro, start "top center"}; title lines 0.66s stagger .15 same; text lines (use splitLinesMasked on the p) 0.66s stagger .15 ST start "top 35%"; CTA alpha/y 20 in 0.5s @ +0.1.
- Intro content parallax: gsap.fromTo(introContent, {y:0},{y:-200, ease:"none", ST:{trigger: rootRef, start:"top top", end:"+=200%", scrub:true}}).
- Wrapper master (scrub): ST {trigger rootRef, start "top 35%", end "bottom top", scrub:true}: `.dl-hiw-bg` alpha 0→1 dur 0.3 power4.out @0; then per item i: fromTo(.dl-hiw-item-{i} INNER panel, {scale:1, autoAlpha:1},{scale:0.9, autoAlpha:0, duration:0.8, ease:"sine.in"}, i+0.6) — desktop; mobile scale 0.7 @ i+0.8; last item scale-only (no alpha fade).
- Each step's own text reveals once at ST "top 60%": surtitle/title/subtitle/text staggered masked y100→0 power4.out.

## Acceptance
Panels stack: each pins 220lvh, next slides over while prev scales/fades; beige fixed bg appears behind panels so page bg beneath steps is beige; tsc passes. Export `DlHow`.

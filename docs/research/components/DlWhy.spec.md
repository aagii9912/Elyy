# DlWhy — 3 fullscreen image panels with split-title reveals

Target: `src/components/daylight/DlWhy.tsx` (client). Interaction: scroll (once-reveals + first-panel scale-in + parallax).

## Imports
`useLang`; `DL_DICT[lang].why` = {items[3]{surtitle, layout:"center"|"left", title, image, overlay}, cta}; `gsap, ScrollTrigger, useGSAP, DlButton, DlParallax, splitLinesMasked` from `./shared`. Arbitrary px only; dl-text-N/dl-mono/dl-serif.

## Layout
`<section ref=rootRef>`: for each item i → `<article class="dl-why-item relative grid h-lvh grid-cols-1 grid-rows-1 overflow-clip">`:
- Media: `DlParallax` (distance ≈ 0.75*viewport → use 300) `className="col-start-1 row-start-1 h-full w-full"` wrapping `.dl-why-media-{i}`: `<img src class="h-[calc(100%+300px)] w-full object-cover"/>`; overlay div `absolute inset-0 bg-black` style opacity: overlay/100.
- Content: `relative z-10 col-start-1 row-start-1 flex flex-col justify-center gap-y-[48px] text-[var(--dl-beige)] dl-container` + width: layout left → `max-w-[calc(22*var(--column)+21*var(--gutter))]`, center → mx-auto text-center `max-w-[calc(18*var(--column)+17*var(--gutter))]`.
  - surtitle (h2): dl-mono dl-text-12, center → text-center else text-left.
  - title p `.dl-why-title-{i}` (initial `lg:invisible`):
    - layout center: dl-serif normal-case text-[28px] i==0? lg:dl-text-85 : lg:dl-text-70, single flowing text (title).
    - layout left: title.split("\n") → 3 span `.dl-why-line block font-medium dl-text-20 lg:dl-text-45` with align: idx0 text-left, idx1 lg:text-right, idx2 lg:text-center; container `space-y-[48px] lg:space-y-[12px]` font-sans (Gilroy).
- After all items: CTA row `flex justify-center pt-[36px] pb-[60px]`: DlButton primary href="/final#booking" {cta}.

## Behaviors
- Item 0 media: gsap tl ST{trigger: item0, end:"center center", scrub:true}.fromTo(media img, {scale:0.8},{scale:1, ease:"none"}).
- Titles (desktop only ≥1024; on mobile just set visible):
  - center: splitLinesMasked(title) → fromTo lines {yPercent:150, autoAlpha:0}→{yPercent:0, autoAlpha:1, duration:1.6, ease:"expo.out", stagger:0.1} ST{trigger: item, start:"top center"} once; set title visibility visible first.
  - left: use the 3 `.dl-why-line` spans: fromTo {xPercent: idx==1? 15 : -15, autoAlpha:0}→{xPercent:0, autoAlpha:1, duration:1.6, ease:"expo.out", stagger:0.1} same trigger.
- Surtitles: alpha 0 y 20 → in 0.6s expo.out at same trigger.

## Acceptance
h-lvh panels, readable overlays, reveals fire once per panel; tsc passes. Export `DlWhy`.

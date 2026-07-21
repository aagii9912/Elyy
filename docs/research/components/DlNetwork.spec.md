# DlNetwork — growing-community section (text reveals + scroll-scrubbed canvas dot network)

Target: `src/components/daylight/DlNetwork.tsx` (client). Interaction: scroll (once text reveals; canvas progress scrubbed).

## Imports
`useLang`; `DL_DICT[lang].network` = {surtitle, titleLines:[a,b], text, cta}; `gsap, ScrollTrigger, useGSAP, DlButton, splitLinesMasked` from `./shared`. Arbitrary px only; dl classes/vars.

## Layout
`<section ref=rootRef class="pt-[140px] pb-[60px] lg:pt-[150px]">` → inner `flex flex-col items-center gap-[24px] text-center text-[var(--dl-black)] lg:mb-[40px] dl-container`:
- small `.dl-nw-text` dl-mono dl-text-12 (surtitle)
- h2 `.dl-nw-text` dl-serif dl-text-40 lg:dl-text-85 — 2 masked lines (titleLines)
- p `.dl-nw-text` dl-text-14 lg:dl-text-20 mt-[24px] lg:mt-[36px] max-w-[calc(10*var(--column)+9*var(--gutter))] text-[var(--dl-grey)]
- CTA `mt-[36px]`: DlButton primary href="/final#booking" {cta}
- Canvas block below: `<canvas ref=canvasRef class="mx-auto mt-[40px] block h-[300px] w-full lg:h-[max(37.5rem,50vw)] lg:w-[calc(14*var(--column)+13*var(--gutter))]"/>`.

## Canvas animation — "growing network" (custom, replaces Rive)
Deterministic pseudo-random (seeded LCG, seed 7) node field:
- ~90 nodes: positions distributed in an organic cluster (golden-angle spiral + jitter): center (w/2, h*0.52), radius up to min(w,h)*0.46.
- Each node: appearOrder = index/90 (spiral order), r = 2.5–5px.
- Edges: connect each node to 1–2 nearest earlier nodes (precompute).
- Render at progress P (0→1.3, clamp visible math at 1):
  - node visible if appearOrder < P; pop-in scale over 0.06 window (ease-out).
  - edge visible when both ends in; line draw grows (strokeDash progress over 0.08 window).
  - colors: nodes #111 (every 7th #F66F00, slightly larger); edges rgba(17,17,17,0.25) 1px; bg transparent (beige page).
  - subtle idle motion: each node drifts ±2px sin(t*0.6 + i) — rAF loop always running while in view (IntersectionObserver gate).
- DPR-aware sizing w/ ResizeObserver (cap dpr 2).
### Scrub
useGSAP: obj {p:0}; gsap.fromTo(obj, {p:0},{p:1.3, ease:"power3.out", duration:1, onUpdate: () => progressRef.current = obj.p, scrollTrigger:{trigger: rootRef, start:"top center", scrub:true}}).

## Text reveals
`.dl-nw-text` elements (small + h2 lines + p): for h2 use pre-masked titleLines spans; for small/p use splitLinesMasked; fromTo yPercent 100→0 dur 0.8 power4.out stagger 0.1, ST per element {trigger: el, start "top 90%"} once.

## Acceptance
Canvas crisp on retina, no rAF leak (cleanup), scrub feels tied to scroll; tsc passes. Export `DlNetwork`.

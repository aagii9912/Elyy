# DlUsp — 3-item USP band (fixed swapping text + media clip reveals + grid lines)

Target: `src/components/daylight/DlUsp.tsx` (client). Interaction: scroll-driven (desktop master scrub; mobile per-item once).

## Imports
`useLang`; `DL_DICT[lang].usp.items` (3 × {surtitle, titleLines:[a,b], image, alt}); `gsap, ScrollTrigger, useGSAP, SplitText` from `./shared`. Tailwind arbitrary px only; classes dl-text-N / dl-mono / dl-serif; vars --dl-*.

## Layout
`<section id="advantages" class="w-full overflow-clip">` → `<ul ref=listRef class="relative flex flex-col gap-0 pb-[64px] lg:pt-[180px] lg:pb-[180px]">`
- Vertical guide lines (desktop): two abs divs instead of pseudos: `hidden lg:block pointer-events-none absolute top-0 bottom-0 z-10 border-r border-[var(--dl-beige-dark)]` at `left: calc(var(--margin) + 6*var(--column) + 5*var(--gutter))`; mirrored border-l at right (`right: calc(var(--margin) + 6*var(--column) + 5*var(--gutter))`).
- Each item i (li.dl-usp-item): `lg:grid lg:grid-cols-[calc(6*var(--column)+5*var(--gutter))_1fr_calc(6*var(--column)+5*var(--gutter))] px-[var(--margin)] border-b border-[var(--dl-beige-dark)] first:border-t`:
  - Center col: `relative py-[64px] text-center lg:col-start-2 lg:row-start-1` with `lg:[clip-path:border-box]`; inner `.dl-usp-content-{i}`: `flex flex-col items-center justify-center gap-[24px] lg:fixed lg:inset-0 lg:gap-[28px]` (fixed overlay on desktop! initial opacity 0 on lg — set via gsap).
    - p `.dl-usp-surtitle-{i}` dl-mono dl-text-12 text-[var(--dl-grey)]: masked span (surtitle).
    - h2 `.dl-usp-title-{i}` `dl-text-35 lg:dl-text-50 font-medium text-[var(--dl-black)] max-w-[calc(11*var(--column)+10*var(--gutter))]`: two lines (titleLines) each in mask.
  - Media col: `relative overflow-clip lg:row-start-1` — items 0&2: `lg:col-start-3`; item 1: `lg:col-start-1 lg:row-start-1` (alternate side for rhythm) — actually original keeps right side; KEEP `lg:col-start-3` for all.
    - `.dl-usp-media-wrap-{i}`: `relative mx-auto h-full w-[calc(8*var(--column)+7*var(--gutter))] lg:w-[calc(6*var(--column)+5*var(--gutter))] max-lg:aspect-[220/275] overflow-clip` (desktop height: min-h-[500px]).
    - inner `.dl-usp-media-{i}`: `<img src=image alt class="h-full w-full object-cover" />` (scale 1.8 initial).
  - Hairlines `.dl-usp-line-{i}-1/2` (mobile only): abs top/bottom border divs.

## Behaviors
### Mobile (<1024) — per item, play once
- surtitle line: yPercent 100→0, 0.4s expo.out, ST {trigger: item, start "top 70%"}.
- title lines: yPercent 100→0, 0.66s expo.out, stagger 0.15, same trigger.
- media wrap: clipPath `inset(20% 0% 20% 0%)` → `inset(0% 0% 0% 0%)`, 1.5s expo.out, ST start "top 60%"; media img scale 1.8→1 same.
- lines: y ±20%→0 1.5s.
### Desktop (≥1024) — media same once-reveals per item (start "top 60%") PLUS master scrub timeline for the fixed text:
tl ST {trigger: listRef, start "top 52%", end "bottom 50%", scrub: true}; add `tl.to({}, {duration:1}, 0)`:
- content-0: fromTo y 150→-50 dur .4 ease none @0; alpha fromTo 0→1 dur .15 power2.out @0.06; to alpha 0 dur .15 power2.in @0.28.
- content-1: y 50→-150 @0.3; alpha in @0.42; out @0.57.
- content-2: y -50→-250 @0.6; alpha in (power4.out) @0.72 (stays).
- surtitle-i line yPercent 100→0 dur .15 power3.out at 0.06/0.42/0.72; title-i lines yPercent 60→0 + alpha dur .2 power3.out stagger .012 same positions.
Guard: build/destroy on breakpoint cross via gsap.matchMedia(); use SplitText via `splitLinesMasked` or manual masked spans (titleLines given → manual `.dl-line-mask > .dl-line` spans is fine, no SplitText needed).

## Acceptance
Desktop fixed-overlay text swaps correctly while media scrolls; no layout jump; tsc passes. Export `DlUsp`.

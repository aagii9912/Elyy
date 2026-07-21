# DlDiptych — purple CTA section with animated inset mask + mouse parallax

Target: `src/components/daylight/DlDiptych.tsx` (client). Interaction: scroll-scrubbed mask keyframes + mousemove parallax + once text reveals.

## Imports
`useLang`; `DL_DICT[lang].diptych` = {titleLines:[a,b], subtitle, text, cta, image}; `DL_MEDIA.logo`; `gsap, ScrollTrigger, useGSAP, DlButton, DlParallax, splitLinesMasked` from `./shared`. Arbitrary px only; dl classes/vars.

## Layout
`<section id="contact" ref=rootRef class="grid h-fit grid-cols-1 overflow-clip bg-[var(--dl-purple)] lg:h-lvh lg:grid-cols-2">`
1. LEFT col `ref=textCol`: `dl-container col-start-1 row-start-2 flex h-full flex-col gap-[60px] py-[48px] lg:row-start-1 lg:justify-between lg:pt-[65px] lg:pb-[60px]`:
   - h2 title: `dl-serif dl-text-40 lg:dl-text-120 lg:leading-[1.22] text-[var(--dl-purple-dark)]` — two masked line spans (titleLines), each `.dl-line-mask > .dl-line` full-width block.
   - bottom grid `grid grid-cols-1 gap-[60px] lg:grid-cols-2 lg:gap-y-[60px] max-w-[calc(10*var(--column)+9*var(--gutter))]`:
     - figure: img DL_MEDIA.logo `w-[30px] h-auto` (masked block) — tint dark via CSS filter ok.
     - right cell: h3 subtitle `mb-[24px] dl-mono dl-text-12 text-[var(--dl-purple-dark)]` (masked); p text `.dl-dip-text` `font-medium dl-text-20 text-[var(--dl-purple-dark)]`.
     - CTA cell `lg:col-start-2`: DlButton primary hoverText="#321F61" href="/final#booking" {cta} (masked block).
2. RIGHT col `ref=mediaCol` `relative isolate overflow-clip` + onMouseMove/onMouseLeave handlers:
   - DlParallax distance 200 `className="sticky top-0 h-[475px] w-full lg:h-lvh"` wrapping img {image} cover full.
   - Mask overlay `absolute inset-0 z-[1] grid grid-cols-1 grid-rows-1`:
     - `.dl-dip-mask` ref=maskRef: `sticky top-0 z-[2] col-start-1 row-start-1 h-[475px] lg:h-lvh will-change-[clip-path]` — contains a brighter duplicate img (same src, `absolute inset-0 h-full w-full object-cover`, e.g. `brightness-110 saturate-110`) so the window pops vs the dimmed base (base img add `brightness-[0.72]`).
     - Edge lines: 4 abs divs refs L[0..3] bg-white/30: top `-top-px h-px w-full`, right `-right-px w-px h-full`, bottom `-bottom-px h-px w-full`, left `-left-px w-px h-full` (in a sticky sibling layer z-[1]).

## Mask math
State kept in refs: base = {top,right,bottom,left} (%), mouse = {x,y} px lerped 0.1/frame.
- clip: `inset(${top+dyP}% ${right-dxP}% ${bottom-dyP}% ${left+dxP}%)` where dxP/dyP = mouse px→% of media box.
- lines: top line translateY(top% · H + dy px); right translateX(-(right% · W) + dx); bottom translateY(-(bottom% · H) + dy); left translateX(left% · W + dx).
- rAF loop (gate: only while section in view via IntersectionObserver; cleanup).

## Timelines
- Desktop keyframes ft = [[7.5,9.57,65.8,42.67],[31.6,29.15,39.3,15.36],[52.5,16.33,10.7,46.9]]; mobile Ln = [[8.42,10.6,72.2,41.3],[37.68,29.6,40.42,17.6],[54.52,24.26,9.86,46.4],[8.42,10.6,72.2,41.3]].
- Init base = kf[0] (gsap.set clip + lines).
- tl ST {trigger rootRef, start "top 75%", end "bottom 25%", scrub: 0.5}; for each subsequent kf i (1..): tl.to(baseObj, {top,right,bottom,left, duration:1, ease:"sine.inOut", onUpdate: applyClipAndLines}, i-1).
- Mouse handlers desktop only (matchMedia ≥1024): dx=(relX-0.5)*50, dy=(relY-0.5)*50 (rel to media box), lerp 0.1.
- Text reveals (once): title lines + logo + subtitle + CTA blocks: yPercent 100→0 dur 0.8 power4.out stagger 0.1, ST {trigger textCol, start "top 75%"}; p text via splitLinesMasked lines same ease ST "top center"→desktop "top 15%".

## Acceptance
Window mask steps through keyframes with scroll, follows mouse subtly on desktop, purple/typography exact; tsc passes. Export `DlDiptych`.

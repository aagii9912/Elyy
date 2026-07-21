# DlFooter — fullscreen footer with video background + bracket links

Target: `src/components/daylight/DlFooter.tsx` (client). Interaction: enter reveals (once); link hovers.

## Imports
`useLang`; `DL_DICT[lang].footer` = {heading, links[]{label,href}, socials[]{label,href}, rights}; `DL_MEDIA.footerVideo|footerPoster|logo`; `gsap, ScrollTrigger, useGSAP` from `./shared`. Arbitrary px only; dl classes/vars.

## Layout
`<footer ref=rootRef class="relative z-10 grid min-h-lvh grid-cols-1 grid-rows-1 overflow-clip">`
1. Media: `<video src={footerVideo} poster={footerPoster} autoPlay muted loop playsInline class="col-start-1 row-start-1 h-full w-full object-cover"/>` + overlay `absolute inset-0 bg-black/45`.
2. Content `relative z-[1] col-start-1 row-start-1 flex flex-col justify-center text-[var(--dl-beige)] dl-container max-lg:pt-[96px]`:
   - Top heading `.dl-f-reveal`: h2 {heading} `font-medium dl-text-35 lg:dl-text-50 text-center pt-[48px]`.
   - Middle row `.dl-f-reveal` `flex items-center justify-around max-lg:flex-col max-lg:gap-y-[96px] lg:mt-auto lg:flex-row mt-[48px]`:
     - Brand block `flex flex-col items-center gap-[16px] w-[calc(8*var(--column)+7*var(--gutter))] lg:w-[calc(5*var(--column)+4*var(--gutter))]`: img logo `w-[96px] lg:w-[120px]` + span "Elysium" Gilroy 600 `text-[34px] lg:text-[44px] tracking-[-0.02em]`.
     - Links `<ul class="flex flex-col items-center gap-y-[27px] w-[calc(8*var(--column)+7*var(--gutter))] lg:w-[calc(4*var(--column)+3*var(--gutter))]">`: each `<a class="dl-bracket flex items-center gap-[10px] py-[4px] dl-mono dl-text-12">`:
       `<span class="dl-bracket-l transition-transform duration-300">[</span><span class="mt-[2px]">{label}</span><span class="dl-bracket-r transition-transform duration-300">]</span>`
       Hover (CSS in component via arbitrary group classes): `group` + `group-hover:-translate-x-[6px]` on l, `group-hover:translate-x-[6px]` on r, ease var(--dl-ease-expo).
   - Bottom bar `.dl-f-reveal` `mt-auto mb-[12px] lg:mb-[24px] flex max-lg:flex-col items-center justify-between gap-[24px] max-lg:pt-[90px] dl-mono dl-text-12`:
     - socials ul `flex items-center gap-x-[48px] max-lg:justify-between max-lg:w-full lg:w-fit`: links {label} `block p-[5px] hover:opacity-60 transition-opacity`.
     - span {rights} opacity-70.

## Behavior
- Reveals: gsap.fromTo(".dl-f-reveal", {y:40, autoAlpha:0},{y:0, autoAlpha:1, duration:0.9, ease:"expo.out", stagger:0.08, scrollTrigger:{trigger: rootRef, start:"top 70%"}}) once.
- Video play() guarded in useEffect.

## Acceptance
min-h-lvh footer; visible over beige page end; tsc passes. Export `DlFooter`.

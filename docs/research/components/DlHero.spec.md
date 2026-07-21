# DlHero — intro animated mask hero (preloader → clip window → scroll-out)

Target: `src/components/daylight/DlHero.tsx` (client). The signature section. Interaction: time-driven intro ONCE, then scroll-scrubbed exit.

## Imports available
`useLang` (`@/components/LangProvider`); `DL_DICT[lang].hero`, `DL_MEDIA` (`@/lib/daylight-content`); `gsap, ScrollTrigger, useGSAP, SplitText, DlButton, DlWaves, splitLinesMasked` from `./shared`. Lenis instance: `import { useLenis } from "lenis/react"` — use `lenis?.stop()` / `lenis?.start()` for scroll lock.
Tailwind: 4px spacing base — ONLY arbitrary px values. Type: `dl-text-N` classes; mono labels `dl-mono`; serif display `dl-serif`. Vars: `--dl-beige` etc.

## Content (DL_DICT[lang].hero)
`kicker`, `titleLines:[l1,l2]`, `text`, `cta`, `ctaSecondary`, `infoTop:{label,value}`, `infoRight:{backup,thermostat,thermoValue}`, `wordmark` ("Elysium"). Media: DL_MEDIA.heroVideo (+heroPoster), logo DL_MEDIA.logo.

## Layout
`<section class="relative h-svh w-screen overflow-clip" style={{clipPath:'border-box'}}>` inside a div `relative isolate h-svh`:
1. **Media layer** `ref=mediaClip`: `absolute inset-0` — will-change clip-path; children: `<video src={heroVideo} poster autoPlay muted loop playsInline class="absolute inset-0 h-full w-full object-cover" ref=mediaInner/>` UNDER a `<DlWaves class="absolute inset-0 h-full w-full"/>` that sits BEHIND video poster while loading (render waves first, video above with opacity-1 once canplay). Initially clip inset(0%) fullscreen.
2. **Edge lines** (4 divs, aria-hidden, refs linesRef[0..3]): abs, bg-white/30; top: `top-0 left-0 h-px w-full`; right: `right-0 top-0 w-px h-full`; bottom/left mirrored. They translate to hug the clip window (see anim).
3. **Wordmark cluster** `ref=wordRef` абс center: flex items-center gap-[18px]: img logo `w-[54px] lg:w-[64px]` + span wordmark in Gilroy 600 `text-[13vw] lg:text-[92px] text-[var(--dl-beige)] tracking-[-0.03em]` — the preloader logo lockup.
4. **Info widgets** (text-[var(--dl-beige)] dl-mono):
   - `.dl-info-top` cluster: absolute `top-[calc(30%-34px)] right-[16.5%]` hidden lg:flex flex-col items-end gap-[2px]; two masked rows: label (dl-text-11) & value (dl-text-12 font-medium).
   - `.dl-info-right` cluster: absolute `top-[30%] right-[calc(15%-12px)] translate-x-full` p-[13px] flex flex-col gap-[8px] dl-text-12; rows masked: `backup` label; progress bar `w-[100px] h-[10px] bg-[rgba(255,247,233,0.4)]` with inner `dl-bar-inner absolute inset-0 origin-left bg-[var(--dl-beige)]` (scaleX 0.4 rest); `thermostat` row (icon ❄ optional inline svg 14px) ; `thermoValue`.
   (Mobile: hide both clusters.)
5. **Text slot** `ref=textRef`: `dl-container relative z-[3] col flex h-full flex-col justify-center` — content sits LEFT-of-window? No: original text is left-aligned block starting at left margin, window on RIGHT at [top30 right15 bottom30 left67.15] → window occupies right side x∈[67.15%,85%]. TEXT column: `lg:translate-y-[min(8vh,72px)] max-w-[calc(15*var(--column)+14*var(--gutter))] flex flex-col gap-[24px]`:
   - kicker: `<small class="dl-mono dl-text-12 text-white">` masked line.
   - h1 `dl-serif dl-text-40 lg:dl-text-85 text-[var(--dl-black)]` — IMPORTANT: after intro the video is a small window; page bg beige → h1 must be DARK (#111) to read on beige. During intro (video fullscreen) h1 hidden anyway. 2 lines each in `.dl-line-mask`.
   - p `dl-text-14 lg:dl-text-20 lg:font-medium text-[var(--dl-grey)] max-w-[calc(10*var(--column)+9*var(--gutter))]`.
   - CTA row `mt-[24px] flex gap-[12px]`: DlButton variant waves href="/final#booking" {cta} + DlButton secondary href="/final#apartments" (border 1px var(--dl-beige-dark)) {ctaSecondary}.

## Animations (useGSAP scope section; gate with `prefers-reduced-motion` → skip intro, static final state)
### Phase A — intro (once, on mount; timeline `paused:false`)
Set at 0: mediaClip clip `inset(0% 0% 0% 0%)`; mediaInner scale 1.1; wordRef x:-100vw? NO — original: wordmark container x -100% then in; use: wordRef alpha 0 x -60; kicker/h1/p/cta lines yPercent 100 (masked); info rows y 100%; bar scaleX 0 alpha 0.
- lenis.stop() at start; setTimeout 2000 → lenis.start() (also on complete).
- 0→2.5s: (decorative) waves running; wordmark: to alpha 1 x 0 dur 1 power4.out at 0.2; logo img slight rotate -20°→0.
- at 1.0: mediaClip.to clip `inset(30% 15% 30% 67.15%)` dur 2 ease expo.inOut (desktop; mobile `inset(22.29% 28.27% 53.83% 36%)`); mediaInner scale 1.1→1 same dur; edge lines translate to window edges: top line translateY(30% of H), right translateX(-15% W), bottom translateY(-30% H), left translateX(67.15% W) — same dur/ease (compute px from getBoundingClientRect at build time of tl; simplest: animate using xPercent/yPercent of full-size lines: top yPercent +30·H/1... use px: y: 0.30*H etc).
- at 2.0: wordmark flies toward top-left header zone: to x -40 y -40 alpha 0 dur 0.8 power4.in (it "hands off" to header which slides in at same time — header self-slides at +2.6s).
- at 2.0: h1 lines yPercent→0 dur 1 power4.out stagger 0.1; kicker at 2.0 dur .5; p line(s) 2.2; CTA buttons alpha 0 y 24 → in dur .5 at 2.35 stagger .08.
- at 2.3: info-top rows y→0 dur .5 expo.out stagger .04; at 2.4: info-right rows y→0 stagger .04, bar alpha 1 scaleX→1 dur .5, bar-inner scaleX→0.4.
### Phase B — scroll exit (created after intro completes)
Timeline ST {trigger: section, start:"top 1%", end:"+=100%", scrub:1, defaults:{duration:1, ease:"power2.in"}}:
- mediaClip clip → `inset(35% 20% 35% 72%)` (mobile → `inset(26% 32% 57% 41%)`).
- edge lines: proportional follow + autoAlpha→0.
- info-top cluster: xPercent +40, autoAlpha 0.
- info-right cluster+bar: xPercent -40 yPercent -20 scaleX .6 autoAlpha 0; bar-inner scaleX 0.4→1.
- textRef: y →-120 (gentle parallax out).
### Video autoplay
`video.play()` in useEffect catch-silent; on `canplay` set opacity 1 (initial 0 over waves).

## Acceptance
- Desktop + mobile clip variants via `window.innerWidth < 1024` at timeline build + rebuild on breakpoint cross (matchMedia listener; kill+recreate).
- No SSR crash (all DOM work in useGSAP/useEffect). `npx tsc --noEmit` passes. Export `DlHero`.

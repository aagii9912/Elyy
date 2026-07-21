# BEHAVIORS — exact GSAP timelines (extracted from site JS chunks)

All values verified from the compiled source (chunk 7103 / 2339). Rebuild with project GSAP (`@/lib/gsap`) + SplitText (`gsap/SplitText`). Lenis: lerp 0.12, wheelMultiplier 1 (project SmoothScroll already close — keep project's).

Conventions: `ST` = ScrollTrigger, positions are timeline offsets in seconds-units of the scrubbed timeline.

## 0. Global
- Grain: `@keyframes grainShift { 0% {background-position: 0 0} 100% {background-position: 1000px 1000px} }`, `animation: grainShift 1s steps(10) infinite`, tile `/dl/grain.jpg` (320w image-set, 640w 2x).
- Header show/hide: initial `-translate-y-[150%]`; slides to 0 after intro completes (~0.4s expo.out). On Lenis scroll: direction down & y>~120 → translateY(-150%); up → 0; transition ~500ms ease-quart-out (cubic-bezier(.26,1.04,.54,1)).
- Button hover (primary/CTA): outer `overflow-hidden`; label span `z-2` transition transform+color 300ms expo-out, hover translate-y-[-1px], color→black (or purple-dark on purple section); bg sweep div: `absolute inset-0 origin-center translate-y-[200%] rotate-[15deg] scale-[1.8] rounded-lg bg-white transition-transform duration-1000 ease-expo-out`, hover → translate-y-0 rotate-8. Buttons: duration-1000 hover:duration-100.
- Bracket links (footer): spans `[` `]` around label; on hover brackets translate outward ±4px + label letter-spacing bump (transition 300ms expo-out). (Original uses simple layout; visual: mono text-12 uppercase, gap-10, py-4.)
- ease tokens: `expo-out` = cubic-bezier(0.16,1,0.3,1) (project EASE_LUXE ok), `quart-out` = cubic-bezier(.26,1.04,.54,1).

## 1. HERO — IntroAnimatedMask
Refs: `_` = media clip container, `B` = wordmark wrap, lines = SplitText(wordmark sub copy), `Q` = wordmark row? (kicker cluster), `G` = sun logo cluster, `E[]` = 4 edge lines, `Z` = rive (scrub 0→1 sun draw), `.intro-info-top`, `.intro-info-right(-bar/-bar-inner)`.
Sizes: mediaRelativeSize desktop 511/1440 x 514/900 (the final window), mobile 277/375 x 350/758.
ClipPaths (props): desktop O=[30,15,30,67.15] (top,right,bottom,left %), mobile X=[22.29,28.27,53.83,36]. Scroll-out targets: desktop or=[35,20,35,72], mobile y$=[26,32,57,41]. Full = Lv=[0,0,0,0].

### Intro timeline (plays once on load, NOT scrubbed)
- onStart: lock scroll (lenis.stop()); setTimeout 2000 → unlock + introPlayed=true. onComplete: unlock, introPlayed, enable scroll-timeline.
- t=0 set: media clip `inset(0% 0% 0% 0%)` (fullscreen waves), edge lines x/y 0, media inner scale 1.1, wordmark B x:-100% (desktop), SplitText lines translateX -50, rive progress 0, kicker Q y:-100%, `.intro-info-top` y:100%, `.intro-info-right` yPercent:100, bar scaleX 0 alpha 0, bar-inner scaleX 0.
- t=0: rive scrub 0→1 over 2.5s linear (Elysium: sun/logo draw — use rotating logo mark or SVG stroke draw 0→1).
- t=1: media clip → `inset(30% 15% 30% 67.15%)` (desktop) duration 2 `expo.inOut` (mobile: X, power3.out-ish). Edge lines follow clip (proportional translate).
- t=2: wordmark B x→0% dur 1 power4.out; SplitText lines translateX→0 dur 1 power4.out stagger 0.1.
- t=2.3: `.intro-info-top` y→0% dur 0.5 expo.out stagger 0.04.
- t=2.4: `.intro-info-right` yPercent→0 dur 0.5 expo.out stagger 0.04; bar scaleX→1 alpha→1 dur 0.5 expo.out; bar-inner scaleX 0→(0.4 initial …) — inner rest state 0.4.
- Header slides in around completion.
- Note: h1/p/CTA (textSlot) reveal with the same wordmark/lines phase (lines = h1 `.intro-line` masked lines; kicker `small` + p + CTA fade/slide up ~t=2.2–2.6). Implement: SplitText h1 into masked lines translateX -50→0 (with wordmark motion), kicker & p & CTA y 24→0 alpha 0→1 stagger 0.06 at t≈2.3.

### Scroll timeline (after intro; scrub 1)
ST: trigger hero, start "top 1%", end "+=heroHeight", defaults {duration:1, ease:"power2.in"}:
- media clip: O → or ([35,20,35,72]) power2.in (desktop; mobile ease power3.out).
- edge-line proxy fades (autoAlpha→0).
- kicker cluster Q: xPercent 0→40 (desktop) / mobile +35 & alpha→0 dur 0.4.
- sun/logo G: xPercent 0→40, yPercent 0→-40 (desktop; mobile 30/-40 alpha 0).
- `.intro-info-right, .intro-info-right-bar`: xPercent→-40 yPercent→-20 scaleX→0.6 alpha→0.
- `.intro-info-right-bar-inner`: scaleX 0.4→1 (bar fills as it leaves).
- (h1/text block parallaxes out naturally with section scroll; original moves textSlot via lg:translate-y-[min(8vh,72px)] static offset.)

## 2. USP — UspMotion
SplitText: `.usp-title-N` lines masked (linesClass usp-surtitle-line/usp-title lines); on desktop lines yPercent 0 + overflow visible (visible by default in DOM but driven by master timeline); `.usp-surtitle` = single SplitText across the 3 surtitle spans (3 lines, one per item).

### Desktop master timeline (scrub, trigger ul, start "top 52%", end "bottom 50%")
- padding tween `to({}, {duration:1})` — total length 1.
- `.usp-content-0`: y 150→-50 dur 0.4 @0; alpha 0→1 dur 0.15 power2.out @0.06; alpha→0 dur 0.15 power2.in @0.28.
- `.usp-content-1`: y 50→-150 dur 0.4 @0.3; alpha 0→1 @0.42; →0 @0.57.
- `.usp-content-2`: y -50→-250 dur 0.4 @0.6; alpha 0→1 (power4.out) @0.72.
- surtitle line N reveals yPercent 100→0 dur 0.15 power3.out at same alpha-in times (0.06/0.42/0.72).
- title lines: yPercent 60→0 + alpha dur 0.15/0.2 power3.out stagger 0.012 at 0.06/0.42/0.72.
Content divs are `lg:fixed inset-0` (fixed overlay swap). Parent `lg:[clip-path:border-box]` clips to section.

### Mobile (per-item, once)
- surtitle line: y 100→0 dur 0.4 expo.out @ item top 70%.
- title lines: y 100→0 dur 0.66 expo.out stagger 0.15 @ top 70%.
- media wrapper: clip `inset(20% 0% 20% 0%)`→`inset(0)` dur 1.5 expo.out @ top 60%; media img scale 1.8→1 same trigger; `.usp-line-N-1` y 20→0; `-2` y -20→0.
Desktop media: same clip+scale reveal pattern per item (use once triggers at top 60%).
Media inner also has slow parallax (wrapper child translateY via scroll ratio — subtle, matrix ty ~±60px; implement Parallax distance ~60).

## 3. HOW IT WORKS
### HowItWorksMotion (wrapper)
ST: trigger wrapper, start "top 35%", end "bottom top", scrub:
- `.hiw-bg` (fixed beige overlay z-2 behind panels): alpha 0→1 dur 0.3 (desktop) @0.
- Desktop: each `.hiw-item-N` (N except handled last identically): scale 1→0.9 + alpha 1→0 dur 0.8 sine.in at position N+0.6. Mobile: scale→0.7 at N+0.8 (last: scale only).
Panels are sticky top-0 h-[220lvh] so each pins ~1.2 viewport then next slides over; combined with scale/fade of the covered one.

### HowItWorksIntro (full-bleed)
- Layout: sticky top-0 z-1 h-lvh; media in Parallax (distance 200, scaleToFit, transform ratio→translateY 0→-300px over [-1,1]); content overlay ScrollAnimation translateY 0→-200px over [0,1].
- SplitText masked line reveals (once): `.fb-surtitle` y100→0 dur 0.4 stagger 0.1 power3.out @ trigger "top center"; `.fb-title` dur 0.66 stagger 0.15 @ "top center"; `.fb-text` dur 0.66 stagger 0.15 @ "top 35%".

### Step1Motion (phone)
Container right half; phone `.step-container` lg:span-w-5 aspect-[175/380] rounded-2xl overflow-hidden.
Init: `.step-logo` scale 3.1; phone container clip `inset(37.5% 16.29% 31% 16.29% round 1rem)`.
Desktop ST: trigger container, start "top 50%", end "+=1.4*vh", scrub:
- clip → `inset(0% 0% 0% 0% round 1rem)` dur 2 expo.inOut @0.
- `.step-logo` y 4.26rem→0, scale 3.1→1 dur 2 expo.inOut @0.
- `.step-title` SplitText lines (mask): alpha 0 y100 → 1/0 dur 1 power4.out stagger 0.2 @0.8.
- `.step-top` chip: alpha 0 y50 → in dur 0.8 power4.out @1.
- `.step-bottom` toggle: same @1.1.
- `.step-bottom-rect` (white slider rect): xPercent 0→109 dur 0.5 expo.inOut @1.35.
- `.step-bottom-left` color #111→#fff dur 0.1 @1.45; `.step-bottom-right` #fff→#111 dur 0.1 @1.5.
Mobile: start "top 70%", clip from `inset(34.5% 12.29% 28% 12.29% round 1rem)`, power4.out, logo y 40px, stagger 0.2 @0.6, chips @0.8/1, rect @1.3 power4.inOut, colors @1.4/1.5.

### Step2 media
ST trigger, start "top 25%" (desktop)/"top 70%", end "+=1.4*vh", scrub: rive progress 0→1.5 (Elysium: image scale 1.15→1 + slight y, or slow video). Panel lg:span-w-12 absolute right, h-[calc(100lvh-2*var(--margin))], margin-top/right-1.

### Step3Chart
Card: aspect-[460/360] rounded-xl border border-brown/15 bg-beige p-20 lg:p-24; header tabs "Energy"(brown)/"Earnings"(brown/35) text-16/18 medium; counter serif 44px/40px + unit label 13/15 brown/55; svg viewBox 700x320 preserveAspectRatio none, paths stroke #F66F00 width 3 round caps, vectorEffect non-scaling-stroke; day row grid-cols-7 mono text-10 lg:12 uppercase (idx 3 brown/70 else brown/40).
Energy curve pts (x,y frac of 700x320): [.04,.58],[.2,.78],[.35,.65],[.5,.55],[.65,.4],[.8,.22],[.96,.12]; secondary [.5,.55],[.65,.32],[.8,.18],[.96,.5]; smooth cubic C with midpoints (ctrl = x±0.5Δx).
ST: trigger comp, start "top 25%"/70%, end "+=1.4*vh", scrub: clip rect width 0→700 dur 1 linear @0; counter value 0→9.5 & percent 0→12.3 linear @0 (textContent toFixed(1)); marker line (x=350, rgba(76,40,6,.35) w1) alpha 0→1 dur 0.25 @0.45; secondary path alpha 0→0.3 dur 0.35 @0.55. Elysium: value 0→85 suffix "%", label "ногоон орчин"; percent → "+12.3%".

## 4. WHY — WhyDaylight
- Panel 1 `.js-video`: scale 0.8→1, ST trigger item, end "center center", scrub, ease none.
- Titles (desktop only; set visibility visible then animate): layout "center": SplitText lines fromTo yPercent 150, alpha 0 → 0/1 dur 1.6 expo.out stagger 0.1 @ ST "top center" (once). layout "left": pre-split `.js-line` spans; xPercent line0 -15, line1 +15, line2 -15 → 0, alpha, same dur/ease/stagger.
- Media: Parallax distance 0.75 (viewportRatio) wrapper; overlay bg-black opacity 30-50%.
- Panels h-(--screen-height-max); content widths: left→lg:span-w-22, center→lg:span-w-18-wide; title sizes: first lg:text-85, others lg:text-70, center-mobile text-40; left: lines block text-20 lg:text-45 medium, align L/R/C; surtitle mono text-12 uppercase center/left.
- CTA below (pt-36 pb-60 center), primary + white sweep hover.

## 5. NETWORK — NetworkMotion
- `.nw-text` (small/h2/p): SplitText lines mask; fromTo y100→0 dur 0.8 power4.out stagger 0.1, ST per-element "top 90%" (once).
- Canvas anim: scrub value 0→1.3, ST trigger section "top center", scrub true, mapped via power3.out tween onUpdate (i.e. eased progress). Elysium canvas: masterplan dot-network — nodes appear + connect as progress grows (draw threshold = progress). Size lg:span-w-14 mx-auto, h-300 mobile, lg:h-[max(37.5rem,50vw)].

## 6. DIPTYCH — DiptychAnimatedMask
- Text reveals (E=title lines, _=logo/subtitle/cta blocks): masked spans yPercent 100→0 dur 0.8 power4.out stagger 0.1; triggers: title @ "top 75%" (desktop "top 20%" for blocks / mobile center), body text SplitText same @ top 15%/center; once.
- Mask timeline: ST trigger section, start "top 75%", end "bottom 25%", scrub 0.5. Desktop keyframes (inset % [T,R,B,L]) from ft[0]=[7.5,9.57,65.8,42.67] → ft[1]=[31.6,29.15,39.3,15.36] @+1 → ft[2]=[52.5,16.33,10.7,46.9] @+2, each dur 1 sine.inOut. Mobile Ln: [8.42,10.6,72.2,41.3]→[37.68,29.6,40.42,17.6]→[54.52,24.26,9.86,46.4]→back to [8.42,10.6,72.2,41.3].
- Edge lines: 4 abs divs (top/right/bottom/left, bg-white/30, 1px) translating: top→translateY(top%·h), right→translateX(-right%·w), bottom→translateY(-bottom%·h), left→translateX(left%·w) — follow mask + mouse.
- Mouse parallax (desktop): on mousemove over media half: dx=(relX-0.5)*50, dy=(relY-0.5)*50; lerp 0.1 per frame; clip = inset(top+dyP% right-dxP% bottom-dyP% left+dxP%); lines add ±dx/dy px.
- Media: sticky top-0 h-475 (mobile) lg:h-lvh; Parallax distance 200.
- Left column: pt-65 pb-60 justify-between; title text-40 lg:text-120 leading-[1.22] serif purple-dark; grid 2-col bottom: logo (30x15) + subtitle mono-12 mb-24 + text text-20 medium + CTA.

## 7. FOOTER
- Video bg full-bleed + content overlay grid-container; reveal: rows fade/slide up on enter (y 40→0, alpha, expo.out, stagger 0.08, trigger footer top 70%).
- `hideFooter` state exists in original (footer hidden while modal open) — skip.
- Bottom bar mono text-12 uppercase; social links p-5.

## Responsive
- Breakpoints: lg=1024px is THE main switch (mobile layout below). 768 minor. Root font-size fluid: mobile min(4.26667vw, 20.267px); ≥768: 2.08333vw; ≥1024: min(1.11111vw, 18.667px) — SCOPE THIS to .dl wrapper as `--dl-rem` var, and express all `text-N`/spacing utilities in px·(var scale) (see DESIGN_TOKENS).
- Grid vars on .dl: mobile --margin 4.26667vw --gutter 2.66667vw --column 5.17778vw; ≥768 2.60417/1.30208/6.70573vw; ≥1024 1.38889/1.38889/2.71991vw (24 cols).

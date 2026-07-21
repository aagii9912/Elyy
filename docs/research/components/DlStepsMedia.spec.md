# DlStepsMedia — DlStep1Phone · DlStep2Media · DlStep3Chart

Target: `src/components/daylight/DlStepsMedia.tsx` (client, one file, three named exports). Consumed by `DlHow.tsx` inside sticky step panels (it provides positioning wrappers; you render the media artifacts themselves).

## Imports
`useLang`; `DL_DICT[lang].how.phone|chart`, `DL_MEDIA.step1Image|step2Image`, logo; `gsap, ScrollTrigger, useGSAP` from `./shared`. Arbitrary px Tailwind only; dl-text-N/dl-mono/dl-serif; vars --dl-*.

## 1) DlStep1Phone — phone mockup that un-clips from a pill
Root `ref=rootRef` class `relative z-[1] flex h-full w-full items-center justify-center max-lg:pb-[32px]` aria-hidden.
Phone container `ref=phoneRef`: `relative aspect-[175/380] h-auto max-h-[80lvh] w-[min(48vw,calc(5*var(--column)+4*var(--gutter)))] max-lg:w-[220px] overflow-hidden rounded-[12px] lg:rounded-[16px]` — initial clipPath `inset(37.5% 16.29% 31% 16.29% round 1rem)`.
Inside:
- bg `<img src={DL_MEDIA.step1Image} class="absolute inset-0 h-full w-full object-cover"/>` + gradient overlay `bg-gradient-to-b from-black/50 via-black/10 to-black/60`.
- center col `flex h-full flex-col items-center justify-center gap-[30px] text-center text-white`:
  - `.dl-step-logo` img (DL_MEDIA.logo) `w-[64px] lg:w-[96px]` (initial scale 3.1 via gsap.set).
  - `.dl-step-title` h4: phone.title dl-text-20 font-medium — masked single line.
- `.dl-step-top` chip: absolute top-[14px] left-1/2 -translate-x-1/2 rounded-full bg-white/15 backdrop-blur px-[12px] py-[5px] dl-mono text-[9px] — phone.chipTop.
- `.dl-step-bottom` toggle: absolute bottom-[16px] left-1/2 -translate-x-1/2 w-[78%] rounded-full bg-white/12 backdrop-blur p-[4px] grid grid-cols-2 text-[10px] dl-mono; children: `.dl-step-bottom-rect` abs slider `left-[4px] top-[4px] bottom-[4px] w-[calc(50%-4px)] rounded-full bg-white` (z-0); two labels z-[1] py-[6px]: `.dl-step-bottom-left` (color #111 initial — sits over white rect), `.dl-step-bottom-right` (color #fff).
### Timeline
gsap.matchMedia: desktop ST {trigger rootRef, start "top 50%", end "+=140%", scrub:true}; mobile start "top 70%":
- phoneRef clip → `inset(0% 0% 0% 0% round 1rem)` dur 2 expo.inOut (mobile from `inset(34.5% 12.29% 28% 12.29% round 1rem)`, power4.out).
- `.dl-step-logo` y "4.26rem"→0 scale 3.1→1 dur 2 expo.inOut (mobile y 40).
- `.dl-step-title` line: alpha 0 y100% → in dur 1 power4.out @0.8.
- `.dl-step-top`: alpha 0 y50% → in dur 0.8 power4.out @1.
- `.dl-step-bottom`: same @1.1.
- `.dl-step-bottom-rect`: xPercent 0→109 dur 0.5 expo.inOut @1.35.
- `.dl-step-bottom-left` color #111→#fff dur 0.1 @1.45; `.dl-step-bottom-right` #fff→#111 @1.5.

## 2) DlStep2Media — media card with slow zoom
Root: `relative z-[1] flex w-full items-center justify-center overflow-clip max-lg:h-full lg:absolute lg:top-[var(--margin)] lg:right-[var(--margin)] lg:h-[calc(100lvh-2*var(--margin))] lg:w-[calc(12*var(--column)+11*var(--gutter))]`.
Child card `rounded-[16px] overflow-hidden h-[70%] w-full max-lg:h-[260px]`: img step2Image cover `ref=imgRef` + subtle inner shadow.
Timeline: ST {trigger root, start "top 25%" (mobile 70%), end "+=140%", scrub}: imgRef scale 1.25→1 ease none + y 30→-30.

## 3) DlStep3Chart — animated energy-style chart (Elysium data)
Content: chart = {tabA, tabB, value:85, valueSuffix:"%", valueLabel, percent:12.3, days[7]}.
Root `ref=rootRef`: `relative z-[1] flex h-full w-full flex-1 flex-col items-stretch justify-end gap-[12px] px-[24px] pb-[32px] lg:absolute lg:left-1/2 lg:h-[calc(100lvh-2*var(--margin))] lg:w-1/2 lg:items-center lg:justify-center lg:px-0 lg:pb-0`.
Inner `flex w-full flex-col gap-[12px] lg:max-w-[460px] lg:gap-[16px]`:
- tabs row `flex items-center gap-[20px] px-[4px]`: span tabA `font-medium dl-text-16 lg:dl-text-18 text-[var(--dl-brown)]`; span tabB same but `text-[rgba(76,40,6,0.35)]`.
- card `relative flex aspect-[460/360] flex-col rounded-[12px] border border-[rgba(76,40,6,0.15)] bg-[var(--dl-beige)] p-[20px] lg:p-[24px]`:
  - header: `<span ref=numRef class="dl-serif text-[44px] lg:text-[40px] leading-none text-[var(--dl-brown)]">0</span><span class="dl-text-13 lg:dl-text-15 font-medium text-[rgba(76,40,6,0.55)] ml-[8px]">{valueLabel}</span>` (baseline row).
  - chart `relative mt-[16px] flex-1 lg:mt-[24px]`: svg viewBox "0 0 700 320" preserveAspectRatio "none" class block h-full w-full overflow-visible:
    - defs clipPath#dl-ch-reveal rect ref=clipRef x0 y0 width 0 height 320.
    - path A (main): pts [[.04,.58],[.2,.78],[.35,.65],[.5,.55],[.65,.4],[.8,.22],[.96,.12]] × (700,320); build smooth cubic: for each segment ctrl1=(x₀+Δx/2, y₀), ctrl2=(x₁−Δx/2, y₁); stroke #F66F00, width 3, round caps/joins, fill none, vectorEffect non-scaling-stroke, clip-path url(#dl-ch-reveal).
    - path B (secondary, ref=pathBRef opacity 0): pts [[.5,.55],[.65,.32],[.8,.18],[.96,.5]] same style.
    - vertical line ref=lineRef x=350 y 0→320 stroke rgba(76,40,6,.35) w1 opacity 0.
  - days row `mt-[12px] grid grid-cols-7 text-center lg:mt-[16px]`: spans dl-mono text-[10px] lg:text-[12px], idx===3 ? text-[rgba(76,40,6,0.7)] : text-[rgba(76,40,6,0.4)].
### Timeline
ST {trigger rootRef, start "top 25%" (mobile "top 70%"), end "+=140%", scrub}: clipRef width 0→700 dur 1 ease none @0; counter obj {v:0,p:0} → v:85 p:12.3 dur 1 ease none onUpdate numRef.textContent = Math.round(v) + "%"; (store percent for aria); lineRef alpha→1 dur .25 @0.45; pathBRef alpha→0.3 dur .35 @0.55.

## Acceptance
All three export named; no default; tsc passes; no imports from DlHow (one-way dependency).

# Elyse Residence (Webflow) — Stats + About (reference for FinalStats/FinalAbout)

Source: https://elyse-residence-dev.webflow.io/ · extracted live via getComputedStyle @1440px, 2026-07-02

## Interaction model
Webflow scroll interactions (data-w-id), staggered reveals. Dark near-black sections with white type.

## Computed styles (exact)

### Stat numerals ("60", "30", "150k")
- fontFamily: "Fragment Serif" · fontSize: **135px** · fontWeight: **300** (light, elegant serif)
- lineHeight: 166px (1.23) · color: #fff
- Suffix ("%", "sq. ft.") rendered smaller beside the numeral (sibling in flex row, gap 3px)
- Captions: "Inter 28 Pt" 15px / 300 / letterSpacing 0.6px / lineHeight 18.75px / #fff
- Composition: staggered — one numeral bottom-left huge, two others offset up-right (not a uniform 3-col grid)

### About display headline ("TIMELESS DESIGN WELLNESS-")
- fontFamily: "Fragment Glare" · fontStyle: **italic** · fontSize: 57px · fontWeight: 300
- textTransform: uppercase · letterSpacing: -1.71px (-3%) · lineHeight: 67px (1.18)
- Each WORD is its own element (staggered word-by-word reveal)
- Section label "(ABOUT)" ~21px italic serif; body paragraphs Inter 15px/300/0.6px, narrow column right of center image

### Giant footer wordmark "Elyse"
- 324px "Fragment Serif" 300 uppercase — split into per-LETTER spans (staggered letter reveal)

## Adaptation → FinalStats/FinalAbout
- Scale is the lesson: numerals ~135px at 1440 (≈ clamp(6rem,9.4vw,8.5rem)), captions tiny (15px) — extreme contrast.
- Reference numerals are LIGHT SERIF; client explicitly asked BOLD ("Тоонууд bold байх уу?") → keep Gilroy bold per client, but adopt the 135px scale, suffix-beside-numeral pattern, staggered baseline offsets, tiny tracked captions.
- About: word-by-word masked reveal on the display headline; uppercase display with slight negative tracking; body in a narrow measure (~300px) beside imagery.
- Our giant footer wordmark (ELYSIUM) may adopt per-letter stagger reveal.

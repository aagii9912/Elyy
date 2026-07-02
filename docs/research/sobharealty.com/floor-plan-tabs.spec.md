# Sobha One — Floor-plan tabs + carousel (reference for FinalApartments/ApartmentsCarousel)

Source: https://sobharealty.com/properties-in-dubai/sobha-one · extracted live @1440px, 2026-07-02

## Interaction model
**Click-driven tabs + horizontal Swiper.** Tab row ("1 BR / 2 BR / 3 BR / 4 BR") is itself a Swiper of `.category-button`s. Clicking a category shows its `.tab-content` (display switch) which contains a horizontal `.swiper.floor-plan` sliding between unit types (Type A/B/C…) with side chevrons.

## Computed styles (exact)

### Tabs
- fontSize: 16px · fontWeight: 300 · letterSpacing: 2.88px (18%) · uppercase
- Active: color #000 + borderBottom 1px solid #000
- Idle: color rgb(167,167,167), transparent underline
- Generous gap between tabs; thin full-width hairline under the whole tab row

### Unit title ("1 Bedroom Apartment (Type A)")
- fontFamily: "Chronicle Display XLight" (elegant light serif) · fontSize: 34px · fontWeight: 300
- lineHeight: 41px · color: rgb(199,163,134) (soft tan/gold)

### Spec list (left column)
- Rows: "UNIT : 1 BEDROOM + 1 POWDER ROOM + 1 BALCONY", "SUITE : 674.79 SQ.FT", "BALCONY : 57.48 SQ.FT.", "TOTAL : 732.27 SQ.FT"
- Label+value one line, label uppercase · fontSize 14px · fontWeight 300 · letterSpacing 2px · #000 · marginBottom 20px
- White section background, huge whitespace around content

### Plan image
- ~581×367 rendered, right of the spec column, plain white bg (no card/frame)
- Side chevrons (thin, light) vertically centered at the section's left/right edges

## Adaptation → ApartmentsCarousel
- Keep our 4 tabs (1–4 өрөө + м² beneath); adopt active/idle treatment: black/ink + 1px underline vs 60%-grey, tracking ~0.18em, weight 300–400.
- Unit title in our font-display (moss/gold accent), ~34px, light.
- Spec rows as single-line "ӨРӨӨ : 2 унтлага + 1 угаалгын" style — 14px, 0.14em tracking, 20px row gap (no boxed cards).
- Plain light background, image floated right ~580px, thin chevrons at edges.
- Slide transition: horizontal Swiper slide (speed ~650ms) — already matches; keep drag.

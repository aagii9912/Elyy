# FIND Real Estate — Buy/Sell/Rent rows (reference for FinalElys)

Source: https://findrealestate.com/ · extracted live @1440px, 2026-07-02 · Lenis active, no GSAP

## Interaction model
**Hover-driven photo wipe per row.** Each row is a `<button class="services_item">` (full-bleed, stacked, separated by 1px solid rgb(56,58,58)). Absolutely-positioned photo layer per row (`services_item-bg`):
- **Idle:** clip-path: inset(100% 0 0) · opacity: 0
- **Hover:** clip-path: inset(0) · opacity: **0.4** (photo dimmed under dark section)
- **Transition:** `opacity 0.4s, clip-path 1s cubic-bezier(0.16, 1, 0.3, 1), transform 4s cubic-bezier(0.5, 1, 0.89, 1)` (wipe rises fast-then-soft; transform gives slow 4s drift/zoom)
- Word also gains an underline on hover.

## Computed styles (exact)

### Section
- backgroundColor: rgb(21,23,23) · padding: 112.5px 0

### Row (button.services_item)
- height: 300px · display grid/flex: [badge+para left] [huge word center] [arrow right], space-between
- overflow: hidden · position: relative · width: 100%

### Layout inside row (from 1440 screenshot)
- Number badge: 35px circle, border 1px solid #fff, borderRadius 50%, numeral 12px #fff — top-left of the text column
- Paragraph (h3): fontSize 18px · lineHeight 27px · fontWeight 500 · #fff · column ~280px wide, left-aligned at container edge
- Huge word ("Buy"/"Sell"/"Rent"): "Instrument Sans" · fontSize **180px** · fontWeight 400 · lineHeight 171px (0.95) · letterSpacing **-9px (-5%)** · #fff · sentence-case (not uppercase) · horizontally centered
- Arrow: ~140×140px thin-stroke → glyph at right edge (present on hovered/active row)

## Adaptation → FinalElys
- 4 rows (Ergonomic Standards / Live in Harmony / Your Safety / Save Big), each `min-h` ~300px (клamp), 1px hairline separators on near-black (#151717-equivalent: our charcoal token).
- Per-row photo layer using existing exterior/amenity images: idle clip inset(100% 0 0) + op 0 → hover clip inset(0) + op ~0.35-0.4, transition exactly `opacity .4s, clip-path 1s cubic-bezier(.16,1,.3,1)`, image `scale(1.06)` idle → `scale(1)` over 4s cubic-bezier(.5,1,.89,1).
- Badge circle 35px/1px border/12px numeral; Mongolian body 18px/27px fw500 max-w ~300px; keyword 180px→clamp(5rem,12.5vw,11.25rem) weight 400 tracking -0.05em; arrow accent right.
- On touch devices (no hover): reveal active row's photo when row is in viewport center (IntersectionObserver) or on tap.

# Sobha About — Timeline accordion-slider (reference for ProjectsCarousel)

Source: https://sobharealty.com/about · extracted live @1440px, 2026-07-02

## Interaction model
**Click-to-expand accordion + drag.** 7 absolutely-positioned panels in `.as-panels.as-grab` (custom grab cursor → draggable strip). Each panel has two layers: `.as-layer.as-closed.as-white.as-vertical` (collapsed: white column, year label) and an open layer (full photo + text). Clicking a collapsed panel expands it in place; the previously open one collapses. Panels carry `as-shadow` (soft drop shadow).

## Computed styles (exact)
- Panel (expanded): ~707 × 432 px, position absolute, overflow visible, box shadow soft
- Collapsed column: narrow (~90–110px from screenshot), white bg, year centered, rendered dim/greyed when inactive
- Year (collapsed + expanded label): "Chronicle Display" serif · 36px · 400 · #000 (collapsed) / #fff over photo (expanded)
- Expanded body text: "Ringside" · 16px · 300 · #fff over darkened photo; year + em-dash + italic serif subtitle ("Royal Approval") above the paragraph
- Expanded panel = full-bleed photo with dark gradient under text (photo visibly darkened bottom-left)
- Transition: "all" on panels (width/position morph, ~0.5–0.8s feel)

## Adaptation → ProjectsCarousel (Монкон 4 төсөл)
- Keep our one-by-one filmstrip; adopt exact proportions: expanded panel ≈ 16:10 (707×432 → aspect-[16/10]), collapsed columns ~96px wide showing the years (2014–2019 г.м.) vertically-centered serif.
- Collapsed columns: light bone bg + ink year, dimmed (opacity ~0.55); expanded: photo + gradient + white text block bottom-left with year → title → давхар/айл meta.
- Soft drop shadow on the active panel; grab cursor + drag advance (we already have swipe on mobile).
- Morph transition on flex-grow/width ~0.7s with expo-out ease (matches "all" morph feel).

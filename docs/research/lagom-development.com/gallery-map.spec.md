# Lagom — Gallery ("Простір, що надихає") + Infrastructure map (reference for FinalGallery + FinalMap)

Sources: https://lagom-development.com/lagom/ (+ /unique/ same patterns) · extracted live @1440px, 2026-07-02
Note: site hides content behind a preloader + custom smooth-wrapper; Swiper params unreadable at runtime, structure + typography extracted from DOM/CSS; sizes cross-checked with the earlier live measurement (slides ≈ 1026×684, 3:2) and the client's screenshots.

## Gallery — section.media
- Interaction model: **click/drag Swiper with tabs** — NOT an auto-marquee. 3 category tabs (`label.tab.mulish-24`, 18px cream text, active underlined), one `.slider` per tab (display-switched), each `.swiper > .swiper-wrapper > .swiper-slide` (4 slides per category).
- Slides: big landscape photos ≈3:2 (~1026×684 at 1440 → ~70vw), one dominant image with a **peek** of the next (slidesPerView ~1.3), generous gap.
- Navigation: `.slider-navigation` = swiper-pagination (bullets) + prev/next as **text CTAs with arrow icons** ("Назад" / "Вперед" → Монголоор "Өмнөх" / "Дараах"), Inter 16 semibold.
- Section on dark/immersive band: H2 `mulish-64-light` → 48px / 300 / cream rgb(242,239,233).
- Ease feel: long soft ease-out slides (site uses ~0.8–1s transitions).

## Infrastructure map — section.infrastructure
- Structure: `container-index` (small index label) → `container-content` (H2 `mulish-80` — big display) → `container-map` (**Mapbox** interactive, full-width, ~800px tall) → `container-slider` (Swiper row of landmark cards).
- Landmark cards: one photo card + N "time" cards. Time card = big minute numeral + small unit caption ("хв пішки/машиною" → "мин явган/машинаар") + place name at bottom; беige/stone card bg, square corners, generous padding (visual: numeral ~64px, caption 14-16px beside it, name 18-20px bottom-left; card ≈ 360×220).
- Cards row slides horizontally (Swiper, draggable) under the map; map has orange markers + route line.

## Adaptation
- **FinalGallery:** big-landscape peek carousel (perView ~1.25–1.35 desktop / 1.1 mobile), drag + arrows + bullets/fraction, slide speed ~800–1000ms soft ease-out. Keep our slow auto-drift only if it pauses on hover/interaction and reduced-motion disables it (client asked "хажуу тийшээ гүйдэг" — sideways sliding is the point). Keep "Интерьер зураг — удахгүй" badges.
- **FinalMap:** big display heading, map band ~70-80vh, then a horizontal draggable card row UNDER the map (not overlaid): stone/bone cards with big minute numerals + "мин машинаар" + place name, first card = photo card. Keep Google iframe (Mapbox needs token) + "client to confirm" placeholder note.

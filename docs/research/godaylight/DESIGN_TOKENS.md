# DESIGN TOKENS — /daylight (from godaylight.com computed CSS)

## Colors (exact)
| token | hex | usage |
|---|---|---|
| beige | #FFF7E9 | page bg, light text on dark |
| beige-dark | #DACAB6 | hairline borders / grid lines |
| black | #111111 | primary ink, dark panels |
| grey-txt | #514E4A | muted labels |
| orange | #F66F00 | brand accent, chart stroke, CTA gradient base |
| brown | #4C2806 | chart text on beige |
| purple | #C8B2FF | diptych section bg |
| purple-dark | #321F61 | diptych text |
| white | #FFFFFF | header pill, hover sweeps |
Alpha variants used: beige/40, brown/15 /35 /40 /55 /70, white/20 /30, black/10 /20.

## Fonts (Elysium substitutions)
- sans: Gilroy (var --font-gilroy) ← aeonikPro. Weights 400/500.
- mono: JetBrains Mono (new, subsets latin+cyrillic, 400) ← socialMono. Always uppercase small labels, tracking -0.02em→0.
- serif: Lora (add cyrillic subset, 400/500) ← featureDeck. Display headings, normal-case, tight leading.

## Fluid scale (CRITICAL — scope to .dl, do NOT touch root)
Original sets html font-size fluid; we scope with a multiplier var:
```
.dl { --dlu: min(4.26667vw, 20.267px); }                 /* mobile: 1rem-equivalent */
@media (min-width:768px){ .dl { --dlu: 2.08333vw; } }
@media (min-width:1024px){ .dl { --dlu: min(1.11111vw, 18.667px); } }
```
Type utility formula (original `.text-N{font-size:max(Npx, N/16 rem)}`):
`--dl-text-N: max(Npx, calc(N/16 * var(--dlu)))`.
Sizes used: 8,9,10,11,12,13,14,15,16,18,20,22,28,35,40,45,50,55,70,85,120.
Line-heights: text-12→1.5, text-14→1.4, text-20/35/55/85→1.16, text-28→0.95, big display (40/85/120 headings often leading-[0.95]–[1.22] per class). Letter-spacing -0.02em on most.

## Grid (24-col fluid, scope to .dl)
```
.dl{ --margin:4.26667vw; --gutter:2.66667vw; --column:5.17778vw; }
@media(min-width:768px){ .dl{ --margin:2.60417vw; --gutter:1.30208vw; --column:6.70573vw; } }
@media(min-width:1024px){ .dl{ --margin:1.38889vw; --gutter:1.38889vw; --column:2.71991vw; } }
```
Helpers: `.dl-span-N { width: calc(N*var(--column) + (N-1)*var(--gutter)) }` for N∈{1,4,5,6,8,10,11,12,14,15,16,18,22}; `-wide` variants add gutters: width + 2*gutter (approx; used for pl offsets). `.dl-container { padding-inline: var(--margin) }` (= margin-px-1). `--nav-height: 5rem→(80px); --header-height: 94px`.

## Radii / misc
- rounded-sm 4px (buttons), rounded-lg 8px (header pill, hover sweep), rounded-xl 12px (chart card, phone mobile), rounded-2xl 16px (phone desktop).
- Header pill: p 6px (16px left), gap 28px, h 57px. CTA in pill: h 45px, px-24, radius 4, text 15 medium white.
- Buttons: h-50 px-24 radius 4 text-12(→14px actual) medium; primary bg-#111 text-white; secondary bg-beige text-black.
- Easings: expo-out cubic-bezier(0.16,1,0.3,1); quart-out cubic-bezier(.26,1.04,.54,1); durations: base 1000ms, hover-in 100ms, color 300ms.
- Scrollbar: width ~4px, thumb black/35 rounded, track transparent (webkit + firefox thin).
- Grain: /dl/grain.jpg tile, steps(10) 1s loop, size ~200px, opacity ~.55, z-index max, pointer-events none, fixed.

## Assets (Elysium replacements)
- Hero window video: /video/hero-source.mp4 (poster /images/hero-sunset.png)
- Waves texture (preloader/button/hero fallback): DlWaves canvas (orange #F66F00→#FF8A3D layered bands + grain)
- USP: /images/exterior-lowangle-towers.jpg, /images/exterior-snow-courtyard.jpg, /images/aerial-courtyard-promenade.jpg
- HowIntro bg: /images/hero-towers-bluesky.png (overlay 30%)
- Step1 phone bg: /images/amenity-pool-deck.jpg (portrait crop) + HTML UI overlay
- Step2 media: /images/exterior-towers-winter.jpg
- Why bgs: /images/aerial-park-playground.jpg, /images/exterior-path-moody.jpg, /images/amenity-canal-golden.jpg
- Network base: canvas (dots) — colors black on beige, orange accents
- Diptych media: /images/exterior-dusk-pastel.png (portrait)
- Footer bg: /video/hero-source.mp4 (reuse) + black/40 overlay
- Logo: /brand/elysium-logo.svg (+ text wordmark "Elysium" in Gilroy 600)

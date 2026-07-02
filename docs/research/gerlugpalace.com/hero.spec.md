# Gerlug Palace — Hero (reference for FinalHero/FinalHeader)

Source: https://gerlugpalace.com/ · extracted live via getComputedStyle @1440px, 2026-07-02

## Interaction model
Static hero over full-bleed **image** background (no video). **Lenis smooth scroll** active (`.lenis`). No GSAP. Transparent header sits over hero (dark toggle pill top-left, logo center, 2 text links right).

## Computed styles (exact)

### H1 "PREMIER LIVING" (`._heroSlogan_… .slogan`)
- fontFamily: "Grato Grotesk", Helvetica, … (rounded grotesk → our Gilroy is the correct analog)
- fontSize: 64px · fontWeight: 500 · lineHeight: 70.4px (1.1) · letterSpacing: -0.2px
- textTransform: uppercase · color: #fff
- Position: centered horizontally, sits at ~50% viewport height; buttons pinned near bottom (~735px of 822px viewport)

### Primary pill button ("Өрөөний төлөвлөлт")
- padding: 16px 24px · borderRadius: 50px
- backgroundColor: #fff · color: rgb(150,127,93) (muted gold)
- fontSize: 14px · fontWeight: 500 · letterSpacing: -0.2px · textTransform: uppercase
- transition: 0.3s

### Secondary pill button ("VR - Coming soon") — glassmorphism
- backgroundColor: rgba(255,255,255,0.6) · border: 1px solid rgba(255,255,255,0.4)
- backdropFilter: blur(16px) saturate(1.9) brightness(1.08) · color: #fff
- same padding/radius/type as primary

### Composition notes (from 1440×822 screenshot)
- Header: transparent over hero; nav links 14px-ish uppercase white, generous outer margins (~56px)
- H1 alone in the middle — no subtitle, no tagline visible in first viewport
- Two pill buttons side-by-side, horizontally centered, ~90% down the viewport
- Building image anchored right edge, sky occupies the rest

## Adaptation → FinalHero
- Keep our brandLine as the single dominant element; tag line may move to a smaller treatment or near the buttons.
- Adopt: weight 500 (not 900) display, uppercase, tight 1.1 leading, -0.2px tracking; pill radius 50px, 16/24 padding, 14px uppercase labels.
- Secondary CTA gets the glass treatment (white/60 + blur(16px)); primary = solid bone with brand-color text.
- Buttons anchored low in the viewport, centered — not directly under the title.

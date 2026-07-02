# FIND — feature/advantages layout (reference for FinalElys "ELYS 4 давуу тал")

Source: https://findrealestate.com/  ("Support Beyond Buying and Selling", "How FIND Can Help You")

## Aesthetic
- Dark bg (our charcoal ✓). Editorial, **card-less** — no borders/boxes.
- Giant two-tone section heading: active part white, trailing part grey. 64.8px, weight 500, letterSpacing **-2.6px** (very tight).
- Multi-column grid (3-up) of items. Each item:
  - Big heading: **39.6px, weight 500, Instrument-Sans-like, letterSpacing -0.79px, tight leading (1.15)**
  - generous vertical space
  - a "Learn More →" pill (thin outline) at the bottom
- Subheadline is two-tone (white lead + grey remainder) with a pill CTA.

## Interaction model
- Scroll word-reveal on big headings (grey→black wipe).
- Hover on pills: subtle.

## Application to FinalElys (4 items: Ergonomic / Harmony / Safety / Save Big)
- Move toward FIND editorial columns: big tight-tracked headings, minimal chrome.
- Keep charcoal bg (client confirmed). Keep Gilroy (tight negative tracking on headings).
- Current impl = 2x2 icon cards (client's earlier pick). Refine: lighten card chrome, enlarge headings, tighten tracking to match FIND. Keep icons subtle OR drop borders for a more FIND-faithful column look. 2x2 grid fits 4 items well.

# Elyse Residence — Stats + About (reference for FinalStats + FinalAbout)

Source: https://elyse-residence-dev.webflow.io/

## Interaction model
- Stats: scroll-driven **count-up** animation (numbers tick from 0 → target as the block enters view). Caught mid-count 23%→28%.
- About: fade/rise reveal on scroll.

## Stat numbers (exact computed)
- fontSize: **162px** (huge), fontWeight: **300 (light/thin — NOT bold)**, serif (Fragment Serif), white, lineHeight ~1.23
- `%` / suffix rendered small, superscript-ish next to the number
- 2-line label beneath, small, light, low-contrast grey
- Dark charcoal background section; numbers are faint (low contrast) — quiet luxury, not loud

## About (exact computed)
- Headline: **68px, weight 300, UPPERCASE**, tall lineHeight (~1.18), serif display
- Body: 18px, weight 300, lineHeight 1.25, calm
- Two-column: headline left, body right; large negative space

## Application to Elysium /final (keep Gilroy, adopt layout+motion)
- Keep count-up motion (already have Counter).
- **Decision needed:** reference numbers are THIN (300). Our /final currently uses extrabold (800). Offer client: thin airy numbers (match reference) vs. current bold.
- Adopt uppercase, airy, generous whitespace for stat labels + about headline.
- Keep our brand green/charcoal palette.

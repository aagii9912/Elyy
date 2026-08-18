# ELYSIUM — Design System

Extracted from the shipped code, not aspirational. Every rule below is checkable by
looking at rendered output or by grepping the source. Written for the **System critic**
of `/design-loop`: if a piece violates a `MUST` here, it fails, regardless of how good
it looks.

**Scope: the mono experience at `/`** — the live marketing site
([src/app/page.tsx](src/app/page.tsx), [src/components/mono/](src/components/mono/)).
Tokens live in [src/app/globals.css](src/app/globals.css).

Other routes carry their own deliberately different systems and are **out of scope**
for this document: `/daylight` (`.dl` scope, beige/orange, 24-col fluid grid),
`/arcsphere` (`acs-*`, cream/brown clone), `/v2` + `/find` (FIND/LAGOM aesthetics),
`/final` (Gilroy + gold kicker), `/admin` (tool UI, opts out of cursor & progress bar).
Never mix a token from those scopes into `/`.

---

## 1. The one-ground rule

The page used to alternate `bg-white` / `bg-paper` / `bg-night` band by band. That read
as uneven and far too dark. It was replaced by a single canvas.

- **MUST** every content section sit on `bg-ground` (`#f4f4f1`). One ground, whole page.
- **MUST** separation come from **hairlines + raised white surfaces**, never from
  alternating band backgrounds.
- Dark blocks (`bg-night`) are reserved for the **cinematic scroll chapters** and the
  hero/footer. Currently exactly one dark story chapter (`MonoStats`, chapter 01) plus
  hero and footer.
- **MUST NOT** add a new full-height dark section without removing one. More than ~3.5
  screens of unrelieved black before a light section reads as the page being dark.

## 2. Palette

| Token | Hex | Role |
| --- | --- | --- |
| `ground` | `#f4f4f1` | the one page canvas |
| `surface` | `#ffffff` | cards / insets raised off the ground |
| `night` | `#151717` | ink, primary CTA fill, dark blocks, footer |
| `shade` | `#1c1f1e` | softened dark for cinematic blocks |
| `mist` | `#8a8d8c` | muted / secondary text |
| `moss` | `#3f6a33` | green accent **on light** (kicker rule) |
| `lime` | `#b4d656` | green accent **on dark** (kicker rule, hero tag) |
| `ink` | `#2a5124` | deep brand forest green |

Rules:

- **Black & white experience with a ~5% brand-green accent budget.** Green appears only
  as: kicker rules, the custom cursor mark, map/equipment pins, and timeline nodes.
- **MUST NOT** exceed **two** green marks per viewport-height of a light section.
- **MUST** step the kicker rule down to `moss` on light ground and up to `lime` on dark —
  lime all but disappears on `#f4f4f1`. See
  [shared.tsx:30](src/components/mono/shared.tsx:30).
- **MUST NOT** introduce a fourth hue. `gold` (`#faac32`) exists in the theme but belongs
  to `/final`; it is out of budget here.
- Text opacity ladder on light: `text-night` → `text-night/70` → `text-night/50`.
  On dark: `text-white` → `text-white/80` → `text-white/60`. Nothing below `/50`.

## 3. Typography

Typeface: **Gilroy** (local, weights 100–950), set on the page root as `font-gilroy`
([page.tsx](src/app/page.tsx)). Inter/Fraunces are loaded for other routes — **MUST NOT**
be used inside `/`.

Weights in use: `500` (hero h1 only), `600` (kickers), `700` (buttons, micro labels),
`800` (`font-extrabold` — every h2/h3).

| Tier | Size | Spec |
| --- | --- | --- |
| Hero h1 | `clamp(2.6rem, 7.5vw, 4.6rem)` | `font-medium`, **uppercase**, `leading-[1.05]`, `tracking-[-0.2px]` |
| Dark-chapter h2 | `clamp(2rem, 5.4vw, 4.2rem)` | `font-extrabold`, `leading-[1.04]`, `tracking-tight` |
| Section h2 | `clamp(1.8rem, 3.4vw, 2.8rem)` | `font-extrabold`, `leading-tight`, `tracking-tight` |
| Card h3 | `text-2xl` (1.5rem) | `font-extrabold`, `leading-tight`, `tracking-tight` |
| Body | `text-sm` / `text-[15px]` / `text-base` | `leading-relaxed` for paragraphs |
| Kicker / overline | `text-[11px]` | `font-semibold`, uppercase, `tracking-[0.28em]` |
| Micro label / badge | `text-[10px]`–`text-[12px]` | `font-bold`, uppercase, `tracking-[0.08em]`–`[0.14em]` |

Rules:

- **MUST NOT** use more than **five** distinct type sizes in one section.
- **MUST** set every heading `tracking-tight` (negative) and every uppercase label
  positive-tracked (`0.08em` minimum). Nothing uppercase at default tracking.
- **MUST** headings be `font-extrabold` (800). The hero h1 at `font-medium` is the single
  intentional exception — do not copy it into sections.
- **MUST** every section open with a `MonoKicker` (rule + 11px label), then the h2.
  That pair is the section's identity; no bare headings.
- `[text-wrap:balance]` on hero and chapter headlines only.

## 4. Layout & rhythm

- **Container: `mx-auto max-w-[1500px] px-5 md:px-10`.** This exact string, 7×in the
  codebase. Header widens to `max-w-[1600px]`; long-form prose narrows to
  `max-w-[1100px]`. **MUST NOT** invent a third width.
- **Section shell:** `border-b border-night/10 bg-ground py-20 md:py-28`. Every standard
  section, verbatim.
- Scroll-story chapters are full-bleed, `bg-night`, height set in `vh`
  (`h-[280vh] md:h-[340vh]` class), sticky inner viewport.
- Header height: `--header-h: 5rem`; anchor scrolls compensate with `offset: -70`.
- Prose measure: `max-w-md` / `max-w-xl` / `max-w-3xl`. **MUST NOT** run body copy
  full-width at 1500px.
- **Mobile-first.** `md:` is the working breakpoint (122 uses); `sm:` handles button
  stacking, `lg:`/`xl:` are rare. **MUST** author and check every piece at **375px**
  first; `md:` is the only required uplift.

## 5. Surfaces, borders, radius, shadow

- **Hairline default: `border-night/10`.** Interactive/raised: `/15`, `/20`, `/25`.
  Hover lifts to `border-night/30` or full `border-night`. **MUST NOT** use a hairline
  heavier than `/30` on light ground.
- **Radius:** `rounded-full` for anything pill-shaped (buttons, badges, pins — 45 uses),
  `rounded-2xl` for cards (14 uses), `rounded-xl` for small insets. Hero CTAs use
  `rounded-[50px]`. **MUST NOT** use `rounded-md`/`rounded-lg` or square cards.
- **Shadow is soft, large, and negative-spread only.** Canonical card shadow:
  `shadow-[0_18px_50px_-32px_rgba(21,23,23,0.4)]`. Big lifted panels:
  `shadow-[0_40px_120px_-40px_rgba(21,23,23,0.7)]`. **MUST NOT** use Tailwind's
  `shadow-md`/`shadow-lg` or any shadow without negative spread — mid-tone shadows read
  as a grey halo on `#f4f4f1`.
- Text over imagery gets `drop-shadow-[0_2px_30px_rgba(0,0,0,0.4)]`, not a scrim box.
- Dark imagery overlays: vertical gradient `from-night/45 via-night/5 to-night/60`.

## 6. Controls

**Primary CTA** — `rounded-full bg-night px-7 py-3.5 text-sm font-bold text-white
transition-transform duration-300 hover:-translate-y-0.5`

**Secondary** — `rounded-full border border-night/25 text-sm font-bold text-night
transition-colors hover:bg-night hover:text-white`

**Hero CTA** — `rounded-[50px] px-6 py-4 text-[14px] font-bold uppercase
tracking-[-0.2px]`, white fill on dark; the glass sibling is
`border border-white/40 bg-white/[0.06] backdrop-blur-[16px]`.

**Inputs are underline-only** — `w-full border-b border-night/20 bg-transparent pb-3
text-lg font-semibold text-night focus:border-night focus:outline-none`.
**MUST NOT** use boxed or filled inputs.

Rules:

- **MUST** every interactive element carry a visible hover state: `-translate-y-0.5`,
  a border-opacity step, or a fill inversion. Never opacity-only.
- **MUST NOT** remove focus visibility — `focus:outline-none` is only ever paired with a
  `focus:border-night` (or equivalent) replacement.
- **MUST** interactive elements be tagged `data-cursor-hover` so `MonoCursor` reacts.
- Hover scale ceiling: `1.05` on small marks, `1.03` on images. Nothing larger.

## 7. Motion

Scroll is owned by **Lenis**; native `scroll-behavior` is off. GSAP + ScrollTrigger
handle everything scroll-driven ([lib/gsap](src/lib/gsap.ts)).

- **Easing:** CSS uses `--ease-luxe` = `cubic-bezier(0.16, 1, 0.3, 1)`. GSAP uses
  `power3.out` for reveals, `expo.out` for headings. **MUST NOT** ship `ease-in-out`,
  `linear` (except frame-scrub), or an unnamed easing.
- **Reveals are opt-in via `data-reveal`** on the element, so server components stay
  server components. Variants: `up` (default) · `left` · `right` · `zoom` · `heading`
  (blur rise) · `iso`. Optional `data-reveal-delay`.
  **MUST NOT** hand-roll a new IntersectionObserver — use the attribute; `MonoMotion`
  batches it ([MonoMotion.tsx](src/components/mono/MonoMotion.tsx)).
- **Reveal spec:** trigger `top 90%`, `once: true`, stagger `0.06s`, duration `1s`
  (`heading` `1.15s`), travel `28px` (`heading` `34px` + `blur(10px)`→`0`).
- **CSS transition durations: `300ms` default, `500ms` for layout shifts, `700ms` for
  image scale.** **MUST NOT** ship a transition under `300ms` or a bespoke duration
  outside this set.
- Hero headline: per-word mask rise, `0.9s cubic-bezier(0.22, 1, 0.36, 1)`, stagger
  `0.09s`. Copy entrances `mono-fade-up` `0.7s` with explicit `animationDelay`.
- **Frame-scrub sequences are desktop-only.** Mobile and `prefers-reduced-motion` load
  **one still** — and a still that actually shows the subject (hero uses frame 100, not
  frame 1, which is bare sky). See [MonoHero.tsx:17](src/components/mono/MonoHero.tsx:17).
- **MUST** every animation have a `prefers-reduced-motion: reduce` escape. Global
  transition/animation kill is in
  [globals.css:343](src/app/globals.css:343) — new named keyframes need their own entry
  there too.
- Reveals must survive a mid-page load (hash link, refresh, back button): anything already
  scrolled past is shown instantly rather than left at `autoAlpha: 0`.

## 8. Content & structure constraints

- **All copy and imagery come from the admin** (`SiteContent` via `loadSiteContent()`,
  edited at `/admin/site`). **MUST NOT** hardcode user-facing strings in a mono
  component — take them off the `site` prop.
- A section whose content is unset **MUST** render nothing (see `MonoVr`: no
  `vr.embedUrl` → no section).
- Page language is Mongolian (`<html lang="mn">`). Copy is Mongolian; code comments may be
  either.
- Images: `loading="lazy" decoding="async"`, `object-cover`, wrapped in
  `overflow-hidden`. Reveal via `ZoomMedia` (scale `1.18`→`1`, scrub) rather than a fade.

---

## Quick fail-list for the System critic

1. A content section not on `bg-ground`, or a new dark full-height block.
2. More than two green marks in one viewport, or green outside rule/cursor/pin/node.
3. A heading that isn't `font-extrabold` + `tracking-tight` (hero h1 excepted).
4. A section without the `MonoKicker` + h2 pair.
5. A container width other than `1500px` / `1600px` (header) / `1100px` (prose).
6. Section padding other than `py-20 md:py-28`.
7. `shadow-md`/`shadow-lg`, or any shadow without negative spread.
8. `rounded-md`/`rounded-lg`, or a square card.
9. A transition under `300ms`, or an easing that isn't `--ease-luxe` / `power3.out` /
   `expo.out`.
10. A hand-rolled scroll observer instead of `data-reveal`.
11. Any animation with no `prefers-reduced-motion` escape.
12. A hardcoded user-facing string instead of a `site` prop value.
13. Broken at 375px.
14. An interactive element with no hover state or no `data-cursor-hover`.

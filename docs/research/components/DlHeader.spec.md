# DlHeader — fixed pill navbar (Daylight-style, Elysium content)

Target file: `src/components/daylight/DlHeader.tsx` (client component). Interaction: scroll-driven show/hide + mobile menu (click).

## Context (already exists — import, do not recreate)
- `useLang()` from `@/components/LangProvider` → `{ lang }`; content: `DL_DICT[lang].nav` from `@/lib/daylight-content` (`links: {label, href}[]`, `cta`), `DL_MEDIA.logo` = "/brand/elysium-logo.svg".
- `DlWaves`, `gsap`, `useGSAP` from `./shared`.
- Scoped CSS (globals): `.dl` wrapper provides vars `--dl-beige/-black/-orange/--dl-ease-quart`; classes `dl-text-N`, `dl-mono`.
- IMPORTANT: project Tailwind spacing = 4px base. NEVER copy numeric utilities from原 site (top-22 etc.) — always arbitrary px: `top-[22px]`, `gap-[28px]`.

## Structure (desktop ≥1024px)
`<header>` fixed `top-[12px] lg:top-[22px] left-0 z-[100] w-full px-[var(--margin)]`, initial style `transform: translateY(-150%)` (animated in by page after hero intro — expose `id="dl-header"`; also self-animate: gsap.to translateY 0, 0.6s expo at mount +2.6s delay as fallback).
- Centered white pill: `hidden lg:flex mx-auto w-fit items-center bg-white rounded-[8px]`, padding `6px 6px 6px 16px`, `gap-[28px]`, height `57px`, subtle shadow `0 1px 2px rgba(0,0,0,0.06)`.
  - Logo link (href "/daylight"): img src DL_MEDIA.logo `h-[26px] w-auto` + span "Elysium" Gilroy 600 `text-[17px] tracking-[-0.01em]` (logo+word row, gap-[8px], text-[var(--dl-black)]).
  - `<nav class="flex items-center gap-[24px]">`: links `text-[14px] text-[var(--dl-black)] transition-opacity duration-300 hover:opacity-60` (plain sans 400).
  - CTA `<a>`: `relative flex items-center justify-center overflow-clip whitespace-nowrap rounded-[4px] h-[45px] px-[24px] text-white font-medium text-[15px]`; children: `<DlWaves className="pointer-events-none absolute inset-0 z-0 h-full w-full" speed={0.35} bands={6}/>` + `<span class="pointer-events-none absolute inset-0 z-[1] backdrop-blur-[3px]"/>` + `<span class="relative z-[2]">{cta}</span>`. Hover: slight brightness raise (`hover:brightness-110 transition`).
- Mobile (<1024): white full-width bar `lg:hidden flex items-center justify-between bg-white rounded-[8px] px-[14px] h-[52px]`: logo row (as above, text 15px) + hamburger button (two spans 18x2px bg-black, gap 5px; rotate ±45° into X when open, transition 300ms).
  - Menu panel (when open): absolute below bar `mt-[6px] bg-white rounded-[8px] p-[18px] flex flex-col gap-[14px]`, links `text-[16px]`, then CTA (same waves style, w-full h-[46px]). Animate open: height/alpha gsap 0.35s expo.out. Close on link click.

## Behavior — hide on scroll down / show on scroll up
useEffect: listen `window.scrollY` via rAF or lenis scroll event (use `window.addEventListener('scroll', ...)` — Lenis emits native scroll):
- if y < 80 → shown; else if dy > 2 (down) → hidden (`translateY(-150%)`); dy < -2 → shown (`translateY(0)`).
- Apply via gsap.to(header, {yPercent}, 0.5s, ease cubic-bezier(.26,1.04,.54,1)) — use `ease: "power2.out"` approximation or CSS class toggle with `transition: transform .5s var(--dl-ease-quart)`.
- While mobile menu open → always shown.

## A11y
- First child: skip link `<a href="#dl-content" class="sr-only focus:not-sr-only fixed top-[20px] left-[20px] z-[1001] bg-white p-[10px] rounded-[6px] text-[13px]">Агуулга руу очих</a>` (hardcode MN label fine).
- aria-expanded on hamburger; nav aria-label "Main".

## Language toggle
Append a small MN/EN toggle inside pill after nav links (before CTA): two buttons text-[12px] dl-mono, active = opacity-100, inactive opacity-40 hover:opacity-70; uses `setLang` from useLang.

## Acceptance
- `npx tsc --noEmit` passes. Component self-contained, no new deps. Export `DlHeader`.

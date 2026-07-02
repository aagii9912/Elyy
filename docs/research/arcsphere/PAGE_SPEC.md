# ArcSphere Studio — Clone Spec (source: https://aagist.framer.website/)

Cloned into Next.js at route `/arcsphere`. Faithful (pixel-ish) clone, ArcSphere content kept verbatim.
Page height ~9823px @ 1440. Cream editorial architecture aesthetic, Framer scroll-reveal animations.

## Design Tokens
- Cream background: `#F0EBE6` (rgb 240,235,230)
- Primary brown (text, headings, buttons, footer): `#4F4742` (rgb 79,71,66)
- Darker brown text (service names/desc): `#453E3A` (rgb 69,62,58)
- Light cream 2 (footer band bg near wordmark): `#E2DACF` (rgb 226,218,207)
- Cream text on dark: `#F0EBE6`
- Muted brown: rgba(79,71,66,0.8)
- Font: **Inter** (Framer "Inter Display") — weights 400, 500, 800. Applied to `.arcsphere` subtree only.

## Type scale (computed @1440)
- Hero H1: 80px / w400 / lh1.1 / ls -3.2px / cream
- Section headings (uppercase, centered): 40px / w500 / lh1.3 / ls -0.4px / brown
- Contact/footer CTA headings: 40px / w500 / uppercase / brown (footer CTA ~52px, 3 lines)
- Service row name: 34px / w400 / TitleCase / #453E3A
- Body / subtitle: 18px / w400 / lh1.3 / #453E3A (uppercase subtitles ~15px)
- Nav links: ~14px uppercase brown; nav logo ~22px brown
- Buttons/labels: 14–16px uppercase, ls tight
- Big stat numbers (16+/35+): ~100px w500
- Footer wordmark "ArcSphere Studio": ~240px (responsive) / w800 / ls -9.6px / brown
- Project card title: 16px w500 uppercase; category/location: ~13px uppercase

## Section topology (top → bottom)
1. **Nav** (sticky, cream): left links DESIGN PROCESS · PROJECTS · SERVICES | center logo "ArcSphere Studio" | right "CONTACT US" pill (brown bg, cream text, rounded-full).
2. **Hero** (~92vh): full-bleed image `vVqkA2phwOpc7kzAHksLgpPasxY.png` (dark wood-panel lounge), rounded, heading overlaid bottom-left "Where Architecture Meets Experience" (cream, 80px). Bottom-right: subtitle "Based in Dubai, we design residential and commercial spaces that elevate how people live, work, and interact with their environment" + 2 pill buttons: VIEW PROJECTS (cream/solid, dark text), BOOK CONSULTATION (glass/outline, cream text). Thin divider line near bottom.
3. **Gallery strip**: 3 images row — `JEOoI9AUjiorAUapWVh1gnkvdBI.png` (terrace, portrait) | `vVqkA...` (center, landscape) | `eJtReq8aEIEdVjdWqNPxJAANXJQ.jpg` (striped sofas, portrait). (This is the hero's scroll-morph final state; render as static row.)
4. **Statement**: centered heading "DESIGNING TIMELESS SPACES WITH PURPOSE" (40px uppercase) + subtitle "WE OFFER A COMPLETE RANGE OF ARCHITECTURE AND INTERIOR DESIGN SERVICES TAILORED TO CREATE SPACES." Flanked by 2 staggered square images: left `wthfvP6tU9Aorh9kHe1fCtIJ6Lg.png` (top-down sofa/rug, higher), right `GR6RzM6Itwx2wDtjwveRN43I.png` (blurred walking person, lower).
5. **Stats marquee** (horizontal scrolling): AWARD WINNING DESIGNS ○ 100% CLIENT SATISFACTION ○ 150+ PROJECTS COMPLETED ○ 12+ YEARS EXPERIENCE — brown ~24px uppercase, small circle separators, looping.
6. **Featured Projects**: heading "FEATURED PROJECTS" + subtitle "A SELECTION OF OUR RECENT ARCHITECTURE AND INTERIOR DESIGN WORK." 3 cards, staggered heights (middle taller/lower):
   - `4DOVdvbWRuODDfm0C2LMekOT9c.png` — CORPORATE OFFICE SPACE / COMMERCIAL ARCHITECTURE / NEW YORK, 2026
   - `q1jRseViT6p77AKtrsON5HifB0.jpg` (taller) — SERENITY VILLA / RESIDENTIAL ARCHITECTURE / DUBAI, 2025
   - `YJqX4cT1uigCFLzeZ7sd5CjGa0.png` — MINIMALIST APPARTMENT INTERIOR / RESIDENTIAL ARCHITECTURE / LONDON, 2025
   Each: image (rounded), title row with ↗ circle button, category + location below. "VIEW MORE PROJECTS" link centered.
7. **Services**: heading "OUR SERVICES" + subtitle "END-TO-END DESIGN SERVICES FROM CONCEPT TO COMPLETION." 6 accordion rows (title 34px TitleCase + ↗ circle button right, description below, divider between). Hover reveals a cursor-following thumbnail.
   - Architectural — "Designing modern buildings that combine aesthetics, efficiency, and long-term value." (img `xILzBC4T9dkW9g4SA2OKFCeCpWY.png`)
   - Interior Design — "Creating refined interiors through thoughtful materials, lighting, and spatial composition." (`XvAPBw1t0Xzlyw7rz6xXH45yg.png`)
   - Renovation & Remodeling — "Transforming outdated spaces into modern and carefully designed environments" (`6YL1tAtmkIm3Mvy6fpHipVf7s.png`)
   - 3D Visualization — "High-quality visualizations that help clients clearly understand the design before construction begins." (`HZFnCooJ4Nr7M2uNee0yvEoK7k.jpg`)
   - Space Planning — "Optimizing layouts to improve functionality, circulation, and spatial flow." (`yJOuZOIs8ZL0On3JA5nIXentk.jpg`)
   - Construction Consultation — "Professional guidance during construction to ensure the design vision is executed correctly." (`MhNlfvpNMNpvRZw6EG0mXPj9Qg.jpg`)
8. **Project Expertise**: heading "PROJECT EXPERTISE" + subtitle "WE DESIGN SPACES ACROSS RESIDENTIAL AND COMMERCIAL ENVIRONMENTS." 2 large image cards (rounded), white text overlaid:
   - `UqMqhHYfcJfkq2yOeOBnNWsjEmQ.jpg` — top-left "16+ / COMMERCIAL PROJECTS DONE"; bottom-left "COMMERCIAL DESIGN" + "FUNCTIONAL AND VISUALLY COMPELLING SPACES FOR OFFICES, RETAIL STORES, HOSPITALITY, AND BUSINESSES."
   - `ecG0oXxVciB6YeEscSE3BDzmk.jpg` — top-left "35+ / RESIDENTIAL PROJECTS DONE"; bottom-left "RESIDENTIAL DESIGN" + "THOUGHTFULLY DESIGNED HOMES INCLUDING VILLAS, APARTMENTS, AND PRIVATE RESIDENCES."
9. **Design Process**: heading "CLEAR DESIGN PROCESS" + subtitle "A COLLABORATIVE APPROACH FROM CONCEPT TO COMPLETION." 4 image cards, each: circular icon button top-right, dark gradient bottom overlay with TITLE + desc:
   - `IoCUX80inVa3YYNnEWvV34nKZQ.png` (search icon) — RESEARCH / 01 / DISCOVERY / "We Begin By Understanding Your Goals, Requirements, And Design Vision."
   - `11MwiLjJmisM6fK5qmtatuS8OE.png` (cube icon) — IDEATION / 02 / CONCEPT DEVELOPMENT / "Our Team Develops Layouts, Ideas, And Creative Design Directions."
   - `BY0VkDaSLT6GSQPRcYDxvN8K448.png` (bulb icon) — MODELLING / 03 / DESIGN DEVELOPMENT / "Detailed Drawings, Materials, And Spatial Specifications Are Finalized."
   - `TcTapBxBAcl92Z0CxBxNdDiN5zs.png` (check icon) — DELIVERY / 04 / EXECUTION / "We Guide Implementation To Ensure The Final Result Reflects The Original Design Vision."
   (RESEARCH label + number shown small top-left; TITLE + desc bottom.)
10. **Testimonials**: heading "WHAT OUR CLIENTS SAY" + subtitle "REAL EXPERIENCES FROM CLIENTS WHO TRUSTED US WITH THEIR SPACES." Left big image `uCxt73fPvlnB5kTHTnBcmT5QU.jpg` (rounded). Right: 5 filled stars, heading "A Game-Changing Experience for My Growth" (~34px TitleCase), quote "Working with Claryo brought clarity to decisions I had been postponing for months. The structure, insight, and accountability helped me move forward with confidence and measurable progress." then "Michael Turner" (bold) / "Founder & Business Consultant", + row of 4 avatar thumbnails (active outlined): `YwMiyx3zw3BnInoLrttBGb07Ok.jpg`, `6lE03xTKE41EJJCgtuMd8nnBp6c.jpg`, `POgUrnekSgfq9jHFSm7Gi1re5xw.jpg`, `WW5YYUveqRONYLlubu7BDlfjoew.jpg`.
11. **Gehry CTA band**: full-width rounded image `Vot4TfNdPciaGO0nbBK36oh4ec.png` (hillside house over LA). Overlaid: faint quote top-left "ARCHITECTURE SHOULD SPEAK OF ITS TIME AND PLACE, BUT YEARN FOR TIMELESSNESS." — FRANK GEHRY. Bottom-right: VIEW PROJECTS + BOOK CONSULTATION buttons.
12. **Contact**: left heading "LET'S TALK ABOUT YOUR PROJECTS" (40px uppercase) + subtitle "Every collaboration begins with a conversation. We'd love to hear about your project, idea, or partnership." Lower-left contact blocks: Phone Number / +62 812 3456 7890 · Email / hello@arcspherestudio.ae · Social Media / [instagram, linkedin, pinterest, behance] · Address / Dubai-Based Architecture And Interior Design Studio. Right: form — "Enter Your Details": Fullname, Email, Phone Number, Services; "Project Context": Project Type, Your Location, Project Scale; underline inputs; Submit button (full-width brown).
13. **Footer**: CTA "OPEN TO NEW PROJECTS AND COLLABORATIONS THAT SHAPE MEANINGFUL SPACES." (large uppercase, 3 lines) + "GET IN TOUCH". Right: 3 link columns — [HOME, ABOUT, SERVICES, PROJECTS, PROCESS, CONTACT] · [PINTEREST, LINKEDIN, INSTAGRAM, BEHANCE] · [PRIVACY POLICY, COOKIE POLICY, TERMS & CONDITIONS]. Divider. Row: mail/phone/location icons left, "© 2026 Your Architecture Studio. All Rights Reserved." right. Then GIANT "ArcSphere Studio" wordmark (w800). Bottom: full-width image `3GG8FlJkc5UJfOGjTcx5PwNKKs.jpg` (hillside house).

## Interaction notes
- Smooth entrance reveals (fade + rise) on scroll into view — implement with Lenis (already in project) + IntersectionObserver/GSAP or CSS. Keep subtle.
- Stats bar = infinite horizontal marquee.
- Nav is sticky at top.
- Assets downloaded to `public/arcsphere/images/<hash>`.

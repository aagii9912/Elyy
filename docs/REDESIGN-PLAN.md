# Elysium — Redesign plan (client comments, v2 review)

Source: `Elysium website info.xlsx` → sheet **"Comments on second ver"** (+ Basic Info, first-ver concept).
Decision: build a **new unified `/final` route** combining the best of `/` (FIND-style) and `/v2` (LAGOM-style),
then promote to `/` once approved. Brand: **"Elysium Residence — Бизнес зэрэглэлийн орон сууц"**.

## Global
- **A1 Font → Gilroy-style rounded.** Gilroy is commercial → either client supplies licensed files, or use a free near-match (Mulish / Poppins / Onest). `layout.tsx`.
- **A2 Remove MN/EN toggle**, replace with **"Танилцуулга татах"** (brochure PDF) button. `header`.
- **A3 Numbers bold**, unified font.
- **A4 Data fixes (`content.ts`):** apartments **440 → 506**; phone **7786-2222**; hours **Да–Ням 09–18**; developer **Монкон Констракшн ХХК (2006-)**; sales office "Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, 360 Мандала тауэр".

## Sections (order = page flow)
| # | Section | Source / build | Comment | Status |
|---|---|---|---|---|
| 1 | Header | reuse, edit (A2) | r9 | edit |
| 2 | Hero | FIND cinematic, cleaned: brand text, no descriptive sentence, **video** slot + brochure btn | r4,6,8 | rebuild |
| 3 | Ерөнхий төлөвлөлт / Stats | 3 big numbers + motion (506 / 85% / 513) | r10,12,13 | edit |
| 4 | Төслийн тухай (About) — NEW | concept text + completion **2027 Q2** (moved from stats) | r12,14 | new |
| 5 | Давуу тал "ELYS" | findrealestate-style dark, 4 items (Ergonomic/Live in Harmony/Your Safety/Save Big) | r16,18-22 | rebuild |
| 6 | Өрөөний сонголт | Sobha-style: room+m² label + **axono horizontal carousel** (Swiper) | r24,25 | rebuild |
| 7 | Төсөл хэрэгжүүлэгч | Монкон info + **4 projects carousel** (Комфорт 600 / Мандала 510 / Мандала гарден 2500 / 360·365 Тауэр 200) | r30-34 | new |
| 8 | Зургийн цомог (Gallery) | lagom-style horizontal/infinite carousel — **DONE**, swap in interior images | r35 | done* |
| 9 | Бидэнтэй холбогдох | form + phone/hours/location | r44-48 | edit |
| 10 | Газрын зураг (Map) — NEW | map + nearby landmarks (from Basic Info) | r49 | new |
| 11 | FAQ | 5 questions (Basic Info) | — | new/reuse |
| 12 | Footer | reuse | — | edit |

## Build phases
- **Phase 1 (no assets needed):** scaffold `/final`; global font swap (free Gilroy-alt) + remove lang toggle; data fixes; Stats (506, move date); About section; ELYS advantages; Contact data; FAQ; Footer.
- **Phase 2 (logic, placeholder media):** apartments axono carousel; developer projects carousel; gallery interior swap (placeholders); brochure button (placeholder PDF); hero video slot (placeholder); map (embed/static placeholder).
- **Phase 3 (client assets):** real Gilroy font, brochure PDF, hero video, interior + axono images, map coordinates → drop into the slots.

## Blockers (client to provide)
Gilroy font files · hero video · brochure PDF · interior images · axonometric drawings · map location/coords.

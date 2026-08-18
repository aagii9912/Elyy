# bar.md — the standard this run is judged against

**The bar is this page's own strongest stretch**, chosen by the user: desktop screens
4.5–17, i.e. `#elys`, `#equip`, `#apartments`, `#developer`, `#location`, `#contact`,
`#managers`, `#faq`. The pieces being changed are **not** part of the reference.

Known ceiling of this choice: a self-bar can pull the weak parts up to the site's own
best, and no further. It cannot make the page better than its best existing section.

Every number below was **measured** from a headless render of `http://localhost:3000`
at 1440×900 and 390×844 — then the thresholds were **calibrated against the reference
itself**, so that every reference section passes every mechanism at round 0. A bar that
fails its own reference is a broken bar; this one was rebuilt once for exactly that
reason (M4 sat above `#equip`'s real value, M5 above `#contact`'s).

Rigs (in the session scratchpad):

- `capture.py` — filmstrip per section + luminance curve every half-screen
- `teardown.py` — per-viewport luminance, ground share, accent share, type sizes,
  per-image tonal range, headline-vs-backdrop contrast
- `jank.py` — rAF frame deltas + long tasks over a full wheel-scroll pass
- `report.py` — runs all three for a label and scores M1–M7 arithmetically

`python3 report.py --label <round>` → `renders/<round>/report.md`. Pass/fail contains
no judgement; a critic checks a mechanism by reading the number.

---

## M1 — Luminance floor and no cliff

- Every viewport in the page body measures **mean luminance ≥ 0.76**.
- **Adjacent half-screen steps ≤ 0.20.**

Reference: the light stretch measures 0.76–0.94 (median 0.87); its largest step between
adjacent half-screens is **0.09**.

Round 0: **FAIL** — desktop 11 viewports under the floor (lowest **0.117**), mobile 14
(lowest **0.098**). Worst adjacent step **0.565** desktop / **0.540** mobile.

## M2 — Bare light ground is the majority of the frame

Pixels within tolerance of `#f4f4f1` / `#ffffff` cover **≥ 0.55 of the viewport**.

Reference: 0.59–0.96 (contact 0.957, apartments 0.732, map 0.607, structure 0.594).

Round 0: **FAIL** — hero **0.046**, chapter 01 **0.0002**.

## M3 — The headline is legible against its own backdrop

Approximate contrast of the largest visible text against the mean luminance of the
pixels in its own box: **≥ 12:1**.

Reference: 13.45–15.97 across all eight reference sections, without exception. The floor
sits at 12 rather than 13.45 to leave media-backed sections a small allowance — a
properly scrimmed white headline clears it easily.

Round 0: **FAIL** — hero **1.73** (white text on a 0.556-luminance photograph),
chapter 01 **2.44**.

## M4 — Big media has tonal range, not just presence

Every `img` / `canvas` / `video` covering **≥ 10% of the frame** measures
**p95 − p05 luminance ≥ 0.22** and **mean ≥ 0.33**.

Reference: 0.238 (structure, the floor) up to 0.875 (managers); means 0.334–0.788.
The threshold sits just under the reference floor.

Round 0: **FAIL** — chapter 01 canvas: range **0.048**, mean **0.130**. Five times
flatter than the weakest reference image. The masterplan footage is *present and
invisible* — the single worst measurement on the page.

## M5 — Type stays inside the page's own scale

- **≤ 6 distinct rendered type sizes per viewport.**
- **headline : body ratio between 3.0 and 5.5**, where "body" is the size carrying the
  most text on screen — not the smallest size, or an 11px kicker gets read as body copy
  and the ratio stops meaning anything.
- The ratio clause does **not** apply to the two full-bleed title cards (`hero`,
  `chapter01-plan`): they carry no body copy, so a ratio derived from body-copy sections
  is comparing unlike things. The size-count cap still applies to them.

Reference: 4–6 sizes (contact carries 6); ratios 3.00 · 3.21 · 3.21 · 3.40 · 4.09 ·
4.09 · 4.91.

Round 0: **FAIL** — `#developer` has **8 sizes** and ratio **22.86**, driven by a 320px
year numeral. This also breaks `design-system.md` §3 (≤5 sizes), which is stricter.

## M6 — Green accent stays a rounding error

Pixels near `#b4d656` / `#3f6a33` cover **≤ 0.035% of the viewport**.

Reference maximum 0.029% (developer); contact, map, faq measure 0.000%.

Round 0: **pass** — hero sits at 0.034%, on the ceiling. This mechanism is a **guard**:
it stops a builder from "brightening" a dark section by adding green instead of fixing
the ground.

## M7 — Motion is smooth and not crowded

- Frame-time **p99 ≤ 18ms**, **zero stalls > 100ms**, dropped-frame share **≤ 1%**.
- **≤ 6 simultaneously running animations** outside a user-driven interactor.

Round 0: **pass** — p99 **17.5ms** desktop / **9.3ms** mobile, **0** stalls, dropped
0.1%, baseline **3** running animations. `#elys` runs **19** — exempt, it is the
hover/tap stack the user drives.

Measured in headless Chromium with software raster and unthrottled vsync, so the
frame-time distribution is meaningful but the absolute fps is not. **Motion passes M7
already.** If motion still reads as wrong, the cause is choreography — easing, duration,
what moves when — and the Craft critic judges that on the filmstrip, not on this number.

---

## Round 0 scoreboard — 8 failures, all genuine

| | M1 | M2 | M3 | M4 | M5 | M6 | M7 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| hero | ❌ | ❌ 0.046 | ❌ 1.73 | ✅ 0.765 | ✅ | ⚠️ 0.034 | ✅ |
| chapter01-plan | ❌ 0.117 | ❌ 0.000 | ❌ 2.44 | ❌ 0.048 | ✅ | ✅ | ✅ |
| elys-concept | ✅ | ✅ | ✅ | — | ✅ | ✅ | exempt |
| structure | ✅ | ✅ | ✅ | ✅ 0.238 | ✅ | ✅ | ✅ |
| apartments | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| developer | ✅ | ✅ | ✅ | ✅ | ❌ 8 / 22.86 | ✅ | ✅ |
| map · contact · managers · faq | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Plus the two cliffs, which belong to no single section: entry **0.565**, footer **0.35**.

## No-regression rule

A check that **passed at baseline** and fails in a later round is a **regression** and
fails the round on its own. A pre-existing defect that still fails is not a regression —
the loop chases its own damage, not the page's history. Baseline is
`renders/baseline/report.json`.

---

## Mobile mechanisms — M8 to M11

M1–M7 are device-agnostic and mobile already clears all seven, so "make it mobile
friendly" needed thresholds of its own or there would be nothing for a critic to check.
Measured by `mobileprobe.py` at **390×844** and **360×640**.

One correction belongs here, because it changed the numbers. The rigs used to screenshot
650ms after scrolling, which is inside the 1s reveal animation. A section caught mid-reveal
reads emptier and lighter than it is: that artefact invented a 359px "dead band" in the map
section which collapsed to 41px once the reveal finished. All rigs now wait for every
`[data-reveal]` element in the viewport to reach opacity 0.95 before measuring. Re-measured
with the fix, `hero`, `chapter01-plan` and `apartments` were unchanged — so piece A's result
stands — but `#apartments` turned out to break M6, which the early screenshot had hidden.

### M8 — Tap targets are at least 44×44

The platform floor on both iOS and Android. Inline links inside running text are exempt;
they are not tap targets in the same sense.

Round 0 of piece B: **FAIL** — the menu button is **40×40** at both widths, and a contact
input is **292×41**.

### M9 — Nothing bleeds sideways

`document.scrollWidth` must equal the viewport width, and no element may extend past the
viewport edge unless an ancestor clips it. Marquees clip, so they are fine.

Round 0 of piece B: **pass** — no horizontal scroll and no unclipped overflow at either width.

### M10 — No text below the design system's own smallest size

`design-system.md` documents 11px as the kicker size, so anything under 11px is an outlier
rather than a deliberate tier.

Round 0 of piece B: **pass** — nothing under 11px anywhere.

### M11 — No dead bands

The longest unbroken run of rows that are bare ground **and** carry no image, canvas, video
or iframe: **≤ 110 CSS px**. Pale content is not empty — a light map tile reads as ground to
a pixel test but is content to a reader, so media boxes are excluded.

Reference: 43–98px across the eight reference sections, at both widths.

Round 0 of piece B: **FAIL** — `chapter01-plan` runs **197px** at 390×844 (110px at 360×640),
twice the reference maximum.

### Context, not a mechanism

The page runs **19.26 screens** at 390×844 and **24.34 screens** at 360×640. Page length is a
content decision rather than a defect, so no threshold covers it — but it is the mobile
reader's actual experience, and the craft critic judges it.

## Regression floor

From piece B onward the no-regression floor is `renders/verify-A2/report.json` — the first
scoreboard measured with reveal-aware settling. The earlier `baseline` was measured with the
old timing, so comparing against it would compare two different instruments.

## Outside the reach of this rig

Supabase reads fail locally (`JWT issued at future`), so the page falls back to default
content: **`#vr` is absent and social links are filtered out**. Punch-list items 9 and 7
must be verified in `/admin/site` against production. No mechanism here covers them, and
no critic should claim they pass.

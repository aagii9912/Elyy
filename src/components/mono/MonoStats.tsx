"use client";

/* / — Ерөнхий төлөвлөлт. Chapter 01: the key figures roll in as giant
   numerals beside the masterplan window.

   The backdrop is a dedicated 180-frame sequence built from four client
   clips, one per stat point and crossfaded on the quarter boundaries, so
   each figure lands over the footage that proves it (masterplan / green
   courtyard / parking street / finished elevation at dusk). Rebuild with
   `node scripts/build-scroll-frames.mjs plan`.

   The chapter was a dark full-bleed plate; the footage sat behind a night
   scrim and measured a tonal range of 0.048 — the masterplan was there and
   could not be seen. It is now a light chapter on the page ground and the
   footage is shown as footage. */

import type { SiteContent } from "@/lib/site-content";
import { MonoScrollStory } from "./MonoScrollStory";

export function MonoStats({ site }: { site: SiteContent }) {
  const points = site.plan.points.map((p, i) => ({
    n: String(i + 1).padStart(2, "0"),
    heading: p.heading,
    accent: p.accent || undefined,
    text: p.text,
  }));

  return (
    <MonoScrollStory
      id="about"
      chapter="01"
      kicker={site.plan.kicker}
      title={site.plan.title}
      points={points}
      frameStart={1}
      frameEnd={180}
      frameDir="/plan-frames"
      frameExt="webp"
      stillAt={0.12}
      heightClass="h-[280vh] md:h-[340vh]"
    />
  );
}

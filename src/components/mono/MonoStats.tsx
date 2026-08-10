"use client";

/* /mono — Ерөнхий төлөвлөлт. Chapter 01 of the scroll story: blueprint
   HUD variant — key figures roll in as giant numerals.

   The backdrop is a dedicated 180-frame sequence built from four client
   clips, one per stat point and crossfaded on the quarter boundaries, so
   each figure lands over the footage that proves it (masterplan / green
   courtyard / parking street / finished elevation at dusk). Rebuild with
   `node scripts/build-scroll-frames.mjs plan`.

   The section runs taller than the default chapter so the last point —
   the 2027 handover date — gets the same dwell as the other three. */

import { FINAL } from "@/lib/content";
import { MonoScrollStory } from "./MonoScrollStory";

const POINTS = [
  { n: "01", heading: "506", text: "айлын орон сууц · 4 блок" },
  { n: "02", heading: "85", accent: "%", text: "нийтийн эзэмшлийн талбай — ногоон байгууламж, орон зай" },
  { n: "03", heading: "513", text: "автомашины зогсоол" },
  { n: "04", heading: "2027 · II", text: "улиралд ашиглалтад орно" },
];

export function MonoStats() {
  return (
    <MonoScrollStory
      id="about"
      chapter="01"
      kicker={FINAL.stats.kicker}
      title={FINAL.about.title}
      points={POINTS}
      frameStart={1}
      frameEnd={180}
      frameDir="/plan-frames"
      frameExt="webp"
      stillAt={0.12}
      heightClass="h-[340vh] md:h-[440vh]"
      variant="numbers"
    />
  );
}

"use client";

/* /mono — Ерөнхий төлөвлөлт. Chapter 01 of the scroll story: blueprint
   HUD variant — key figures roll in as giant numerals over the
   sky-descent segment. */

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
      frameEnd={45}
      variant="numbers"
    />
  );
}

"use client";

/* /mono — ELYS concept. Chapter 02 of the scroll story: editorial
   typography variant — the E·L·Y·S acronym letters loom over the
   mid-flight segment while each advantage sequences through. */

import { FINAL } from "@/lib/content";
import { MonoScrollStory } from "./MonoScrollStory";

export function MonoElys() {
  const points = FINAL.elys.items.map((item, i) => ({
    n: `0${i + 1}`,
    heading: item.title,
    text: item.body,
  }));

  return (
    <MonoScrollStory
      id="elys"
      chapter="02"
      kicker={FINAL.elys.kicker}
      title={FINAL.elys.title}
      points={points}
      frameStart={45}
      frameEnd={85}
      variant="letters"
    />
  );
}

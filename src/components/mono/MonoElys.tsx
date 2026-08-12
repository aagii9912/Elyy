"use client";

/* /mono — ELYS concept. Chapter 02 of the scroll story: editorial
   typography variant — the E·L·Y·S acronym letters loom over the
   mid-flight segment while each advantage sequences through. */

import type { SiteContent } from "@/lib/site-content";
import { MonoScrollStory } from "./MonoScrollStory";

export function MonoElys({ site }: { site: SiteContent }) {
  const points = site.elys.items.map((item, i) => ({
    n: String(i + 1).padStart(2, "0"),
    heading: item.title,
    text: item.body,
  }));

  return (
    <MonoScrollStory
      id="elys"
      chapter="02"
      kicker={site.elys.kicker}
      title={site.elys.title}
      points={points}
      frameStart={45}
      frameEnd={85}
      variant="letters"
    />
  );
}

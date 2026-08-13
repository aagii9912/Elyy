"use client";

/* /mono — Үндсэн бүтээц. Chapter 03 of the scroll story:
   engineering-callout variant — lime pins on the facade close-up
   (frames 85–121) with connector lines drawing toward sharp spec
   cards. Each card can link out to the maker's product page. */

import type { SiteContent } from "@/lib/site-content";
import { MonoScrollStory } from "./MonoScrollStory";

export function MonoEquip({ site }: { site: SiteContent }) {
  const points = site.equip.items.map((item, i) => ({
    n: String(i + 1).padStart(2, "0"),
    heading: item.title,
    text: item.body,
    link: item.link,
  }));

  return (
    <MonoScrollStory
      id="equip"
      chapter="03"
      kicker={site.equip.kicker}
      title={site.equip.title}
      points={points}
      frameStart={85}
      frameEnd={121}
      variant="callouts"
    />
  );
}

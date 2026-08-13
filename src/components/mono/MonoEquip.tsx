"use client";

/* /mono — Барилгын бүтэц. Chapter 03 of the scroll story:
   engineering-callout variant over the construction footage
   (public/structure-frames — bare monolithic frame → Veka windows →
   Yaret facade cladding). Point copy (title/body/link) comes from the
   admin site content; the pin anchor and white brand mark for each
   point are matched by brand keyword below, so admin edits and
   reordering keep working. */

import type { SiteContent } from "@/lib/site-content";
import { MonoScrollStory, type StoryPoint } from "./MonoScrollStory";

/* Presentation per known brand/material — the pin sits on the element
   the footage shows while the point is active. Unmatched items fall
   back to the shared anchor cycle with no mark. */
const PRESETS: Array<{
  match: RegExp;
  logo?: StoryPoint["logo"];
  anchor?: StoryPoint["anchor"];
}> = [
  {
    // bare concrete skeleton — pin mid-frame on the cast floors
    match: /цутгамал/i,
    logo: { alt: "Elysium Residence", mark: true },
    anchor: { x: 22, y: 52 },
  },
  {
    // glazing goes in — pin on the fresh window band
    match: /veka|цонх/i,
    logo: { src: "/brand/veka-mark.png", alt: "VEKA" },
    anchor: { x: 31, y: 38 },
  },
  {
    // composite panels cladding the tower — pin on the finished facade
    match: /yaret|фасад/i,
    logo: { src: "/brand/yaret-mark.png", alt: "Yaret Group" },
    anchor: { x: 16, y: 30 },
  },
];

export function MonoEquip({ site }: { site: SiteContent }) {
  const points: StoryPoint[] = site.equip.items.map((item, i) => {
    const preset = PRESETS.find((p) => p.match.test(item.title));
    return {
      n: String(i + 1).padStart(2, "0"),
      heading: item.title,
      text: item.body,
      link: item.link,
      logo: preset?.logo,
      anchor: preset?.anchor,
    };
  });

  return (
    <MonoScrollStory
      id="equip"
      chapter="03"
      kicker={site.equip.kicker}
      title={site.equip.title}
      points={points}
      frameStart={1}
      frameEnd={120}
      frameDir="/structure-frames"
      frameExt="webp"
      variant="callouts"
    />
  );
}

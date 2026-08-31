"use client";

/* /mono — Ерөнхий төлөвлөлт. Chapter 01 of the scroll story: blueprint
   HUD variant — key figures roll in as giant numerals.

   The backdrop is a dedicated 180-frame sequence built from four client
   clips, one per stat point and crossfaded on the quarter boundaries, so
   each figure lands over the footage that proves it (masterplan / green
   courtyard / parking street / finished elevation at dusk). Rebuild with
   `node scripts/build-scroll-frames.mjs plan`.

   `tone="dark"` — энэ бүлэг богино хугацаанд `light` байсан (цагаан
   хөшиг + бараан бичиг), гэвч цагаан хөшиг нь захиалагчийн рендерүүдийг
   бүдгэрүүлж, бүлгийн эхлэл/төгсгөлийн хөшиг нь бүтэн дэлгэц цагаан
   болгодог байсан тул буцаав. Одоо кадрууд бүрэн өнгөөрөө харагдаж,
   бичиг цагаанаараа уншигдана.

   ТАЙЛБАРЫН БИЧВЭР: `points[].text` доторх ` · ` эсвэл ` — ` салгагч нь
   мөрийг «нэр томьёо / дэлгэрэнгүй» болгон хуваана (`MonoScrollStory →
   specOf`). Ж: «айлын орон сууц · 4 блок» → АЙЛЫН ОРОН СУУЦ + «4 блок».
   Салгагчгүй бол ганц мөр болж үлдэнэ.

   The section runs taller than the default chapter so the last point —
   the 2027 handover date — gets the same dwell as the other three. Тэр
   зайг гараар гүйлгэх нь ядаргаатай тул эхний гүйлтийн дараа бүлэг
   өөрөө тоглоно (`autoplaySeconds`). */

import type { SiteContent } from "@/lib/site-content";
import { MonoScrollStory } from "./MonoScrollStory";
import { mediaFilmStyle, sectionTone } from "@/lib/theme-css";

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
      /* ~2.4 дэлгэц / 13сек — цэг тутамд ~2.4сек уншиж амжина. */
      autoplaySeconds={13}
      bgKey="stats"
      tone={sectionTone(site.theme, "stats", "dark")}
      film={mediaFilmStyle(site.theme, "stats")}
    />
  );
}

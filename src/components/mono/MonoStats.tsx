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
import { sectionTone } from "@/lib/theme-css";

/* МОБАЙЛ: кадрын дарааллын оронд цэг бүрд нэг рендер (индексээрээ
   `plan.points`-т харгалзана). Эх нь `public/images` дахь бүрэн
   хэмжээтэй рендерүүд — эндхийнх нь 1400px өндөртэй, шахсан хуулбар
   (`plan-mobile/`), учир нь мобайл 4 зургийг зэрэг татна. */
const PLAN_STILLS = [
  "/images/plan-mobile/plan-01.jpg", // 506 айл — 4 блокийг агаараас
  "/images/plan-mobile/plan-02.jpg", // 85% — гаднах ногоон талбай
  "/images/plan-mobile/plan-03.jpg", // 513 зогсоол — оролцын гудамж, зогсоолын хэсэг
  "/images/plan-mobile/plan-04.jpg", // 2027·II — фасадын үндсэн өнцөг
];

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
      pointImages={PLAN_STILLS}
      heightClass="h-[280vh] md:h-[340vh]"
      /* ~2.4 дэлгэц / 13сек — цэг тутамд ~2.4сек уншиж амжина. */
      autoplaySeconds={13}
      bgKey="stats"
      tone={sectionTone(site.theme, "stats", "dark")}
    />
  );
}

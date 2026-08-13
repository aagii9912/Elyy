"use client";

/* /mono — ELYS concept. Chapter 02: hover/tap stack interactor — the
   E·L·Y·S advantages drive a GSAP clip-path collage of client renders
   (interior / courtyard / entrance street / tower crown). Sits between
   the two pinned scroll-story chapters on the same night ground, so the
   dark bridge out of chapter 01 and into chapter 03 stays seamless. */

import type { SiteContent } from "@/lib/site-content";
import { MonoKicker } from "./shared";
import {
  ConnoisseurStackInteractor,
  type StackItem,
} from "@/components/ui/connoisseur-stack-interactor";

/* client renders + mask shape per advantage, keyed by site.elys.items order */
const MEDIA: Array<Pick<StackItem, "clipId" | "image" | "alt">> = [
  {
    // Ergonomic Standards — эргономик төлөвлөлттэй дотоод орчин
    clipId: "elys-clip-bands",
    image: "/images/elys/ergonomic-interior.jpg",
    alt: "Эргономик төлөвлөлттэй дотоод орчин",
  },
  {
    // Live in Harmony — ногоон байгууламжтай хотхоны орчин
    clipId: "elys-clip-blocks",
    image: "/images/elys/harmony-courtyard.jpg",
    alt: "Ногоон байгууламж бүхий хотхоны орчин",
  },
  {
    // Your Safety — хяналттай орц, нэвтрэлтийн орчин
    clipId: "elys-clip-pixels",
    image: "/images/amenity-retail-podium.jpg",
    alt: "Оршин суугчдын орц ба үйлчилгээний давхар",
  },
  {
    // Save Big — эрчим хүчний хэмнэлттэй фасад
    clipId: "elys-clip-columns",
    image: "/images/elys/efficiency-tower-crown.jpg",
    alt: "ELYSIUM цамхагийн эрчим хүчний хэмнэлттэй фасад",
  },
];

export function MonoElys({ site }: { site: SiteContent }) {
  const items: StackItem[] = site.elys.items.map((item, i) => ({
    num: String(i + 1).padStart(2, "0"),
    name: item.title,
    body: item.body,
    ...MEDIA[i % MEDIA.length],
  }));

  return (
    <section id="elys" className="relative bg-night text-white">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-24 md:px-10 md:pb-28 md:pt-32">
        <MonoKicker tone="dark" reveal>
          02 — {site.elys.kicker}
        </MonoKicker>
        <h2
          data-reveal="heading"
          className="mt-4 max-w-2xl text-[clamp(1.9rem,4vw,3.2rem)] font-extrabold leading-[1.05] tracking-tight"
        >
          {site.elys.title}
        </h2>

        <div data-reveal="up" data-reveal-delay="0.1">
          <ConnoisseurStackInteractor items={items} className="mt-12 md:mt-16" />
        </div>
      </div>
    </section>
  );
}

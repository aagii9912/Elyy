"use client";

import { Reveal } from "@/components/Reveal";
import { ApartmentsCarousel, type ApartmentSlide } from "@/components/final/ApartmentsCarousel";
import { FINAL } from "@/lib/content";

// Placeholder axonometric visuals until the client supplies real drawings.
const axonoPlaceholders = [
  "/images/exterior-elevation-dusk.jpg",
  "/images/exterior-garden-path.jpg",
  "/images/amenity-pool-deck.jpg",
  "/images/exterior-cluster-dusk.jpg",
];

// Section heading (no dedicated title field in FINAL.apartments).
const HEADING = "Танд тохирох орон зай";
// Placeholder badge — real axonometric drawings still pending from client.
const BADGE = "Аксно зураг — удахгүй";
// Qualitative planning descriptors per type — derived from the brief, no prices.
const PLANS = [
  "Студи / нэг өрөө",
  "Гэр бүлд тохиромжтой",
  "Уужим зохион байгуулалт",
  "Дээд зэрэглэлийн орон зай",
];

export function FinalApartments() {
  const { kicker, body, types } = FINAL.apartments;

  const slides: ApartmentSlide[] = types.map((t, i) => ({
    title: t.title,
    rooms: t.title,
    area: t.area,
    plan: PLANS[i] ?? "Уян хатан төлөвлөлт",
    image: axonoPlaceholders[i % axonoPlaceholders.length],
    badge: BADGE,
  }));

  return (
    <section
      id="apartments"
      className="scroll-mt-20 overflow-hidden bg-bone py-24 font-gilroy text-ink md:py-36"
    >
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        <Reveal>
          <p className="fnl-kicker text-moss">{kicker}</p>
          <h2 className="mt-4 max-w-3xl text-[clamp(2rem,5vw,4rem)] font-semibold leading-[0.98] tracking-[-0.02em]">
            {HEADING}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/60 md:text-lg">
            {body}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-16 md:mt-24">
          <ApartmentsCarousel slides={slides} />
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import { Reveal } from "@/components/Reveal";
import { ApartmentsCarousel, type ApartmentSlide } from "@/components/final/ApartmentsCarousel";
import { FINAL } from "@/lib/content";
import { AXONO_UNITS, axonoSrc, axonoTitle } from "@/lib/units";

// Section heading (no dedicated title field in FINAL.apartments).
const HEADING = "Танд тохирох орон зай";

// Захиалагчийн ирүүлсэн аксонометр рендерүүд, тип тус бүр 2 өнцөгтэй.
const SLIDES: ApartmentSlide[] = AXONO_UNITS.map((u) => ({
  title: axonoTitle(u),
  rooms: u.rooms,
  area: u.area,
  floor: u.floor,
  plan: u.plan,
  images: u.views.map((v) => axonoSrc(v)),
}));

export function FinalApartments() {
  const { kicker, body } = FINAL.apartments;

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
          <ApartmentsCarousel slides={SLIDES} />
        </Reveal>
      </div>
    </section>
  );
}

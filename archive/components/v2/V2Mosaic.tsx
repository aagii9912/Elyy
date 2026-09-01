"use client";

import { ScrollText } from "@/components/v2/ScrollText";
import { InfiniteGallery } from "@/components/v2/InfiniteGallery";
import { useT } from "@/components/LangProvider";

const rowA = [
  "/images/exterior-elevation-dusk.jpg",
  "/images/amenity-canal-golden.jpg",
  "/images/exterior-plaza-pink.jpg",
  "/images/aerial-masterplan.jpg",
  "/images/amenity-garden-walk.jpg",
  "/images/exterior-snow-courtyard.jpg",
];

const rowB = [
  "/images/exterior-cluster-dusk.jpg",
  "/images/amenity-pool-deck.jpg",
  "/images/aerial-courtyard-water.jpg",
  "/images/exterior-garden-path.jpg",
  "/images/amenity-canal-blue.jpg",
  "/images/exterior-lowangle-towers.jpg",
];

export function V2Mosaic() {
  const t = useT();
  return (
    <section className="overflow-hidden bg-white py-24 text-night md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <ScrollText
            as="h2"
            text={`${t.v2.mosaic.title} ${t.v2.mosaic.body}`}
            className="text-[clamp(1.6rem,3.4vw,3rem)] font-medium leading-[1.16] tracking-[-0.01em]"
          />
        </div>
      </div>

      {/* full-bleed infinite image marquee, two rows drifting opposite ways */}
      <div className="mt-16 flex flex-col gap-4 md:mt-24 md:gap-6">
        <InfiniteGallery images={rowA} duration={48} />
        <InfiniteGallery images={rowB} duration={56} reverse />
      </div>
    </section>
  );
}

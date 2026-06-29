"use client";

import { Reveal } from "@/components/Reveal";
import { RevealImage } from "@/components/RevealImage";
import { ScrollText } from "@/components/v2/ScrollText";
import { useT } from "@/components/LangProvider";

const imgs = [
  "/images/amenity-canal-golden.jpg",
  "/images/exterior-plaza-pink.jpg",
  "/images/amenity-garden-walk.jpg",
  "/images/exterior-snow-courtyard.jpg",
];

export function V2Mosaic() {
  const t = useT();
  return (
    <section className="bg-white py-24 text-night md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <ScrollText
            as="h2"
            text={`${t.v2.mosaic.title} ${t.v2.mosaic.body}`}
            className="text-[clamp(1.6rem,3.4vw,3rem)] font-medium leading-[1.16] tracking-[-0.01em]"
          />
        </div>

        <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {imgs.map((src, i) => (
            <RevealImage
              key={src}
              src={src}
              alt="Elysium"
              sizes="(max-width:768px) 50vw, 25vw"
              className={`aspect-[3/4] ${i % 2 ? "md:mt-12" : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

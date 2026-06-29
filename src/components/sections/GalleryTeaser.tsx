"use client";

import { RevealText } from "@/components/Reveal";
import { RevealImage } from "@/components/RevealImage";
import { GALLERY } from "@/lib/content";
import { useT } from "@/components/LangProvider";

const spans = [
  "md:col-span-7 md:aspect-[16/9]",
  "md:col-span-5 md:aspect-[16/9]",
  "md:col-span-4 md:aspect-[4/5]",
  "md:col-span-4 md:aspect-[4/5]",
  "md:col-span-4 md:aspect-[4/5]",
];

export function GalleryTeaser() {
  const t = useT();
  const imgs = GALLERY.slice(0, 5);
  return (
    <section className="bg-bone py-24 md:py-32">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <p className="overline text-moss">{t.gallery.kicker}</p>
        <RevealText as="h2" text={t.gallery.title} className="mt-5 font-display text-display font-light" />

        <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-5">
          {imgs.map((img, i) => (
            <RevealImage
              key={img.src}
              src={img.src}
              alt={img.alt}
              sizes="(max-width:768px) 50vw, 40vw"
              className={`aspect-square ${spans[i]}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

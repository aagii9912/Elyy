"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Swiper as SwiperType } from "swiper/types";
import { Reveal } from "@/components/Reveal";
import { FinalCarousel } from "@/components/final/FinalCarousel";
import { FINAL } from "@/lib/content";

// Placeholder interior/exterior visuals until the client supplies interior renders.
// All slides render at a uniform big-landscape 3:2 aspect (Lagom peek carousel):
// one dominant photo in view + a peek of the next, no mixed widths.
const galleryImages: string[] = [
  "/images/amenity-pool-deck.jpg",
  "/images/amenity-canal-golden.jpg",
  "/images/exterior-plaza-pink.jpg",
  "/images/aerial-courtyard-water.jpg",
  "/images/amenity-garden-walk.jpg",
  "/images/exterior-elevation-dusk.jpg",
  "/images/amenity-canal-blue.jpg",
  "/images/exterior-cluster-dusk.jpg",
  "/images/aerial-courtyard-promenade.jpg",
];

export function FinalGallery() {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [active, setActive] = useState(0);

  // Respect prefers-reduced-motion: no ambient autoplay drift when opted out.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Uniform big-landscape 3:2 slides — one dominant + a peek of the next.
  const slides = galleryImages.map((src) => (
    <div className="group relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-ink/5">
      <Image
        src={src}
        alt="Elysium Residence"
        fill
        sizes="(max-width:640px) 88vw, (max-width:1024px) 62vw, 70vw"
        className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        draggable={false}
      />
      <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-bone/85 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-ink/60 backdrop-blur-sm">
        Интерьер зураг — удахгүй
      </span>
    </div>
  ));

  return (
    <section id="gallery" className="overflow-hidden bg-bone py-24 font-gilroy text-ink md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        <Reveal>
          <p className="fnl-kicker text-moss">{FINAL.gallery.kicker}</p>
          <h2 className="mt-4 text-[clamp(2rem,5vw,4rem)] font-light leading-[1.02] tracking-[-0.02em]">
            {FINAL.gallery.title}
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-14 md:mt-20">
        {/* Big-landscape peek carousel: one dominant ~70vw slide + peek of next. */}
        <FinalCarousel
          key={reduceMotion ? "static" : "drift"}
          slides={slides}
          loop
          spaceBetween={28}
          // Soft ease-out per-step glide (~900ms) — calm, cinematic advance.
          speed={900}
          autoplay={!reduceMotion}
          autoplaySpeed={5200}
          pauseOnHover
          showPagination={false}
          slideClassName="!w-[88vw] sm:!w-[62vw] lg:!w-[70vw]"
          auto
          className="!overflow-visible !px-5 md:!px-8"
          onSwiper={setSwiper}
          onSlideChange={setActive}
        />

        {/* Controls: NN/NN fraction + text CTAs with arrow icons. */}
        <div className="mx-auto mt-8 flex max-w-[1500px] items-center justify-between gap-6 px-5 md:mt-10 md:px-8">
          <span className="text-sm font-semibold tabular-nums text-ink/45">
            {String(active + 1).padStart(2, "0")}
            <span className="mx-1.5 text-ink/25">/</span>
            {String(galleryImages.length).padStart(2, "0")}
          </span>

          <div className="flex items-center gap-8">
            <button
              type="button"
              data-cursor-hover
              onClick={() => swiper?.slidePrev()}
              className="group flex items-center gap-2 text-base font-semibold text-ink/70 transition-colors hover:text-ink"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Өмнөх
            </button>
            <button
              type="button"
              data-cursor-hover
              onClick={() => swiper?.slideNext()}
              className="group flex items-center gap-2 text-base font-semibold text-ink/70 transition-colors hover:text-ink"
            >
              Дараах
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

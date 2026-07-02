"use client";

import { useT } from "@/components/LangProvider";
import { Reveal } from "@/components/Reveal";
import { Counter } from "@/components/Counter";
import { LagomGallery } from "@/components/lagom/LagomGallery";
import { LagomReveal } from "@/components/lagom/LagomReveal";

export function LagomProjects() {
  const t = useT();

  const blocks = [
    {
      index: "01",
      label: "Residences",
      title: t.apartments.types[0].title,
      facts: [t.apartments.types[0].body, t.apartments.types[1].body],
      images: [
        "/images/exterior-elevation-dusk.jpg",
        "/images/exterior-garden-path.jpg",
        "/images/amenity-garden-walk.jpg",
        "/images/exterior-plaza-pink.jpg",
        "/images/aerial-courtyard-water.jpg",
      ],
      stat: t.stats[0],
      reverse: false,
    },
    {
      index: "02",
      label: "Premium",
      title: t.apartments.types[3].title,
      facts: [t.apartments.types[2].body, t.apartments.types[3].body],
      images: [
        "/images/exterior-cluster-dusk.jpg",
        "/images/exterior-lowangle-towers.jpg",
        "/images/amenity-pool-deck.jpg",
        "/images/exterior-towers-winter.jpg",
        "/images/aerial-courtyard-promenade.jpg",
      ],
      stat: t.stats[1],
      reverse: true,
    },
  ];

  return (
    <section id="apartments" className="scroll-mt-20 bg-lagom-cream py-24 md:py-32">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        {/* section heading */}
        <Reveal className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-5">
            <span className="lagom-num text-xl md:text-2xl">003</span>
            <h2 className="lagom-display max-w-2xl text-[clamp(2.4rem,6vw,5rem)] leading-[0.95]">
              {t.apartments.title}
            </h2>
          </div>
          <span className="mt-2 hidden text-lagom-ink/40 md:block" aria-hidden>↗</span>
        </Reveal>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-lagom-ink/55 md:text-lg">
          {t.apartments.body}
        </p>

        {/* project blocks — info (left) + 5-image gallery (right), like lagom */}
        <div className="mt-16 flex flex-col gap-20 md:mt-24 md:gap-28">
          {blocks.map((b) => (
            <div key={b.index} className="grid items-center gap-10 md:gap-14 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
              {/* info */}
              <LagomReveal variant="text" className={b.reverse ? "md:order-2" : "md:order-1"}>
                <div className="flex items-baseline gap-2">
                  <span className="lagom-display text-7xl leading-none md:text-8xl">{b.index}</span>
                  <span className="lagom-num text-lg text-lagom-ink/35">/02</span>
                </div>

                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-lagom-orange">
                  {b.label}
                </p>
                <h3 className="lagom-display mt-2 text-[clamp(1.9rem,4vw,3rem)] leading-tight">
                  {b.title}
                </h3>

                <ul className="mt-7 border-t border-lagom-ink/12">
                  {b.facts.map((fact, fi) => (
                    <li
                      key={fi}
                      className="flex items-center justify-between gap-4 border-b border-lagom-ink/12 py-4 text-base md:text-lg"
                    >
                      <span className="text-lagom-ink/45">{String(fi + 1).padStart(2, "0")}</span>
                      <span className="flex-1 text-right font-medium text-lagom-ink">{fact}</span>
                    </li>
                  ))}
                </ul>

                <a href="#contact" className="lagom-btn lagom-btn--ghost mt-9 w-fit">
                  {t.cta}
                  <span className="lagom-btn__arrow" aria-hidden>↗</span>
                </a>
              </LagomReveal>

              {/* gallery (Swiper) with availability badge — clip-wipe reveal */}
              <div className={`min-w-0 ${b.reverse ? "md:order-1" : "md:order-2"}`}>
                <LagomReveal variant="image" className="relative h-[64vw] max-h-[560px] w-full overflow-hidden md:h-[560px]">
                  <LagomGallery images={b.images} sizes="(max-width:768px) 100vw, 840px" />
                  <div className="pointer-events-none absolute left-0 top-0 z-20 flex flex-col gap-1 bg-lagom-card px-6 py-4">
                    <span className="lagom-display text-3xl leading-none text-lagom-orange md:text-4xl">
                      {b.stat.value !== undefined ? (
                        <Counter value={b.stat.value} suffix={b.stat.suffix ?? ""} />
                      ) : (
                        <>{b.stat.text}</>
                      )}
                    </span>
                    <span className="max-w-[14ch] text-xs font-semibold uppercase tracking-wide text-lagom-ink/55">
                      {b.stat.label}
                    </span>
                  </div>
                </LagomReveal>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

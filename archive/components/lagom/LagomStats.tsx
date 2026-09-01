"use client";

import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { LagomReveal } from "@/components/lagom/LagomReveal";
import { Counter } from "@/components/Counter";
import { useT } from "@/components/LangProvider";

export function LagomStats() {
  const t = useT();

  return (
    <section id="why" className="scroll-mt-20 bg-lagom-cream py-24 text-lagom-ink md:py-32">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        {/* Intro */}
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Reveal>
              <span className="lagom-num text-xl md:text-2xl">002</span>
            </Reveal>
            <Reveal delay={0.08}>
              <h2
                className="lagom-display mt-5 max-w-[15ch] leading-[1.04]"
                style={{ fontSize: "clamp(1.8rem, 4vw, 3.5rem)" }}
              >
                {t.intro.title}
              </h2>
            </Reveal>
          </div>
          <div className="md:col-span-5">
            <Reveal delay={0.16}>
              <p className="max-w-xl text-base leading-relaxed text-lagom-ink/70 md:text-lg">
                {t.intro.body}
              </p>
            </Reveal>
          </div>
        </div>

        {/* Stat cards + one photo card */}
        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-lagom-ink/10 bg-lagom-ink/10 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
          {t.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="flex h-full min-h-[200px] flex-col justify-between bg-lagom-card p-7 md:min-h-[260px] md:p-8">
                <span
                  className="lagom-display leading-none"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
                >
                  {typeof stat.value === "number" ? (
                    <Counter value={stat.value} suffix={stat.suffix} />
                  ) : (
                    stat.text
                  )}
                </span>
                <span className="mt-6 max-w-[22ch] text-sm leading-snug text-lagom-ink/55">
                  {stat.label}
                </span>
              </div>
            </Reveal>
          ))}

          {/* Photo card mixed in among the stats — clip-wipe reveal */}
          <LagomReveal variant="image" className="relative h-full min-h-[200px] overflow-hidden bg-lagom-card md:min-h-[260px]">
            <Image
              src="/images/amenity-garden-walk.jpg"
              alt="Elysium"
              fill
              sizes="(max-width:768px) 100vw, 25vw"
              className="object-cover"
            />
          </LagomReveal>
        </div>
      </div>
    </section>
  );
}

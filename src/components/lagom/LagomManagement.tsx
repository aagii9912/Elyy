"use client";

import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { LagomReveal } from "@/components/lagom/LagomReveal";
import { useT } from "@/components/LangProvider";

export function LagomManagement() {
  const t = useT();
  const { title, body, items } = t.advantages;

  return (
    <section id="advantages" className="scroll-mt-20 bg-lagom-card py-24 md:py-32">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        {/* header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Reveal>
              <span className="lagom-num text-xl md:text-2xl">005</span>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="lagom-display mt-4 text-[clamp(2rem,5vw,3.75rem)] leading-[0.95]">
                {title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.16} className="max-w-md">
            <p className="text-lagom-ink/65 md:text-lg">{body}</p>
          </Reveal>
        </div>

        {/* photo + grid */}
        <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <LagomReveal variant="image" className="relative aspect-[4/3] overflow-hidden lg:aspect-[3/4]">
              <Image
                src="/images/amenity-pool-deck.jpg"
                alt="Elysium"
                fill
                sizes="(max-width:1024px) 100vw, 40vw"
                className="object-cover"
              />
            </LagomReveal>
          </div>

          <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
            {items.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="flex flex-col gap-3 border-t border-lagom-ink/10 pt-6">
                  <span
                    className="text-lagom-orange text-lg font-extrabold"
                    style={{ fontFamily: "var(--font-mulish)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="lagom-display text-[1.25rem] leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-lagom-ink/65 leading-relaxed">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

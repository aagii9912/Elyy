"use client";

import { Counter } from "@/components/Counter";
import { Reveal } from "@/components/Reveal";
import { ScrollText } from "@/components/v2/ScrollText";
import { useT } from "@/components/LangProvider";

export function V2Why() {
  const t = useT();
  return (
    <section id="why" className="scroll-mt-20 bg-white py-28 text-night md:py-40">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="grid gap-y-10 md:grid-cols-[200px_1fr] md:gap-x-12">
          <p className="find-label text-night/50 md:pt-2">{t.v2.why.kicker}</p>
          <div>
            <ScrollText
              as="h2"
              text={`${t.v2.why.title} ${t.v2.why.body}`}
              className="max-w-[24ch] text-[clamp(1.6rem,3vw,2.75rem)] font-medium leading-[1.18] tracking-[-0.01em]"
            />
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-12 border-t border-night/10 pt-14 md:grid-cols-4">
          {t.stats.map((stat, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <p className="find-display text-[clamp(2.5rem,5vw,4.25rem)] leading-none">
                {typeof stat.value === "number" ? <Counter value={stat.value} suffix={stat.suffix} /> : stat.text}
              </p>
              <p className="mt-3 max-w-[16ch] text-sm text-night/55">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

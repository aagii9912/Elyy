"use client";

import { Counter } from "@/components/Counter";
import { Reveal } from "@/components/Reveal";
import { useT } from "@/components/LangProvider";

export function Stats() {
  const t = useT();
  return (
    <section className="bg-ink text-bone">
      <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
          {t.stats.map((stat, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="border-t border-bone/15 pt-6">
                <p className="font-display text-[clamp(2.5rem,6vw,5rem)] font-light leading-none">
                  {typeof stat.value === "number" ? (
                    <Counter value={stat.value} suffix={stat.suffix} />
                  ) : (
                    stat.text
                  )}
                </p>
                <p className="mt-4 max-w-[16ch] text-sm text-bone/60">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

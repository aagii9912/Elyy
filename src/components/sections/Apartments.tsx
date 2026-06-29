"use client";

import { Reveal, RevealText } from "@/components/Reveal";
import { InteriorPlaceholder } from "@/components/Placeholders";
import { useT } from "@/components/LangProvider";

export function Apartments() {
  const t = useT();
  return (
    <section id="apartments" className="scroll-mt-24 bg-sand py-24 md:py-32">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="max-w-3xl">
          <p className="overline text-moss">{t.apartments.kicker}</p>
          <RevealText
            as="h2"
            text={t.apartments.title}
            className="mt-5 font-display text-display font-light"
          />
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed text-taupe">{t.apartments.body}</p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.apartments.types.map((type, i) => (
            <Reveal key={type.title} delay={i * 0.06}>
              <div className="group">
                <InteriorPlaceholder
                  className="aspect-[4/5] w-full"
                  label={t.apartments.placeholder}
                />
                <h3 className="mt-5 font-display text-title font-light">{type.title}</h3>
                <p className="mt-2 text-sm text-taupe">{type.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-12 text-sm text-stone">{t.apartments.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import { Reveal, RevealText } from "@/components/Reveal";
import { useT } from "@/components/LangProvider";

export function Articles() {
  const t = useT();
  return (
    <section id="articles" className="scroll-mt-24 bg-sand py-24 md:py-32">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <p className="overline text-moss">{t.articles.kicker}</p>
        <RevealText as="h2" text={t.articles.title} className="mt-5 font-display text-display font-light" />
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-taupe">{t.articles.body}</p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="flex aspect-[4/3] items-center justify-center border border-clay/60 bg-bone">
                <span className="overline text-stone">{t.articles.soon}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

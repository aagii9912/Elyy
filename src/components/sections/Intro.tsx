"use client";

import { Reveal, RevealText } from "@/components/Reveal";
import { useT } from "@/components/LangProvider";

export function Intro() {
  const t = useT();
  return (
    <section className="bg-bone py-28 md:py-40">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="overline text-taupe">{t.intro.kicker}</p>
              <span className="mt-6 block h-px w-16 bg-gold" />
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <RevealText
              as="h2"
              text={t.intro.title}
              className="max-w-4xl font-display text-display font-light leading-[1.05]"
            />
            <Reveal delay={0.15}>
              <p className="mt-10 max-w-2xl text-lg leading-relaxed text-taupe">{t.intro.body}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

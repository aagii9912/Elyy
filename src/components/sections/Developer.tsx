"use client";

import { Reveal, RevealText } from "@/components/Reveal";
import { VideoPlaceholder } from "@/components/Placeholders";
import { useT } from "@/components/LangProvider";

export function Developer() {
  const t = useT();
  return (
    <section id="developer" className="scroll-mt-24 bg-bone py-24 md:py-32">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 md:grid-cols-2 md:gap-16 md:px-10">
        <div className="flex flex-col justify-center">
          <p className="overline text-moss">{t.developer.kicker}</p>
          <RevealText
            as="h2"
            text={t.developer.title}
            className="mt-5 font-display text-display font-light"
          />
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-taupe">{t.developer.body}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-9 overline text-stone">{t.developer.label}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {t.developer.projects.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-ink/20 px-5 py-2 text-sm tracking-wide"
                >
                  {p}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <VideoPlaceholder className="aspect-[4/3] w-full" label={t.developer.tour} />
        </Reveal>
      </div>
    </section>
  );
}

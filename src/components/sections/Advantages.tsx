"use client";

import { Marquee } from "@/components/Marquee";
import { Reveal, RevealText } from "@/components/Reveal";
import { useT } from "@/components/LangProvider";

export function Advantages() {
  const t = useT();
  return (
    <section id="advantages" className="scroll-mt-24 bg-bone py-24 md:py-32">
      <Marquee
        items={t.advantages.items.map((i) => i.title)}
        className="border-y border-ink/10 py-7 text-ink/90"
      />

      <div className="mx-auto mt-20 max-w-[1600px] px-5 md:mt-28 md:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="overline text-moss">{t.advantages.kicker}</p>
            <RevealText
              as="h2"
              text={t.advantages.title}
              className="mt-5 font-display text-display font-light"
            />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-sm text-taupe">{t.advantages.body}</p>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <ul className="border-t border-ink/10">
              {t.advantages.items.map((item, i) => (
                <Reveal as="li" key={item.title} delay={i * 0.05} className="border-b border-ink/10">
                  <div className="flex flex-col gap-2 py-7 md:flex-row md:items-baseline md:gap-10">
                    <span className="font-display text-xl text-moss md:w-12">0{i + 1}</span>
                    <h3 className="font-display text-title font-light md:w-1/3">{item.title}</h3>
                    <p className="text-taupe md:flex-1">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

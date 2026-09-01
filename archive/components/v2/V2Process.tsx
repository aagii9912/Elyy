"use client";

import { useLenis } from "lenis/react";
import { Reveal } from "@/components/Reveal";
import { ScrollText } from "@/components/v2/ScrollText";
import { useT } from "@/components/LangProvider";

export function V2Process() {
  const t = useT();
  const lenis = useLenis();
  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -70 });
    else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="from-abroad" className="scroll-mt-20 bg-paper py-24 text-night md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="find-label text-night/50">{t.v2.process.kicker}</p>
            <ScrollText
              as="h2"
              text={t.v2.process.title}
              className="mt-5 find-display text-[clamp(2.25rem,5.5vw,4.75rem)]"
            />
          </div>
          <a href="#contact" onClick={(e) => go(e, "#contact")} data-cursor-hover className="find-pill find-pill--solid">
            {t.v2.process.cta}
            <span className="find-pill__arrow" aria-hidden>→</span>
          </a>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden border-t border-night/15 md:grid-cols-3">
          {t.v2.process.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="flex h-full flex-col border-night/15 py-10 md:border-l md:px-10 md:first:border-l-0 md:first:pl-0">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-night/30 text-sm">
                  {i + 1}
                </span>
                <h3 className="mt-8 find-display text-[clamp(1.5rem,2.4vw,2rem)]">{step.title}</h3>
                <p className="mt-4 leading-relaxed text-night/60">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useLenis } from "lenis/react";
import { Reveal, RevealText } from "@/components/Reveal";
import { RevealImage } from "@/components/RevealImage";
import { MagneticButton } from "@/components/MagneticButton";
import { useT } from "@/components/LangProvider";

export function FromAbroad() {
  const t = useT();
  const lenis = useLenis();
  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -80 });
    else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="from-abroad" className="scroll-mt-24 bg-bone py-24 md:py-32">
      <div className="mx-auto grid max-w-[1600px] items-center gap-12 px-5 md:grid-cols-2 md:gap-16 md:px-10">
        <RevealImage
          src="/images/aerial-masterplan.jpg"
          alt="Elysium"
          sizes="(max-width:768px) 100vw, 50vw"
          className="aspect-[4/3]"
        />
        <div>
          <p className="overline text-moss">{t.fromAbroad.kicker}</p>
          <RevealText as="h2" text={t.fromAbroad.title} className="mt-5 font-display text-display font-light" />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-taupe">{t.fromAbroad.body}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <ul className="mt-8 space-y-3">
              {t.fromAbroad.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-taupe">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.2}>
            <MagneticButton
              href="#contact"
              onClick={(e) => go(e, "#contact")}
              className="mt-10 inline-flex rounded-full bg-ink px-8 py-4 text-sm tracking-wide text-bone"
            >
              {t.cta}
            </MagneticButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import { RevealText } from "@/components/Reveal";
import { MagneticButton } from "@/components/MagneticButton";
import { HERO_IMAGE, SITE } from "@/lib/content";
import { useT } from "@/components/LangProvider";

export function Hero() {
  const t = useT();
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -80 });
      else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(bg.current, { scale: 1.18, duration: 2, ease: "power3.out" });
      gsap.to(bg.current, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-fade]", { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.5 });
      gsap.to("[data-hero-cue]", { y: 9, repeat: -1, yoyo: true, duration: 1.2, ease: "sine.inOut" });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="top" ref={root} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <div ref={bg} className="absolute inset-x-0 -top-[8%] z-0 h-[116%] will-change-transform">
        <Image src={HERO_IMAGE} alt={SITE.name} fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/45 via-black/5 to-black/60" />

      <div className="relative z-20 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-20 text-bone md:px-10 md:pb-24">
        <p data-hero-fade className="fade-up overline text-bone/80">{t.hero.kicker}</p>
        <RevealText as="h1" text={t.hero.title} className="mt-5 max-w-5xl font-display text-hero font-light" delay={0.35} />
        <p data-hero-fade className="fade-up mt-7 max-w-xl text-lg leading-relaxed text-bone/85">
          {t.hero.subtitle}
        </p>
        <div data-hero-fade className="fade-up mt-9 flex flex-wrap gap-4">
          <MagneticButton href="#contact" onClick={(e) => go(e, "#contact")} className="rounded-full bg-bone px-8 py-4 text-sm tracking-wide text-ink">
            {t.hero.primary}
          </MagneticButton>
          <MagneticButton href="#apartments" onClick={(e) => go(e, "#apartments")} className="rounded-full border border-bone/50 px-8 py-4 text-sm tracking-wide text-bone">
            {t.hero.secondary}
          </MagneticButton>
        </div>
      </div>

      <div data-hero-cue className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-bone/70">
        <span className="overline">{t.hero.scroll}</span>
        <span className="h-10 w-px bg-bone/50" />
      </div>
    </section>
  );
}

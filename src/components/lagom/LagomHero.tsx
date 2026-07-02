"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import { useT } from "@/components/LangProvider";
import { HERO_IMAGE, SITE } from "@/lib/content";

export function LagomHero() {
  const t = useT();
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -80 });
    else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(bg.current, { scale: 1.18, duration: 2.4, ease: "power3.out" });
      gsap.to(bg.current, {
        yPercent: 14,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.from("[data-lg]", { y: 30, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.4 });
      // wordmark letters rise
      gsap.from("[data-lg-mark]", { yPercent: 120, opacity: 0, duration: 1.3, ease: "power4.out", delay: 0.25 });
      gsap.to("[data-lg-cue]", { y: 9, repeat: -1, yoyo: true, duration: 1.2, ease: "sine.inOut" });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="lgtop" ref={root} className="relative flex h-[100svh] min-h-[640px] w-full flex-col overflow-hidden bg-lagom-ink">
      <div ref={bg} className="absolute inset-x-0 -top-[6%] z-0 h-[112%] will-change-transform">
        <Image src={HERO_IMAGE} alt={SITE.name} fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/30 via-transparent to-black/55" />

      {/* top row: section index + corner arrow */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] items-start justify-between px-5 pt-24 md:px-8">
        <span data-lg className="lagom-num text-2xl !text-white/70">001</span>
        <span data-lg className="text-white/70" aria-hidden>↗</span>
      </div>

      {/* giant wordmark */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 items-center px-5 md:px-8">
        <div className="overflow-hidden">
          <h1 data-lg-mark className="lagom-display text-lagom-cream text-[clamp(4rem,21vw,20rem)] leading-[0.82]">
            {SITE.name.toUpperCase()}
          </h1>
        </div>
      </div>

      {/* bottom: tagline + CTA */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-5 pb-14 md:flex-row md:items-end md:justify-between md:px-8">
        <p data-lg className="max-w-md text-2xl font-semibold leading-snug text-white md:text-3xl" style={{ fontFamily: "var(--font-mulish)" }}>
          {t.hero.title}
        </p>
        <a href="#contact" onClick={(e) => go(e, "#contact")} data-cursor-hover data-lg className="lagom-btn w-fit">
          {t.cta}
          <span className="lagom-btn__arrow" aria-hidden>↗</span>
        </a>
      </div>

      <div data-lg-cue className="absolute bottom-6 left-1/2 z-10 h-9 w-px -translate-x-1/2 bg-white/50" />
    </section>
  );
}

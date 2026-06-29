"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import { RevealText } from "@/components/Reveal";
import { useT } from "@/components/LangProvider";
import { HERO_IMAGE, SITE } from "@/lib/content";

/* A different vantage point (looking up the towers) shown clipped inside the
   ELYSIUM wordmark during the hero's second scroll phase. */
const WORDMARK_IMAGE = "/images/exterior-lowangle-towers.jpg";

export function V2Hero() {
  const t = useT();
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const wordmark = useRef<HTMLDivElement>(null);
  const whiteout = useRef<HTMLDivElement>(null);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -70 });
    else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(bg.current, { scale: 1.15, duration: 2.2, ease: "power3.out" });
      gsap.from("[data-v2fade]", { y: 26, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.4 });
      gsap.to("[data-v2cue]", { y: 9, repeat: -1, yoyo: true, duration: 1.2, ease: "sine.inOut" });

      // drifting fog layers
      gsap.utils.toArray<HTMLElement>(".v2-fog").forEach((el, i) => {
        gsap.to(el, {
          xPercent: i % 2 ? 18 : -18,
          yPercent: i % 2 ? -8 : 8,
          scale: 1.15,
          opacity: i % 2 ? 0.5 : 0.75,
          duration: 16 + i * 5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      // Scroll-driven two-phase sequence (CSS-sticky pinned):
      // 1) headline over the building  →  2) whiteout + ELYSIUM wordmark with
      //    the building texture clipped inside the letters.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true },
      });
      tl.to(bg.current, { yPercent: 14, ease: "none" }, 0)
        .to(intro.current, { opacity: 0, yPercent: -12, ease: "none" }, 0)
        .to(whiteout.current, { opacity: 1, ease: "none" }, 0.12)
        .fromTo(
          wordmark.current,
          { opacity: 0, scale: 1.12 },
          { opacity: 1, scale: 1, ease: "none" },
          0.32
        )
        .to(".v2-wordmark-bg", { backgroundPositionY: "60%", ease: "none" }, 0.32);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="v2top" ref={root} className="relative h-[220vh] bg-night">
      <div className="sticky top-0 flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden">
        <div ref={bg} className="absolute inset-x-0 -top-[8%] z-0 h-[116%] will-change-transform">
          <Image src={HERO_IMAGE} alt={SITE.name} fill priority sizes="100vw" className="object-cover" />
        </div>

        {/* atmospheric fog / cloud layers */}
        <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
          <div className="v2-fog absolute -left-[10%] top-[12%] h-[55vh] w-[60vw] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.85),transparent_62%)] opacity-60 blur-3xl mix-blend-screen" />
          <div className="v2-fog absolute right-[-12%] top-[28%] h-[60vh] w-[55vw] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7),transparent_60%)] opacity-50 blur-3xl mix-blend-screen" />
          <div className="v2-fog absolute bottom-[-10%] left-[20%] h-[55vh] w-[70vw] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.6),transparent_60%)] opacity-50 blur-3xl mix-blend-soft-light" />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/15 to-black/60" />

        {/* whiteout backdrop for the wordmark phase */}
        <div ref={whiteout} className="pointer-events-none absolute inset-0 z-[15] bg-white opacity-0" />

        {/* phase 2 — ELYSIUM wordmark with the building image clipped inside */}
        <div ref={wordmark} className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center opacity-0">
          <span
            className="v2-wordmark-bg find-display select-none text-center uppercase leading-[0.82] text-[clamp(4rem,21vw,19rem)]"
            style={{
              backgroundImage: `url(${WORDMARK_IMAGE})`,
              backgroundSize: "155% auto",
              backgroundPosition: "center 42%",
              backgroundRepeat: "no-repeat",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            {SITE.name}
          </span>
          <span className="mt-2 find-label tracking-[0.4em] text-night/55 sm:mt-4">RESIDENCES · ULAANBAATAR</span>
        </div>

        {/* phase 1 — headline + CTA */}
        <div ref={intro} className="relative z-20 mx-auto max-w-5xl px-5 text-center text-white">
          <p data-v2fade className="find-label text-white/75">{SITE.name} · Ulaanbaatar</p>
          <RevealText
            as="h1"
            text={t.v2.hero.headline}
            className="find-display mx-auto mt-6 max-w-4xl text-[clamp(3rem,8.5vw,7.5rem)]"
            stagger={0.1}
          />
          <p data-v2fade className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-white/85">{t.v2.hero.sub}</p>
          <div data-v2fade className="mt-11 flex flex-wrap items-center justify-center gap-5">
            <a href="#services" onClick={(e) => go(e, "#services")} data-cursor-hover className="find-pill find-pill--light">
              {t.v2.hero.primary}
              <span className="find-pill__arrow" aria-hidden>→</span>
            </a>
            <a
              href="#contact"
              onClick={(e) => go(e, "#contact")}
              data-cursor-hover
              className="inline-flex items-center gap-2 text-sm tracking-wide text-white/90 underline-offset-4 hover:underline"
            >
              {t.v2.hero.secondary} <span aria-hidden>→</span>
            </a>
          </div>
        </div>

        <div data-v2cue className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70">
          <span className="h-10 w-px bg-white/50" />
        </div>
      </div>
    </section>
  );
}

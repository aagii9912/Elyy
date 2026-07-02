"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import { RevealText } from "@/components/Reveal";
import { useT } from "@/components/LangProvider";
import { HERO_IMAGE, SITE } from "@/lib/content";

/* Building shown clipped inside the ELYSIUM wordmark during phase 2. */
const WORDMARK_IMAGE = "/images/exterior-lowangle-towers.jpg";

export function V2Hero() {
  const t = useT();
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const wash = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLDivElement>(null);
  const wordmark = useRef<HTMLDivElement>(null);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -70 });
    else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(bg.current, { scale: 1.18, duration: 2.4, ease: "power3.out" });
      gsap.from("[data-hl]", { y: 30, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.45 });
      gsap.to("[data-cue]", { y: 9, repeat: -1, yoyo: true, duration: 1.2, ease: "sine.inOut" });

      // Continuous, organic cloud + smoke drift (independent of scroll).
      gsap.utils.toArray<HTMLElement>(".fr-cloud").forEach((el, i) => {
        gsap.to(el, {
          xPercent: i % 2 ? 14 : -14,
          yPercent: i % 3 ? -6 : 7,
          scale: 1.08,
          duration: 18 + i * 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
      gsap.utils.toArray<HTMLElement>(".fr-smoke").forEach((el, i) => {
        gsap.to(el, {
          xPercent: i % 2 ? -10 : 10,
          duration: 22 + i * 5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      // Scroll-driven, frame-by-frame sequence (CSS-sticky pin).
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true },
      });
      // building rises / parallaxes up through the clouds
      tl.fromTo(bg.current, { yPercent: 8 }, { yPercent: -10, ease: "none" }, 0);
      // headline fades to a ghost, then out
      tl.to(headline.current, { opacity: 0, y: -50, scale: 0.97, ease: "none", duration: 0.4 }, 0.05);
      // soft white wash settles over the scene (building stays faintly visible)
      tl.fromTo(wash.current, { opacity: 0 }, { opacity: 0.72, ease: "none", duration: 0.35 }, 0.32);
      // edge clouds part outward + low smoke sinks as the wordmark resolves
      tl.to(".fr-cloud--edge", { xPercent: (i) => (i % 2 ? 55 : -55), ease: "none", duration: 0.5 }, 0.3);
      tl.to(".fr-smoke", { yPercent: 60, opacity: 0.85, ease: "none", duration: 0.5 }, 0.3);
      // ELYSIUM wordmark (building clipped inside) resolves in
      tl.fromTo(
        wordmark.current,
        { opacity: 0, scale: 1.12, yPercent: 5 },
        { opacity: 1, scale: 1, yPercent: 0, ease: "power2.out", duration: 0.45 },
        0.42
      );
      tl.fromTo(".v2-wordmark-bg", { backgroundPositionY: "30%" }, { backgroundPositionY: "62%", ease: "none", duration: 0.6 }, 0.42);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="v2top" ref={root} className="relative h-[340vh] bg-night">
      <div className="sticky top-0 flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden">
        {/* building / scene */}
        <div ref={bg} className="absolute inset-x-0 -top-[8%] z-0 h-[120%] will-change-transform">
          <Image src={HERO_IMAGE} alt={SITE.name} fill priority sizes="100vw" className="object-cover" />
        </div>
        {/* subtle scene grade for headline legibility */}
        <div className="pointer-events-none absolute inset-0 z-[4] bg-gradient-to-b from-black/30 via-transparent to-black/45" />

        {/* atmospheric clouds + low smoke (CSS-built, drifting) */}
        <div className="pointer-events-none absolute inset-0 z-[6] overflow-hidden">
          <div className="fr-cloud fr-cloud--edge" style={{ left: "-12%", top: "8%", width: "46vw", height: "34vh" }} />
          <div className="fr-cloud fr-cloud--edge" style={{ right: "-12%", top: "14%", width: "44vw", height: "32vh" }} />
          <div className="fr-cloud" style={{ left: "18%", top: "30%", width: "34vw", height: "26vh", opacity: 0.7 }} />
          <div className="fr-cloud" style={{ right: "16%", top: "40%", width: "30vw", height: "24vh", opacity: 0.65 }} />
          <div className="fr-cloud fr-cloud--edge" style={{ left: "-8%", bottom: "16%", width: "40vw", height: "30vh" }} />
          <div className="fr-cloud fr-cloud--edge" style={{ right: "-8%", bottom: "20%", width: "38vw", height: "28vh" }} />
          {/* dense low smoke the building rises through */}
          <div className="fr-smoke" style={{ left: "-15%", bottom: "-14%", width: "70vw", height: "44vh" }} />
          <div className="fr-smoke" style={{ right: "-15%", bottom: "-16%", width: "72vw", height: "46vh" }} />
          <div className="fr-smoke" style={{ left: "10%", bottom: "-20%", width: "80vw", height: "40vh", opacity: 0.9 }} />
        </div>

        {/* soft white wash for the wordmark phase */}
        <div ref={wash} className="pointer-events-none absolute inset-0 z-[8] bg-white opacity-0" />

        {/* phase 2 — ELYSIUM wordmark with the building image clipped inside */}
        <div ref={wordmark} className="pointer-events-none absolute inset-0 z-[10] flex flex-col items-center justify-center opacity-0">
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
        <div ref={headline} className="relative z-[10] mx-auto max-w-5xl px-5 text-center text-white">
          <p data-hl className="find-label text-white/75">{SITE.name} · Ulaanbaatar</p>
          <RevealText
            as="h1"
            text={t.v2.hero.headline}
            className="find-display mx-auto mt-6 max-w-4xl text-[clamp(3rem,8.5vw,7.5rem)]"
            stagger={0.1}
          />
          <p data-hl className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-white/85">{t.v2.hero.sub}</p>
          <div data-hl className="mt-11 flex flex-wrap items-center justify-center gap-5">
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

        <div data-cue className="absolute bottom-8 left-1/2 z-[10] h-10 w-px -translate-x-1/2 bg-white/50" />
      </div>
    </section>
  );
}

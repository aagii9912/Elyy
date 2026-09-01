"use client";

/* ============================================================
   /daylight — DlFooter
   Fullscreen looping-video footer + bracket-framed link list.
   Daylight-style close with Elysium content.
   ============================================================ */

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "./shared";
import { DL_DICT, DL_MEDIA } from "@/lib/daylight-content";
import { useLang } from "@/components/LangProvider";

export function DlFooter() {
  const { lang } = useLang();
  const f = DL_DICT[lang].footer;

  const rootRef = useRef<HTMLElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);

  /* Autoplay the background video (guarded) and pause it while the
     footer is scrolled out of view — a light perf touch. */
  useEffect(() => {
    const vid = vidRef.current;
    if (!vid) return;
    const play = () => {
      vid.play().catch(() => {});
    };
    play();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) play();
          else vid.pause();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(vid);
    return () => io.disconnect();
  }, []);

  /* Staggered reveal once the footer enters the viewport.
     prefers-reduced-motion → render everything static. */
  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(".dl-f-reveal", { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        ".dl-f-reveal",
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 70%",
            once: true,
          },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <footer
      ref={rootRef}
      className="relative z-10 grid min-h-lvh grid-cols-1 grid-rows-1 overflow-clip"
    >
      {/* Background video + dim */}
      <video
        ref={vidRef}
        src={DL_MEDIA.footerVideo}
        poster={DL_MEDIA.footerPoster}
        muted
        loop
        playsInline
        preload="metadata"
        className="col-start-1 row-start-1 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}
      <div className="relative z-[1] col-start-1 row-start-1 flex flex-col justify-center text-[var(--dl-beige)] dl-container max-lg:pt-[96px]">
        {/* Middle row — brand + bracket links */}
        <div className="dl-f-reveal flex items-center justify-around max-lg:flex-col max-lg:gap-y-[96px] lg:mt-auto lg:flex-row">
          <div className="flex flex-col items-center gap-[16px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DL_MEDIA.logo} className="w-[260px] lg:w-[340px]" alt="Elysium" />
          </div>

          <ul className="flex flex-col items-center gap-y-[27px]">
            {f.links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="group flex items-center gap-[10px] py-[4px] dl-mono dl-text-12"
                >
                  <span
                    className="transition-transform duration-300 group-hover:-translate-x-[6px]"
                    style={{ transitionTimingFunction: "var(--dl-ease-expo)" }}
                  >
                    [
                  </span>
                  <span className="mt-[2px]">{l.label}</span>
                  <span
                    className="transition-transform duration-300 group-hover:translate-x-[6px]"
                    style={{ transitionTimingFunction: "var(--dl-ease-expo)" }}
                  >
                    ]
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <h2 className="dl-f-reveal font-medium dl-text-35 lg:dl-text-50 text-center mt-[48px] lg:mt-[60px]">
          {f.heading}
        </h2>

        {/* Bottom bar — socials + rights */}
        <div className="dl-f-reveal mt-auto mb-[12px] lg:mb-[24px] flex max-lg:flex-col items-center justify-between gap-[24px] max-lg:pt-[90px] dl-mono dl-text-12">
          <ul className="flex items-center gap-x-[48px] max-lg:w-full max-lg:justify-between lg:w-fit">
            {f.socials.map((s) => (
              <li key={s.label}>
                <a
                  className="block p-[5px] transition-opacity hover:opacity-60"
                  href={s.href}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <span className="opacity-70">{f.rights}</span>
        </div>
      </div>
    </footer>
  );
}

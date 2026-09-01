"use client";

/* ============================================================
   /daylight — "How it works" (Daylight-style)
   Full-bleed parallax intro + 3 sticky, stacking step panels
   that scale down / fade as you scroll while a fixed beige
   layer rises behind them. Content from DL_DICT[lang].how.
   ============================================================ */

import { useRef } from "react";
import {
  gsap,
  useGSAP,
  DlButton,
  DlParallax,
  splitLinesMasked,
} from "./shared";
import { DlStep1Phone, DlStep2Media, DlStep3Chart } from "./DlStepsMedia";
import { DL_DICT, DL_MEDIA } from "@/lib/daylight-content";
import { useLang } from "@/components/LangProvider";

export function DlHow() {
  const { lang } = useLang();
  const t = DL_DICT[lang].how;

  const rootRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const introContentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      // prefers-reduced-motion → leave everything in its natural, static
      // state (all copy already visible, panels un-transformed, CSS sticky
      // stacking still applies). No transforms are ever applied.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const introEl = introRef.current;
      const introContent = introContentRef.current;

      /* ---- Intro reveals (once) ---- */
      if (introEl) {
        gsap.from(".dl-fb-surtitle .dl-line", {
          yPercent: 100,
          duration: 0.4,
          ease: "power3.out",
          scrollTrigger: { trigger: introEl, start: "top center" },
        });
        gsap.from(".dl-fb-title .dl-line", {
          yPercent: 100,
          duration: 0.66,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: introEl, start: "top center" },
        });

        const introText = root.querySelector<HTMLElement>(".dl-fb-text");
        if (introText) {
          const split = splitLinesMasked(introText);
          gsap.from(split.lines, {
            yPercent: 100,
            duration: 0.66,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: { trigger: introEl, start: "top 35%" },
            // Restore the paragraph to a normal (React-owned) node once the
            // reveal is done so a later language toggle can re-render it.
            onComplete: () => split.revert(),
          });
        }

        gsap.from(".dl-fb-cta", {
          autoAlpha: 0,
          y: 20,
          duration: 0.5,
          delay: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: introEl, start: "top center" },
        });
      }

      /* ---- Intro content parallax (drifts up as the section pins) ---- */
      if (introContent) {
        gsap.fromTo(
          introContent,
          { y: 0 },
          {
            y: -200,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "+=200%",
              scrub: true,
            },
          },
        );
      }

      /* ---- Master scrub: beige layer rises + panels stack/scale ----
         Numbers differ per breakpoint, so drive them with matchMedia. */
      const mm = gsap.matchMedia();
      mm.add(
        { isDesktop: "(min-width: 1024px)", isMobile: "(max-width: 1023px)" },
        (ctx) => {
          const isMobile = ctx.conditions?.isMobile ?? false;
          const panelScale = isMobile ? 0.7 : 0.9;
          const posBase = isMobile ? 0.8 : 0.6;

          const master = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: "top 35%",
              end: "bottom top",
              scrub: true,
            },
          });

          const bg = root.querySelector<HTMLElement>(".dl-hiw-bg");
          if (bg) {
            /* Rise only once the intro has had its moment — just before
               the first step panel pins over it. */
            master.fromTo(
              bg,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.35, ease: "power4.out" },
              0.45,
            );
          }

          t.steps.forEach((_, i) => {
            const panel = root.querySelector<HTMLElement>(".dl-hiw-panel-" + i);
            if (!panel) return;
            const isLast = i === t.steps.length - 1;
            master.fromTo(
              panel,
              { scale: 1, autoAlpha: 1 },
              {
                scale: panelScale,
                // First panels fade out; the last one only scales.
                autoAlpha: isLast ? 1 : 0,
                duration: 0.8,
                ease: "sine.in",
              },
              i + posBase,
            );
          });
        },
      );

      /* ---- Per-step copy reveals (once) ---- */
      root.querySelectorAll<HTMLElement>(".dl-hiw-item").forEach((article) => {
        const lines = article.querySelectorAll<HTMLElement>(".dl-line");
        if (lines.length) {
          gsap.from(lines, {
            yPercent: 100,
            duration: 0.8,
            stagger: 0.08,
            ease: "power4.out",
            scrollTrigger: { trigger: article, start: "top 60%" },
          });
        }
        const bits = article.querySelectorAll<HTMLElement>(
          ".dl-step-chip, .dl-step-text, .dl-step-cta",
        );
        if (bits.length) {
          gsap.from(bits, {
            autoAlpha: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: article, start: "top 60%" },
          });
        }
      });
    },
    { scope: rootRef },
  );

  return (
    <section id="about" ref={rootRef} className="relative">
      <div className="relative overflow-clip">
        {/* Beige layer spanning the whole section — rises behind the
            stacking panels (absolute, not fixed: same look, no
            fixed-in-clipped-ancestor compositing hazards). */}
        <div className="dl-hiw-bg absolute inset-0 z-[2] bg-[var(--dl-beige)] opacity-0 pointer-events-none" />

        {/* Full-bleed parallax intro */}
        <div
          ref={introRef}
          className="sticky top-0 z-[1] h-lvh overflow-clip"
        >
          <DlParallax
            distance={300}
            className="h-full w-full"
            innerClassName="h-full w-full"
          >
            <img
              src={DL_MEDIA.howIntroImage}
              alt=""
              className="h-[calc(100%+300px)] w-full object-cover -mt-[150px]"
            />
          </DlParallax>
          <div className="absolute inset-0 bg-black/30" />

          <div
            ref={introContentRef}
            className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-[24px] text-center text-[var(--dl-beige)] dl-container"
          >
            <p className="dl-fb-surtitle dl-mono dl-text-12">
              <span className="dl-line-mask">
                <span className="dl-line">{t.surtitle}</span>
              </span>
            </p>
            <h2 className="dl-fb-title dl-serif dl-text-40 lg:dl-text-85 leading-[0.95]">
              {t.titleLines.map((line, i) => (
                <span key={i} className="dl-line-mask">
                  <span className="dl-line">{line}</span>
                </span>
              ))}
            </h2>
            <p className="dl-fb-text dl-text-14 lg:dl-text-20 mt-[24px] lg:mt-[36px] max-w-[calc(12*var(--column)+11*var(--gutter))]">
              {t.text}
            </p>
            <div className="dl-fb-cta mt-[36px]">
              <DlButton variant="secondary" href="/final#booking">
                {t.cta}
              </DlButton>
            </div>
          </div>
        </div>

        {/* Sticky, stacking step panels */}
        {t.steps.map((s, i) => {
          const titleLines = s.title.split("\n");
          const copyClass =
            "dl-step-copy flex flex-col items-start gap-[24px] px-[24px] pt-[32px] lg:gap-[48px] lg:pl-[calc(var(--column)+var(--gutter))] lg:pr-[24px] lg:pt-0 lg:justify-center lg:h-full";

          const copy = (
            <div className={copyClass}>
              <p className="dl-step-surtitle dl-mono dl-text-12 text-[var(--dl-purple-dark)]">
                <span className="dl-line-mask">
                  <span className="dl-line">{s.surtitle}</span>
                </span>
              </p>
              <h3 className="dl-step-title font-medium dl-text-36">
                {titleLines.map((line, li) => (
                  <span key={li} className="dl-line-mask">
                    <span className="dl-line">{line}</span>
                  </span>
                ))}
              </h3>
              <span
                className="dl-step-chip inline-flex rounded-full border border-[rgba(76,40,6,0.25)] px-[14px] py-[6px] dl-mono dl-text-11"
              >
                {s.subtitle}
              </span>
              <p className="dl-step-text dl-text-14 lg:dl-text-16 max-w-[46ch]">
                {s.text}
              </p>
              {s.cta && (
                <DlButton
                  variant="primary"
                  href="/final#booking"
                  className="dl-step-cta mt-[8px]"
                >
                  {s.cta}
                </DlButton>
              )}
            </div>
          );

          return (
            <article
              key={i}
              className={
                "dl-hiw-item dl-hiw-item-" +
                i +
                " sticky top-0 z-[3] h-[220lvh] px-[6px] pb-[6px] pt-[var(--nav-height)] lg:px-[var(--margin)] lg:pb-[var(--margin)] lg:pt-[var(--margin)] " +
                (i < 2 ? "origin-top" : "origin-center lg:origin-bottom")
              }
            >
              <div
                className={
                  "dl-hiw-panel-" +
                  i +
                  " relative flex h-[calc(100lvh-6px-var(--nav-height))] flex-col overflow-clip rounded-[6px] lg:h-[calc(100lvh-2*var(--margin))] bg-[#f0e5cf] text-[var(--dl-brown)]"
                }
              >
                <div className="relative z-[1] grid h-full items-center lg:grid-cols-2">
                  {copy}

                  {i === 0 && (
                    <div className="relative flex items-center justify-center max-lg:pb-[24px] lg:absolute lg:inset-y-0 lg:left-1/2 lg:right-0">
                      <DlStep1Phone />
                    </div>
                  )}
                  {i === 1 && <DlStep2Media />}
                  {i === 2 && (
                    <div className="relative lg:absolute lg:inset-y-0 lg:left-1/2 lg:right-0 flex items-center justify-center">
                      <DlStep3Chart />
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

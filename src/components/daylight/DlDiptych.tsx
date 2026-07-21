"use client";

/* ============================================================
   /daylight — DlDiptych
   Purple contact panel: serif title + logo + CTA on the left,
   scroll-stepped inset-mask media on the right with a subtle
   mouse parallax that offsets both the clip window and the
   four tracing edge lines.
   ============================================================ */

import { useRef } from "react";
import { gsap, useGSAP, splitLinesMasked, DlButton } from "./shared";
import { DL_DICT } from "@/lib/daylight-content";
import { useLang } from "@/components/LangProvider";

/* Inset keyframes — [top, right, bottom, left] as % of the mask box. */
const KF_DESKTOP: number[][] = [
  [7.5, 9.57, 65.8, 42.67],
  [31.6, 29.15, 39.3, 15.36],
  [52.5, 16.33, 10.7, 46.9],
];
const KF_MOBILE: number[][] = [
  [8.42, 10.6, 72.2, 41.3],
  [37.68, 29.6, 40.42, 17.6],
  [54.52, 24.26, 9.86, 46.4],
  [8.42, 10.6, 72.2, 41.3],
];

export function DlDiptych() {
  const { lang } = useLang();
  const d = DL_DICT[lang].diptych;

  const rootRef = useRef<HTMLElement>(null);
  const textCol = useRef<HTMLDivElement>(null);
  const mediaCol = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const bodyP = useRef<HTMLParagraphElement>(null);
  const linesRef = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);

  // Mutated in place (never reassigned) so the rAF loop keeps a live handle.
  const baseRef = useRef({ t: 0, r: 0, b: 0, l: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseEnabledRef = useRef(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      const textColEl = textCol.current;
      const bodyEl = bodyP.current;
      if (!root || !textColEl || !bodyEl) return;

      const revealEls = Array.from(
        textColEl.querySelectorAll<HTMLElement>("[data-reveal]"),
      );

      /* Push the current base inset + mouse offset into styles. */
      const apply = () => {
        const mask = maskRef.current;
        if (!mask) return;
        const rect = mask.getBoundingClientRect();
        const W = rect.width;
        const H = rect.height;
        if (!W || !H) return;
        const b = baseRef.current;
        const s = smoothRef.current;
        const dxP = (s.x / W) * 100;
        const dyP = (s.y / H) * 100;
        mask.style.clipPath = `inset(${b.t + dyP}% ${b.r - dxP}% ${b.b - dyP}% ${b.l + dxP}%)`;
        const lines = linesRef.current;
        if (lines[0])
          lines[0].style.transform = `translateY(${(b.t / 100) * H + s.y}px)`;
        if (lines[1])
          lines[1].style.transform = `translateX(${-((b.r / 100) * W) + s.x}px)`;
        if (lines[2])
          lines[2].style.transform = `translateY(${-((b.b / 100) * H) + s.y}px)`;
        if (lines[3])
          lines[3].style.transform = `translateX(${(b.l / 100) * W + s.x}px)`;
      };

      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const isDesktop = !!context.conditions?.isDesktop;
          const reduce = !!context.conditions?.reduce;
          const KF = isDesktop ? KF_DESKTOP : KF_MOBILE;

          const b = baseRef.current;
          gsap.set(b, { t: KF[0][0], r: KF[0][1], b: KF[0][2], l: KF[0][3] });
          apply();

          // Reduced motion → hold the first keyframe, reveal everything, no parallax.
          if (reduce) {
            if (revealEls.length) gsap.set(revealEls, { yPercent: 0 });
            mouseEnabledRef.current = false;
            return;
          }

          // Scroll-stepped inset mask.
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: "top 75%",
              end: "bottom 25%",
              scrub: 0.5,
            },
          });
          KF.slice(1).forEach((k, i) => {
            tl.to(
              b,
              {
                t: k[0],
                r: k[1],
                b: k[2],
                l: k[3],
                duration: 1,
                ease: "sine.inOut",
                onUpdate: apply,
              },
              i,
            );
          });

          // Title / logo / subtitle / CTA masked reveal.
          if (revealEls.length) {
            gsap.fromTo(
              revealEls,
              { yPercent: 100 },
              {
                yPercent: 0,
                duration: 0.8,
                ease: "power4.out",
                stagger: 0.1,
                scrollTrigger: {
                  trigger: textColEl,
                  start: "top 75%",
                  once: true,
                },
              },
            );
          }

          // Body copy masked line reveal.
          const split = splitLinesMasked(bodyEl);
          gsap.fromTo(
            split.lines,
            { yPercent: 100 },
            {
              yPercent: 0,
              duration: 0.8,
              ease: "power4.out",
              stagger: 0.1,
              scrollTrigger: {
                trigger: textColEl,
                start: "top 60%",
                once: true,
              },
            },
          );

          // Mouse parallax — desktop only, gated to when the panel is on screen.
          let raf = 0;
          let io: IntersectionObserver | null = null;
          if (isDesktop) {
            mouseEnabledRef.current = true;
            const smooth = smoothRef.current;
            const mouse = mouseRef.current;
            let visible = true;
            io = new IntersectionObserver((entries) => {
              visible = entries[0]?.isIntersecting ?? false;
            });
            io.observe(root);
            const loop = () => {
              if (visible) {
                smooth.x += (mouse.x - smooth.x) * 0.1;
                smooth.y += (mouse.y - smooth.y) * 0.1;
                apply();
              }
              raf = requestAnimationFrame(loop);
            };
            raf = requestAnimationFrame(loop);
          }

          return () => {
            mouseEnabledRef.current = false;
            if (raf) cancelAnimationFrame(raf);
            if (io) io.disconnect();
            smoothRef.current.x = 0;
            smoothRef.current.y = 0;
            mouseRef.current.x = 0;
            mouseRef.current.y = 0;
            split.revert();
          };
        },
      );
    },
    { scope: rootRef, dependencies: [lang], revertOnUpdate: true },
  );

  return (
    <section
      id="contact"
      ref={rootRef}
      className="grid h-fit grid-cols-1 overflow-clip bg-[var(--dl-purple)] lg:h-lvh lg:grid-cols-2"
    >
      {/* LEFT — title + logo + subtitle/body + CTA */}
      <div
        ref={textCol}
        className="dl-container col-start-1 row-start-2 flex h-full flex-col gap-[60px] py-[48px] lg:row-start-1 lg:col-start-1 lg:justify-between lg:pt-[65px] lg:pb-[60px]"
      >
        <h2 className="dl-serif dl-text-40 lg:dl-text-120 lg:leading-[1.22] text-[var(--dl-purple-dark)]">
          {d.titleLines.map((line, i) => (
            <span key={i} className="dl-line-mask w-full">
              <span data-reveal className="dl-line">
                {line}
              </span>
            </span>
          ))}
        </h2>

        <div className="grid grid-cols-1 gap-[60px] lg:grid-cols-2 lg:gap-y-[60px] lg:max-w-[calc(10*var(--column)+9*var(--gutter))]">
          <figure className="dl-line-mask w-fit">
            <img
              data-reveal
              src="/brand/elysium-logo-dark.svg"
              className="h-auto w-[140px] opacity-80"
              alt="Elysium"
            />
          </figure>

          <div>
            <h3 className="mb-[24px] dl-mono dl-text-12 text-[var(--dl-purple-dark)]">
              <span className="dl-line-mask w-fit">
                <span data-reveal className="dl-line">
                  {d.subtitle}
                </span>
              </span>
            </h3>
            <p
              ref={bodyP}
              className="dl-dip-text font-medium dl-text-20 text-[var(--dl-purple-dark)]"
            >
              {d.text}
            </p>
          </div>

          <div className="lg:col-start-2">
            <span className="dl-line-mask w-fit">
              <span data-reveal className="dl-line">
                <DlButton
                  variant="primary"
                  hoverText="#321F61"
                  href="/final#booking"
                >
                  {d.cta}
                </DlButton>
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT — scroll-stepped inset-mask media + mouse parallax */}
      <div
        ref={mediaCol}
        className="relative isolate overflow-clip col-start-1 row-start-1 lg:col-start-2"
        onMouseMove={(e) => {
          if (!mouseEnabledRef.current) return;
          const el = mediaCol.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const m = mouseRef.current;
          m.x = ((e.clientX - rect.left) / rect.width - 0.5) * 50;
          m.y = ((e.clientY - rect.top) / rect.height - 0.5) * 50;
        }}
        onMouseLeave={() => {
          const m = mouseRef.current;
          m.x = 0;
          m.y = 0;
        }}
      >
        {/* base media (dimmed) */}
        <div className="sticky top-0 h-[475px] w-full lg:h-lvh">
          <img
            src={d.image}
            className="h-full w-full object-cover brightness-[0.72]"
            alt=""
          />
        </div>

        {/* mask overlay (bright window + tracing lines) */}
        <div className="absolute inset-0 z-[1] grid grid-cols-1 grid-rows-1">
          <div
            ref={maskRef}
            className="sticky top-0 z-[2] col-start-1 row-start-1 h-[475px] lg:h-lvh will-change-[clip-path]"
          >
            <img
              src={d.image}
              className="absolute inset-0 h-full w-full object-cover brightness-110 saturate-110"
              alt=""
            />
          </div>

          <div
            aria-hidden
            className="sticky top-0 z-[1] col-start-1 row-start-1 h-[475px] lg:h-lvh"
          >
            <div
              ref={(el) => {
                linesRef.current[0] = el;
              }}
              className="absolute -top-px left-0 h-px w-full bg-white/30"
            />
            <div
              ref={(el) => {
                linesRef.current[1] = el;
              }}
              className="absolute -right-px top-0 h-full w-px bg-white/30"
            />
            <div
              ref={(el) => {
                linesRef.current[2] = el;
              }}
              className="absolute -bottom-px left-0 h-px w-full bg-white/30"
            />
            <div
              ref={(el) => {
                linesRef.current[3] = el;
              }}
              className="absolute -left-px top-0 h-full w-px bg-white/30"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

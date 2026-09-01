"use client";

/* ============================================================
   /daylight — DlHow step artifacts
   These render the visual artifacts inside the sticky step
   panels owned by DlHow.tsx (which supplies outer positioning).

   1) DlStep1Phone — phone mockup that un-clips from a pill
   2) DlStep2Media — media card with a slow scroll zoom
   3) DlStep3Chart — animated stat chart (curve draw + counter)
   ============================================================ */

import { useRef } from "react";
import { gsap, useGSAP } from "./shared";
import { DL_DICT, DL_MEDIA } from "@/lib/daylight-content";
import { useLang } from "@/components/LangProvider";

/* ------------------------------------------------------------
   Chart geometry — pure, deterministic, computed once at module
   scope. Builds a smooth cubic path with horizontal control
   tangents from fractional points across a 700×320 viewBox.
   ------------------------------------------------------------ */
const CH_VIEW_W = 700;
const CH_VIEW_H = 320;

function buildSmoothChartPath(points: readonly (readonly [number, number])[]): string {
  if (points.length === 0) return "";
  const pts = points.map(
    ([fx, fy]) => [fx * CH_VIEW_W, fy * CH_VIEW_H] as [number, number],
  );
  const [x0, y0] = pts[0];
  let d = `M ${x0.toFixed(2)} ${y0.toFixed(2)}`;
  for (let i = 1; i < pts.length; i += 1) {
    const [xPrev, yPrev] = pts[i - 1];
    const [xCur, yCur] = pts[i];
    const dx = xCur - xPrev;
    const c1x = xPrev + dx / 2;
    const c2x = xCur - dx / 2;
    d +=
      ` C ${c1x.toFixed(2)} ${yPrev.toFixed(2)}, ` +
      `${c2x.toFixed(2)} ${yCur.toFixed(2)}, ` +
      `${xCur.toFixed(2)} ${yCur.toFixed(2)}`;
  }
  return d;
}

const CH_MAIN_PATH = buildSmoothChartPath([
  [0.04, 0.58],
  [0.2, 0.78],
  [0.35, 0.65],
  [0.5, 0.55],
  [0.65, 0.4],
  [0.8, 0.22],
  [0.96, 0.12],
]);

const CH_SECONDARY_PATH = buildSmoothChartPath([
  [0.5, 0.55],
  [0.65, 0.32],
  [0.8, 0.18],
  [0.96, 0.5],
]);

/* ============================================================
   1) DlStep1Phone
   ============================================================ */
export function DlStep1Phone() {
  const { lang } = useLang();
  const phone = DL_DICT[lang].how.phone;
  const rootRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const phoneEl = phoneRef.current;
      if (!root || !phoneEl) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conds = (context?.conditions ?? {}) as {
            isDesktop?: boolean;
            reduce?: boolean;
          };
          const isDesktop = conds.isDesktop ?? false;
          const reduce = conds.reduce ?? false;

          const openClip = "inset(0% 0% 0% 0% round 1rem)";
          const startClip = isDesktop
            ? "inset(37.5% 16.29% 31% 16.29% round 1rem)"
            : "inset(34.5% 12.29% 28% 12.29% round 1rem)";
          const clipEase = isDesktop ? "expo.inOut" : "power4.out";

          if (reduce) {
            gsap.set(phoneEl, { clipPath: openClip });
            gsap.set(".dl-step-logo", { y: 0, scale: 1 });
            gsap.set(".dl-step-title .dl-line", { autoAlpha: 1, yPercent: 0 });
            gsap.set([".dl-step-top", ".dl-step-bottom"], {
              autoAlpha: 1,
              yPercent: 0,
            });
            return;
          }

          gsap.set(phoneEl, { clipPath: startClip });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: isDesktop ? "top 50%" : "top 70%",
              end: "+=140%",
              scrub: true,
            },
          });

          tl.to(phoneEl, { clipPath: openClip, duration: 2, ease: clipEase }, 0)
            .fromTo(
              ".dl-step-logo",
              { y: isDesktop ? "4.26rem" : 40, scale: 3.1 },
              { y: 0, scale: 1, duration: 2, ease: clipEase },
              0,
            )
            .fromTo(
              ".dl-step-title .dl-line",
              { autoAlpha: 0, yPercent: 100 },
              {
                autoAlpha: 1,
                yPercent: 0,
                duration: isDesktop ? 1 : 1.2,
                ease: "power4.out",
              },
              isDesktop ? 0.8 : 0.6,
            )
            .fromTo(
              ".dl-step-top",
              { autoAlpha: 0, yPercent: 50 },
              { autoAlpha: 1, yPercent: 0, duration: 0.8, ease: "power4.out" },
              1,
            )
            .fromTo(
              ".dl-step-bottom",
              { autoAlpha: 0, yPercent: 50 },
              { autoAlpha: 1, yPercent: 0, duration: 0.8, ease: "power4.out" },
              1.1,
            )
            .fromTo(
              ".dl-step-bottom-rect",
              { xPercent: 0 },
              { xPercent: 109, duration: 0.5, ease: "expo.inOut" },
              1.35,
            )
            .fromTo(
              ".dl-step-bottom-left",
              { color: "#111111" },
              { color: "#ffffff", duration: 0.1 },
              1.45,
            )
            .fromTo(
              ".dl-step-bottom-right",
              { color: "#ffffff" },
              { color: "#111111", duration: 0.1 },
              1.5,
            );
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="relative z-[1] flex h-full w-full items-center justify-center max-lg:py-[32px]"
    >
      <div
        ref={phoneRef}
        className="relative aspect-[175/380] max-h-[80lvh] w-[min(44vw,340px)] overflow-hidden rounded-[12px] max-lg:w-[220px] lg:rounded-[16px]"
      >
        <img
          src={DL_MEDIA.step1Image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/60" />

        <div className="relative z-[1] flex h-full flex-col items-center justify-center gap-[30px] text-center text-white">
          <img
            src={DL_MEDIA.logo}
            alt=""
            className="dl-step-logo w-[120px] lg:w-[150px]"
          />
          <h4 className="dl-step-title dl-text-20 font-medium">
            <span className="dl-line-mask">
              <span className="dl-line">{phone.title}</span>
            </span>
          </h4>
        </div>

        <span className="dl-step-top dl-mono absolute left-1/2 top-[14px] z-[2] -translate-x-1/2 rounded-full bg-white/15 px-[12px] py-[5px] text-[9px] text-white backdrop-blur-[6px]">
          {phone.chipTop}
        </span>

        <div className="dl-step-bottom dl-mono absolute bottom-[16px] left-1/2 z-[2] grid w-[78%] -translate-x-1/2 grid-cols-2 rounded-full bg-white/15 p-[4px] text-center text-[10px] backdrop-blur-[6px]">
          <span className="dl-step-bottom-rect absolute bottom-[4px] left-[4px] top-[4px] w-[calc(50%-4px)] rounded-full bg-white" />
          <span
            className="dl-step-bottom-left relative z-[1] py-[6px]"
            style={{ color: "#111111" }}
          >
            {phone.toggleLeft}
          </span>
          <span
            className="dl-step-bottom-right relative z-[1] py-[6px]"
            style={{ color: "#ffffff" }}
          >
            {phone.toggleRight}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   2) DlStep2Media
   ============================================================ */
export function DlStep2Media() {
  const rootRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const img = imgRef.current;
      if (!root || !img) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conds = (context?.conditions ?? {}) as {
            isDesktop?: boolean;
            reduce?: boolean;
          };
          const isDesktop = conds.isDesktop ?? false;
          const reduce = conds.reduce ?? false;

          if (reduce) {
            gsap.set(img, { scale: 1, y: 0 });
            return;
          }

          gsap.fromTo(
            img,
            { scale: 1.25, y: 30 },
            {
              scale: 1,
              y: -30,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: isDesktop ? "top 25%" : "top 70%",
                end: "+=140%",
                scrub: true,
              },
            },
          );
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="relative z-[1] flex w-full items-center justify-center overflow-clip max-lg:h-[280px] max-lg:px-[24px] lg:absolute lg:bottom-[var(--margin)] lg:left-1/2 lg:right-[var(--margin)] lg:top-[var(--margin)]"
    >
      <div className="relative h-full w-full overflow-hidden rounded-[6px] max-lg:h-[240px]">
        <img
          ref={imgRef}
          src={DL_MEDIA.step2Image}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

/* ============================================================
   3) DlStep3Chart
   ============================================================ */
export function DlStep3Chart() {
  const { lang } = useLang();
  const chart = DL_DICT[lang].how.chart;
  const rootRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const clipRef = useRef<SVGRectElement>(null);
  const pathBRef = useRef<SVGPathElement>(null);
  const lineRef = useRef<SVGLineElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const numEl = numRef.current;
      const clipEl = clipRef.current;
      const pathBEl = pathBRef.current;
      const lineEl = lineRef.current;
      if (!root || !numEl || !clipEl || !pathBEl || !lineEl) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conds = (context?.conditions ?? {}) as {
            isDesktop?: boolean;
            reduce?: boolean;
          };
          const isDesktop = conds.isDesktop ?? false;
          const reduce = conds.reduce ?? false;

          if (reduce) {
            numEl.textContent = Math.round(chart.value) + chart.valueSuffix;
            gsap.set(clipEl, { attr: { width: CH_VIEW_W } });
            gsap.set(lineEl, { autoAlpha: 1 });
            gsap.set(pathBEl, { autoAlpha: 0.3 });
            return;
          }

          const counter = { v: 0 };
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: isDesktop ? "top 25%" : "top 70%",
              end: "+=140%",
              scrub: true,
            },
          });

          tl.to(
            counter,
            {
              v: chart.value,
              duration: 1,
              ease: "none",
              onUpdate: () => {
                numEl.textContent = Math.round(counter.v) + chart.valueSuffix;
              },
            },
            0,
          )
            .to(clipEl, { attr: { width: CH_VIEW_W }, duration: 1, ease: "none" }, 0)
            .to(lineEl, { autoAlpha: 1, duration: 0.25 }, 0.45)
            .to(pathBEl, { autoAlpha: 0.3, duration: 0.35 }, 0.55);
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="relative z-[1] flex w-full flex-col items-stretch justify-end gap-[12px] px-[24px] pb-[32px] max-lg:pt-[16px] lg:h-full lg:items-center lg:justify-center lg:px-0 lg:pb-0"
    >
      <div className="flex w-full flex-col gap-[12px] lg:max-w-[460px] lg:gap-[16px]">
        <div className="flex items-center gap-[20px] px-[4px]">
          <span className="dl-text-16 font-medium text-[var(--dl-brown)] lg:dl-text-18">
            {chart.tabA}
          </span>
          <span className="dl-text-16 font-medium text-[rgba(76,40,6,0.35)] lg:dl-text-18">
            {chart.tabB}
          </span>
        </div>

        <div className="relative flex aspect-[460/360] flex-col rounded-[12px] border border-[rgba(76,40,6,0.15)] bg-[var(--dl-beige)] p-[20px] lg:p-[24px]">
          <div className="flex items-baseline gap-[8px]">
            <span
              ref={numRef}
              className="dl-serif text-[44px] leading-none text-[var(--dl-brown)] lg:text-[40px]"
            >
              {`0${chart.valueSuffix}`}
            </span>
            <span className="dl-text-13 font-medium text-[rgba(76,40,6,0.55)] lg:dl-text-15">
              {chart.valueLabel}
            </span>
          </div>

          <div className="relative mt-[16px] flex-1 lg:mt-[24px]">
            <svg
              viewBox="0 0 700 320"
              preserveAspectRatio="none"
              className="block h-full w-full overflow-visible"
            >
              <defs>
                <clipPath id="dl-ch-reveal">
                  <rect ref={clipRef} x={0} y={0} width={0} height={320} />
                </clipPath>
              </defs>
              <path
                d={CH_MAIN_PATH}
                stroke="#F66F00"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                clipPath="url(#dl-ch-reveal)"
              />
              <path
                ref={pathBRef}
                d={CH_SECONDARY_PATH}
                stroke="#F66F00"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                opacity={0}
              />
              <line
                ref={lineRef}
                x1={350}
                x2={350}
                y1={0}
                y2={320}
                stroke="rgba(76,40,6,0.35)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                opacity={0}
              />
            </svg>
          </div>

          <div className="mt-[12px] grid grid-cols-7 text-center lg:mt-[16px]">
            {chart.days.map((d, idx) => (
              <span
                key={`${idx}-${d}`}
                className="dl-mono text-[10px] uppercase lg:text-[12px]"
                style={{
                  color: idx === 3 ? "rgba(76,40,6,0.7)" : "rgba(76,40,6,0.4)",
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

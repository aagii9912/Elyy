"use client";

/* ============================================================
   /daylight — DlUsp
   3-item USP band. Desktop: swapping text pinned via a sticky
   overlay (one h-lvh layer spanning the list) driven by a
   scrubbed master timeline + per-item media clip/scale reveals
   + vertical grid guide lines. Mobile: per-item reveals.
   (Sticky is used instead of the original's fixed-in-clipped-
   parent pattern — visually identical, far kinder to
   compositors.)
   ============================================================ */

import { useRef } from "react";
import { gsap, useGSAP } from "./shared";
import { DL_DICT } from "@/lib/daylight-content";
import { useLang } from "@/components/LangProvider";

const GUIDE = "calc(var(--margin) + 6*var(--column) + 5*var(--gutter))";

export function DlUsp() {
  const { lang } = useLang();
  const items = DL_DICT[lang].usp.items;

  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      /* media reveal (shared by mobile + desktop) */
      const mediaReveal = (i: number, li: HTMLLIElement) => {
        gsap.fromTo(
          `.dl-usp-media-wrap-${i}`,
          { clipPath: "inset(20% 0% 20% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.5,
            ease: "expo.out",
            scrollTrigger: { trigger: li, start: "top 60%", once: true },
          },
        );
        gsap.fromTo(
          `.dl-usp-media-${i}`,
          { scale: 1.8 },
          {
            scale: 1,
            duration: 1.5,
            ease: "expo.out",
            scrollTrigger: { trigger: li, start: "top 60%", once: true },
          },
        );
      };

      /* ---------- reduced motion → static final states ---------- */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".dl-usp-overlay", { display: "none" });
        gsap.set(".dl-usp-copy-m", { display: "flex" });
        items.forEach((_, i) => {
          gsap.set(
            `.dl-usp-surtitle-${i} .dl-line, .dl-usp-title-${i} .dl-line`,
            { yPercent: 0, autoAlpha: 1 },
          );
          gsap.set(`.dl-usp-media-wrap-${i}`, { clipPath: "inset(0% 0% 0% 0%)" });
          gsap.set(`.dl-usp-media-${i}`, { scale: 1 });
          gsap.set(`.dl-usp-content-${i}`, { autoAlpha: 1, y: 0 });
        });
      });

      /* ---------- mobile ---------- */
      mm.add(
        "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        () => {
          items.forEach((_, i) => {
            const li = itemRefs.current[i];
            if (!li) return;

            gsap.fromTo(
              `.dl-usp-surtitle-${i} .dl-line`,
              { yPercent: 100 },
              {
                yPercent: 0,
                duration: 0.4,
                ease: "expo.out",
                scrollTrigger: { trigger: li, start: "top 70%", once: true },
              },
            );
            gsap.fromTo(
              `.dl-usp-title-${i} .dl-line`,
              { yPercent: 100 },
              {
                yPercent: 0,
                duration: 0.66,
                ease: "expo.out",
                stagger: 0.15,
                scrollTrigger: { trigger: li, start: "top 70%", once: true },
              },
            );
            mediaReveal(i, li);
          });
        },
      );

      /* ---------- desktop ---------- */
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const list = listRef.current;
          if (!list) return;

          /* per-item media reveals */
          items.forEach((_, i) => {
            const li = itemRefs.current[i];
            if (li) mediaReveal(i, li);
          });

          /* content hidden until the master timeline reveals it */
          gsap.set(".dl-usp-content", { autoAlpha: 0 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: list,
              start: "top 52%",
              end: "bottom 50%",
              scrub: true,
            },
          });
          /* fix the timeline length so scrub maps cleanly across the range */
          tl.to({}, { duration: 1 }, 0);

          /* content-0 */
          tl.fromTo(
            ".dl-usp-content-0",
            { y: 150 },
            { y: -50, duration: 0.4, ease: "none" },
            0,
          );
          tl.fromTo(
            ".dl-usp-content-0",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.15, ease: "power2.out" },
            0.06,
          );
          tl.to(
            ".dl-usp-content-0",
            { autoAlpha: 0, duration: 0.15, ease: "power2.in" },
            0.28,
          );

          /* content-1 */
          tl.fromTo(
            ".dl-usp-content-1",
            { y: 50 },
            { y: -150, duration: 0.4, ease: "none" },
            0.3,
          );
          tl.fromTo(
            ".dl-usp-content-1",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.15, ease: "power2.out" },
            0.42,
          );
          tl.to(
            ".dl-usp-content-1",
            { autoAlpha: 0, duration: 0.15, ease: "power2.in" },
            0.57,
          );

          /* content-2 (no fade-out) */
          tl.fromTo(
            ".dl-usp-content-2",
            { y: -50 },
            { y: -250, duration: 0.4, ease: "none" },
            0.6,
          );
          tl.fromTo(
            ".dl-usp-content-2",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.15, ease: "power4.out" },
            0.72,
          );

          /* surtitle + title inner lines, per content position */
          const revealPos = [0.06, 0.42, 0.72];
          items.forEach((_, i) => {
            tl.fromTo(
              `.dl-usp-surtitle-${i} .dl-line`,
              { yPercent: 100 },
              { yPercent: 0, duration: 0.15, ease: "power3.out" },
              revealPos[i],
            );
            tl.fromTo(
              `.dl-usp-title-${i} .dl-line`,
              { yPercent: 60, autoAlpha: 0 },
              {
                yPercent: 0,
                autoAlpha: 1,
                duration: 0.2,
                ease: "power3.out",
                stagger: 0.012,
              },
              revealPos[i],
            );
          });
        },
      );
    },
    { scope: listRef, dependencies: [lang] },
  );

  /* copy block — reused by the sticky overlay (desktop) and per-item (mobile) */
  const copyBlock = (i: number) => (
    <>
      <p className={`dl-mono dl-text-12 text-[var(--dl-grey)] dl-usp-surtitle-${i}`}>
        <span className="dl-line-mask">
          <span className="dl-line">{items[i].surtitle}</span>
        </span>
      </p>
      <h2
        className={`dl-usp-title-${i} dl-text-35 lg:dl-text-50 font-medium text-[var(--dl-black)] mx-auto max-w-[calc(11*var(--column)+10*var(--gutter))]`}
      >
        <span className="dl-line-mask">
          <span className="dl-line">{items[i].titleLines[0]}</span>
        </span>
        <span className="dl-line-mask">
          <span className="dl-line">{items[i].titleLines[1]}</span>
        </span>
      </h2>
    </>
  );

  return (
    <section id="advantages" className="w-full overflow-clip">
      <ul
        ref={listRef}
        className="relative flex flex-col gap-0 pb-[64px] lg:pt-[180px] lg:pb-[180px]"
      >
        {/* desktop: one sticky h-lvh layer pins the swapping copy */}
        <div className="dl-usp-overlay pointer-events-none absolute inset-0 z-[5] hidden lg:block">
          <div className="sticky top-0 grid h-lvh grid-cols-1 grid-rows-1">
            {items.map((_, i) => (
              <div
                key={i}
                className={`dl-usp-content dl-usp-content-${i} col-start-1 row-start-1 flex flex-col items-center justify-center gap-[28px] text-center opacity-0`}
              >
                {copyBlock(i)}
              </div>
            ))}
          </div>
        </div>

        {/* desktop vertical guide lines */}
        <div
          aria-hidden
          className="hidden lg:block pointer-events-none absolute top-0 bottom-0 z-10 w-0 border-r border-[var(--dl-beige-dark)]"
          style={{ left: GUIDE }}
        />
        <div
          aria-hidden
          className="hidden lg:block pointer-events-none absolute top-0 bottom-0 z-10 w-0 border-l border-[var(--dl-beige-dark)]"
          style={{ right: GUIDE }}
        />

        {items.map((item, i) => (
          <li
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="dl-usp-item lg:grid px-[var(--margin)] border-b border-[var(--dl-beige-dark)] first:border-t border-[var(--dl-beige-dark)] lg:grid-cols-[calc(6*var(--column)+5*var(--gutter))_1fr_calc(6*var(--column)+5*var(--gutter))]"
          >
            {/* center column — copy (mobile only; desktop uses the overlay) */}
            <div className="relative py-[64px] text-center lg:col-start-2 lg:row-start-1 lg:min-h-[70vh]">
              <div className="dl-usp-copy-m flex flex-col items-center justify-center gap-[24px] lg:hidden">
                {copyBlock(i)}
              </div>
            </div>

            {/* media column */}
            <figure className="relative overflow-clip lg:row-start-1 lg:col-start-3">
              <div
                className={`dl-usp-media-wrap-${i} relative mx-auto overflow-clip max-lg:aspect-[220/275] max-lg:w-[calc(8*var(--column)+7*var(--gutter))] lg:w-[calc(6*var(--column)+5*var(--gutter))] lg:min-h-[500px] lg:h-[70vh]`}
              >
                <img
                  className={`dl-usp-media-${i} h-full w-full object-cover`}
                  src={item.image}
                  alt={item.alt}
                />
              </div>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

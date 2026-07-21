"use client";

/* ============================================================
   /daylight — DlWhy
   Three full-screen image panels with split-title reveals.
   Panels 0 & 2 use centered serif titles (masked line rise);
   panel 1 is a left-aligned three-line statement (x-slide).
   ============================================================ */

import { useRef } from "react";
import {
  gsap,
  useGSAP,
  DlButton,
  DlParallax,
  splitLinesMasked,
} from "@/components/daylight/shared";
import { DL_DICT } from "@/lib/daylight-content";
import { useLang } from "@/components/LangProvider";

export function DlWhy() {
  const { lang } = useLang();
  const w = DL_DICT[lang].why;
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const articles = gsap.utils.toArray<HTMLElement>(".dl-why-item", root);
      const getTitle = (i: number) =>
        articles[i]?.querySelector<HTMLElement>(`.dl-why-title-${i}`) ?? null;

      // Reduced motion → everything static; titles simply shown.
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        articles.forEach((_, i) => {
          const title = getTitle(i);
          if (title) gsap.set(title, { visibility: "visible" });
        });
        return;
      }

      // Surtitles — soft rise as each panel enters.
      articles.forEach((article) => {
        const surtitle = article.querySelector(".dl-mono");
        if (!surtitle) return;
        gsap.fromTo(
          surtitle,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "expo.out",
            scrollTrigger: { trigger: article, start: "top center" },
          },
        );
      });

      // Panel 0 media scale-in — scrubbed as the first panel scrolls in.
      if (articles[0]) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: articles[0],
              start: "top bottom",
              end: "center center",
              scrub: true,
            },
          })
          .fromTo(".dl-why-media-0", { scale: 0.8 }, { scale: 1, ease: "none" });
      }

      // Titles — desktop split reveals; mobile just shows them.
      const mm = gsap.matchMedia();

      mm.add("(min-width:1024px)", () => {
        w.items.forEach((item, i) => {
          const article = articles[i];
          const title = getTitle(i);
          if (!article || !title) return;

          if (item.layout === "center") {
            const split = splitLinesMasked(`.dl-why-title-${i}`);
            gsap.set(title, { visibility: "visible" });
            gsap.fromTo(
              split.lines,
              { yPercent: 150, autoAlpha: 0 },
              {
                yPercent: 0,
                autoAlpha: 1,
                duration: 1.6,
                ease: "expo.out",
                stagger: 0.1,
                scrollTrigger: { trigger: article, start: "top center", once: true },
              },
            );
          } else {
            gsap.set(title, { visibility: "visible" });
            gsap.fromTo(
              article.querySelectorAll(".dl-why-line"),
              { xPercent: (idx: number) => (idx === 1 ? 15 : -15), autoAlpha: 0 },
              {
                xPercent: 0,
                autoAlpha: 1,
                duration: 1.6,
                ease: "expo.out",
                stagger: 0.1,
                scrollTrigger: { trigger: article, start: "top center" },
              },
            );
          }
        });
      });

      mm.add("(max-width:1023px)", () => {
        articles.forEach((_, i) => {
          const title = getTitle(i);
          if (title) gsap.set(title, { visibility: "visible" });
        });
      });
    },
    { scope: rootRef, dependencies: [lang] },
  );

  return (
    <section ref={rootRef}>
      {w.items.map((item, i) => {
        const center = item.layout === "center";
        const titleClass =
          `dl-why-title-${i} lg:invisible ` +
          (center
            ? `dl-serif normal-case dl-text-40 mx-auto max-w-[calc(18*var(--column)+17*var(--gutter))] ${
                i === 0 ? "lg:dl-text-85" : "lg:dl-text-70"
              }`
            : "max-w-[calc(22*var(--column)+21*var(--gutter))] space-y-[48px] lg:space-y-[12px] w-full");

        return (
          <article
            key={i}
            className="dl-why-item relative grid h-lvh grid-cols-1 grid-rows-1 overflow-clip"
          >
            {/* Media */}
            <DlParallax
              distance={300}
              className="col-start-1 row-start-1 h-full w-full"
              innerClassName="h-full w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={`dl-why-media-${i} h-[calc(100%+300px)] w-full object-cover -mt-[150px]`}
                src={item.image}
                alt=""
              />
            </DlParallax>
            <div
              className="absolute inset-0 bg-black pointer-events-none"
              style={{ opacity: item.overlay / 100 }}
            />

            {/* Content */}
            <div
              className={`relative z-10 col-start-1 row-start-1 flex flex-col justify-center gap-y-[48px] text-[var(--dl-beige)] dl-container ${
                center ? "items-center text-center" : ""
              }`}
            >
              <h2 className="dl-mono dl-text-12">{item.surtitle}</h2>
              <p className={titleClass}>
                {center
                  ? item.title
                  : item.title.split("\n").map((line, idx) => (
                      <span
                        key={idx}
                        className={`dl-why-line block font-medium dl-text-20 lg:dl-text-45 ${
                          idx === 0
                            ? "text-left"
                            : idx === 1
                              ? "lg:text-right"
                              : "lg:text-center"
                        }`}
                      >
                        {line}
                      </span>
                    ))}
              </p>
            </div>
          </article>
        );
      })}

      <div className="flex justify-center pt-[36px] pb-[60px]">
        <DlButton variant="primary" href="/final#booking">
          {w.cta}
        </DlButton>
      </div>
    </section>
  );
}

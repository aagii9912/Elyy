"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { FINAL } from "@/lib/content";

/* ELYS concept — each advantage maps to one initial of the acronym
   (E·L·Y·S kept for the mapping intent). The Mongolian body comes from
   FINAL.elys.items (client-approved copy); the huge center keyword is
   presentation-only. Each row carries a photo revealed by the hover
   photo-wipe — E/L/Y now use the client's own shots for the claim they
   make (interior planning, the green spine, the live monitoring wall)
   instead of a generic exterior. */
const ROWS = [
  { initial: "E", keyword: "Ergonomic", photo: "/images/elys/ergonomic-interior.jpg" },
  { initial: "L", keyword: "Harmony", photo: "/images/elys/harmony-courtyard.jpg" },
  { initial: "Y", keyword: "Safety", photo: "/images/elys/safety-control-room.jpg" },
  { initial: "S", keyword: "Save", photo: "/images/amenity-retail-podium.jpg" },
] as const;

export function FinalElys() {
  const { kicker, title, items } = FINAL.elys;
  const listRef = useRef<HTMLDivElement>(null);

  /* Touch devices have no hover — reveal the photo of the row nearest the
     viewport center via IntersectionObserver, matching the reference. */
  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (canHover) return;

    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-elys-row]"));
    if (!rows.length) return;

    let active: HTMLElement | null = null;
    const setActive = (el: HTMLElement | null) => {
      if (el === active) return;
      active?.removeAttribute("data-active");
      active = el;
      active?.setAttribute("data-active", "true");
    };

    const pickNearestCenter = () => {
      const mid = window.innerHeight / 2;
      let best: HTMLElement | null = null;
      let bestDist = Infinity;
      for (const el of rows) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = el;
        }
      }
      setActive(best);
    };

    const io = new IntersectionObserver(pickNearestCenter, {
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    });
    rows.forEach((el) => io.observe(el));
    window.addEventListener("scroll", pickNearestCenter, { passive: true });
    pickNearestCenter();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", pickNearestCenter);
      active?.removeAttribute("data-active");
    };
  }, []);

  return (
    <section id="advantages" className="scroll-mt-20 bg-charcoal font-gilroy text-bone">
      {/* Intro */}
      <div className="mx-auto max-w-[1600px] px-5 pb-14 pt-24 md:px-10 md:pb-20 md:pt-32">
        <Reveal>
          <p className="fnl-kicker text-bone/55">{kicker}</p>
          <h2 className="mt-5 max-w-4xl text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
            {title}
          </h2>
        </Reveal>
      </div>

      {/* Scoped CSS for the hover photo-wipe (exact live-extracted values). */}
      <style>{`
        .elys-list .elys-photo {
          opacity: 0;
          clip-path: inset(100% 0 0);
          transition: opacity 0.4s, clip-path 1s cubic-bezier(0.16,1,0.3,1), transform 4s cubic-bezier(0.5,1,0.89,1);
        }
        .elys-list .elys-photo-img {
          transform: scale(1.06);
          transition: transform 4s cubic-bezier(0.5,1,0.89,1);
        }
        .elys-list .elys-keyword { position: relative; text-transform: none; }
        .elys-list .elys-keyword::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: 0.08em;
          height: 0.045em;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        @media (hover: hover) {
          .elys-list .elys-row:hover .elys-photo { opacity: 0.4; clip-path: inset(0 0 0 0); }
          .elys-list .elys-row:hover .elys-photo-img { transform: scale(1); }
          .elys-list .elys-row:hover .elys-keyword::after { transform: scaleX(1); }
        }
        .elys-list .elys-row[data-active="true"] .elys-photo { opacity: 0.4; clip-path: inset(0 0 0 0); }
        .elys-list .elys-row[data-active="true"] .elys-photo-img { transform: scale(1); }
        .elys-list .elys-row[data-active="true"] .elys-keyword::after { transform: scaleX(1); }
        @media (prefers-reduced-motion: reduce) {
          .elys-list .elys-photo,
          .elys-list .elys-photo-img,
          .elys-list .elys-keyword::after { transition: none; }
        }
      `}</style>

      {/* Full-bleed stacked rows */}
      <div ref={listRef} className="elys-list border-t border-bone/[0.14]">
        {ROWS.map((row, i) => {
          const item = items[i];
          const num = String(i + 1).padStart(2, "0");
          return (
            <Reveal key={row.keyword} delay={i * 0.06}>
              <a
                href="#contact"
                data-cursor-hover
                data-elys-row
                aria-label={`${item.title} — дэлгэрэнгүй`}
                className="elys-row group relative block overflow-hidden border-b border-bone/[0.14]"
              >
                {/* Hover photo-wipe layer — signature move.
                    Idle: clipped from top + faded out, image scaled 1.06.
                    Hover / touch-active: unclipped, 0.4 opacity, slow 4s drift to 1. */}
                <div
                  aria-hidden
                  className="elys-photo pointer-events-none absolute inset-0 z-0"
                >
                  <Image
                    src={row.photo}
                    alt=""
                    fill
                    sizes="100vw"
                    className="elys-photo-img object-cover"
                    aria-hidden
                  />
                </div>

                <div className="relative z-10 mx-auto flex min-h-[300px] max-w-[1600px] flex-col justify-center gap-6 px-5 py-12 md:grid md:grid-cols-[minmax(0,26rem)_1fr_auto] md:items-center md:gap-10 md:px-10 md:py-16">
                  {/* Left — number badge + Mongolian body */}
                  <div className="flex items-start gap-5 md:gap-6">
                    <span className="mt-1 flex h-[35px] w-[35px] flex-none items-center justify-center rounded-full border border-white text-[12px] font-semibold tabular-nums text-bone transition-colors duration-500 group-hover:border-gold group-hover:text-gold">
                      {num}
                    </span>
                    <div className="max-w-[300px]">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-bone/60">
                        {item.title}
                      </p>
                      <p className="mt-2.5 text-[18px] font-medium leading-[27px] text-white">
                        {item.body}
                      </p>
                    </div>
                  </div>

                  {/* Center — huge display keyword (weight 400), underline on hover */}
                  <div className="md:justify-self-center md:text-center">
                    <span className="elys-keyword inline-flex items-baseline text-[clamp(5rem,12.5vw,11.25rem)] font-normal leading-[0.95] tracking-[-0.05em] text-bone">
                      {row.keyword}
                    </span>
                  </div>

                  {/* Right — large thin-stroke arrow */}
                  <div className="md:justify-self-end">
                    <span
                      aria-hidden
                      className="elys-arrow inline-flex items-center justify-center text-bone transition-transform duration-500 group-hover:translate-x-2"
                    >
                      <svg
                        viewBox="0 0 100 40"
                        className="h-[70px] w-[110px] md:h-[90px] md:w-[140px]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="2" y1="20" x2="96" y2="20" />
                        <polyline points="78,6 96,20 78,34" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

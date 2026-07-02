"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { FINAL } from "@/lib/content";

// Placeholder nearby landmarks — client to confirm exact list + drive times.
// Reference: lagom-development.com/unique (big minute numeral + "мин машинаар" + place).
// One card carries a photo instead of a numeral.
type Landmark =
  | { kind: "time"; minutes: number; place: string }
  | { kind: "photo"; image: string; place: string };

const landmarks: Landmark[] = [
  { kind: "photo", image: "/images/amenity-garden-walk.jpg", place: "Үндэсний цэцэрлэгт хүрээлэн" },
  { kind: "time", minutes: 3, place: "Их дэлгүүр" },
  { kind: "time", minutes: 8, place: "Сүхбаатарын талбай" },
  { kind: "time", minutes: 12, place: "Зайсан" },
  { kind: "time", minutes: 18, place: "Аэропорт" },
  { kind: "time", minutes: 25, place: "Чингис хаан ОУНБ" },
];

const MAP_SRC =
  "https://www.google.com/maps?q=National%20Garden%20Park%2C%20Ulaanbaatar&z=14&output=embed";
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=National+Garden+Park+Ulaanbaatar";

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M12 22s7-6.16 7-12a7 7 0 1 0-14 0c0 5.84 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function FinalMap() {
  // Pointer-drag scrolling for the landmark card row (Lagom-style draggable strip).
  const rowRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = rowRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = rowRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startLeft - dx;
  }, []);

  const endDrag = useCallback((e?: React.PointerEvent<HTMLDivElement>) => {
    const el = rowRef.current;
    if (el && e) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer may already be released */
      }
    }
    drag.current.active = false;
  }, []);

  // Suppress accidental link clicks after a drag gesture.
  const onClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }, []);

  // Grab pointer capture only after mount to avoid SSR issues.
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const handleDown = (e: PointerEvent) => {
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* setPointerCapture unsupported */
      }
    };
    el.addEventListener("pointerdown", handleDown);
    return () => el.removeEventListener("pointerdown", handleDown);
  }, []);

  return (
    <section id="location" className="scroll-mt-20 bg-bone py-24 font-gilroy text-ink md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        <Reveal>
          <p className="fnl-kicker text-moss">Байршил</p>
          <h2 className="mt-4 max-w-2xl text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[1.0] tracking-[-0.02em]">
            Хотын төвд, байгальтай зэрэгцэн
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-ink/70 md:text-lg">{FINAL.contact.location}</p>
        </Reveal>
      </div>

      {/* Lagom-style: large edge-to-edge map band, then a draggable row of landmark cards BELOW it. */}
      <Reveal delay={0.1} className="mt-12 md:mt-16">
        {/* Map band ~70vh. Google iframe — client to confirm exact coordinates/pin. */}
        <div className="relative h-[62vh] min-h-[480px] w-full overflow-hidden bg-sand md:h-[70vh]">
          <iframe
            src={MAP_SRC}
            title="Elysium Residence байршил"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full grayscale-[0.35] contrast-[0.95]"
            style={{ border: 0 }}
          />
          <div className="pointer-events-none absolute right-4 top-4 md:right-8 md:top-8">
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener"
              data-cursor-hover
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone shadow-lg transition-transform duration-300 hover:-translate-y-0.5"
            >
              Замын заавар авах <span aria-hidden>→</span>
            </a>
          </div>
        </div>

        {/* Landmark card row — draggable horizontal strip below the map. */}
        <div className="mx-auto max-w-[1500px] px-5 md:px-8">
          <p className="mt-8 fnl-kicker text-moss md:mt-10">Ойр орчим</p>
          <div
            ref={rowRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
            onClickCapture={onClickCapture}
            className="fnl-map-row mt-5 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pb-2 active:cursor-grabbing select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {landmarks.map((l) => (
              <div
                key={l.place}
                className="group relative flex h-[200px] w-[300px] shrink-0 snap-start flex-col justify-between overflow-hidden bg-clay/45 p-6 transition-transform duration-500 ease-out hover:-translate-y-1 md:h-[220px] md:w-[360px]"
              >
                {l.kind === "photo" ? (
                  <>
                    <Image
                      src={l.image}
                      alt={l.place}
                      fill
                      sizes="360px"
                      draggable={false}
                      className="pointer-events-none object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/25 to-transparent" />
                    <PinIcon className="relative z-10 h-6 w-6 self-end text-bone/90" />
                    <span className="relative z-10 max-w-[80%] text-lg font-bold leading-tight text-bone md:text-xl">
                      {l.place}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[clamp(3rem,6vw,4rem)] font-extrabold leading-none tracking-tight text-ink">
                        {l.minutes}
                      </span>
                      <span className="text-xs font-semibold text-ink/55">мин машинаар</span>
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-lg font-bold leading-tight text-ink md:text-xl">
                        {l.place}
                      </p>
                      <PinIcon className="h-6 w-6 shrink-0 text-moss/60" />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

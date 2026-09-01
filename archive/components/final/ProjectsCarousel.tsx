"use client";

import Image from "next/image";
import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from "react";

export type ProjectItem = {
  title: string;
  meta: string;
  floors?: number;
  units?: number;
  years: string;
  image: string;
};

/**
 * Sobha-style timeline carousel: ONE expanded active card (large photo, year,
 * name, метадата) flanked by narrow collapsed columns that show only the
 * year/label of neighbouring projects. Arrows + click-a-column advance one at a
 * time. Width/opacity transitions are CSS transform/flex-basis only (60fps).
 * On mobile it collapses to a single full-width card per view with swipe.
 */
/** Collapsed columns show a single year (spec: "1976" style), so use the start. */
function yearOf(years: string): string {
  const m = years.match(/\d{4}/);
  return m ? m[0] : years;
}

export function ProjectsCarousel({ projects }: { projects: ProjectItem[] }) {
  const [active, setActive] = useState(0);
  const count = projects.length;

  const go = useCallback(
    (next: number) => setActive((prev) => {
      const clamped = ((next % count) + count) % count;
      return clamped === prev ? prev : clamped;
    }),
    [count],
  );
  const prev = useCallback(() => go(active - 1), [active, go]);
  const next = useCallback(() => go(active + 1), [active, go]);

  // ----- Grab-cursor drag to advance one panel (spec: GRAB cursor + drag) -----
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const onPointerDown = useCallback((e: ReactPointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { x: e.clientX, moved: false };
    setDragging(true);
  }, []);
  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!drag.current) return;
      const dx = e.clientX - drag.current.x;
      if (Math.abs(dx) < 60 || drag.current.moved) return;
      drag.current.moved = true;
      if (dx < 0) next();
      else prev();
    },
    [next, prev],
  );
  const endDrag = useCallback(() => {
    drag.current = null;
    setDragging(false);
  }, []);

  return (
    <div>
      {/* ---------- Desktop / tablet: expanding filmstrip ---------- */}
      {/* Height tuned so the active panel reads ~16/10 (expanded ~707x432 @1440). */}
      <div
        className={`hidden select-none md:flex md:h-[clamp(24rem,30vw,27rem)] md:gap-3 ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        {projects.map((p, i) => {
          const isActive = i === active;
          return (
            <button
              key={p.title}
              type="button"
              onClick={() => {
                // Suppress the click that ends a drag-advance gesture.
                if (drag.current?.moved) return;
                go(i);
              }}
              aria-label={p.title}
              aria-current={isActive}
              style={{
                // Expanded ~16/10; collapsed a fixed ~100px column.
                flex: isActive ? "1 1 0%" : "0 0 clamp(88px,7vw,110px)",
              }}
              className={`group relative h-full overflow-hidden rounded-md text-left outline-none shadow-[0_18px_40px_-24px_rgba(22,40,15,0.45)] transition-[flex-basis,flex-grow,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-2 focus-visible:ring-gold ${
                isActive ? "" : "bg-bone"
              }`}
            >
              <Image
                src={p.image}
                alt={p.title}
                fill
                sizes={isActive ? "70vw" : "12vw"}
                draggable={false}
                className={`object-cover transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive ? "scale-100 opacity-100" : "scale-105 grayscale opacity-[0.14] group-hover:opacity-25"
                }`}
              />
              {/* Expanded scrim: dark gradient bottom-left */}
              <span
                aria-hidden
                className={`absolute inset-0 bg-gradient-to-tr from-charcoal/85 via-charcoal/20 to-transparent transition-opacity duration-700 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Collapsed column: dimmed serif year, centered on light bone */}
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                  isActive ? "opacity-0" : "opacity-100"
                }`}
              >
                <span className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-normal leading-none tracking-tight text-ink/55">
                  {yearOf(p.years)}
                </span>
              </span>

              {/* Expanded card content */}
              <span
                className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col p-6 transition-all duration-700 md:p-8 ${
                  isActive ? "translate-y-0 opacity-100 delay-150" : "translate-y-4 opacity-0"
                }`}
              >
                <span className="font-display text-[clamp(1.75rem,2.5vw,2.25rem)] font-normal leading-none tracking-tight text-bone">
                  {p.years}
                </span>
                <span className="mt-3 text-[clamp(1.15rem,1.7vw,1.7rem)] font-extrabold leading-tight tracking-tight text-bone">
                  {p.title}
                </span>
                <span className="mt-2 text-base font-light text-bone/85">
                  {p.meta}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ---------- Desktop controls ---------- */}
      <div className="mt-8 hidden items-center justify-between md:flex">
        <div className="flex items-center gap-3">
          {projects.map((p, i) => (
            <button
              key={p.title}
              type="button"
              onClick={() => go(i)}
              aria-label={`${p.title} — ${p.years}`}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === active ? "w-10 bg-ink" : "w-5 bg-ink/25 hover:bg-ink/50"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="mr-2 text-sm font-semibold tabular-nums text-ink/50">
            {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <NavButton dir="prev" onClick={prev} />
          <NavButton dir="next" onClick={next} />
        </div>
      </div>

      {/* ---------- Mobile: one full card per view, swipeable ---------- */}
      <MobileCarousel projects={projects} active={active} onChange={go} />
    </div>
  );
}

function NavButton({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Өмнөх төсөл" : "Дараах төсөл"}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-bone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className={dir === "next" ? "rotate-180" : ""}>
        <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** Mobile: a swipeable track showing one full card per view. */
function MobileCarousel({
  projects,
  active,
  onChange,
}: {
  projects: ProjectItem[];
  active: number;
  onChange: (i: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrolling = useRef(false);

  // Keep the track in sync when active changes from arrows / dots elsewhere.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[active] as HTMLElement | undefined;
    if (!child) return;
    scrolling.current = true;
    track.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
    const t = window.setTimeout(() => (scrolling.current = false), 400);
    return () => window.clearTimeout(t);
  }, [active]);

  // Report the snapped card back up as the user swipes.
  const onScroll = useCallback(() => {
    if (scrolling.current) return;
    const track = trackRef.current;
    if (!track) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== active) onChange(i);
  }, [active, onChange]);

  return (
    <div className="md:hidden">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((p) => (
          <div key={p.title} className="w-full flex-none snap-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md">
              <Image
                src={p.image}
                alt={p.title}
                fill
                sizes="90vw"
                className="object-cover"
              />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-display text-3xl font-normal leading-none tracking-tight text-bone">{p.years}</p>
                <h3 className="mt-3 text-xl font-extrabold leading-tight tracking-tight text-bone">{p.title}</h3>
                <p className="mt-2 text-sm font-light text-bone/85">{p.meta}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Mobile dots + counter */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {projects.map((p, i) => (
            <button
              key={p.title}
              type="button"
              onClick={() => onChange(i)}
              aria-label={`${p.title} — ${p.years}`}
              className={`h-1.5 rounded-full transition-all duration-400 ${
                i === active ? "w-8 bg-ink" : "w-4 bg-ink/25"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold tabular-nums text-ink/50">
          {String(active + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

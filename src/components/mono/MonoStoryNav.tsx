"use client";

/* /mono — fixed side navigation for the three scroll-story sections
   (Ерөнхий төлөвлөлт / ELYS концепц / Барилгын бүтэц).
   Visible only while the scroll is inside the story zone; the active
   label follows the scroll; clicking a label jumps to that section. */

import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import type { SiteContent } from "@/lib/site-content";

/** Хэсгүүдийн id — DOM хэмжилтэд ашиглана (шошго нь админаас ирнэ). */
const SECTION_IDS = ["about", "elys", "equip"] as const;

export function MonoStoryNav({ site }: { site: SiteContent }) {
  const items = [
    { id: SECTION_IDS[0], label: site.storyNav.plan },
    { id: SECTION_IDS[1], label: site.storyNav.elys },
    { id: SECTION_IDS[2], label: site.storyNav.equip },
  ];
  const lenis = useLenis();
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const mid = window.scrollY + window.innerHeight * 0.5;
      const secs = SECTION_IDS.map((id) => document.getElementById(id));
      if (secs.some((s) => !s)) return;
      const first = secs[0]!;
      const last = secs[secs.length - 1]!;
      const zoneTop = first.getBoundingClientRect().top + window.scrollY;
      const zoneBottom =
        last.getBoundingClientRect().top + window.scrollY + last.offsetHeight;
      setVisible(mid >= zoneTop && mid <= zoneBottom);

      let idx = 0;
      secs.forEach((sec, i) => {
        const top = sec!.getBoundingClientRect().top + window.scrollY;
        if (mid >= top) idx = i;
      });
      setActive(idx);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el);
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Хэсгийн навигаци"
      className={`fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-1 rounded-full bg-night/50 p-2 backdrop-blur-md transition-all duration-500 md:flex lg:right-6 ${
        visible ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-4 opacity-0"
      }`}
    >
      {items.map((it, i) => (
        <button
          key={it.id}
          type="button"
          onClick={() => go(it.id)}
          data-cursor-hover
          aria-current={active === i}
          style={{ transitionDelay: visible ? `${i * 70}ms` : "0ms" }}
          className={`group flex items-center gap-2.5 rounded-full px-3.5 py-2 text-left transition-[background-color,opacity,transform] duration-500 ${
            active === i ? "bg-white/10" : "hover:bg-white/5"
          } ${visible ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"}`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300 ${
              active === i ? "bg-lime" : "bg-white/35 group-hover:bg-white/60"
            }`}
          />
          <span
            className={`whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-300 ${
              active === i ? "text-white" : "text-white/55 group-hover:text-white/85"
            }`}
          >
            {it.label}
          </span>
        </button>
      ))}
    </nav>
  );
}

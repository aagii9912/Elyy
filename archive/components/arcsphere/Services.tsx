"use client";

import { useRef, useState } from "react";
import { SERVICES } from "./data";
import { SectionHead } from "./ui";
import { ArrowUpRight } from "./icons";

export function Services() {
  const [active, setActive] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <section id="services" className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
      <SectionHead title={SERVICES.title} subtitle={SERVICES.subtitle} />

      <div
        ref={sectionRef}
        onMouseMove={onMove}
        className="relative mt-16 border-t border-acs-brown/15"
      >
        {SERVICES.items.map((s, i) => (
          <div
            key={s.name}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive((cur) => (cur === i ? null : cur))}
            className="group flex items-start justify-between gap-6 border-b border-acs-brown/15 py-9 md:py-11"
          >
            <div className="max-w-2xl">
              <h3 className="text-[clamp(1.6rem,2.6vw,2.125rem)] font-normal tracking-[-0.01em] text-acs-ink transition-opacity duration-300 group-hover:opacity-100 md:group-hover:opacity-70">
                {s.name}
              </h3>
              <p className="mt-3 max-w-xl text-[0.98rem] leading-relaxed text-acs-ink/85">
                {s.desc}
              </p>
            </div>
            <span className="mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-acs-brown/40 text-acs-brown transition-colors duration-300 group-hover:bg-acs-brown group-hover:text-acs-cream">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        ))}

        {/* Cursor-following thumbnail */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10 hidden md:block"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`,
            opacity: active !== null ? 1 : 0,
            transition: "opacity 0.35s ease",
          }}
        >
          <div className="h-[180px] w-[270px] overflow-hidden rounded-lg shadow-2xl">
            {SERVICES.items.map((s, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={s.image}
                src={s.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                style={{ opacity: active === i ? 1 : 0 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function Marquee({
  items,
  duration = 26,
  className = "",
}: {
  items: string[];
  duration?: number;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to(el, { xPercent: -50, duration, ease: "none", repeat: -1 });
    }, track);
    return () => ctx.revert();
  }, [duration]);

  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={track} className="flex w-max items-center">
        {row.map((item, i) => (
          <span key={i} className="flex items-center whitespace-nowrap">
            <span className="font-display text-title font-light">{item}</span>
            <span className="mx-8 text-lime md:mx-14" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

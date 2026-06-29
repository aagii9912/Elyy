"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");

    gsap.set([dot.current, ring.current], { xPercent: -50, yPercent: -50 });

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };

    const move = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      gsap.set(dot.current, { x: pos.x, y: pos.y });
    };
    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      gsap.set(ring.current, { x: ringPos.x, y: ringPos.y });
    };
    const enter = () => gsap.to(ring.current, { scale: 2.3, duration: 0.35, ease: "power3.out" });
    const leave = () => gsap.to(ring.current, { scale: 1, duration: 0.35, ease: "power3.out" });

    const interactive = "a, button, [data-cursor-hover], input, textarea, select";
    const over = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(interactive)) enter();
    };
    const out = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(interactive)) leave();
    };

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      gsap.ticker.remove(tick);
      root.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-9 w-9 rounded-full border border-ink/70 mix-blend-difference md:block"
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-1.5 w-1.5 rounded-full bg-ink mix-blend-difference md:block"
      />
    </>
  );
}

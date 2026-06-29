"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useLenis((lenis) => {
    if (ref.current) ref.current.style.transform = `scaleX(${lenis.progress})`;
  });
  return (
    <div
      ref={ref}
      aria-hidden
      className="scroll-progress fixed left-0 top-0 z-[70] h-[2px] w-full bg-gold"
    />
  );
}

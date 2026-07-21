"use client";

/* /mono — shared building blocks (kicker, drag-scroll hook, zoom reveal). */

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/** Section label — tiny lime rule (the ~5% green accent) + neutral label. */
export function MonoKicker({
  children,
  tone = "light",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] ${
        tone === "dark" ? "text-white/60" : "text-mist"
      } ${className}`}
    >
      <span aria-hidden className="h-px w-8 bg-lime" />
      {children}
    </p>
  );
}

/** Pointer-drag horizontal scrolling for carousel strips (mouse).
 *  Pass your own ref when the element already needs one. */
export function useDragScroll<T extends HTMLElement>(externalRef?: React.RefObject<T | null>) {
  const internal = useRef<T>(null);
  const ref = externalRef ?? internal;
  const state = useRef({ active: false, startX: 0, startLeft: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent<T>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    state.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  }, [ref]);

  const onPointerMove = useCallback((e: React.PointerEvent<T>) => {
    const el = ref.current;
    if (!el || !state.current.active) return;
    el.scrollLeft = state.current.startLeft - (e.clientX - state.current.startX);
  }, [ref]);

  const end = useCallback((e: React.PointerEvent<T>) => {
    state.current.active = false;
    ref.current?.releasePointerCapture?.(e.pointerId);
  }, [ref]);

  return { ref, onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end };
}

/** Media zoom-in reveal — image scales down into place as the section enters. */
export function ZoomMedia({
  src,
  alt,
  className = "",
  imgClassName = "",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelector("img"),
        { scale: 1.18, opacity: 0.4 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 95%", end: "top 35%", scrub: 0.5 },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" className={`h-full w-full object-cover ${imgClassName}`} />
    </div>
  );
}

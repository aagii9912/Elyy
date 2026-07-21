"use client";

/* ============================================================
   /daylight — shared primitives
   DlButton · DlGrain · DlWaves · DlParallax · split helpers
   ============================================================ */

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type AnchorHTMLAttributes,
} from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

export { gsap, ScrollTrigger, useGSAP, SplitText };

/* ------------------------------------------------------------
   DlButton — Daylight-style CTA with the rotated white sweep.
   variant: primary (black) | secondary (beige) | waves (video-ish)
   ------------------------------------------------------------ */
export function DlButton({
  variant = "primary",
  hoverText,
  className = "",
  children,
  ...rest
}: {
  variant?: "primary" | "secondary" | "waves";
  /** color the label takes on hover (default black) */
  hoverText?: string;
  className?: string;
  children: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const base =
    "dl-btn group " +
    (variant === "primary"
      ? "bg-[var(--dl-black)] text-white"
      : variant === "secondary"
        ? "bg-[var(--dl-beige)] text-[var(--dl-black)]"
        : "text-white");
  return (
    <a {...rest} className={`${base} ${className}`}>
      {variant === "waves" && (
        <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
          <DlWaves className="h-full w-full" speed={0.35} bands={7} />
          <span className="absolute inset-0 backdrop-blur-[2px]" />
        </span>
      )}
      <span
        className="relative z-2 transition-[transform,color] duration-300 group-hover:-translate-y-[1px]"
        style={{
          transitionTimingFunction: "var(--dl-ease-expo)",
        }}
      >
        <span
          className="dl-btn-label"
          style={{ ["--dl-btn-hover-text" as string]: hoverText ?? "#111111" }}
        >
          {children}
        </span>
      </span>
      {variant !== "waves" && (
        <span
          aria-hidden
          className="absolute inset-0 h-full w-full origin-center translate-y-[200%] rotate-[15deg] scale-[1.8] rounded-lg bg-white transition-transform duration-1000 group-hover:translate-y-0 group-hover:rotate-[8deg]"
          style={{ transitionTimingFunction: "var(--dl-ease-expo)" }}
        />
      )}
    </a>
  );
}

/* ------------------------------------------------------------
   DlGrain — animated film grain overlay (canvas-generated tile,
   stepped background-position shift like the original).
   ------------------------------------------------------------ */
export function DlGrain({ opacity = 0.4 }: { opacity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const size = 160;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 28; // subtle
    }
    ctx.putImageData(img, 0, 0);
    el.style.backgroundImage = `url(${c.toDataURL("image/png")})`;
  }, []);
  return <div ref={ref} aria-hidden className="dl-grain" style={{ opacity }} />;
}

/* ------------------------------------------------------------
   DlWaves — animated diagonal orange bands (recreation of the
   hero wave texture: layered soft sine bands + slow drift).
   ------------------------------------------------------------ */
export function DlWaves({
  className = "",
  speed = 0.5,
  bands = 10,
  style,
}: {
  className?: string;
  speed?: number;
  bands?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Only animate while on-screen and the tab is visible — the waves sit
    // behind videos/buttons and must not burn GPU when they can't be seen.
    let inView = true;
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(canvas);

    const t0 = performance.now();
    const draw = () => {
      if (!inView) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const t = ((performance.now() - t0) / 1000) * speed;
      // base gradient
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#ef6a02");
      g.addColorStop(0.55, "#f67a10");
      g.addColorStop(1, "#fb8f2c");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // diagonal soft bands
      for (let i = 0; i < bands; i++) {
        const p = i / bands;
        const yBase = p * (h + 240) - 120;
        ctx.beginPath();
        ctx.moveTo(-50, yBase + Math.sin(t * 0.7 + i) * 18 + 60);
        const seg = 6;
        for (let s = 0; s <= seg; s++) {
          const x = (w + 100) * (s / seg) - 50;
          const y =
            yBase +
            (x / (w || 1)) * -90 + // diagonal tilt
            Math.sin(t * 0.55 + i * 1.7 + s * 0.9) * 22 +
            60;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w + 50, h + 200);
        ctx.lineTo(-50, h + 200);
        ctx.closePath();
        const shade = i % 2 === 0 ? "rgba(224,88,0,0.20)" : "rgba(255,152,64,0.16)";
        ctx.fillStyle = shade;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [speed, bands]);
  return <canvas ref={ref} className={className} style={style} aria-hidden />;
}

/* ------------------------------------------------------------
   DlParallax — light scroll parallax wrapper (translateY range
   in px across the element's scroll-through, like the original
   Parallax distance prop).
   ------------------------------------------------------------ */
export function DlParallax({
  distance = 200,
  className = "",
  innerClassName = "",
  children,
}: {
  /** total px the inner layer travels while scrolling through */
  distance?: number;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!outer.current || !inner.current) return;
      gsap.fromTo(
        inner.current,
        { y: distance / 2 },
        {
          y: -distance / 2,
          ease: "none",
          scrollTrigger: {
            trigger: outer.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: outer },
  );
  return (
    <div ref={outer} className={`overflow-clip ${className}`}>
      <div ref={inner} className={innerClassName} style={{ willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   splitLinesMasked — SplitText helper: splits into masked lines
   (overflow-clip wrappers) and returns the line elements.
   ------------------------------------------------------------ */
export function splitLinesMasked(target: gsap.DOMTarget, linesClass = "dl-line") {
  return SplitText.create(target, {
    type: "lines",
    linesClass,
    mask: "lines",
  });
}

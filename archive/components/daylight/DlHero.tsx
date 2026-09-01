"use client";

/* ============================================================
   /daylight — DlHero
   Layering matches the original:
   1. Fullscreen dark building film (base, always full-bleed)
   2. Orange wave canvas ABOVE it — fullscreen during the intro,
      then clipped down to a slim "window" (inset mask)
   3. Hairline frame lines crossing the viewport at the window edges
   4. Info widgets sitting OUTSIDE the window edges
   5. White editorial copy + phone form on the left
   A scrubbed exit drifts the window / widgets as you scroll away.
   ============================================================ */

import { useEffect, useRef, type ReactNode } from "react";
import { useLenis } from "lenis/react";
import { useLang } from "@/components/LangProvider";
import { DL_DICT, DL_MEDIA } from "@/lib/daylight-content";
import { gsap, useGSAP, DlWaves, splitLinesMasked } from "./shared";

/* A single masked line row: inner element is the animated `.dl-line`. */
function MaskRow({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={`dl-line-mask ${className}`}>
      <span className="dl-line">{children}</span>
    </span>
  );
}

export function DlHero() {
  const { lang } = useLang();
  const t = DL_DICT[lang].hero;

  /* lenis — captured through refs so the one-shot intro effect never has to
     re-run when the smooth-scroll instance finishes booting. */
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const introRunningRef = useRef(false);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);
  useEffect(() => {
    if (lenis && introRunningRef.current) lenis.stop();
  }, [lenis]);

  /* intro plays exactly once, even across breakpoint / reduced-motion swaps */
  const introPlayedRef = useRef(false);
  const mmRef = useRef<ReturnType<typeof gsap.matchMedia> | null>(null);

  /* refs */
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wavesClipRef = useRef<HTMLDivElement>(null);
  const wavesInnerRef = useRef<HTMLDivElement>(null);
  const edgeTopRef = useRef<HTMLDivElement>(null);
  const edgeRightRef = useRef<HTMLDivElement>(null);
  const edgeBottomRef = useRef<HTMLDivElement>(null);
  const edgeLeftRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const infoTopRef = useRef<HTMLDivElement>(null);
  const infoSideRef = useRef<HTMLDivElement>(null);
  const infoBottomRef = useRef<HTMLDivElement>(null);
  const barInnerRef = useRef<HTMLSpanElement>(null);
  const textWrapRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  /* base film: autoplay best-effort, fade in once it can paint */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const reveal = () => {
      v.style.opacity = "1";
      v.play().catch(() => {});
    };
    const retry = () => {
      if (v.paused) v.play().catch(() => {});
    };
    v.addEventListener("canplay", reveal);
    document.addEventListener("visibilitychange", retry);
    window.addEventListener("pointerdown", retry, { passive: true });
    if (v.readyState >= 2) reveal();
    v.play().catch(() => {});
    return () => {
      v.removeEventListener("canplay", reveal);
      document.removeEventListener("visibilitychange", retry);
      window.removeEventListener("pointerdown", retry);
    };
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      const wavesClip = wavesClipRef.current;
      const wavesInner = wavesInnerRef.current;
      const word = wordRef.current;
      const logo = logoRef.current;
      const infoTop = infoTopRef.current;
      const infoSide = infoSideRef.current;
      const infoBottom = infoBottomRef.current;
      const bar = barInnerRef.current?.parentElement ?? null;
      const barInner = barInnerRef.current;
      const textWrap = textWrapRef.current;
      const kicker = kickerRef.current;
      const h1 = h1Ref.current;
      const p = pRef.current;
      const form = formRef.current;
      const et = edgeTopRef.current;
      const er = edgeRightRef.current;
      const eb = edgeBottomRef.current;
      const el = edgeLeftRef.current;

      if (
        !root || !wavesClip || !wavesInner || !word || !logo || !infoTop ||
        !infoSide || !infoBottom || !bar || !barInner || !textWrap ||
        !kicker || !h1 || !p || !form || !et || !er || !eb || !el
      ) {
        return;
      }

      const edges = [et, er, eb, el];
      const widgetLines = (host: HTMLElement) =>
        gsap.utils.toArray<HTMLElement>(host.querySelectorAll(".dl-line"));
      const infoTopLines = widgetLines(infoTop);
      const infoSideLines = widgetLines(infoSide);
      const infoBottomLines = widgetLines(infoBottom);

      const mm = gsap.matchMedia();
      mmRef.current = mm;

      mm.add(
        {
          desktop: "(min-width: 1024px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const desktop = !!context.conditions?.desktop;
          const reduce = !!context.conditions?.reduce;

          /* clip windows + matching edge offsets for this breakpoint */
          const WINDOW = desktop
            ? "inset(30% 15% 30% 67.15%)"
            : "inset(22.29% 28.27% 53.83% 36%)";
          const EXIT = desktop
            ? "inset(35% 20% 35% 72%)"
            : "inset(26% 32% 57% 41%)";

          const H = root.offsetHeight;
          const W = root.offsetWidth;
          const winTopY = (desktop ? 0.3 : 0.2229) * H;
          const winRightX = (desktop ? -0.15 : -0.2827) * W;
          const winBottomY = (desktop ? -0.3 : -0.5383) * H;
          const winLeftX = (desktop ? 0.6715 : 0.36) * W;
          const exTopY = (desktop ? 0.35 : 0.26) * H;
          const exRightX = (desktop ? -0.2 : -0.32) * W;
          const exBottomY = (desktop ? -0.35 : -0.57) * H;
          const exLeftX = (desktop ? 0.72 : 0.41) * W;

          /* Phase B — scrubbed exit. */
          let phaseB: gsap.core.Timeline | null = null;
          const buildPhaseB = () => {
            if (phaseB) return;
            phaseB = gsap.timeline({
              defaults: { duration: 1, ease: "power2.in" },
              scrollTrigger: {
                trigger: root,
                start: "top 1%",
                end: "+=100%",
                scrub: 1,
              },
            });
            phaseB
              .to(wavesClip, { clipPath: EXIT }, 0)
              .to(et, { y: exTopY }, 0)
              .to(er, { x: exRightX }, 0)
              .to(eb, { y: exBottomY }, 0)
              .to(el, { x: exLeftX }, 0)
              .to(infoTop, { xPercent: 40, autoAlpha: 0 }, 0)
              .to(
                infoSide,
                { xPercent: -40, yPercent: -20, autoAlpha: 0 },
                0,
              )
              .to(infoBottom, { y: 30, autoAlpha: 0 }, 0)
              .to(barInner, { scaleX: 1, transformOrigin: "0% 50%" }, 0)
              .to(textWrap, { y: -120 }, 0)
              .to(edges, { autoAlpha: 0, duration: 0.3 }, 0.7);
          };

          /* ---- reduced motion: land straight on the resolved state ---- */
          if (reduce) {
            gsap.set(wavesClip, { clipPath: WINDOW });
            gsap.set(wavesInner, { scale: 1 });
            gsap.set(word, { autoAlpha: 0 });
            gsap.set(edges, { autoAlpha: 1 });
            gsap.set(et, { y: winTopY });
            gsap.set(er, { x: winRightX });
            gsap.set(eb, { y: winBottomY });
            gsap.set(el, { x: winLeftX });
            gsap.set(barInner, { scaleX: 0.4, transformOrigin: "0% 50%" });
            return;
          }

          /* ---- already played: snap to resolved state, wire the exit ---- */
          if (introPlayedRef.current) {
            gsap.set(wavesClip, { clipPath: WINDOW });
            gsap.set(wavesInner, { scale: 1 });
            gsap.set(word, { autoAlpha: 0 });
            gsap.set(edges, { autoAlpha: 1 });
            gsap.set(et, { y: winTopY });
            gsap.set(er, { x: winRightX });
            gsap.set(eb, { y: winBottomY });
            gsap.set(el, { x: winLeftX });
            gsap.set(bar, { autoAlpha: 1 });
            gsap.set(barInner, { scaleX: 0.4, transformOrigin: "0% 50%" });
            gsap.set(
              [...infoTopLines, ...infoSideLines, ...infoBottomLines],
              { yPercent: 0 },
            );
            buildPhaseB();
            return;
          }

          /* ---- first run: the full intro (plays once) ---- */
          introPlayedRef.current = true;

          const splitK = splitLinesMasked(kicker);
          const splitH = splitLinesMasked(h1);
          const splitP = splitLinesMasked(p);
          const allLines = [...splitK.lines, ...splitH.lines, ...splitP.lines];

          gsap.set(wavesClip, { clipPath: "inset(0% 0% 0% 0%)" });
          gsap.set(wavesInner, { scale: 1.1 });
          gsap.set(word, { autoAlpha: 0, x: -60 });
          gsap.set(logo, { rotate: -12 });
          gsap.set(allLines, { yPercent: 110 });
          gsap.set(
            [...infoTopLines, ...infoSideLines, ...infoBottomLines],
            { yPercent: 110 },
          );
          gsap.set(bar, { autoAlpha: 0 });
          gsap.set(barInner, { scaleX: 0, transformOrigin: "0% 50%" });
          gsap.set(form, { autoAlpha: 0, y: 24 });
          gsap.set(edges, { autoAlpha: 0 });

          introRunningRef.current = true;
          lenisRef.current?.stop();
          const safety = window.setTimeout(() => {
            introRunningRef.current = false;
            lenisRef.current?.start();
          }, 2200);

          const tl = gsap.timeline({
            defaults: { ease: "power4.out" },
            onComplete: () => {
              window.clearTimeout(safety);
              introRunningRef.current = false;
              lenisRef.current?.start();
              buildPhaseB();
            },
          });

          tl
            /* wordmark drops in over the fullscreen waves */
            .to(word, { autoAlpha: 1, x: 0, duration: 1 }, 0.2)
            .to(logo, { rotate: 0, duration: 1.2 }, 0.2)
            /* waves shrink into the window, revealing the film behind */
            .to(wavesClip, { clipPath: WINDOW, duration: 2, ease: "expo.inOut" }, 1.0)
            .to(wavesInner, { scale: 1, duration: 2, ease: "expo.inOut" }, 1.0)
            .to(edges, { autoAlpha: 1, duration: 0.3 }, 1.2)
            .to(et, { y: winTopY, duration: 2, ease: "expo.inOut" }, 1.0)
            .to(er, { x: winRightX, duration: 2, ease: "expo.inOut" }, 1.0)
            .to(eb, { y: winBottomY, duration: 2, ease: "expo.inOut" }, 1.0)
            .to(el, { x: winLeftX, duration: 2, ease: "expo.inOut" }, 1.0)
            /* wordmark sweeps away as the copy takes over */
            .to(word, { x: -40, y: -40, autoAlpha: 0, duration: 0.8, ease: "power4.in" }, 2.0)
            .to(splitH.lines, { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.1 }, 2.0)
            .to(splitK.lines, { yPercent: 0, duration: 0.5, ease: "power4.out" }, 2.0)
            .to(splitP.lines, { yPercent: 0, duration: 0.6, ease: "power4.out", stagger: 0.08 }, 2.2)
            .to(form, { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, 2.35)
            /* info widgets settle in around the window */
            .to(infoTopLines, { yPercent: 0, duration: 0.5, ease: "expo.out", stagger: 0.04 }, 2.3)
            .to(infoSideLines, { yPercent: 0, duration: 0.5, ease: "expo.out", stagger: 0.04 }, 2.4)
            .to(bar, { autoAlpha: 1, duration: 0.3 }, 2.4)
            .to(barInner, { scaleX: 0.4, duration: 0.5, ease: "expo.out", transformOrigin: "0% 50%" }, 2.4)
            .to(infoBottomLines, { yPercent: 0, duration: 0.5, ease: "expo.out", stagger: 0.04 }, 2.5);

          return () => {
            window.clearTimeout(safety);
            splitK.revert();
            splitH.revert();
            splitP.revert();
            phaseB?.scrollTrigger?.kill();
            phaseB?.kill();
            if (introRunningRef.current) {
              introRunningRef.current = false;
              lenisRef.current?.start();
            }
          };
        },
      );
    },
    { scope: rootRef, dependencies: [] },
  );

  /* revert matchMedia (and its per-condition cleanups) on unmount */
  useEffect(
    () => () => {
      mmRef.current?.revert();
      introRunningRef.current = false;
      lenisRef.current?.start();
    },
    [],
  );

  const goBooking = () => {
    window.location.href = "/final#booking";
  };

  return (
    <section
      id="dl-content"
      ref={rootRef}
      className="dl-hero relative h-svh w-full overflow-clip bg-[#141210]"
    >
      {/* 1 — fullscreen building film (base layer) */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src={DL_MEDIA.heroVideo}
          poster={DL_MEDIA.heroPoster}
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500"
        />
        {/* readability veil over the film */}
        <div className="absolute inset-0 bg-black/[12.5%]" />
      </div>

      {/* 2 — orange waves, clipped from fullscreen down to the window */}
      <div
        ref={wavesClipRef}
        className="absolute inset-0 z-[1] will-change-[clip-path]"
      >
        <div ref={wavesInnerRef} className="absolute inset-0 will-change-transform">
          <DlWaves className="absolute inset-0 h-full w-full" />
        </div>
      </div>

      {/* 3 — hairline frame lines crossing the viewport at the window edges */}
      <div ref={edgeTopRef} aria-hidden className="absolute left-0 top-0 z-[2] h-px w-full bg-white/30" />
      <div ref={edgeRightRef} aria-hidden className="absolute right-0 top-0 z-[2] h-full w-px bg-white/30" />
      <div ref={edgeBottomRef} aria-hidden className="absolute bottom-0 left-0 z-[2] h-px w-full bg-white/30" />
      <div ref={edgeLeftRef} aria-hidden className="absolute left-0 top-0 z-[2] h-full w-px bg-white/30" />

      {/* 4 — info widgets OUTSIDE the window edges (desktop) */}
      <div
        ref={infoTopRef}
        className="absolute left-[67.15%] top-[calc(30%-58px)] z-[2] hidden flex-col items-start gap-[4px] text-[var(--dl-beige)] lg:flex"
      >
        <MaskRow className="text-[11px] opacity-90">{t.infoTop.label}</MaskRow>
        <MaskRow className="text-[12px] font-medium">{t.infoTop.value}</MaskRow>
      </div>
      <div
        ref={infoSideRef}
        className="absolute left-[calc(85%+14px)] top-[56%] z-[2] hidden w-max flex-col items-start gap-[8px] text-[var(--dl-beige)] lg:flex"
      >
        <MaskRow className="text-[11px] opacity-90">{t.infoRight.backup}</MaskRow>
        <span className="relative block h-[7px] w-[120px] bg-[var(--dl-beige)]/40">
          <span
            ref={barInnerRef}
            className="absolute inset-0 origin-left bg-[var(--dl-beige)]"
            style={{ transform: "scaleX(0.4)" }}
          />
        </span>
      </div>
      <div
        ref={infoBottomRef}
        className="absolute left-[67.15%] top-[calc(70%+14px)] z-[2] hidden flex-col items-start gap-[4px] text-[var(--dl-beige)] lg:flex"
      >
        <MaskRow className="text-[11px] opacity-90">
          <span className="inline-flex items-center gap-[6px]">
            <span aria-hidden className="text-[0.8em] leading-none">✳</span>
            {t.infoRight.thermostat}
          </span>
        </MaskRow>
        <MaskRow className="text-[12px] font-medium">{t.infoRight.thermoValue}</MaskRow>
      </div>

      {/* 5 — editorial copy + phone form */}
      <div
        ref={textWrapRef}
        className="dl-container relative z-[3] flex h-full flex-col justify-center lg:translate-y-[min(4vh,40px)]"
      >
        <small
          key={`k-${lang}`}
          ref={kickerRef}
          className="dl-mono dl-text-12 text-white"
        >
          {t.kicker}
        </small>
        <h1
          key={`h-${lang}`}
          ref={h1Ref}
          className="dl-serif dl-text-40 lg:dl-text-85 mt-[12px] max-w-[calc(15*var(--column)+14*var(--gutter))] text-[var(--dl-beige)] lg:mt-[24px]"
        >
          {t.titleLines[0]}
          <br />
          {t.titleLines[1]}
        </h1>
        <p
          key={`p-${lang}`}
          ref={pRef}
          className="dl-text-14 lg:dl-text-20 mt-[12px] max-w-[calc(9*var(--column)+8*var(--gutter))] text-[var(--dl-beige)] max-lg:max-w-[calc(8*var(--column)+7*var(--gutter))] lg:mt-[24px] lg:font-medium"
        >
          {t.text}
        </p>
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            goBooking();
          }}
          className="mt-[24px] flex h-[56px] w-full max-w-[340px] items-center rounded-[12px] border border-white/[0.22] bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.24)] backdrop-blur-[6px] backdrop-saturate-[110%] transition-[border-color] duration-200 focus-within:border-[rgba(255,247,233,0.4)] md:h-[60px] md:max-w-[400px]"
        >
          <input
            type="tel"
            name="phone"
            placeholder={t.formPlaceholder}
            className="h-full min-w-0 flex-1 bg-transparent pr-[12px] pl-[16px] text-[16px] tracking-[-0.02em] text-[#FFF7E9] outline-none placeholder:text-[rgba(255,247,233,0.75)] md:pr-[16px] md:pl-[20px]"
            aria-label={t.formPlaceholder}
          />
          <button
            type="submit"
            className="group/btn relative mx-[6px] flex h-[44px] shrink-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-[8px] bg-[#111111] px-[16px] text-[14px] font-medium tracking-[-0.02em] text-[#FFF7E9] md:h-[48px] md:px-[18px]"
          >
            <span className="relative z-[2] transition-colors duration-300 ease-[cubic-bezier(0.16,1.08,0.38,0.98)] group-hover/btn:text-[#4C2806]">
              {t.cta}
            </span>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[1] h-full w-full origin-center translate-y-[200%] rotate-[15deg] scale-[1.8] rounded-[8px] bg-[#FFF7E9] transition-transform duration-1000 ease-[cubic-bezier(0.16,1.08,0.38,0.98)] group-hover/btn:translate-y-0 group-hover/btn:rotate-[8deg]"
            />
          </button>
        </form>
      </div>

      {/* 6 — preloader wordmark (over the fullscreen waves) */}
      <div
        ref={wordRef}
        className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center"
      >
        <img
          ref={logoRef}
          src={DL_MEDIA.logo}
          alt={t.wordmark}
          className="w-[62vw] max-w-[520px] lg:w-[520px]"
        />
      </div>
    </section>
  );
}

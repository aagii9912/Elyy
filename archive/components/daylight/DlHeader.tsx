"use client";

/* ============================================================
   /daylight — DlHeader
   Fixed floating pill navbar. Slides in after the hero intro,
   hides on scroll-down / shows on scroll-up, and swaps to a
   white bar + drop-down panel on mobile.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, DlWaves } from "./shared";
import { DL_DICT } from "@/lib/daylight-content";
import { useLang } from "@/components/LangProvider";

export function DlHeader() {
  const { lang, setLang } = useLang();
  const t = DL_DICT[lang].nav;

  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  /* -- intro: slide the pill in after the hero animation -------- */
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(header, { y: 0, yPercent: 0 });
        readyRef.current = true;
        return;
      }
      // `y: 0` clears the px value gsap parses out of the inline
      // translateY(-150%) SSR style so only yPercent drives the slide.
      gsap.set(header, { y: 0, yPercent: -150 });
      gsap.to(header, {
        yPercent: 0,
        duration: 0.6,
        ease: "expo.out",
        delay: 2.6,
        onComplete: () => {
          readyRef.current = true;
        },
      });
    },
    { scope: headerRef },
  );

  /* -- show / hide the header as the hidden flag flips ---------- */
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    if (!readyRef.current) return; // the intro owns the transform until it settles
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(header, { yPercent: hidden ? -150 : 0 });
      return;
    }
    gsap.to(header, {
      yPercent: hidden ? -150 : 0,
      duration: 0.5,
      ease: "power3.out",
      overwrite: true,
    });
  }, [hidden]);

  /* -- native scroll listener: down = hide, up = show ---------- */
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      if (!readyRef.current) return; // don't fight the intro delay
      const y = window.scrollY;
      if (open) setHidden(false);
      else if (y < 80) setHidden(false);
      else if (y - lastY > 2) setHidden(true);
      else if (lastY - y > 2) setHidden(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  /* -- mobile menu panel open / close -------------------------- */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(panel, { autoAlpha: open ? 1 : 0, y: open ? 0 : -8 });
      return;
    }
    if (open) {
      gsap.fromTo(
        panel,
        { autoAlpha: 0, y: -8 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: "expo.out" },
      );
    } else {
      gsap.to(panel, { autoAlpha: 0, y: -8, duration: 0.35, ease: "expo.out" });
    }
  }, [open]);

  const cta = (
    <>
      <DlWaves
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        speed={0.35}
        bands={6}
      />
      <span className="pointer-events-none absolute inset-0 z-[1] backdrop-blur-[3px]" />
      <span className="relative z-[2]">{t.cta}</span>
    </>
  );

  return (
    <>
      <a
        href="#dl-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-[20px] focus:left-[20px] focus:z-[1001] focus:bg-white focus:p-[10px] focus:rounded-[6px] text-[13px] text-[var(--dl-black)]"
      >
        Агуулга руу очих
      </a>

      <header
        ref={headerRef}
        style={{ transform: "translateY(-150%)" }}
        className="pointer-events-none fixed top-[12px] left-0 z-[100] w-full px-[var(--margin)] will-change-transform lg:top-[22px]"
      >
        {/* ---- desktop pill -------------------------------------- */}
        <div className="pointer-events-auto mx-auto hidden h-[57px] w-fit items-center gap-[28px] rounded-[8px] bg-white p-[6px] pl-[16px] shadow-[0_1px_2px_rgba(0,0,0,0.06)] lg:flex">
          <a href="/daylight" className="flex items-center">
            <img src="/brand/elysium-logo-dark.svg" alt="Elysium" className="h-[13px] w-auto" />
          </a>

          <nav aria-label="Main" className="flex items-center gap-[24px]">
            {t.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[14px] text-[var(--dl-black)] transition-opacity duration-300 hover:opacity-60"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              aria-pressed={lang === "mn"}
              onClick={() => setLang("mn")}
              className={`dl-mono text-[12px] transition-opacity ${
                lang === "mn" ? "opacity-100" : "opacity-40 hover:opacity-70"
              }`}
            >
              MN
            </button>
            <button
              type="button"
              aria-pressed={lang === "en"}
              onClick={() => setLang("en")}
              className={`dl-mono text-[12px] transition-opacity ${
                lang === "en" ? "opacity-100" : "opacity-40 hover:opacity-70"
              }`}
            >
              EN
            </button>
          </div>

          <a
            href="/final#booking"
            className="relative flex h-[45px] items-center justify-center overflow-clip whitespace-nowrap rounded-[4px] px-[24px] text-[15px] font-medium text-white transition hover:brightness-110"
          >
            {cta}
          </a>
        </div>

        {/* ---- mobile bar ---------------------------------------- */}
        <div className="pointer-events-auto relative flex h-[52px] items-center justify-between rounded-[8px] bg-white px-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.06)] lg:hidden">
          <a href="/daylight" className="flex items-center">
            <img src="/brand/elysium-logo-dark.svg" alt="Elysium" className="h-[11px] w-auto" />
          </a>

          <button
            type="button"
            aria-label={open ? "Цэс хаах" : "Цэс нээх"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-[24px] w-[24px] flex-col items-center justify-center gap-[5px]"
          >
            <span
              className={`h-[2px] w-[18px] bg-[var(--dl-black)] transition-transform duration-300 ${
                open ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[2px] w-[18px] bg-[var(--dl-black)] transition-transform duration-300 ${
                open ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>

          <div
            ref={panelRef}
            style={{ opacity: 0, visibility: "hidden" }}
            className="absolute top-full right-0 left-0 mt-[6px] flex flex-col gap-[14px] rounded-[8px] bg-white p-[18px] shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
          >
            {t.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-[16px] text-[var(--dl-black)]"
              >
                {l.label}
              </a>
            ))}
            <a
              href="/final#booking"
              onClick={() => setOpen(false)}
              className="relative flex h-[46px] w-full items-center justify-center overflow-clip whitespace-nowrap rounded-[4px] text-[15px] font-medium text-white"
            >
              {cta}
            </a>
          </div>
        </div>
      </header>
    </>
  );
}

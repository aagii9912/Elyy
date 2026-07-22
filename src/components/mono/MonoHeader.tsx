"use client";

/* /mono — sticky header. Transparent (white text) over the dark hero →
   frosted white with black text once the light page begins. Hides on
   scroll-down, returns on scroll-up. The mobile menu is a SIBLING of
   <header> (not a child) because the header's transform/backdrop-filter
   would otherwise become the containing block for its fixed panel. */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { Logo, LogoMark } from "@/components/Logo";
import { FINAL } from "@/lib/content";

const NAV = [
  { label: "Төслийн тухай", href: "#about" },
  { label: "Давуу тал", href: "#elys" },
  { label: "Өрөөний сонголт", href: "#apartments" },
  { label: "Хэрэгжүүлэгч", href: "#developer" },
  { label: "Байршил", href: "#location" },
  { label: "FAQ", href: "#faq" },
];

export function MonoHeader() {
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const delta = y - lastY;
      if (Math.abs(delta) > 8) {
        setHidden(delta > 0 && y > 480);
        lastY = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -72 });
      else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  };

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 font-gilroy transition-[background-color,box-shadow,backdrop-filter,transform] duration-500 ${
        hidden && !open ? "-translate-y-full" : ""
      } ${
        open
          ? "bg-white text-night"
          : scrolled
            ? "bg-white/90 text-night shadow-[0_1px_0_rgba(21,23,23,0.08)] backdrop-blur-xl"
            : "bg-transparent text-white"
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1600px] items-center gap-6 px-5 transition-[height] duration-500 md:px-10 ${
          scrolled ? "h-[58px]" : "h-[80px]"
        }`}
      >
        <Link href="#top" onClick={(e) => go(e, "#top")} aria-label="Elysium" className="flex items-center gap-2.5">
          <LogoMark className="h-[18px] w-auto" />
          <Logo className="h-3 w-auto" />
        </Link>

        <nav className="ml-4 hidden items-center gap-6 lg:flex xl:gap-8">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => go(e, item.href)}
              data-cursor-hover
              className={`text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
                scrolled ? "text-night/60 hover:text-night" : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <a
            href="/brochure.pdf"
            target="_blank"
            rel="noopener"
            data-cursor-hover
            className={`hidden items-center gap-2 rounded-full border px-5 py-2 text-[11px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 sm:inline-flex ${
              scrolled
                ? "border-night/25 text-night hover:bg-night hover:text-white"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
          >
            {FINAL.hero.brochure} ↓
          </a>
          <a
            href="#contact"
            onClick={(e) => go(e, "#contact")}
            data-cursor-hover
            className={`hidden items-center gap-2 rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-transform duration-300 hover:-translate-y-0.5 md:inline-flex ${
              scrolled ? "bg-night text-white" : "bg-white text-night"
            }`}
          >
            {FINAL.hero.cta}
          </a>
          <button
            type="button"
            aria-label="Цэс"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={`relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden ${open ? "text-night" : ""}`}
          >
            <span className={`h-0.5 w-6 bg-current transition-transform duration-300 ${open ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`h-0.5 w-6 bg-current transition-transform duration-300 ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

    </header>

      {/* Mobile menu — sibling of <header>, see note above */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-white font-gilroy text-night transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="mt-24 flex flex-col gap-2.5 px-7">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => go(e, item.href)}
              className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.01em]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t border-night/10 px-7 py-7">
          <a href="#contact" onClick={(e) => go(e, "#contact")} className="rounded-full bg-night px-6 py-3 text-center text-sm font-bold text-white">
            {FINAL.hero.cta}
          </a>
          <a href="/brochure.pdf" target="_blank" rel="noopener" className="rounded-full border border-night/25 px-6 py-3 text-center text-sm font-semibold">
            {FINAL.hero.brochure} ↓
          </a>
        </div>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { Logo, LogoMark } from "@/components/Logo";
import { FINAL } from "@/lib/content";

const NAV = [
  { label: "Төслийн тухай", href: "#about" },
  { label: "Өрөөний сонголт", href: "#apartments" },
  { label: "Төслийн давуу тал", href: "#advantages" },
  { label: "Байршил", href: "#location" },
  { label: "FAQ", href: "#faq" },
  { label: "Холбоо барих", href: "#contact" },
];

export function FinalHeader() {
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -80 });
      else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 font-gilroy transition-[background-color,box-shadow,backdrop-filter,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled
          ? "bg-bone/95 text-ink shadow-[0_1px_0_rgba(42,81,36,0.10)] backdrop-blur-xl"
          : "bg-transparent text-bone shadow-none backdrop-blur-0"
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1600px] items-center gap-6 px-6 transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-12 ${
          scrolled ? "h-[60px]" : "h-[84px]"
        }`}
      >
        <Link href="#top" onClick={(e) => go(e, "#top")} aria-label="Elysium" className="flex items-center gap-2.5">
          <LogoMark className={`h-[18px] w-auto transition-colors duration-500 ${scrolled ? "text-moss" : "text-bone"}`} />
          <Logo className="h-3 w-auto" />
        </Link>

        <nav className="ml-3 hidden items-center gap-6 lg:flex xl:ml-6 xl:gap-8">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => go(e, item.href)}
              data-cursor-hover
              className={`text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
                scrolled ? "text-ink/70 hover:text-ink" : "text-bone/80 hover:text-bone"
              } ${item.href === "#location" || item.href === "#faq" ? "hidden xl:inline" : ""}`}
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
              scrolled ? "border-ink/25 hover:bg-ink hover:text-bone" : "border-bone/45 hover:bg-bone/10"
            }`}
          >
            {FINAL.hero.brochure}
          </a>
          <a
            href="#contact"
            onClick={(e) => go(e, "#contact")}
            data-cursor-hover
            className={`hidden items-center gap-2 rounded-full px-5 py-2 text-[11px] font-medium uppercase tracking-[0.08em] transition-[transform,background-color,color] duration-300 hover:-translate-y-0.5 md:inline-flex ${
              scrolled ? "bg-ink text-bone" : "bg-bone text-ink"
            }`}
          >
            {FINAL.hero.cta}
          </a>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={`relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden ${open ? "text-ink" : ""}`}
          >
            <span className={`h-0.5 w-6 bg-current transition-transform duration-300 ${open ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`h-0.5 w-6 bg-current transition-transform duration-300 ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 flex flex-col bg-bone font-gilroy text-ink transition-[opacity,visibility] duration-500 lg:hidden ${
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
        <div className="mt-auto flex flex-col gap-3 border-t border-ink/10 px-7 py-7">
          <a href="#contact" onClick={(e) => go(e, "#contact")} className="rounded-full bg-ink px-6 py-3 text-center text-sm font-semibold text-bone">
            {FINAL.hero.cta}
          </a>
          <a href="/brochure.pdf" target="_blank" rel="noopener" className="rounded-full border border-ink/25 px-6 py-3 text-center text-sm font-semibold">
            {FINAL.hero.brochure} ↓
          </a>
        </div>
      </div>
    </header>
  );
}

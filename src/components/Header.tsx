"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { Logo, LogoMark } from "./Logo";
import { LangToggle } from "./LangToggle";
import { useT } from "./LangProvider";
import { NAV } from "@/lib/content";

export function Header() {
  const t = useT();
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useLenis((l) => {
    setScrolled(l.scroll > 40);
    setHidden(l.direction === 1 && l.scroll > 260 && !open);
  });

  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
    return () => lenis.start();
  }, [open, lenis]);

  const go = (e: React.MouseEvent, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -80 });
      else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  };

  const onHero = !scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color] duration-500 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${
        onHero
          ? "bg-transparent text-bone"
          : "border-b border-ink/10 bg-bone/85 text-ink backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 md:px-10">
        <Link
          href="#top"
          onClick={(e) => go(e, "#top")}
          aria-label="Elysium"
          className="relative z-50 flex items-center gap-2.5"
        >
          <LogoMark className="h-[18px] w-auto" />
          <Logo className="h-3.5 w-auto" />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.key}
              href={item.href}
              onClick={(e) => go(e, item.href)}
              className="group relative text-sm tracking-wide opacity-80 transition-opacity hover:opacity-100"
            >
              {t.nav[item.key]}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <LangToggle className="hidden sm:flex" />
          <a
            href="#contact"
            onClick={(e) => go(e, "#contact")}
            data-cursor-hover
            className={`hidden rounded-full border px-6 py-2.5 text-sm tracking-wide transition-colors duration-300 md:inline-flex ${
              onHero
                ? "border-bone/40 hover:bg-bone hover:text-ink"
                : "border-ink/30 hover:bg-ink hover:text-bone"
            }`}
          >
            {t.cta}
          </a>

          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <span className={`h-px w-6 bg-current transition-transform duration-300 ${open ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`h-px w-6 bg-current transition-transform duration-300 ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-bone text-ink transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="mt-28 flex flex-col gap-2 px-7">
          {NAV.map((item, i) => (
            <a
              key={item.key}
              href={item.href}
              onClick={(e) => go(e, item.href)}
              className={`font-display text-4xl transition-all duration-500 ${
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
            >
              {t.nav[item.key]}
            </a>
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between border-t border-ink/10 px-7 py-7">
          <a
            href="#contact"
            onClick={(e) => go(e, "#contact")}
            className="inline-flex rounded-full bg-ink px-7 py-3 text-sm text-bone"
          >
            {t.cta}
          </a>
          <LangToggle />
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useLenis } from "lenis/react";
import { Logo, LogoMark } from "@/components/Logo";
import { LangToggle } from "@/components/LangToggle";
import { useT } from "@/components/LangProvider";
import { NAV, SITE } from "@/lib/content";

export function LagomHeader() {
  const t = useT();
  const lenis = useLenis();
  const [open, setOpen] = useState(false);

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
    <header className="fixed inset-x-0 top-0 z-50 bg-lagom-cream/95 text-lagom-ink shadow-[0_1px_0_rgba(43,43,43,0.08)] backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1500px] items-center gap-6 px-5 md:px-8">
        <Link href="#lgtop" onClick={(e) => go(e, "#lgtop")} aria-label="Elysium" className="flex items-center gap-2.5">
          <LogoMark className="h-[18px] w-auto text-lagom-orange" />
          <Logo className="h-3 w-auto" />
        </Link>

        <nav className="ml-4 hidden items-center gap-7 lg:flex">
          {NAV.map((item, i) => (
            <a
              key={item.key}
              href={item.href}
              onClick={(e) => go(e, item.href)}
              className={`text-sm font-semibold transition-colors hover:text-lagom-orange ${i === 0 ? "text-lagom-orange" : ""}`}
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {t.nav[item.key]}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-5">
          <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hidden text-sm font-semibold tracking-wide md:block">
            {SITE.phone}
          </a>
          <ul className="hidden items-center gap-3 text-xs text-lagom-ink/55 xl:flex">
            {SITE.social.map((s) => (
              <li key={s.label}>
                <a href={s.href} aria-label={s.label} className="transition-colors hover:text-lagom-orange">
                  {s.label[0]}
                </a>
              </li>
            ))}
          </ul>
          <LangToggle className="hidden sm:flex" />
          <a href="#contact" onClick={(e) => go(e, "#contact")} data-cursor-hover className="lagom-btn hidden md:inline-flex">
            {t.cta}
            <span className="lagom-btn__arrow" aria-hidden>↗</span>
          </a>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <span className={`h-0.5 w-6 bg-current transition-transform duration-300 ${open ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`h-0.5 w-6 bg-current transition-transform duration-300 ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-lagom-cream text-lagom-ink transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="mt-28 flex flex-col gap-3 px-7">
          {NAV.map((item) => (
            <a key={item.key} href={item.href} onClick={(e) => go(e, item.href)} className="lagom-display text-3xl">
              {t.nav[item.key]}
            </a>
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between border-t border-lagom-ink/10 px-7 py-7">
          <a href="#contact" onClick={(e) => go(e, "#contact")} className="lagom-btn">
            {t.cta} <span aria-hidden>↗</span>
          </a>
          <LangToggle />
        </div>
      </div>
    </header>
  );
}

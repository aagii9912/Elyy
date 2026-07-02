"use client";

import { useEffect, useState } from "react";
import { NAV_LINKS, BRAND } from "./data";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-acs-cream/85 backdrop-blur-md" : "bg-acs-cream"
      }`}
    >
      <nav className="mx-auto flex h-[86px] max-w-[1440px] items-center justify-between px-6 md:px-8">
        {/* Left links */}
        <ul className="hidden flex-1 items-center gap-9 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="text-[0.82rem] uppercase tracking-[0.03em] text-acs-brown/90 transition-opacity hover:opacity-60"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Center logo */}
        <a
          href="#top"
          className="text-[1.45rem] tracking-[-0.01em] text-acs-brown md:flex-1 md:text-center"
        >
          {BRAND.name}
        </a>

        {/* Right CTA */}
        <div className="flex flex-1 items-center justify-end">
          <a
            href="#contact"
            className="rounded-full bg-acs-brown px-6 py-3 text-[0.78rem] uppercase tracking-[0.03em] text-acs-cream transition-colors duration-300 hover:bg-acs-ink"
          >
            {BRAND.navCta}
          </a>
        </div>
      </nav>
    </header>
  );
}

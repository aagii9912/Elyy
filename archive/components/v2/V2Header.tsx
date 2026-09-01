"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { Logo, LogoMark } from "@/components/Logo";
import { LangToggle } from "@/components/LangToggle";
import { useT } from "@/components/LangProvider";
import { NAV } from "@/lib/content";

export function V2Header() {
  const t = useT();
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);

  useLenis((l) => setScrolled(l.scroll > 40));

  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
    return () => lenis.start();
  }, [open, lenis]);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -70 });
      else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
    setMenu(null);
  };

  const onHero = !scrolled && !open;

  // Mega-menu contents derived from the content dictionary, with a thumbnail
  // per sub-item (indexed by order).
  const menuImages: Record<string, string[]> = {
    apartments: [
      "/images/exterior-elevation-dusk.jpg",
      "/images/exterior-garden-path.jpg",
      "/images/amenity-pool-deck.jpg",
      "/images/exterior-cluster-dusk.jpg",
    ],
    advantages: [
      "/images/amenity-garden-walk.jpg",
      "/images/aerial-courtyard-water.jpg",
      "/images/exterior-plaza-pink.jpg",
      "/images/amenity-retail-podium.jpg",
    ],
  };
  const menus: Record<string, { label: string; href: string; sub: { title: string; body: string }[] } | undefined> = {
    apartments: { label: t.nav.apartments, href: "#apartments", sub: t.apartments.types },
    advantages: { label: t.nav.advantages, href: "#advantages", sub: t.advantages.items },
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,color] duration-500 ${
        onHero ? "bg-transparent text-white" : "bg-white/90 text-night shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-md"
      }`}
      onMouseLeave={() => setMenu(null)}
    >
      <div className="mx-auto flex h-[70px] max-w-[1400px] items-center gap-8 px-5 md:px-8">
        <Link href="#v2top" onClick={(e) => go(e, "#v2top")} aria-label="Elysium" className="flex items-center gap-2.5">
          <LogoMark className="h-[17px] w-auto" />
          <Logo className="h-3 w-auto" />
        </Link>

        <nav className="ml-2 hidden items-center gap-7 lg:flex">
          {NAV.map((item) => {
            const m = menus[item.key];
            return (
              <div key={item.key} className="flex items-center" onMouseEnter={() => setMenu(m ? item.key : null)}>
                <a
                  href={item.href}
                  onClick={(e) => go(e, item.href)}
                  className="flex items-center gap-1.5 text-sm opacity-80 transition-opacity hover:opacity-100"
                >
                  {t.nav[item.key]}
                  {m && (
                    <span
                      aria-hidden
                      className={`text-[0.6rem] transition-transform duration-300 ${menu === item.key ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  )}
                </a>
              </div>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-5">
          <LangToggle className="hidden sm:flex" />
          <a
            href="#contact"
            onClick={(e) => go(e, "#contact")}
            data-cursor-hover
            className={`hidden md:inline-flex find-pill ${onHero ? "find-pill--light" : "find-pill--solid"}`}
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

      {/* desktop dropdown panel */}
      <div
        className={`absolute inset-x-0 top-full hidden border-t border-night/10 bg-white text-night shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] transition-[opacity,visibility] duration-300 lg:block ${
          menu && menus[menu] ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onMouseEnter={() => menu && setMenu(menu)}
      >
        <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-8">
          <p className="find-label text-night/45">{menu && menus[menu]?.label}</p>
          <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            {menu &&
              menus[menu]?.sub.map((s, i) => {
                const href = menus[menu]!.href;
                return (
                  <a
                    key={s.title}
                    href={href}
                    onClick={(e) => go(e, href)}
                    className="group rounded-xl border border-transparent p-2 transition-colors hover:border-night/10 hover:bg-paper"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-paper">
                      <Image
                        src={menuImages[menu]?.[i] ?? "/images/exterior-elevation-dusk.jpg"}
                        alt={s.title}
                        fill
                        sizes="(max-width:1024px) 50vw, 320px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <span className="mt-3 flex items-center gap-2 px-1 find-display text-lg">
                      {s.title}
                      <span className="opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-1 group-hover:opacity-100" aria-hidden>
                        →
                      </span>
                    </span>
                    <span className="mt-1 block px-1 pb-1 text-sm leading-relaxed text-night/55">{s.body}</span>
                  </a>
                );
              })}
          </div>
        </div>
      </div>

      {/* mobile menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-white text-night transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="mt-28 flex flex-col gap-2 px-7">
          {NAV.map((item) => (
            <a key={item.key} href={item.href} onClick={(e) => go(e, item.href)} className="find-display text-4xl">
              {t.nav[item.key]}
            </a>
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between border-t border-night/10 px-7 py-7">
          <a href="#contact" onClick={(e) => go(e, "#contact")} className="find-pill find-pill--solid">
            {t.cta}
          </a>
          <LangToggle />
        </div>
      </div>
    </header>
  );
}

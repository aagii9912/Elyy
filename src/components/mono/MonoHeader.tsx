"use client";

/* /mono — sticky header. Ink on the page ground at the top of the hero →
   frosted white once the page is scrolled. (It used to invert to white
   type over a dark hero; the hero is now the same light ground as the
   rest of the page, so there is nothing to invert against.) Hides on
   scroll-down, returns on scroll-up. The mobile menu is a SIBLING of
   <header> (not a child) because the header's transform/backdrop-filter
   would otherwise become the containing block for its fixed panel.

   `variant`:
     home — нүүр хуудас: hash холбоос зөөлөн гүйлгэнэ, hero дээр тунгалаг.
     page — дотоод хуудас (ж: /news): үргэлж цагаан, hash холбоос нүүр
            хуудасны тухайн хэсэг рүү (`/#about`) шилжинэ. */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { Logo, LogoMark } from "@/components/Logo";
import type { SiteContent } from "@/lib/site-content";
import { NEWS_PATH } from "@/lib/news-links";
import { BrochureButton } from "./MonoBrochure";

export function MonoHeader({
  site,
  variant = "home",
}: {
  site: SiteContent;
  variant?: "home" | "page";
}) {
  const { nav, news } = site;
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  const isHome = variant === "home";
  /* Толгой хэсэг гүйлгэсний дараа л мөстсөн цагаан болно; хуудасны эхэнд
     цайвар суурин дээр тунгалаг байна. Текст үргэлж бараан (`night`). */
  const solid = scrolled || !isHome;

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

  /* Гар утасны цэс нээлттэй үед ард нь хуудас гүйдэг байсан — Lenis-ийг
     зогсоож, native гүйлтийг ч барина. */
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      lenis?.start();
    };
  }, [open, lenis]);

  const isHash = (href: string) => href.startsWith("#");
  /** Дотоод хуудсанд `#about` → `/#about` (нүүр рүү буцаж очно). */
  const resolve = (href: string) => (isHash(href) && !isHome ? `/${href}` : href);

  const go = (e: React.MouseEvent, href: string) => {
    if (!isHome || !isHash(href)) {
      setOpen(false);
      return; // жирийн навигаци
    }
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -72 });
      else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  };

  /* Мэдээний холбоос үргэлж цэсэнд байна. Админ гараар нэмсэн бол
     давхардуулахгүй. */
  const items = [
    ...nav.items.filter((i) => i.href !== NEWS_PATH),
    { label: news.navLabel, href: NEWS_PATH },
  ];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 font-gilroy transition-[background-color,box-shadow,backdrop-filter,transform] duration-500 ${
          hidden && !open ? "-translate-y-full" : ""
        } ${
          open
            ? "bg-white text-night"
            : solid
              ? "bg-white/90 text-night shadow-[0_1px_0_rgba(21,23,23,0.08)] backdrop-blur-xl"
              : "bg-transparent text-night"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1600px] items-center gap-6 px-5 transition-[height] duration-500 md:px-10 ${
            scrolled ? "h-[58px]" : "h-[80px]"
          }`}
        >
          <Link
            href={isHome ? "#top" : "/"}
            onClick={(e) => go(e, "#top")}
            aria-label="Elysium"
            data-cursor-hover
            className="flex min-h-11 items-center gap-2.5"
          >
            <LogoMark className="h-[18px] w-auto" />
            <Logo className="h-3 w-auto" />
          </Link>

          <nav className="ml-4 hidden items-center gap-6 lg:flex xl:gap-8">
            {items.map((item) => (
              <Link
                key={item.href}
                href={resolve(item.href)}
                onClick={(e) => go(e, item.href)}
                data-cursor-hover
                className="text-[11px] font-medium uppercase tracking-[0.08em] text-night/60 transition-colors duration-300 hover:text-night"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <BrochureButton
              site={site}
              source="elysium/mono#header"
              className="hidden items-center gap-2 rounded-full border border-night/25 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-night transition-colors duration-300 hover:bg-night hover:text-white sm:inline-flex"
            >
              {nav.brochureLabel} ↓
            </BrochureButton>
            <Link
              href={resolve("#contact")}
              onClick={(e) => go(e, "#contact")}
              data-cursor-hover
              className="hidden items-center gap-2 rounded-full bg-night px-5 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white transition-transform duration-300 hover:-translate-y-0.5 md:inline-flex"
            >
              {nav.ctaLabel}
            </Link>
            <button
              type="button"
              aria-label={nav.menuAria}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              /* Хүрэх талбай 44×44 (iOS/Android-ын доод хязгаар); зураас
                 нь өмнөх шигээ 24px хэвээр — товч томорсон, тэмдэг нь биш.
                 -mr-0.5 нь өргөссөн 2px-ыг нөхөж, тэмдгийн оптик байрлал
                 өмнөхтэй яг адил хэвээр. */
              className={`relative z-50 -mr-0.5 flex h-11 w-11 flex-col items-center justify-center gap-[5px] lg:hidden ${open ? "text-night" : ""}`}
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
        <nav className="mt-24 flex flex-col gap-1 overflow-y-auto px-7">
          {items.map((item) => (
            <Link
              key={item.href}
              href={resolve(item.href)}
              onClick={(e) => go(e, item.href)}
              /* Хүрэх талбай 44px-аас багагүй байхаар босоо зай нэмэв. */
              className="flex min-h-12 items-center py-1.5 text-[1.6rem] font-extrabold leading-tight tracking-[-0.01em]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t border-night/10 px-7 py-7">
          <Link
            href={resolve("#contact")}
            onClick={(e) => go(e, "#contact")}
            className="rounded-full bg-night px-6 py-3 text-center text-sm font-bold text-white"
          >
            {nav.ctaLabel}
          </Link>
          <BrochureButton
            site={site}
            source="elysium/mono#menu"
            className="w-full rounded-full border border-night/25 px-6 py-3.5 text-center text-sm font-semibold"
          >
            {nav.brochureLabel} ↓
          </BrochureButton>
        </div>
      </div>
    </>
  );
}

"use client";

/* `/noir` — толгой хэсэг.

   Макетын хэмжилтээр: тэмдэг зүүн 75u, цэс голдоо 51u, цөцгий дугуй
   товч баруун 75u. Hero-гоос гармагц зурвас нягтарч, бүдэг шилэн
   дэвсгэртэй болно. Босоо дэлгэцэд цэс нь бүтэн дэлгэцийн pop-up. */

import { useCallback, useEffect, useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { LogoMark } from "@/components/Logo";
import { BrochureButton } from "@/components/mono/MonoBrochure";
import { useAnchorGo, navHref } from "./shared";

export function NoirHeader({ site }: { site: SiteContent }) {
  const { nav, brand } = site;
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [active, setActive] = useState("");
  const go = useAnchorGo();

  /* Цэсний төлөв нь хуудасны үндэс дээр сууна — бургер, pop-up, доторх
     бүх шилжилт нэг л класснаас хамаарна (`noir.css`). */
  useEffect(() => {
    const root = document.querySelector(".noir-page");
    root?.classList.toggle("is-open", open);
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      root?.classList.remove("is-open");
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > window.innerHeight * 0.62);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Хэвтээ болмогц цэс өөрөө хаагдана (утсаа эргүүлэхэд гацахгүй). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => {
      if (window.innerWidth / window.innerHeight > 1.1) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* Гүйлгэх үед аль хэсэгт байгааг цэсэн дээр тэмдэглэнэ. */
  useEffect(() => {
    const ids = nav.items.map((i) => i.href).filter((h) => h.startsWith("#"));
    const targets = ids
      .map((h) => document.querySelector(h))
      .filter((el): el is Element => Boolean(el));
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit?.target.id) setActive(`#${hit.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5] }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [nav.items]);

  const onNavClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      setOpen(false);
      go(e, href);
    },
    [go]
  );

  return (
    <>
      <header className={`nv-topbar${stuck ? " is-stuck" : ""}`} data-bg="header">
        <a className="nv-brand" href="#top" aria-label={brand.line} onClick={(e) => onNavClick(e, "#top")}>
          <LogoMark />
        </a>

        <nav className="nv-links" aria-label="Үндсэн цэс">
          {nav.items.map((item) => {
            const href = navHref(item.href);
            if (!href) return null;
            return (
              <a
                key={item.href + item.label}
                href={href}
                aria-current={active === item.href ? "true" : undefined}
                onClick={(e) => onNavClick(e, href)}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <a className="nv-pill nv-pill-nav" href="#contact" onClick={(e) => onNavClick(e, "#contact")}>
          <span>{nav.ctaLabel}</span>
        </a>

        <button
          type="button"
          className="nv-burger"
          aria-expanded={open}
          aria-controls="nv-menu"
          aria-label={open ? "Цэс хаах" : nav.menuAria}
          onClick={() => setOpen((v) => !v)}
        >
          <i />
          <i />
        </button>
      </header>

      <nav id="nv-menu" className="nv-menu" aria-label={nav.menuAria} aria-hidden={!open}>
        <div className="nv-menu-inner">
          <p className="nv-menu-eyebrow">{nav.menuAria}</p>
          <ul className="nv-menu-list">
            {nav.items.map((item) => {
              const href = navHref(item.href);
              if (!href) return null;
              return (
                <li key={item.href + item.label}>
                  <a href={href} tabIndex={open ? 0 : -1} onClick={(e) => onNavClick(e, href)}>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="nv-menu-foot">
            <a
              className="nv-pill"
              href="#contact"
              tabIndex={open ? 0 : -1}
              onClick={(e) => onNavClick(e, "#contact")}
            >
              <span>{nav.ctaLabel}</span>
            </a>
            <BrochureButton site={site} source="elysium/noir#menu" className="nv-ghost">
              {nav.brochureLabel}
            </BrochureButton>
          </div>
        </div>
      </nav>
    </>
  );
}

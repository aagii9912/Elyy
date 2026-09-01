"use client";

import { useLenis } from "lenis/react";
import { NAV, SITE } from "@/lib/content";
import { RevealText } from "./Reveal";
import { Logo } from "./Logo";
import { useT } from "./LangProvider";

export function Footer() {
  const t = useT();
  const lenis = useLenis();

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -80 });
      else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="relative overflow-hidden bg-charcoal text-bone">
      <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-24 md:px-10 md:pt-32">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="overline text-bone/50">{SITE.name} · Ulaanbaatar</p>
            <RevealText
              as="h2"
              text={t.footer.ctaTitle}
              className="mt-6 max-w-2xl font-display text-display font-light"
            />
            <a
              href="#contact"
              onClick={(e) => go(e, "#contact")}
              className="mt-9 inline-flex items-center gap-3 rounded-full border border-bone/40 px-8 py-4 text-sm tracking-wide transition-colors duration-300 hover:bg-bone hover:text-ink"
            >
              {t.cta}
              <span aria-hidden>→</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="overline text-bone/40">{t.footer.explore}</p>
              <ul className="mt-5 space-y-2.5">
                {NAV.map((item) => (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      onClick={(e) => go(e, item.href)}
                      className="text-bone/75 transition-colors hover:text-bone"
                    >
                      {t.nav[item.key]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <div>
                <p className="overline text-bone/40">{t.footer.contact}</p>
                <ul className="mt-5 space-y-2.5 text-bone/75">
                  <li>
                    <a href={`mailto:${SITE.email}`} className="hover:text-bone">{SITE.email}</a>
                  </li>
                  <li>
                    <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-bone">{SITE.phone}</a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="overline text-bone/40">{t.footer.salesOffice}</p>
                <p className="mt-4 text-bone/60">{t.footer.salesAddress}</p>
                <p className="mt-1 text-bone/45">{t.footer.hours}</p>
                <div className="mt-4 flex flex-wrap gap-4">
                  {SITE.social.map((s) => (
                    <a key={s.label} href={s.href} className="text-bone/60 transition-colors hover:text-bone">
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Logo className="mt-20 h-8 w-auto text-bone/80" />

        <div className="mt-10 flex flex-col gap-3 border-t border-bone/10 pt-7 text-xs text-bone/45 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE.name}. {t.footer.rights}</span>
          <span className="text-bone/40">{SITE.developer}</span>
        </div>
      </div>
    </footer>
  );
}

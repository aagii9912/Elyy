"use client";

import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { useT } from "@/components/LangProvider";
import { NAV, SITE } from "@/lib/content";

export function LagomFooter() {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-lagom-ink text-lagom-cream">
      <div className="mx-auto max-w-[1500px] px-5 py-20 md:px-8 md:py-24">
        {/* Top area: brand + columns */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* Brand */}
          <Reveal className="md:col-span-5">
            <Logo className="h-7 w-auto text-lagom-cream" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-lagom-cream/55">
              {t.footer.salesAddress}
            </p>
          </Reveal>

          {/* Menu */}
          <Reveal delay={0.08} className="md:col-span-3">
            <h3 className="text-xs uppercase tracking-wide text-lagom-cream/40">
              {t.footer.explore}
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              {NAV.map((item) => (
                <li key={item.key}>
                  <a
                    href={item.href}
                    className="text-sm font-semibold transition-colors hover:text-lagom-orange"
                  >
                    {t.nav[item.key]}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Contact */}
          <Reveal delay={0.16} className="md:col-span-2">
            <h3 className="text-xs uppercase tracking-wide text-lagom-cream/40">
              {t.footer.contact}
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-sm font-semibold transition-colors hover:text-lagom-orange"
                >
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                  className="text-sm font-semibold transition-colors hover:text-lagom-orange"
                >
                  {SITE.phone}
                </a>
              </li>
              <li className="text-sm text-lagom-cream/55">{t.footer.hours}</li>
            </ul>
          </Reveal>

          {/* Social */}
          <Reveal delay={0.24} className="md:col-span-2">
            <h3 className="text-xs uppercase tracking-wide text-lagom-cream/40">
              {t.footer.social}
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              {SITE.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    className="text-sm font-semibold transition-colors hover:text-lagom-orange"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Giant wordmark */}
        <div className="mt-20 overflow-hidden md:mt-28">
          <h2 className="lagom-display text-lagom-cream/95 text-[clamp(3rem,14vw,12rem)] leading-[0.85]">
            {SITE.name.toUpperCase()}
          </h2>
        </div>

        {/* Bottom row */}
        <div className="mt-16 flex flex-col gap-2 border-t border-lagom-cream/10 pt-7 text-xs text-lagom-cream/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {SITE.name}. {t.footer.rights}
          </p>
          <p>{SITE.developer}</p>
        </div>
      </div>
    </footer>
  );
}

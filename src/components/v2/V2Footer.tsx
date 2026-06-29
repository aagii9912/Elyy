"use client";

import { useLenis } from "lenis/react";
import { NAV, SITE } from "@/lib/content";
import { Logo } from "@/components/Logo";
import { useLang, useT } from "@/components/LangProvider";

export function V2Footer() {
  const t = useT();
  const { lang } = useLang();
  const lenis = useLenis();

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -70 });
    else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  };

  const legal =
    lang === "mn"
      ? ["Үйлчилгээний нөхцөл", "Нууцлалын бодлого"]
      : ["Terms of Service", "Privacy Policy"];

  const newsletterTitle = lang === "mn" ? "Мэдээллийн захидал авах" : "Subscribe to our Newsletter!";

  return (
    <footer className="bg-night text-white">
      <div className="mx-auto max-w-[1400px] px-5 pb-10 pt-20 md:px-8">
        {/* newsletter + nav + social */}
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="find-display text-[clamp(1.5rem,2.4vw,2rem)]">{newsletterTitle}</p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-7 flex items-center gap-3 border-b border-white/25 pb-3"
            >
              <input
                type="email"
                placeholder={t.v2.cta.placeholder}
                className="w-full bg-transparent text-white placeholder:text-white/45 outline-none"
              />
              <button type="submit" aria-label={t.v2.cta.button} className="text-white/80 transition-colors hover:text-white">
                →
              </button>
            </form>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <div>
                <p className="find-label text-white/40">{t.footer.salesOffice}</p>
                <p className="mt-4 max-w-[24ch] text-sm text-white/70">{t.footer.salesAddress}</p>
              </div>
              <div>
                <p className="find-label text-white/40">{t.footer.contact}</p>
                <a href={`mailto:${SITE.email}`} className="mt-4 block text-sm text-white/70 hover:text-white">{SITE.email}</a>
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="mt-1 block text-sm text-white/70 hover:text-white">{SITE.phone}</a>
              </div>
              <div>
                <p className="find-label text-white/40">{t.footer.hours}</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-3.5">
            {NAV.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={(e) => go(e, item.href)}
                className="find-display text-2xl text-white/85 transition-colors hover:text-white"
              >
                {t.nav[item.key]}
              </a>
            ))}
          </nav>

          <ul className="flex flex-col gap-3.5">
            {SITE.social.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="text-white/70 transition-colors hover:text-white">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* giant wordmark */}
        <Logo className="mt-20 w-full text-white" />

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-white/45 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {legal.map((l) => (
              <a key={l} href="#" className="transition-colors hover:text-white/80">{l}</a>
            ))}
          </div>
          <span>© {new Date().getFullYear()} {SITE.name}. {t.footer.rights} · {SITE.developer}</span>
        </div>
      </div>
    </footer>
  );
}

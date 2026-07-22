/* /mono — Footer: sales hours, contacts, socials, nav + wordmark. Dark. */

import { Logo } from "@/components/Logo";
import { FINAL, SITE } from "@/lib/content";

export function MonoFooter() {
  return (
    <footer className="bg-night font-gilroy text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div data-reveal="up">
            <Logo className="h-4 w-auto text-white" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              {FINAL.brandTag}. {FINAL.hero.sub}
            </p>
          </div>

          <div data-reveal="up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">Борлуулалтын алба</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              <li>{FINAL.contact.hours}</li>
              <li>
                <a href={`tel:+976${FINAL.contact.phone.replace(/[^0-9]/g, "")}`} data-cursor-hover className="hover:text-white">
                  {FINAL.contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} data-cursor-hover className="hover:text-white">
                  {SITE.email}
                </a>
              </li>
              <li className="text-white/55">{FINAL.contact.location}</li>
            </ul>
          </div>

          <div data-reveal="up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">Цэс</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              <li><a href="#apartments" data-cursor-hover className="hover:text-white">Өрөөний сонголт</a></li>
              <li><a href="#elys" data-cursor-hover className="hover:text-white">Төслийн давуу тал</a></li>
              <li><a href="#location" data-cursor-hover className="hover:text-white">Байршил</a></li>
              <li>
                <a href="/brochure.pdf" target="_blank" rel="noopener" data-cursor-hover className="hover:text-white">
                  Танилцуулга татах
                </a>
              </li>
            </ul>
          </div>

          <div data-reveal="up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">Сошиал</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              {SITE.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener" data-cursor-hover className="hover:text-white">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Elysium Residence · {FINAL.developer.name}</p>
          <p>Form Follows Function · Comfort · Serenity</p>
        </div>
      </div>
    </footer>
  );
}

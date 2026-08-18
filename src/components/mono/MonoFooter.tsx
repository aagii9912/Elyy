/* /mono — Footer: sales hours, contacts, socials, nav + wordmark.
   Light: the footer used to be a full-width `bg-night` slab, which put a
   0.35 luminance cliff at the very bottom of an otherwise light page. It
   now closes on the same ground as every section (design-system §1), held
   apart by a hairline.
   `variant="page"` (ж: /news) үед hash холбоос нүүр хуудас руу заана. */

import Link from "next/link";
import { Logo } from "@/components/Logo";
import type { SiteContent } from "@/lib/site-content";
import { NEWS_PATH } from "@/lib/news-links";
import { SocialList, liveSocials } from "./MonoSocial";
import { BrochureButton } from "./MonoBrochure";

/** Файл/гадаад холбоосыг шинэ табд нээнэ, дотоод замыг апп дотор. */
const opensInNewTab = (href: string) => /^https?:\/\//.test(href) || /\.[a-z0-9]{2,4}$/i.test(href);

export function MonoFooter({
  site,
  variant = "home",
}: {
  site: SiteContent;
  variant?: "home" | "page";
}) {
  const { footer, brand, contact, developer, hero, news } = site;
  const resolve = (href: string) =>
    href.startsWith("#") && variant !== "home" ? `/${href}` : href;

  /* Мэдээний холбоос үргэлж хөлний цэсэнд байна. */
  const menu = [
    ...footer.menu.filter((i) => i.href !== NEWS_PATH),
    { label: news.navLabel, href: NEWS_PATH },
  ];
  const socials = liveSocials(footer.social);

  return (
    <footer className="border-t border-night/10 bg-ground font-gilroy text-night">
      <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <div
          className={`grid gap-10 sm:grid-cols-2 ${
            socials.length ? "md:grid-cols-[1.4fr_1fr_1fr_1fr]" : "md:grid-cols-[1.4fr_1fr_1fr]"
          }`}
        >
          <div data-reveal="up">
            <Logo className="h-4 w-auto text-night" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-night/60">
              {brand.tag}. {hero.sub}
            </p>
          </div>

          <div data-reveal="up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-night/50">{footer.salesTitle}</p>
            {/* Хөлний холбоосууд гар утсанд хүрэхэд хэтэрхий нимгэн байсан —
                inline-flex + min-h-11-ээр хүрэх талбайг 44px болгов (M8-ын
                платформын доод хязгаар; урьд нь 36px байсан). */}
            <ul className="mt-3 space-y-1 text-sm text-night/70">
              <li className="py-1.5">{contact.hours}</li>
              <li>
                <a
                  href={`tel:+976${contact.phone.replace(/[^0-9]/g, "")}`}
                  data-cursor-hover
                  className="inline-flex min-h-11 items-center transition-colors duration-300 hover:text-night"
                >
                  {contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${brand.email}`}
                  data-cursor-hover
                  className="inline-flex min-h-11 items-center transition-colors duration-300 hover:text-night"
                >
                  {brand.email}
                </a>
              </li>
              <li className="py-1.5 text-night/50">{contact.location}</li>
            </ul>
          </div>

          <div data-reveal="up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-night/50">{footer.menuTitle}</p>
            <ul className="mt-3 space-y-1 text-sm text-night/70">
              {menu.map((item, i) => (
                <li key={`${item.href}-${i}`}>
                  {/* Танилцуулга — хөлнөөс дарсан ч мөн адил маягтаар дамжина */}
                  {item.href === brand.brochureUrl ? (
                    <BrochureButton
                      site={site}
                      source="elysium/mono#footer"
                      className="inline-flex min-h-11 items-center text-left transition-colors duration-300 hover:text-night"
                    >
                      {item.label}
                    </BrochureButton>
                  ) : opensInNewTab(item.href) ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener"
                      data-cursor-hover
                      className="inline-flex min-h-11 items-center transition-colors duration-300 hover:text-night"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={resolve(item.href)}
                      data-cursor-hover
                      className="inline-flex min-h-11 items-center transition-colors duration-300 hover:text-night"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {socials.length > 0 && (
            <div data-reveal="up">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-night/50">{footer.socialTitle}</p>
              <SocialList items={footer.social} />
            </div>
          )}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-night/10 pt-6 text-[12px] text-night/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {brand.line} · {developer.name}</p>
          <p>{footer.note}</p>
        </div>
      </div>
    </footer>
  );
}

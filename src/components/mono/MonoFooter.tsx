/* /mono — Footer: sales hours, contacts, socials, nav + wordmark. Dark.
   `variant="page"` (ж: /news) үед hash холбоос нүүр хуудас руу заана. */

import Link from "next/link";
import { Logo } from "@/components/Logo";
import type { SiteContent } from "@/lib/site-content";
import { NEWS_PATH } from "@/lib/news-links";
import { SocialList, liveSocials } from "./MonoSocial";
import { BrochureButton } from "./MonoBrochure";
import { flatSectionTone } from "@/lib/theme-css";

/** Файл/гадаад холбоосыг шинэ табд нээнэ, дотоод замыг апп дотор. */
const opensInNewTab = (href: string) => /^https?:\/\//.test(href) || /\.[a-z0-9]{2,4}$/i.test(href);

/* Хөлний мөрүүд ижилхэн текстэн жагсаалт байсныг icon-оор ялгав.
   24×24 stroke, currentColor — MonoChatbot-ийн icon-той нэг хэв маяг. */
const ICONS = {
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.4V12l3.1 1.9" />
    </>
  ),
  phone: (
    <path d="M8.2 3.5 10 8l-2.2 2a14.4 14.4 0 0 0 6.2 6.2l2-2.2 4.5 1.8v2.8a2 2 0 0 1-2.2 2C10.5 20 4 13.5 3.4 5.7a2 2 0 0 1 2-2.2h2.8Z" />
  ),
  mail: (
    <>
      <rect x="2.8" y="5.4" width="18.4" height="13.2" rx="1.8" />
      <path d="m3.4 7 8.6 5.4L20.6 7" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21c4.3-4.5 6.5-8 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 13 7.7 16.5 12 21Z" />
      <circle cx="12" cy="10.4" r="2.4" />
    </>
  ),
  download: <path d="M12 3.8v10.4m0 0 3.8-3.9M12 14.2l-3.8-3.9M4.6 19.4h14.8" />,
  external: <path d="M8 16.2 16.2 8m0 0H9.9m6.3 0v6.3" />,
  chevron: <path d="m10 7.2 4.8 4.8-4.8 4.8" />,
  plan: (
    <>
      <rect x="3.4" y="3.4" width="7.2" height="7.2" rx="1.2" />
      <rect x="13.4" y="3.4" width="7.2" height="7.2" rx="1.2" />
      <rect x="3.4" y="13.4" width="7.2" height="7.2" rx="1.2" />
      <rect x="13.4" y="13.4" width="7.2" height="7.2" rx="1.2" />
    </>
  ),
  spark: <path d="M12 3.2 14 10l6.8 2-6.8 2-2 6.8-2-6.8L3.2 12 10 10l2-6.8Z" />,
  news: (
    <>
      <path d="M4.4 5.2h11.2v13.6H5.8a1.4 1.4 0 0 1-1.4-1.4V5.2Z" />
      <path d="M15.6 8.4h2.6a1.4 1.4 0 0 1 1.4 1.4v7.6a1.4 1.4 0 0 1-2.8 0" />
      <path d="M7.4 8.6h5.2M7.4 12h5.2M7.4 15.4h3.2" />
    </>
  ),
  headset: (
    <>
      <path d="M4.6 14.4v-2.2a7.4 7.4 0 0 1 14.8 0v2.2" />
      <rect x="2.8" y="13.4" width="3.6" height="5.4" rx="1.6" />
      <rect x="17.6" y="13.4" width="3.6" height="5.4" rx="1.6" />
    </>
  ),
  menu: <path d="M4.4 7h15.2M4.4 12h15.2M4.4 17h9.6" />,
  share: (
    <>
      <circle cx="17.6" cy="5.8" r="2.6" />
      <circle cx="6.4" cy="12" r="2.6" />
      <circle cx="17.6" cy="18.2" r="2.6" />
      <path d="m8.8 10.7 6.5-3.6m0 9.8-6.5-3.6" />
    </>
  ),
} as const;

type IconName = keyof typeof ICONS;

function FooterIcon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
}

/** Цэсний мөрийн icon — админаас href өөрчилвөл сум руу буцаж уналгүй ажиллана. */
const menuIcon = (href: string, brochureUrl: string): IconName => {
  /* Файл эсэхийг ЗӨВХӨН замын хэсгээр шийднэ — эс тэгвэл гадаад
     холбоосын ".com" өргөтгөл мэт уншигдаж, external биш download
     icon авна (ж: https://facebook.com). */
  const path = href.replace(/^https?:\/\/[^/]+/i, "");
  if (href === brochureUrl || /\.[a-z0-9]{2,4}$/i.test(path)) return "download";
  if (href === NEWS_PATH || href.startsWith(`${NEWS_PATH}/`)) return "news";
  if (/^https?:\/\//.test(href)) return "external";
  if (href.includes("apartment")) return "plan";
  if (href.includes("location") || href.includes("map")) return "pin";
  if (href.includes("elys")) return "spark";
  if (href.includes("contact")) return "phone";
  return "chevron";
};

/** Багана бүрийн гарчиг — жижиг lime icon-той (харанхуй суурин дээрх акцент). */
function ColumnTitle({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-fg/45">
      <FooterIcon name={icon} className="h-3.5 w-3.5 shrink-0 text-lime/80" />
      {children}
    </p>
  );
}

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
    <footer
      data-bg="footer"
      data-tone={flatSectionTone(site.theme, "footer", "dark")}
      className="bg-night font-gilroy text-fg"
    >
      <div className="mx-auto max-w-[1500px] px-6 py-16 md:px-10 md:py-20">
        <div
          className={`grid gap-10 sm:grid-cols-2 ${
            socials.length ? "md:grid-cols-[1.4fr_1fr_1fr_1fr]" : "md:grid-cols-[1.4fr_1fr_1fr]"
          }`}
        >
          <div data-reveal="up">
            <Logo className="h-4 w-auto text-fg" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-fg/55">
              {brand.tag}. {hero.sub}
            </p>
          </div>

          <div data-reveal="up">
            <ColumnTitle icon="headset">{footer.salesTitle}</ColumnTitle>
            {/* Хөлний холбоосууд гар утсанд хүрэхэд хэтэрхий нимгэн байсан —
                inline-flex + min-h-9-ээр хүрэх талбайг өргөтгөв. */}
            <ul className="mt-3 space-y-1 text-sm text-fg/80">
              <li className="flex items-start gap-2.5 py-1.5">
                <FooterIcon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-fg/35" />
                {contact.hours}
              </li>
              <li>
                <a
                  href={`tel:+976${contact.phone.replace(/[^0-9]/g, "")}`}
                  data-cursor-hover
                  className="group inline-flex min-h-9 items-center gap-2.5 transition-colors duration-300 hover:text-fg"
                >
                  <FooterIcon
                    name="phone"
                    className="h-4 w-4 shrink-0 text-fg/35 transition-colors duration-300 group-hover:text-lime"
                  />
                  {contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${brand.email}`}
                  data-cursor-hover
                  className="group inline-flex min-h-9 items-center gap-2.5 transition-colors duration-300 hover:text-fg"
                >
                  <FooterIcon
                    name="mail"
                    className="h-4 w-4 shrink-0 text-fg/35 transition-colors duration-300 group-hover:text-lime"
                  />
                  {brand.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 py-1.5 text-fg/55">
                <FooterIcon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-fg/35" />
                {contact.location}
              </li>
            </ul>
          </div>

          <div data-reveal="up">
            <ColumnTitle icon="menu">{footer.menuTitle}</ColumnTitle>
            <ul className="mt-3 space-y-1 text-sm text-fg/80">
              {menu.map((item, i) => {
                const icon = (
                  <FooterIcon
                    name={menuIcon(item.href, brand.brochureUrl)}
                    className="h-4 w-4 shrink-0 text-fg/35 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-lime"
                  />
                );
                const linkClass =
                  "group inline-flex min-h-9 items-center gap-2.5 text-left transition-colors duration-300 hover:text-fg";

                return (
                  <li key={`${item.href}-${i}`}>
                    {/* Танилцуулга — хөлнөөс дарсан ч мөн адил маягтаар дамжина */}
                    {item.href === brand.brochureUrl ? (
                      <BrochureButton site={site} source="elysium/mono#footer" className={linkClass}>
                        {icon}
                        {item.label}
                      </BrochureButton>
                    ) : opensInNewTab(item.href) ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener"
                        data-cursor-hover
                        className={linkClass}
                      >
                        {icon}
                        {item.label}
                      </a>
                    ) : (
                      <Link href={resolve(item.href)} data-cursor-hover className={linkClass}>
                        {icon}
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {socials.length > 0 && (
            <div data-reveal="up">
              <ColumnTitle icon="share">{footer.socialTitle}</ColumnTitle>
              <SocialList items={footer.social} />
            </div>
          )}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-fg/10 pt-6 text-[12px] text-fg/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {brand.line} · {developer.name}</p>
          <p>{footer.note}</p>
        </div>
      </div>
    </footer>
  );
}

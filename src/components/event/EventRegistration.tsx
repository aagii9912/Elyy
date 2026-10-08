import type { CSSProperties } from "react";
import type { EventDoc } from "@/lib/events";
import { ulaanbaatarToday } from "@/lib/event-registration";
import { defaultRegistrationPage } from "@/lib/registration-page";
import { loadSiteContent } from "@/lib/site";
import { externalHref } from "@/lib/links";
import { SocialRow } from "@/components/mono/MonoSocial";
import { RegistrationExperience } from "./RegistrationExperience";
import { RegistrationPlaceholder } from "./RegistrationPlaceholder";
import styles from "./EventRegistration.module.css";

/* eslint-disable @next/next/no-img-element */

export async function EventRegistration({ event }: { event: EventDoc }) {
  const site = await loadSiteContent();
  const { contact } = event.content;
  const page = event.content.registrationPage ?? defaultRegistrationPage();
  const { header, footer, links } = page;
  const address = contact.address?.trim() || site.contact.location;
  const email = contact.email?.trim() || site.brand.email;
  const mapUrl = externalHref(contact.mapUrl) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const website = externalHref(links.website);
  const socials = event.content.registrationPage ? links.social : site.footer.social;
  const footerMap = externalHref(footer.mapUrl);
  const logo = header.logo ? <img key="brand-logo" className={styles.logo} src={header.logo} alt={header.logoAlt || event.name} /> :
    <RegistrationPlaceholder key="brand-placeholder" kind="logo" label="Лого" className={styles.logoPlaceholder} />;

  return <RegistrationExperience event={event} today={ulaanbaatarToday()} page={page} logo={logo}
    header={<header key="registration-header">
      <div className={styles.banner}>
        {header.desktopImage || header.mobileImage ? <picture>
          {header.mobileImage && <source media="(max-width: 767px)" srcSet={header.mobileImage} />}
          <img src={header.desktopImage || header.mobileImage} alt="" fetchPriority="high" />
        </picture> : <RegistrationPlaceholder label="Header зураг" detail="1920 × 400 · Гар утас 1080 × 720" />}
      </div>
      <div className={styles.intro}>
        {logo}
        <h1 className={!header.title ? styles.emptyText : undefined}>{header.title || "Уриа, гарчиг"}</h1>
        <p className={!header.body ? styles.emptyText : undefined}>{header.body || "Цаг товлохын зорилго, төслийн товч танилцуулга энд байрлана."}</p>
      </div>
    </header>}
    sidebar={<aside key="registration-sidebar" className={styles.sidebar} aria-label={page.salesTitle}>
      <div className={styles.showroom}>
        {contact.image ? <img src={contact.image} alt={`${event.name} — шоурум`} loading="lazy" /> :
          <RegistrationPlaceholder label="Шоурум зураг / эвлүүлэг" detail="900 × 1200 · 3:4" />}
      </div>
      <h3 className={styles.contactTitle}>{page.salesTitle}</h3>
      <p className={styles.address}>{address}</p>
      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
        <span aria-hidden>↗</span><span>Google Map-аас</span><strong>ХАРАХ</strong>
      </a>
      <div className={styles.contact}>
        <h3 className={styles.contactTitle}>{page.contactTitle}</h3>
        <div className={styles.contactLinks}>
          {contact.phone && <a href={`tel:${contact.phone.replace(/[^+0-9]/g, "")}`}>{contact.phone}</a>}
          {email && <a href={`mailto:${email}`}>{email}</a>}
          {website && <a href={website} target="_blank" rel="noopener noreferrer">Вэбсайт үзэх ↗</a>}
        </div>
        {contact.note && <p className={styles.hours}>{contact.note}</p>}
        <SocialRow items={socials} className={styles.socials} />
      </div>
    </aside>}
    footer={<footer key="registration-footer" className={styles.footer} style={{ "--footer-bg": footer.background, "--footer-text": footer.textColor } as CSSProperties}>
      <div className={styles.footerGrid}>
        <div className={styles.footerBrand}>
          {footer.logo ? <img className={styles.logo} src={footer.logo} alt={footer.company || event.name} loading="lazy" /> :
            <RegistrationPlaceholder kind="logo" label="Компанийн лого" className={styles.logoPlaceholder} />}
          <h2>{footer.company || "Компанийн нэр"}</h2>
          <p>{footer.description || "Компанийн товч мэдээлэл энд байрлана."}</p>
        </div>
        <div>
          <h3>Хаяг, байршил</h3>
          <p>{footer.address || "Оффисын хаяг энд байрлана."}</p>
          {footerMap ? <a href={footerMap} target="_blank" rel="noopener noreferrer">Газрын зураг дээр харах ↗</a> : <span className={styles.footerPlaceholder}>Газрын зургийн холбоос</span>}
        </div>
        <div>
          <h3>{page.contactTitle}</h3>
          <div className={styles.footerLinks}>
            {footer.phone ? <a href={`tel:${footer.phone.replace(/[^+0-9]/g, "")}`}>{footer.phone}</a> : <span className={styles.footerPlaceholder}>Утасны дугаар</span>}
            {footer.email ? <a href={`mailto:${footer.email}`}>{footer.email}</a> : <span className={styles.footerPlaceholder}>И-мэйл хаяг</span>}
            {website ? <a href={website} target="_blank" rel="noopener noreferrer">Вэбсайт үзэх ↗</a> : <span className={styles.footerPlaceholder}>Вэбсайтын холбоос</span>}
          </div>
          <SocialRow items={links.social} className={styles.footerSocials} />
        </div>
      </div>
      <div className={styles.footerBottom}>{footer.copyright || "Зохиогчийн эрхийн мэдээлэл"}</div>
    </footer>}
  />;
}

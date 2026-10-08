import type { EventDoc } from "@/lib/events";
import { ulaanbaatarToday } from "@/lib/event-registration";
import { loadSiteContent } from "@/lib/site";
import { externalHref } from "@/lib/links";
import { SocialRow } from "@/components/mono/MonoSocial";
import { RegistrationLeadForm } from "./RegistrationLeadForm";
import styles from "./EventRegistration.module.css";

/* eslint-disable @next/next/no-img-element */

export async function EventRegistration({ event }: { event: EventDoc }) {
  const site = await loadSiteContent();
  const { form, contact } = event.content;
  const address = contact.address?.trim() || site.contact.location;
  const email = contact.email?.trim() || site.brand.email;
  const mapUrl = externalHref(contact.mapUrl ?? "") ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <section id="register" className={styles.section} aria-labelledby="registration-title">
      <header className={form.showIntro ? styles.intro : "sr-only"}>
        <h2 id="registration-title">{form.title}</h2>
        <p>{form.subtitle}</p>
      </header>
      <div className={styles.layout}>
        <RegistrationLeadForm slug={event.slug} eventName={event.name} form={form} today={ulaanbaatarToday()} />
        <aside className={styles.sidebar} aria-label="Борлуулалтын алба">
          {contact.image ? (
            <img src={contact.image} alt="Elysium Residence" loading="lazy" className={styles.contactImage} />
          ) : (
            <div className={styles.collage} aria-label="Elysium Residence-ийн интерьер">
              {[
                "living-04.jpg", "living-09.jpg", "bedroom-03.jpg",
                "bath-01.jpg", "living-01.jpg", "bedroom-07.jpg",
              ].map((file) => (
                <img key={file} src={`/images/interior/${file}`} alt="" loading="lazy" />
              ))}
              <span aria-hidden /><span aria-hidden /><span aria-hidden /><span aria-hidden />
            </div>
          )}

          <h3 className={styles.contactTitle}>Борлуулалтын алба</h3>
          <p className={styles.address}>{address}</p>
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
            <svg aria-hidden viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
            </svg>
            <span>Google Map-аас</span><strong>ХАРАХ</strong>
          </a>

          <div className={styles.contact}>
            <h3 className={styles.contactTitle}>Бидэнтэй холбогдох</h3>
            <div className={styles.contactLinks}>
              {contact.phone && (
                <a href={`tel:${contact.phone.replace(/[^+0-9]/g, "")}`}>
                  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor">
                    <path d="m6.6 2 3.2 5.6-2.2 2.2a17.8 17.8 0 0 0 6.6 6.6l2.2-2.2 5.6 3.2v2A2.6 2.6 0 0 1 19.2 22C9.6 21.4 2.6 14.4 2 4.8A2.6 2.6 0 0 1 4.6 2h2Z" />
                  </svg>
                  {contact.phone}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`}>
                  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 5h20v2l-10 6L2 7V5Zm0 4 10 6 10-6v10H2V9Z" />
                  </svg>
                  {email}
                </a>
              )}
            </div>
            {contact.note && <p className={styles.hours}>{contact.note}</p>}
            <SocialRow items={site.footer.social} className={styles.socials} />
          </div>
        </aside>
      </div>
    </section>
  );
}

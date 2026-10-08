"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { EventDoc } from "@/lib/events";
import type { RegistrationPageContent } from "@/lib/registration-page";
import { RegistrationLeadForm } from "./RegistrationLeadForm";
import { RegistrationPlaceholder } from "./RegistrationPlaceholder";
import styles from "./EventRegistration.module.css";

/* eslint-disable @next/next/no-img-element */

export function RegistrationExperience({ event, today, page, header, logo, sidebar, footer }: {
  event: EventDoc; today: string; page: RegistrationPageContent;
  header: ReactNode; logo: ReactNode; sidebar: ReactNode; footer: ReactNode;
}) {
  const [sent, setSent] = useState(false);
  const confirmation = useRef<HTMLHeadingElement>(null);
  const { form } = event.content;

  useEffect(() => {
    if (!sent) return;
    confirmation.current?.focus({ preventScroll: true });
    confirmation.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [sent]);

  return (
    <div className={styles.page}>
      {sent ? <header className={styles.confirmationHeader}>{logo}</header> : header}
      <section id="register" className={styles.section} aria-labelledby={sent ? "registration-success" : "registration-title"}>
        {sent ? <>
          <div className={styles.success} role="status">
            <svg aria-hidden className={styles.successMark} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="13" width="40" height="41" rx="4" /><path d="M9 25h40M20 7v12M38 7v12" />
              <circle cx="46" cy="46" r="14" className={styles.successCircle} /><path d="m39 46 5 5 9-10" />
            </svg>
            <h1 id="registration-success" ref={confirmation} tabIndex={-1}>{form.successTitle}</h1>
            <p>{form.successBody}</p>
          </div>
          <ManagerCarousel content={page.managers} />
        </> : <>
          <div className={form.showIntro ? styles.formIntro : "sr-only"}>
            <h2 id="registration-title">{form.title}</h2>
            <p>{form.subtitle}</p>
          </div>
          <div className={styles.layout}>
            <RegistrationLeadForm slug={event.slug} eventName={event.name} form={form} today={today} onSuccess={() => setSent(true)} />
            {sidebar}
          </div>
        </>}
      </section>
      {footer}
    </div>
  );
}

function ManagerCarousel({ content }: { content: RegistrationPageContent["managers"] }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const measure = () => {
    const el = track.current;
    if (el) setEdges({ start: el.scrollLeft < 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  };
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const move = (direction: number) => {
    const el = track.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: direction * ((first?.offsetWidth ?? el.clientWidth) + gap), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  if (!content.items.length) return null;
  return (
    <section className={styles.managers} aria-labelledby="managers-title" aria-roledescription="картын цуваа">
      <div className={styles.managersHeading}>
        <div>
          <h2 id="managers-title">{content.title || "Борлуулалтын менежерүүд"}</h2>
          {content.subtitle && <p>{content.subtitle}</p>}
        </div>
        <div className={styles.carouselControls} hidden={edges.start && edges.end}>
          <button type="button" aria-label="Өмнөх менежер" aria-controls="manager-cards" disabled={edges.start} onClick={() => move(-1)}>←</button>
          <button type="button" aria-label="Дараагийн менежер" aria-controls="manager-cards" disabled={edges.end} onClick={() => move(1)}>→</button>
        </div>
      </div>
      <div id="manager-cards" ref={track} onScroll={measure} className={styles.managerTrack} tabIndex={0} aria-label="Менежерийн картууд">
        {content.items.map((manager, i) => (
          <article key={manager.id} className={styles.managerCard} aria-label={`${i + 1} / ${content.items.length} — ${manager.name || "Менежер"}`}>
            <div className={styles.managerPortrait}>
              {manager.image ? <img src={manager.image} alt={manager.name || "Борлуулалтын менежер"} loading="lazy" /> :
                <RegistrationPlaceholder kind="person" label="Менежерийн зураг" detail="800 × 1000 · 4:5" />}
            </div>
            <div className={styles.managerInfo}>
              <h3>{manager.name || "Менежерийн нэр"}</h3>
              <p>{manager.role || "Албан тушаал"}</p>
              {manager.phone ? <a href={`tel:${manager.phone.replace(/[^+0-9]/g, "")}`}>{manager.phone}</a> : <span className={styles.emptyText}>Утасны дугаар</span>}
              {manager.email && <a href={`mailto:${manager.email}`}>{manager.email}</a>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

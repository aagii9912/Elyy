"use client";

/* `/noir` — Холбоо барих. Хүсэлт нь бусад хуудастай ижил `/api/contact`
   руу очно (Google Sheet + Supabase). Талбарууд нь картгүй, зөвхөн доод
   зураастай — theme-ийн үсэг зүйн хэмнэлийг дагана. */

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { sectionTone } from "@/lib/theme-css";
import { NoirChapter, NoirSection } from "./shared";

type Status = "idle" | "sending" | "sent" | "error";

export function NoirContact({ site }: { site: SiteContent }) {
  const { contact, brand } = site;
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    const data = new FormData(e.currentTarget);
    const date = String(data.get("date") ?? "");
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          message: `${contact.form.dateLabel}: ${date || "сонгоогүй"}`,
          source: "elysium/noir#contact",
          website: String(data.get("website") ?? ""), // honeypot
        }),
      });
      const json = await res.json().catch(() => null);
      setStatus(res.ok && json?.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <NoirSection id="contact" bg="contact" tone={sectionTone(site.theme, "contact", "dark")}>
      <div className="nv-head nv-head--split">
        <div>
          <NoirChapter>{contact.kicker}</NoirChapter>
          <h2 className="nv-h2" data-rise>
            {contact.title}
          </h2>
          <p className="nv-lead" style={{ marginTop: "18px" }}>
            {contact.sub}
          </p>

          <dl className="nv-contact-meta">
            <div>
              <dt>{contact.labels.phone}</dt>
              <dd>
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>{contact.phone}</a>
              </dd>
            </div>
            <div>
              <dt>{contact.labels.hours}</dt>
              <dd>{contact.hours}</dd>
            </div>
            <div>
              <dt>{contact.labels.office}</dt>
              <dd style={{ fontSize: "16px", lineHeight: 1.5 }}>{contact.location}</dd>
            </div>
            <div>
              <dt>{contact.labels.email}</dt>
              <dd>
                <a href={`mailto:${brand.email}`}>{brand.email}</a>
              </dd>
            </div>
          </dl>
        </div>

        <div data-rise style={{ "--d": "0.08s" } as React.CSSProperties}>
          {status === "sent" ? (
            <div>
              <h3 className="nv-h3">{contact.form.successTitle}</h3>
              <p className="nv-note">{contact.form.successBody}</p>
            </div>
          ) : (
            <form className="nv-form" onSubmit={onSubmit} noValidate={false}>
              <div className="nv-field">
                <label htmlFor="nv-name">{contact.form.name}</label>
                <input id="nv-name" name="name" required autoComplete="name" />
              </div>
              <div className="nv-field">
                <label htmlFor="nv-phone">{contact.form.phone}</label>
                <input id="nv-phone" name="phone" required inputMode="tel" autoComplete="tel" />
              </div>
              <div className="nv-field">
                <label htmlFor="nv-date">{contact.form.dateLabel}</label>
                <input id="nv-date" name="date" type="date" />
              </div>

              {/* Ботыг барих далд талбар — хүн хэзээ ч бөглөхгүй. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
              />

              <button type="submit" className="nv-pill" disabled={status === "sending"}>
                <span>{status === "sending" ? contact.form.sending : contact.form.submit}</span>
              </button>

              {status === "error" && <p className="nv-note nv-note--bad">{contact.form.error}</p>}
            </form>
          )}
        </div>
      </div>
    </NoirSection>
  );
}

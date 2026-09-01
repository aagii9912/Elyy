"use client";

/* /mono — Уулзалт товлох. Brief: "маш энгийн (нэр, утас, огноо)".
   Posts to /api/contact → Google Sheet (борлуулалтын менежерүүдэд).
   Хуудасны нэгдсэн цайвар суурин дээр, маягт нь цагаан карт дээр. */

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { MonoKicker } from "./shared";
import { SocialRow } from "./MonoSocial";
import { flatSectionTone } from "@/lib/theme-css";

export function MonoContact({ site }: { site: SiteContent }) {
  const { contact, brand } = site;
  const f = contact.form;
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const date = String(data.get("date") ?? "");
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          message: `Уулзалтын хүссэн огноо: ${date || "сонгоогүй"}`,
          source: "elysium/mono#contact",
          website: String(data.get("website") ?? ""), // honeypot
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) setSent(true);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      id="contact"
      data-bg="contact"
      data-tone={flatSectionTone(site.theme, "contact")}
      className="border-b border-fg/10 bg-ground py-24 font-gilroy text-fg md:py-28"
    >
      <div className="mx-auto max-w-page px-6 md:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <MonoKicker reveal>{contact.kicker}</MonoKicker>
            <h2 data-reveal="heading" className="mono-h2 mt-4 max-w-md">
              {contact.title}
            </h2>
            <p data-reveal="up" className="mono-lead mt-5">{contact.sub}</p>

            <dl className="mt-10 space-y-6 border-t border-fg/10 pt-8">
              <div data-reveal="up">
                <dt className="text-label font-semibold uppercase tracking-caps text-fg/45">{contact.labels.phone}</dt>
                <dd className="mt-1.5">
                  <a
                    href={`tel:+976${contact.phone.replace(/[^0-9]/g, "")}`}
                    data-cursor-hover
                    className="inline-flex min-h-11 items-center text-2xl font-extrabold text-fg transition-opacity duration-300 hover:opacity-70"
                  >
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div data-reveal="up">
                <dt className="text-label font-semibold uppercase tracking-caps text-fg/45">{contact.labels.hours}</dt>
                <dd className="mt-1.5 text-lg font-semibold">{contact.hours}</dd>
              </div>
              <div data-reveal="up">
                <dt className="text-label font-semibold uppercase tracking-caps text-fg/45">{contact.labels.office}</dt>
                <dd className="mt-1.5 max-w-sm text-lg font-semibold leading-snug text-fg/85">{contact.location}</dd>
              </div>
              <div data-reveal="up">
                <dt className="text-label font-semibold uppercase tracking-caps text-fg/45">{contact.labels.email}</dt>
                <dd className="mt-1.5">
                  <a
                    href={`mailto:${brand.email}`}
                    data-cursor-hover
                    className="inline-flex min-h-11 items-center text-lg font-semibold underline-offset-4 transition-opacity duration-300 hover:underline hover:opacity-70"
                  >
                    {brand.email}
                  </a>
                </dd>
              </div>
            </dl>

            <SocialRow items={site.footer.social} className="mt-9 border-t border-fg/10 pt-7" />
          </div>

          <div className="lg:pt-3">
            {sent ? (
              <div className="mono-fade-up max-w-md rounded-2xl border border-fg/10 bg-surface p-7 shadow-[0_18px_50px_-32px_rgba(21,23,23,0.4)]">
                <p className="text-xl font-bold leading-relaxed text-fg">{f.successTitle}</p>
                <p className="mt-2 text-sm text-fg/60">{f.successBody}</p>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                data-reveal="up"
                className="flex max-w-md flex-col gap-7 rounded-2xl border border-fg/10 bg-surface p-7 shadow-[0_18px_50px_-32px_rgba(21,23,23,0.4)] md:p-9"
              >
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={f.name}
                  className="border-b border-fg/20 bg-transparent pb-3 pt-2 text-lg font-semibold text-fg placeholder:text-fg/35 focus:border-fg focus:outline-none"
                />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder={f.phone}
                  className="border-b border-fg/20 bg-transparent pb-3 pt-2 text-lg font-semibold text-fg placeholder:text-fg/35 focus:border-fg focus:outline-none"
                />
                <label className="block">
                  <span className="mb-2 block text-label font-semibold uppercase tracking-caps text-fg/45">
                    {f.dateLabel}
                  </span>
                  <input
                    type="date"
                    name="date"
                    className="w-full border-b border-fg/20 bg-transparent pb-3 pt-2 text-lg font-semibold text-fg focus:border-fg focus:outline-none"
                  />
                </label>
                {error && (
                  <p role="alert" className="text-sm font-semibold text-red-600">
                    {f.error} {contact.phone}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  data-cursor-hover
                  className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-night px-7 py-3.5 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {busy ? f.sending : f.submit}
                  <span aria-hidden>→</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

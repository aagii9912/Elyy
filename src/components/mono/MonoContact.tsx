"use client";

/* /mono — Уулзалт товлох. Brief: "маш энгийн (нэр, утас, огноо)".
   Posts to /api/contact → Google Sheet (борлуулалтын менежерүүдэд).
   Dark band. */

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { MonoKicker } from "./shared";

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
    <section id="contact" className="bg-night py-20 font-gilroy text-white md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <MonoKicker tone="dark" reveal>{contact.kicker}</MonoKicker>
            <h2 data-reveal="heading" className="mt-5 max-w-md text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-[1.02] tracking-tight">
              {contact.title}
            </h2>
            <p data-reveal="up" className="mt-5 max-w-md text-[15px] leading-relaxed text-white/65">{contact.sub}</p>

            <dl className="mt-10 space-y-6 border-t border-white/10 pt-8">
              <div data-reveal="up">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{contact.labels.phone}</dt>
                <dd className="mt-1.5">
                  <a
                    href={`tel:+976${contact.phone.replace(/[^0-9]/g, "")}`}
                    data-cursor-hover
                    className="text-2xl font-extrabold text-white transition-opacity hover:opacity-70"
                  >
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div data-reveal="up">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{contact.labels.hours}</dt>
                <dd className="mt-1.5 text-lg font-semibold">{contact.hours}</dd>
              </div>
              <div data-reveal="up">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{contact.labels.office}</dt>
                <dd className="mt-1.5 max-w-sm text-lg font-semibold leading-snug text-white/90">{contact.location}</dd>
              </div>
              <div data-reveal="up">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{contact.labels.email}</dt>
                <dd className="mt-1.5">
                  <a
                    href={`mailto:${brand.email}`}
                    data-cursor-hover
                    className="text-lg font-semibold underline-offset-4 transition-opacity hover:underline hover:opacity-70"
                  >
                    {brand.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="max-w-md lg:pt-3">
            {sent ? (
              <div className="mono-fade-up rounded-2xl border border-white/20 bg-white/5 p-7">
                <p className="text-xl font-bold leading-relaxed text-white">{f.successTitle}</p>
                <p className="mt-2 text-sm text-white/65">{f.successBody}</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-7">
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
                  data-reveal="up"
                  className="border-b border-white/30 bg-transparent pb-3 text-lg font-semibold text-white placeholder:text-white/40 focus:border-white focus:outline-none"
                />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder={f.phone}
                  data-reveal="up"
                  className="border-b border-white/30 bg-transparent pb-3 text-lg font-semibold text-white placeholder:text-white/40 focus:border-white focus:outline-none"
                />
                <label data-reveal="up" className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    {f.dateLabel}
                  </span>
                  <input
                    type="date"
                    name="date"
                    className="w-full border-b border-white/30 bg-transparent pb-3 text-lg font-semibold text-white [color-scheme:dark] focus:border-white focus:outline-none"
                  />
                </label>
                {error && (
                  <p role="alert" className="text-sm font-semibold text-red-300">
                    {f.error} {contact.phone}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  data-cursor-hover
                  data-reveal="up"
                  className="mt-2 inline-flex items-center justify-center gap-2 self-start rounded-full bg-white px-7 py-3.5 text-sm font-bold text-night transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
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

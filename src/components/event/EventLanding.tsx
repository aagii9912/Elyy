/* Эвентийн landing page рендер — server component.
   Hero + дараалсан section-ууд + бүртгэлийн блок + footer.
   Онцлох өнгө (accent) нь --accent CSS хувьсагчаар дамжина. */

import type { CSSProperties } from "react";
import type { EventDoc, Section } from "@/lib/events";
import { EventLeadForm } from "./EventLeadForm";

/* eslint-disable @next/next/no-img-element */

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-label font-bold uppercase tracking-caps text-[var(--accent)]">
      <span aria-hidden className="h-px w-8 bg-[var(--accent)]" />
      {children}
    </p>
  );
}

const wrap = "mx-auto w-full max-w-[1200px] px-5 md:px-10";

/* ---------------- Section renderers ---------------- */

function SectionView({ s }: { s: Section }) {
  switch (s.type) {
    case "richText":
      return (
        <section className="bg-white py-20 text-night md:py-28">
          <div className={`${wrap} grid gap-8 md:grid-cols-12`}>
            <div className="md:col-span-4">
              {s.heading && (
                <h2 className="text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-[1.05] tracking-tight">
                  {s.heading}
                </h2>
              )}
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <p className="whitespace-pre-line text-sub leading-relaxed text-night/70">{s.body}</p>
            </div>
          </div>
        </section>
      );

    case "stats":
      return (
        <section className="bg-night py-16 text-white md:py-20">
          <div className={`${wrap} grid grid-cols-2 gap-8 md:grid-cols-4`}>
            {s.items.map((it, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-none tracking-tight text-[var(--accent)]">
                  {it.value}
                </div>
                <div className="mt-2 text-body font-semibold uppercase tracking-wide text-white/55">
                  {it.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      );

    case "agenda":
      return (
        <section className="bg-paper py-20 text-night md:py-28">
          <div className={wrap}>
            {s.heading && <Kicker>{s.heading}</Kicker>}
            <div className="mt-10 divide-y divide-night/10 border-y border-night/10">
              {s.items.map((it, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 py-6 md:grid-cols-12 md:items-baseline md:gap-6">
                  <div className="text-lg font-extrabold tracking-tight text-[var(--accent)] md:col-span-2">
                    {it.time}
                  </div>
                  <div className="md:col-span-10">
                    <div className="text-xl font-bold">{it.title}</div>
                    {it.desc && <div className="mt-1 text-lead text-night/60">{it.desc}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "gallery":
      if (!s.images.length) return null;
      return (
        <section className="bg-white py-16 md:py-24">
          <div className={`${wrap} grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4`}>
            {s.images.map((img, i) => (
              <div key={i} className="aspect-[4/3] overflow-hidden rounded-lg bg-paper">
                <img src={img.url} alt={img.alt || ""} loading="lazy" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      );

    case "image":
      if (!s.url) return null;
      return (
        <section className="bg-white py-10 md:py-16">
          <div className={wrap}>
            <div className="overflow-hidden rounded-2xl bg-paper">
              <img src={s.url} alt={s.caption || ""} loading="lazy" className="h-full w-full object-cover" />
            </div>
            {s.caption && <p className="mt-3 text-center text-sm text-night/50">{s.caption}</p>}
          </div>
        </section>
      );

    case "cards":
      return (
        <section className="bg-white py-20 text-night md:py-28">
          <div className={wrap}>
            {s.heading && <Kicker>{s.heading}</Kicker>}
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {s.items.map((it, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-night/10 bg-paper/40">
                  {it.image && (
                    <div className="aspect-[4/3] overflow-hidden bg-paper">
                      <img src={it.image} alt={it.title} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="text-lg font-extrabold">{it.title}</div>
                    {it.subtitle && (
                      <div className="mt-0.5 text-body font-semibold uppercase tracking-wide text-[var(--accent)]">
                        {it.subtitle}
                      </div>
                    )}
                    {it.desc && <p className="mt-3 text-lead leading-relaxed text-night/65">{it.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "cta":
      return (
        <section className="bg-night py-20 text-white md:py-28">
          <div className={`${wrap} text-center`}>
            <h2 className="mx-auto max-w-3xl text-[clamp(2rem,4.6vw,3.6rem)] font-extrabold leading-[1.03] tracking-tight">
              {s.heading}
            </h2>
            {s.body && <p className="mx-auto mt-5 max-w-xl text-sub leading-relaxed text-white/65">{s.body}</p>}
            <a
              href="#register"
              data-cursor-hover
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-8 py-4 text-sm font-extrabold uppercase tracking-wide text-night transition-transform duration-300 hover:-translate-y-0.5"
            >
              {s.buttonLabel} <span aria-hidden>→</span>
            </a>
          </div>
        </section>
      );
  }
}

/* ---------------- Landing ---------------- */

export function EventLanding({ event }: { event: EventDoc }) {
  const c = event.content;
  const rootStyle = { "--accent": c.accent || "#b4d656" } as CSSProperties;
  const heroDark = c.theme !== "light";

  return (
    <div style={rootStyle} className="font-gilroy">
      {/* ---------- HERO ---------- */}
      <section
        className={`relative flex min-h-[92vh] flex-col overflow-hidden ${
          heroDark ? "bg-night text-white" : "bg-paper text-night"
        }`}
      >
        {/* background image + overlay (дэвсгэр өнгө нь section дээр шууд) */}
        {c.hero.image && (
          <>
            <img src={c.hero.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div
              className={`absolute inset-0 ${
                heroDark
                  ? "bg-gradient-to-b from-night/70 via-night/55 to-night/85"
                  : "bg-gradient-to-b from-white/60 via-white/40 to-white/80"
              }`}
            />
          </>
        )}

        {/* top bar */}
        <div className={`relative z-10 ${wrap} flex items-center justify-between py-7`}>
          <a href="/" className="text-lg font-extrabold tracking-tight" data-cursor-hover>
            Elysium
          </a>
          <a
            href="#register"
            data-cursor-hover
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-body font-extrabold uppercase tracking-wide text-night transition-transform hover:-translate-y-0.5"
          >
            {c.hero.ctaLabel}
          </a>
        </div>

        {/* hero content */}
        <div className={`relative z-10 ${wrap} flex flex-1 flex-col justify-center py-16`}>
          {c.hero.kicker && <Kicker>{c.hero.kicker}</Kicker>}
          <h1 className="mt-6 max-w-4xl text-[clamp(2.6rem,7vw,6rem)] font-extrabold leading-[0.98] tracking-tight">
            {c.hero.title}
          </h1>
          {c.hero.subtitle && (
            <p className={`mt-6 max-w-xl text-[clamp(1rem,1.5vw,1.25rem)] leading-relaxed ${heroDark ? "text-white/75" : "text-night/70"}`}>
              {c.hero.subtitle}
            </p>
          )}

          {/* date / location chips */}
          <div className="mt-9 flex flex-wrap gap-3">
            {c.hero.date && (
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${heroDark ? "border-white/25 text-white" : "border-night/20 text-night"}`}>
                <span aria-hidden>🗓</span> {c.hero.date}
              </span>
            )}
            {c.hero.location && (
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${heroDark ? "border-white/25 text-white" : "border-night/20 text-night"}`}>
                <span aria-hidden>📍</span> {c.hero.location}
              </span>
            )}
          </div>

          <a
            href="#register"
            data-cursor-hover
            className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent)] px-8 py-4 text-sm font-extrabold uppercase tracking-wide text-night transition-transform duration-300 hover:-translate-y-0.5"
          >
            {c.hero.ctaLabel} <span aria-hidden>→</span>
          </a>
        </div>
      </section>

      {/* ---------- SECTIONS ---------- */}
      {c.sections.map((s) => (
        <SectionView key={s.id} s={s} />
      ))}

      {/* ---------- REGISTER (lead capture) ---------- */}
      <section id="register" className="scroll-mt-6 bg-night py-20 text-white md:py-28">
        <div className={`${wrap} grid gap-12 lg:grid-cols-2 lg:gap-20`}>
          <div>
            <Kicker>{c.form.title}</Kicker>
            <h2 className="mt-5 max-w-md text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-[1.02] tracking-tight">
              {c.form.subtitle}
            </h2>
            <dl className="mt-10 space-y-6 border-t border-white/10 pt-8">
              {c.contact.phone && (
                <div>
                  <dt className="text-label font-semibold uppercase tracking-caps text-white/45">Утас</dt>
                  <dd className="mt-1.5">
                    <a href={`tel:+976${c.contact.phone.replace(/[^0-9]/g, "")}`} data-cursor-hover className="text-2xl font-extrabold hover:opacity-70">
                      {c.contact.phone}
                    </a>
                  </dd>
                </div>
              )}
              {c.contact.note && (
                <div>
                  <dt className="text-label font-semibold uppercase tracking-caps text-white/45">Мэдээлэл</dt>
                  <dd className="mt-1.5 max-w-sm text-lg font-semibold leading-snug text-white/90">{c.contact.note}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="max-w-md lg:pt-3">
            <EventLeadForm slug={event.slug} eventName={event.name} form={c.form} />
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-night pb-12 pt-4 text-white/50">
        <div className={`${wrap} flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-sm md:flex-row`}>
          <span>© Elysium Residence</span>
          <span>{c.hero.date} · {c.hero.location}</span>
        </div>
      </footer>
    </div>
  );
}

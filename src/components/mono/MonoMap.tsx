"use client";

/* /mono — Байршил. Хоёр хэсэгтэй: (1) төслийн байршил + ойролцоох
   цэгүүд, (2) борлуулалтын оффис + холбоо барих мэдээлэл.
   Табаар сольж нэг л газрын зураг дээр харуулна. Хаяг, координат,
   ойролцоох цэгүүд бүгд админаас (`/admin/site` → Байршил) удирдагдах
   ба coords-ыг солиход зураг болон чиглэл шууд шинэчлэгдэнэ. */

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { MonoKicker } from "./shared";

/* Яг координат — pin нь тодорхой цэг дээр буух ба чиглэл мөн үүн рүү заана. */
const embed = (coords: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(coords)}&z=16&output=embed`;
const directions = (coords: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}`;

type TabId = "project" | "office";

export function MonoMap({ site }: { site: SiteContent }) {
  const { location, contact, brand } = site;
  const [active, setActive] = useState<TabId>("project");
  const [group, setGroup] = useState(0);
  const tab = { id: active, ...location.tabs[active] };
  const nearby = location.nearby[group] ?? location.nearby[0];

  return (
    <section id="location" className="border-b border-night/10 bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <MonoKicker reveal>{location.kicker}</MonoKicker>
            <h2
              data-reveal="heading"
              className="mt-4 max-w-xl text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-night"
            >
              {tab.title}
            </h2>
          </div>
          <a
            href={directions(tab.coords)}
            target="_blank"
            rel="noopener"
            data-cursor-hover
            data-reveal="up"
            className="inline-flex items-center gap-2 self-start rounded-full border border-night/25 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-night transition-colors hover:bg-night hover:text-white md:self-auto"
          >
            {location.directionsLabel}
          </a>
        </div>

        {/* Tabs — төслийн байршил / борлуулалтын оффис */}
        <div
          role="tablist"
          aria-label="Байршлын төрөл"
          data-reveal="up"
          className="mt-8 inline-flex rounded-full border border-night/15 bg-white p-1"
        >
          {(["project", "office"] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active === id}
              aria-controls={`map-panel-${id}`}
              onClick={() => setActive(id)}
              data-cursor-hover
              className={`rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors ${
                active === id
                  ? "bg-night text-white"
                  : "text-night/55 hover:text-night"
              }`}
            >
              {location.tabs[id].label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div
            data-reveal="zoom"
            className="overflow-hidden rounded-2xl border border-night/10 bg-white"
          >
            <iframe
              key={tab.id}
              title={`Elysium Residence — ${tab.label}`}
              src={embed(tab.coords)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              /* lg дээр хажуугийн жагсаалтын өндрийг дагаж дүүргэнэ —
                 картын доор цагаан зай үлдэхгүй. */
              className="h-[320px] w-full grayscale-[0.25] md:h-[440px] lg:h-full lg:min-h-[440px]"
            />
          </div>

          <div
            id={`map-panel-${active}`}
            role="tabpanel"
            key={active}
            className="mono-fade-up grid content-start gap-3"
          >
            <div className="rounded-xl border border-night/10 bg-white px-4 py-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-night/45">
                {location.addressLabel}
              </p>
              <p className="mt-1.5 text-sm font-bold leading-snug text-night">{tab.address}</p>
            </div>

            {active === "project" ? (
              <div className="grid content-start gap-3">
                {/* Ойролцоох цэгүүд — бүлгээр шүүнэ */}
                <div
                  role="tablist"
                  aria-label="Ойролцоох цэгийн бүлэг"
                  className="flex flex-wrap gap-2"
                >
                  {location.nearby.map((g, i) => (
                    <button
                      key={`${g.label}-${i}`}
                      type="button"
                      role="tab"
                      aria-selected={group === i}
                      aria-controls={`nearby-${i}`}
                      onClick={() => setGroup(i)}
                      data-cursor-hover
                      className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors ${
                        group === i
                          ? "border-night bg-night text-white"
                          : "border-night/15 bg-white text-night/55 hover:border-night/40 hover:text-night"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                <ul
                  id={`nearby-${group}`}
                  role="tabpanel"
                  key={group}
                  /* min-h нь хамгийн богино бүлэг (Эрүүл мэнд, 3 мөр) сонгогдоход
                     газрын зургийг хэт намсгахаас сэргийлнэ. */
                  className="mono-fade-up grid content-start gap-2 sm:grid-cols-2 lg:min-h-[19rem] lg:grid-cols-1"
                >
                  {nearby.items.map((l, i) => (
                    <li
                      key={`${l.place}-${i}`}
                      className="flex items-center gap-3 rounded-xl border border-night/10 bg-white px-4 py-3 transition-colors hover:border-night/30"
                    >
                      <span className="w-6 shrink-0 text-[11px] font-bold tabular-nums text-night/35">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-night">{l.place}</p>
                        {l.kind && (
                          <p className="text-[10px] uppercase tracking-[0.16em] text-night/45">
                            {l.kind}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-extrabold tabular-nums text-night">
                        {l.distance}
                        <span className="ml-0.5 text-[11px] font-bold text-night/45">м</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="grid content-start gap-3">
                <div className="rounded-xl border border-night/10 bg-white px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-night/45">
                    {location.office.phoneLabel}
                  </p>
                  <a
                    href={`tel:+976${contact.phone.replace(/[^0-9]/g, "")}`}
                    data-cursor-hover
                    className="mt-1.5 block text-xl font-extrabold text-night transition-opacity hover:opacity-70"
                  >
                    {contact.phone}
                  </a>
                </div>
                <div className="rounded-xl border border-night/10 bg-white px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-night/45">
                    {location.office.hoursLabel}
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-night">{contact.hours}</p>
                </div>
                <div className="rounded-xl border border-night/10 bg-white px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-night/45">
                    {location.office.emailLabel}
                  </p>
                  <a
                    href={`mailto:${brand.email}`}
                    data-cursor-hover
                    className="mt-1.5 block text-sm font-bold text-night underline-offset-4 transition-opacity hover:underline hover:opacity-70"
                  >
                    {brand.email}
                  </a>
                </div>
                <a
                  href="#contact"
                  data-cursor-hover
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-night px-6 py-3.5 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {location.office.ctaLabel} <span aria-hidden>→</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

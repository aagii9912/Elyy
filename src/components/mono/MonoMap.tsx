"use client";

/* /mono — Байршил. Хоёр хэсэгтэй: (1) төслийн байршил + ойролцоох
   цэгүүд, (2) борлуулалтын оффис + холбоо барих мэдээлэл.
   Табаар сольж нэг л газрын зураг дээр харуулна.
   TABS дахь coords-ыг солиход зураг болон чиглэл шууд шинэчлэгдэнэ. */

import { useState } from "react";
import { FINAL, SITE } from "@/lib/content";
import { MonoKicker } from "./shared";

/* Ойролцоох цэгүүд — захиалагчийн хэмжсэн зайгаар, 3 бүлэгт.
   Бүлэг бүрд хамгийн ойроос нь эрэмбэлнэ. */
type NearbyGroup = {
  id: string;
  label: string;
  items: { place: string; m: number; kind?: string }[];
};

const NEARBY: NearbyGroup[] = [
  {
    id: "edu",
    label: "Боловсрол",
    items: [
      { place: "Номин Кидс", m: 450, kind: "Цэцэрлэг" },
      { place: "Оном сургууль", m: 600, kind: "Сургууль" },
      { place: "18-р сургууль", m: 1000, kind: "Сургууль" },
      { place: "72-р цэцэрлэг", m: 1000, kind: "Цэцэрлэг" },
      { place: "Орхон Хасу", m: 1200, kind: "Сургууль" },
      { place: "15-р сургууль", m: 1500, kind: "Сургууль" },
      { place: "65-р цэцэрлэг", m: 1650, kind: "Цэцэрлэг" },
      { place: "67-р цэцэрлэг", m: 1790, kind: "Цэцэрлэг" },
      { place: "75-р сургууль", m: 1800, kind: "Сургууль" },
    ],
  },
  {
    id: "retail",
    label: "Худалдаа, үйлчилгээ",
    items: [
      { place: "Поларис их дэлгүүр", m: 550 },
      { place: "Номин Юнайтэд", m: 620 },
      { place: "Лавай зах", m: 1100 },
      { place: "19-р үйлчилгээний төв", m: 1600 },
      { place: "Хүннү молл", m: 3700 },
      { place: "Food City", m: 3800 },
    ],
  },
  {
    id: "health",
    label: "Эрүүл мэнд",
    items: [
      { place: "ХУД эрүүл мэндийн төв", m: 1000 },
      { place: "Интермед эмнэлэг", m: 1700 },
      { place: "Улаанбаатар сувилал", m: 1800 },
    ],
  },
];

/* Яг координат — pin нь тодорхой цэг дээр буух ба чиглэл мөн үүн рүү заана. */
const embed = (coords: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(coords)}&z=16&output=embed`;
const directions = (coords: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}`;

type TabId = "project" | "office";

const TABS: { id: TabId; label: string; title: string; address: string; coords: string }[] = [
  {
    id: "project",
    label: "Төслийн байршил",
    title: "Хотын төвд, байгалийн хажууд",
    address: "Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, Улаанбаатар",
    coords: "47.89733862835647,106.88538756153864",
  },
  {
    id: "office",
    label: "Борлуулалтын оффис",
    title: "Биечлэн ирж танилцаарай",
    address: FINAL.contact.location,
    coords: "47.90146685024925,106.93241183285195",
  },
];

export function MonoMap() {
  const [active, setActive] = useState<TabId>("project");
  const [group, setGroup] = useState(NEARBY[0].id);
  const tab = TABS.find((t) => t.id === active)!;
  const nearby = NEARBY.find((g) => g.id === group)!;

  return (
    <section id="location" className="border-b border-night/10 bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <MonoKicker reveal>Байршил</MonoKicker>
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
            Чиглэл авах ↗
          </a>
        </div>

        {/* Tabs — төслийн байршил / борлуулалтын оффис */}
        <div
          role="tablist"
          aria-label="Байршлын төрөл"
          data-reveal="up"
          className="mt-8 inline-flex rounded-full border border-night/15 bg-white p-1"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active === t.id}
              aria-controls={`map-panel-${t.id}`}
              onClick={() => setActive(t.id)}
              data-cursor-hover
              className={`rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors ${
                active === t.id
                  ? "bg-night text-white"
                  : "text-night/55 hover:text-night"
              }`}
            >
              {t.label}
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
                Хаяг
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
                  {NEARBY.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      role="tab"
                      aria-selected={group === g.id}
                      aria-controls={`nearby-${g.id}`}
                      onClick={() => setGroup(g.id)}
                      data-cursor-hover
                      className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors ${
                        group === g.id
                          ? "border-night bg-night text-white"
                          : "border-night/15 bg-white text-night/55 hover:border-night/40 hover:text-night"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                <ul
                  id={`nearby-${nearby.id}`}
                  role="tabpanel"
                  key={nearby.id}
                  /* min-h нь хамгийн богино бүлэг (Эрүүл мэнд, 3 мөр) сонгогдоход
                     газрын зургийг хэт намсгахаас сэргийлнэ. */
                  className="mono-fade-up grid content-start gap-2 sm:grid-cols-2 lg:min-h-[19rem] lg:grid-cols-1"
                >
                  {nearby.items.map((l, i) => (
                    <li
                      key={l.place}
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
                        {l.m}
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
                    Утас
                  </p>
                  <a
                    href={`tel:+976${FINAL.contact.phone.replace(/[^0-9]/g, "")}`}
                    data-cursor-hover
                    className="mt-1.5 block text-xl font-extrabold text-night transition-opacity hover:opacity-70"
                  >
                    {FINAL.contact.phone}
                  </a>
                </div>
                <div className="rounded-xl border border-night/10 bg-white px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-night/45">
                    Цагийн хуваарь
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-night">{FINAL.contact.hours}</p>
                </div>
                <div className="rounded-xl border border-night/10 bg-white px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-night/45">
                    И-мэйл
                  </p>
                  <a
                    href={`mailto:${SITE.email}`}
                    data-cursor-hover
                    className="mt-1.5 block text-sm font-bold text-night underline-offset-4 transition-opacity hover:underline hover:opacity-70"
                  >
                    {SITE.email}
                  </a>
                </div>
                <a
                  href="#contact"
                  data-cursor-hover
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-night px-6 py-3.5 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Уулзалт товлох <span aria-hidden>→</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

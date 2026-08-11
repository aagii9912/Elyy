"use client";

/* /mono — Байршил. Хоёр хэсэгтэй: (1) төслийн байршил + ойролцоох
   цэгүүд, (2) борлуулалтын оффис + холбоо барих мэдээлэл.
   Табаар сольж нэг л картан дээр харуулна.

   Төслийн таб дээр — жинхэнэ Google газрын зургийн оронд *зайн диаграм*
   (proximity map): төсөл нь төвд, ойролцоох цэг бүр өөрийн ЖИНХЭНЭ зайгаар
   (500м / 1км / 2км цагирагууд) дугаартай тэмдэглэгээгээр буух ба хажуугийн
   жагсаалттай дугаараараа тааран онцолно. Чиглэл нь схемчилсэн — зай нь бодит.
   TABS дахь coords-ыг солиход iframe болон чиглэл шууд шинэчлэгдэнэ. */

import { useRef, useState } from "react";
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

/* Зайн диаграмын геометр —————————————————————————————————————————
   viewBox нэгж 0..100. Төв = (50,50). Цэг бүрийн радиус нь зайнаас (√-scale
   ойрын цэгүүд төвд бөөгнөрөхгүй), өнцөг нь алтан өнцгөөр (137.5°) тархах тул
   давхцахгүй, тогтвортой. Чиглэл нь схемчилсэн — цагиргийн зай нь бодит. */
const GOLDEN = 137.508; // алтан өнцөг (°) — жигд, давхцахгүй тархалт
const R_MIN = 8; // хамгийн ойр цэгийн радиус (%)
const R_MAX = 43; // хамгийн хол цэгийн радиус (%)
const RINGS = [500, 1000, 2000, 3000]; // цагиргийн зай (м)

function layout(items: { m: number }[]) {
  const maxM = Math.max(...items.map((i) => i.m), 1);
  const rOf = (m: number) => R_MIN + (R_MAX - R_MIN) * Math.sqrt(m / maxM);
  const pts = items.map((it, i) => {
    const theta = ((-90 + i * GOLDEN) * Math.PI) / 180; // -90° = дээшээ
    const r = rOf(it.m);
    return {
      x: 50 + r * Math.cos(theta),
      y: 50 + r * Math.sin(theta),
    };
  });
  const rings = RINGS.filter((d) => d <= maxM).map((d) => ({ d, r: rOf(d) }));
  return { pts, rings, maxM };
}

export function MonoMap() {
  const [active, setActive] = useState<TabId>("project");
  const [group, setGroup] = useState(NEARBY[0].id);
  const [hover, setHover] = useState<number | null>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  const tab = TABS.find((t) => t.id === active)!;
  const nearby = NEARBY.find((g) => g.id === group)!;
  const { pts, rings } = layout(nearby.items);

  /* Курсорын байрлалаар 3D налуу — framer-motion-гүй, CSS transform-оор. */
  const onTilt = (e: React.MouseEvent) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
  };
  const resetTilt = () => {
    if (tiltRef.current) tiltRef.current.style.transform = "";
    setHover(null);
  };

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
          {active === "project" ? (
            /* ── Зайн диаграм: дугаартай цэгүүд төслийн эргэн тойронд ── */
            <div
              data-reveal="zoom"
              className="relative overflow-hidden rounded-2xl border border-night/10 bg-night"
              style={{ perspective: 1000 }}
              onMouseMove={onTilt}
              onMouseLeave={resetTilt}
            >
              {/* дэвсгэр торон текстур */}
              <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]">
                <defs>
                  <pattern id="mono-map-grid" width="26" height="26" patternUnits="userSpaceOnUse">
                    <path d="M 26 0 L 0 0 0 26" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mono-map-grid)" />
              </svg>

              <div
                ref={tiltRef}
                className="grid h-[360px] place-items-center p-5 transition-transform duration-300 ease-out will-change-transform md:h-[460px] lg:h-full lg:min-h-[460px]"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="relative aspect-square w-full max-w-[440px]">
                  {/* Цагиргууд + холбоос шугамууд */}
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
                    {rings.map((ring) => (
                      <g key={ring.d}>
                        <circle
                          cx="50"
                          cy="50"
                          r={ring.r}
                          fill="none"
                          stroke="white"
                          strokeOpacity={0.12}
                          strokeWidth={0.4}
                          strokeDasharray="1.5 2"
                        />
                        <text
                          x="50"
                          y={50 - ring.r - 1.2}
                          textAnchor="middle"
                          fill="white"
                          fillOpacity={0.4}
                          fontSize={3}
                          fontWeight={700}
                          className="tabular-nums"
                        >
                          {ring.d < 1000 ? `${ring.d}м` : `${ring.d / 1000}км`}
                        </text>
                      </g>
                    ))}
                    {/* Төвөөс цэг рүү холбоос шугам */}
                    {pts.map((p, i) => (
                      <line
                        key={i}
                        x1="50"
                        y1="50"
                        x2={p.x}
                        y2={p.y}
                        stroke={hover === i ? "#b4d656" : "white"}
                        strokeOpacity={hover === i ? 0.9 : 0.14}
                        strokeWidth={hover === i ? 0.6 : 0.35}
                        className="transition-all duration-200"
                      />
                    ))}
                  </svg>

                  {/* Төслийн тэмдэглэгээ (төв) */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-lime/25" />
                    <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-lime shadow-[0_0_0_4px_rgba(21,23,23,1)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-night" />
                    </span>
                    <span className="absolute left-1/2 top-[calc(50%+14px)] -translate-x-1/2 whitespace-nowrap text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
                      Elysium
                    </span>
                  </div>

                  {/* Дугаартай цэгүүд */}
                  {nearby.items.map((it, i) => {
                    const p = pts[i];
                    const on = hover === i;
                    return (
                      <button
                        key={it.place}
                        type="button"
                        data-cursor-hover
                        onMouseEnter={() => setHover(i)}
                        onFocus={() => setHover(i)}
                        onBlur={() => setHover(null)}
                        aria-label={`${it.place} — ${it.m}м`}
                        className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 outline-none"
                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold tabular-nums shadow-[0_0_0_3px_rgba(21,23,23,1)] transition-all duration-200 ${
                            on
                              ? "scale-125 bg-lime text-night"
                              : "bg-white text-night group-hover:bg-lime"
                          }`}
                        >
                          {i + 1}
                        </span>
                        {/* hover дээр нэр + зай */}
                        <span
                          className={`pointer-events-none absolute left-1/2 top-[calc(100%+4px)] z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[10px] font-bold text-night shadow-lg transition-all duration-200 ${
                            on ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          {it.place} · {it.m}м
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* доод тайлбар */}
              <div className="pointer-events-none absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                <span>Ойролцоох {nearby.label.toLowerCase()}</span>
                <span className="tabular-nums">{nearby.items.length} цэг · зай схемчилсэн</span>
              </div>
            </div>
          ) : (
            /* ── Оффис: жинхэнэ Google газрын зураг ── */
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
                className="h-[360px] w-full grayscale-[0.25] md:h-[460px] lg:h-full lg:min-h-[460px]"
              />
            </div>
          )}

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
                      onClick={() => {
                        setGroup(g.id);
                        setHover(null);
                      }}
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
                  {nearby.items.map((l, i) => {
                    const on = hover === i;
                    return (
                      <li
                        key={l.place}
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(null)}
                        data-cursor-hover
                        className={`flex cursor-default items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-colors ${
                          on ? "border-lime bg-lime/5" : "border-night/10 hover:border-night/30"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold tabular-nums transition-colors ${
                            on ? "bg-lime text-night" : "bg-night/5 text-night/45"
                          }`}
                        >
                          {i + 1}
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
                    );
                  })}
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

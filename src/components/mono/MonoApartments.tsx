"use client";

/* /mono — Өрөөний сонголт. Horizontal carousel of the real axonometric
   renders, trimmed to the plan and shown on the render's own studio plate
   (#dbe3ef). Клик → lightbox, өнцөг бүрийг гүйлгэж үзнэ.

   Хоёр нэмэлт:
     • B1 / B2 блокийн шүүлтүүр — тип бүр аль блокод байгаа нь картан
       дээр шошгоор ялгарч, дээрх табаар шүүгдэнэ (`unit.block`).
     • "Сонирхох" товч урьд нь зүгээр л #contact руу үсэрдэг, аль тип
       болохыг хэн ч мэдэхгүй байсан. Одоо тухайн типийн нэр, өрөө,
       талбайг агуулсан хүсэлтийн pop-up нээж /api/contact руу илгээнэ.

   Типүүд, зураг, текст бүгд админаас (`/admin/site` → Өрөөний сонголт)
   удирдагдана. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import type { SiteContent } from "@/lib/site-content";
import { unitPlanFor, type UnitPlan } from "@/lib/unit-plans";
import { MonoKicker, useDragScroll } from "./shared";
import { MonoModal } from "./MonoModal";
import { sectionTone } from "@/lib/theme-css";

type Unit = SiteContent["apartments"]["units"][number];

const ALL = "__all__";

export function MonoApartments({ site }: { site: SiteContent }) {
  const { apartments } = site;
  const drag = useDragScroll<HTMLDivElement>();
  const [open, setOpen] = useState<number | null>(null);
  const [block, setBlock] = useState<string>(ALL);
  const [inquiry, setInquiry] = useState<Unit | null>(null);
  const lenis = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  /** Контентод байгаа блокууд, гарсан дарааллаараа (ж: B1, B2). */
  const blocks = useMemo(() => {
    const seen: string[] = [];
    for (const u of apartments.units) {
      const b = u.block?.trim();
      if (b && !seen.includes(b)) seen.push(b);
    }
    return seen;
  }, [apartments.units]);

  /* Бүх тип нэг л блокод байвал шошго, шүүлтүүр аль аль нь утгагүй —
     тэр үед огт харуулахгүй. (`mergeSiteContent` нь хадгалсан хуучин
     өгөгдлийн дутуу `block`-ыг эхний өгөгдмөл типээс нөхдөг тул зөв
     хуваарилалт хийгдээгүй байхад бүгд нэг блок мэт харагдана.) */
  const showBlocks = blocks.length > 1;

  const units = useMemo(
    () => (block === ALL ? apartments.units : apartments.units.filter((u) => u.block?.trim() === block)),
    [apartments.units, block]
  );

  /** Lightbox нь ЗӨВХӨН харагдаж буй (шүүсэн) типүүдийн дундуур гүйнэ. */
  const slides = useMemo(
    () =>
      units.flatMap((unit, unitIndex) =>
        unit.views.map((view, viewIndex) => ({ unit, unitIndex, view, viewIndex }))
      ),
    [units]
  );

  const meta = (u: Unit) => (u.area ? `${u.rooms} · ${u.area}` : u.rooms);
  const alt = (u: Unit, i: number) => `${u.title} — аксонометр төлөвлөгөө, өнцөг ${i + 1}`;

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: number) =>
      setOpen((i) => (i === null ? i : (i + dir + slides.length) % slides.length)),
    [slides.length]
  );

  const openAt = (index: number) => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    setOpen(index);
  };

  const isOpen = open !== null;

  /* Блок солих — slides дахин тоологдох тул нээлттэй lightbox-ын
     индекс хүчингүй болно, хамт нь хаана. */
  const selectBlock = (next: string) => {
    setOpen(null);
    setBlock(next);
  };

  /* Lightbox нээлттэй үед хуудасны гүйлтийг зогсоож, фокусыг барина. */
  useEffect(() => {
    if (!isOpen) return;
    lenis?.stop();
    closeRef.current?.focus();
    return () => {
      lenis?.start();
      restoreRef.current?.focus?.();
    };
  }, [isOpen, lenis]);

  /* Esc — хаах, сум — өнцөг солих. */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, step]);

  const current = open === null ? null : slides[open];
  /* Тухайн өнцгийн зурагт харгалзах брошурын хуваалт (олдоогүй бол
     lightbox нь урьдын адил зөвхөн зургаа харуулна). */
  const plan = current ? unitPlanFor(current.view) : null;

  const tabClass = (on: boolean) =>
    /* min-h-11 — хүрэх талбайн 44px доод хязгаар. */
    `min-h-11 rounded-full px-5 py-2 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors duration-300 ${
      on ? "bg-night text-white" : "text-fg/55 hover:text-fg"
    }`;

  return (
    <section
      id="apartments"
      data-bg="apartments"
      data-tone={sectionTone(site.theme, "apartments", "light")}
      className="border-b border-fg/10 bg-ground py-24 md:py-28"
    >
      <div className="mx-auto max-w-[1500px] px-6 md:px-10">
        {/* тайлбар нь гарчгийн доор — баруун талын багана нь гарчгаас дээш
            гарч, хэсгийн навигацитай мөргөлддөг байв */}
        <div className="max-w-2xl">
          <MonoKicker reveal>{apartments.kicker}</MonoKicker>
          <h2 data-reveal="heading" className="mt-4 mono-h2">
            {apartments.title}
          </h2>
          <p data-reveal="up" data-reveal-delay="0.15" className="mt-5 mono-lead">{apartments.body}</p>
        </div>

        {/* B1 / B2 шүүлтүүр — нэгээс олон блок тохируулсан үед л гарна */}
        {showBlocks && (
          <div
            data-reveal="up"
            role="group"
            aria-label="Блокоор шүүх"
            className="mt-8 inline-flex flex-wrap rounded-full border border-fg/15 bg-surface p-1"
          >
            <button
              type="button"
              data-cursor-hover
              onClick={() => selectBlock(ALL)}
              aria-pressed={block === ALL}
              className={tabClass(block === ALL)}
            >
              {apartments.allLabel}
            </button>
            {blocks.map((b) => (
              <button
                key={b}
                type="button"
                data-cursor-hover
                onClick={() => selectBlock(b)}
                aria-pressed={block === b}
                className={tabClass(block === b)}
              >
                {b}
              </button>
            ))}
          </div>
        )}

        <div
          {...drag}
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-12"
        >
          {units.map((unit, unitIndex) => {
            const firstSlide = slides.findIndex((s) => s.unitIndex === unitIndex);
            return (
              <article
                key={`${unit.title}-${unitIndex}`}
                data-reveal="up"
                className="group flex w-[80vw] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-fg/10 bg-surface transition-colors duration-300 hover:border-fg/30 sm:w-[46vw] lg:w-[30vw] xl:w-[23vw]"
              >
                <button
                  type="button"
                  data-cursor-hover
                  onClick={() => firstSlide >= 0 && openAt(firstSlide)}
                  disabled={firstSlide < 0}
                  /* Плейт өнгө = рендерийн студийн дэвсгэр, ингэснээр
                     object-contain-ий хажуугийн зай нь салангид харагдахгүй. */
                  className="relative block w-full cursor-zoom-in overflow-hidden bg-[#dbe3ef] disabled:cursor-default"
                  aria-label={`${unit.title} — аксонометр зургийг томруулж үзэх`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={unit.thumb || unit.views[0]}
                    alt={alt(unit, 0)}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-night px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                      {unit.title}
                    </span>
                    {showBlocks && unit.block?.trim() && (
                      <span className="rounded-full bg-moss px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                        {unit.block}
                      </span>
                    )}
                  </span>
                  {unit.views.length > 0 && (
                    <span className="glass glass-chip absolute bottom-4 right-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-fg">
                      {unit.views.length} {apartments.viewsWord}
                    </span>
                  )}
                </button>
                <div className="mt-auto flex items-end justify-between gap-3 border-t border-fg/10 p-6">
                  <div>
                    <h3 className="text-2xl font-extrabold tracking-tight text-fg">{unit.rooms}</h3>
                    <p className="mt-1 text-sm font-semibold text-fg/55">{unit.area}</p>
                  </div>
                  <button
                    type="button"
                    data-cursor-hover
                    onClick={() => setInquiry(unit)}
                    aria-haspopup="dialog"
                    aria-label={`${unit.title} — ${apartments.cardCta}`}
                    className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-fg/25 px-5 text-[11px] font-bold uppercase tracking-[0.08em] text-fg transition-colors duration-300 hover:border-fg hover:bg-night hover:text-white"
                  >
                    {apartments.cardCta}
                  </button>
                </div>
              </article>
            );
          })}

          {/* closing card — pushes to contact */}
          <a
            href="#contact"
            data-cursor-hover
            data-reveal="zoom"
            className="flex w-[80vw] shrink-0 snap-start flex-col items-start justify-between gap-8 rounded-2xl bg-night p-6 text-white sm:w-[46vw] lg:w-[30vw] xl:w-[23vw]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">{apartments.ctaCard.kicker}</p>
            <div>
              <p className="text-2xl font-extrabold leading-tight tracking-tight">
                {apartments.ctaCard.title}
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold">
                {apartments.ctaCard.link} <span aria-hidden>→</span>
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* key — өөр тип сонгоход маягт цоо шинээр эхэлнэ */}
      <UnitInquiry
        key={inquiry ? `${inquiry.title}-${inquiry.area}` : "none"}
        site={site}
        unit={inquiry}
        withBlock={showBlocks}
        onClose={() => setInquiry(null)}
      />

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${current.unit.title} — аксонометр төлөвлөгөө`}
          className="fixed inset-0 z-[80] flex flex-col bg-surface"
          onClick={close}
        >
          <div className="flex items-start justify-between gap-4 px-5 py-5 md:px-10" onClick={(e) => e.stopPropagation()}>
            <div>
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-fg/50">
                <span aria-hidden className="h-px w-8 bg-moss" />
                {current.unit.title}
                {showBlocks && current.unit.block?.trim() && (
                  <span className="text-moss">· {current.unit.block}</span>
                )}
              </p>
              <p className="mt-2 text-lg font-extrabold tracking-tight text-fg">{meta(current.unit)}</p>
            </div>
            <button
              ref={closeRef}
              type="button"
              data-cursor-hover
              onClick={close}
              aria-label="Хаах"
              className="min-h-11 rounded-full border border-fg/25 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-fg transition-colors duration-300 hover:bg-night hover:text-white"
            >
              Хаах ✕
            </button>
          </div>

          {/* Зураг + төлөвлөгөөний тайлбар. lg-ээс доош багана болж,
              бүхэлдээ гүйнэ; lg дээр зөвхөн баруун талын самбар гүйнэ. */}
          <div
            className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pb-2 md:px-10 lg:flex-row lg:gap-10 lg:overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Самбартай үед зураг гар утсанд 46vh-д багтаж, доогуур нь
                тайлбар гүйнэ. Самбаргүй (танихгүй зураг) үед хуучин
                байдлаараа бүтэн зайг эзэлж төвлөрнө. */}
            <div
              className={`flex min-h-0 items-center justify-center ${
                plan ? "shrink-0 lg:flex-1 lg:shrink" : "flex-1"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={current.view}
                src={current.view}
                alt={alt(current.unit, current.viewIndex)}
                decoding="async"
                className={`max-w-full rounded-2xl object-contain lg:max-h-full ${
                  plan ? "max-h-[46vh]" : "max-h-full"
                }`}
              />
            </div>

            {plan && <UnitPlanPanel plan={plan} />}
          </div>

          <div className="flex items-center justify-between gap-4 px-5 py-5 md:px-10" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              data-cursor-hover
              onClick={() => step(-1)}
              aria-label="Өмнөх зураг"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-fg/25 text-sm font-bold text-fg transition-colors duration-300 hover:bg-night hover:text-white"
            >
              ←
            </button>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fg/50">
              {apartments.viewsWord} {current.viewIndex + 1}/{current.unit.views.length} · {(open ?? 0) + 1}/{slides.length}
            </p>
            <button
              type="button"
              data-cursor-hover
              onClick={() => step(1)}
              aria-label="Дараах зураг"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-fg/25 text-sm font-bold text-fg transition-colors duration-300 hover:bg-night hover:text-white"
            >
              →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Тухайн типийн хүсэлт — нэр, утас + сонгосон тип автоматаар явна.     */
/* ------------------------------------------------------------------ */

function UnitInquiry({
  site,
  unit,
  withBlock,
  onClose,
}: {
  site: SiteContent;
  unit: Unit | null;
  /** Блокийн хуваарилалт утга учиртай эсэх — үгүй бол хүсэлтэд оруулахгүй. */
  withBlock: boolean;
  onClose: () => void;
}) {
  const q = site.apartments.inquiry;
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  if (!unit) return null;

  const label = [unit.title, withBlock ? unit.block?.trim() : "", unit.rooms, unit.area]
    .filter(Boolean)
    .join(" · ");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const note = String(data.get("note") ?? "").trim();
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          message: `Сонирхсон тип: ${label}${note ? ` — ${note}` : ""}`,
          source: "elysium/mono#apartments",
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
    <MonoModal open onClose={onClose} label={`${unit.title} — ${q.title}`}>
      <div className="p-6 sm:p-9">
        {sent ? (
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-fg/50">
              <span aria-hidden className="h-px w-8 bg-moss" />
              {label}
            </p>
            <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-fg">{q.successTitle}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-fg/65">{q.successBody}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div>
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-fg/50">
                <span aria-hidden className="h-px w-8 bg-moss" />
                {q.title}
              </p>
              <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-fg">{label}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-fg/65">{q.sub}</p>
            </div>

            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-fg/45">{q.name}</span>
              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                className="w-full border-b border-fg/20 bg-transparent pb-3 pt-2 text-lg font-semibold text-fg focus:border-fg focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-fg/45">{q.phone}</span>
              <input
                type="tel"
                name="phone"
                required
                inputMode="tel"
                autoComplete="tel"
                className="w-full border-b border-fg/20 bg-transparent pb-3 pt-2 text-lg font-semibold text-fg focus:border-fg focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-fg/45">{q.note}</span>
              <textarea
                name="note"
                rows={2}
                className="w-full resize-none border-b border-fg/20 bg-transparent pb-3 text-base font-medium text-fg focus:border-fg focus:outline-none"
              />
            </label>

            {error && (
              <p role="alert" className="text-sm font-semibold text-red-600">
                {q.error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              data-cursor-hover
              className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-night px-7 py-3.5 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy ? q.sending : q.submit}
              <span aria-hidden>→</span>
            </button>
          </form>
        )}
      </div>
    </MonoModal>
  );
}

/* ------------------------------------------------------------------ */
/* Lightbox доторх төлөвлөгөөний тайлбар — танилцуулгын өгөгдөл.        */
/* ------------------------------------------------------------------ */

function UnitPlanPanel({ plan }: { plan: UnitPlan }) {
  const facts: [string, string][] = [
    ["Хуваалт", plan.code],
    ["Давхар", plan.floors],
    ["Өрөөний тоо", plan.rooms],
    ["Цонхны чиг", plan.facing],
  ];

  return (
    <aside className="w-full shrink-0 border-t border-fg/10 pt-6 lg:w-[340px] lg:overflow-y-auto lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
      <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-fg/50">
        <span aria-hidden className="h-px w-8 bg-moss" />
        Төлөвлөгөөний тайлбар
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4 lg:grid-cols-2">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-fg/40">{label}</dt>
            <dd className="mt-1 text-sm font-extrabold tracking-tight text-fg">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 text-[13px] leading-relaxed text-fg/60">{plan.spot}</p>

      <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-fg/40">Өрөөний задаргаа</p>
      <ul className="mt-3 border-t border-fg/10">
        {plan.list.map((r) => (
          <li key={r.no} className="flex items-baseline justify-between gap-4 border-b border-fg/10 py-2.5">
            <span className="text-[13px] leading-snug text-fg/70">
              <span aria-hidden className="mr-2 tabular-nums text-fg/35">
                {r.no}.
              </span>
              {r.name}
            </span>
            <span className="shrink-0 text-[13px] font-bold tabular-nums text-fg">{r.area} м²</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 pb-2 text-[11px] leading-relaxed text-fg/40">
        Хэмжээ нь зураг төслийн утга — Elysium танилцуулга. Ашиглалтад орох үед бага зэрэг зөрөх боломжтой.
      </p>
    </aside>
  );
}

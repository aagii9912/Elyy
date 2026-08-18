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
import { MonoKicker, useDragScroll } from "./shared";
import { MonoModal } from "./MonoModal";

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

  const tabClass = (on: boolean) =>
    /* min-h-11 — хүрэх талбайн 44px доод хязгаар (M8). */
    `min-h-11 rounded-full px-5 py-2 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors duration-300 ${
      on ? "bg-night text-white" : "text-night/55 hover:text-night"
    }`;

  return (
    <section id="apartments" className="border-b border-night/10 bg-ground py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <MonoKicker reveal>{apartments.kicker}</MonoKicker>
            <h2 data-reveal="heading" className="mt-4 max-w-xl text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-night">
              {apartments.title}
            </h2>
          </div>
          <p data-reveal="up" data-reveal-delay="0.15" className="max-w-sm text-sm leading-relaxed text-night/60">{apartments.body}</p>
        </div>

        {/* B1 / B2 шүүлтүүр — нэгээс олон блок тохируулсан үед л гарна */}
        {showBlocks && (
          <div
            data-reveal="up"
            role="group"
            aria-label="Блокоор шүүх"
            className="mt-8 inline-flex flex-wrap rounded-full border border-night/15 bg-surface p-1"
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
                className="group flex w-[80vw] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-night/10 bg-surface transition-colors duration-300 hover:border-night/30 sm:w-[46vw] lg:w-[30vw] xl:w-[23vw]"
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
                    {/* Блокийн шошго — өмнө нь дүүрэн `bg-moss` бөмбөлөг
                        байсан. design-system §2-оор ногоон нь зөвхөн kicker
                        зураас, курсор, зураг/тоног төхөөрөмжийн пин, timeline
                        node дээр л гарна — дүүрэн шошго тэдний нэг ч биш, ба
                        карт бүр дээр давхарлаад ногоон квот хэтэрдэг. Шошго
                        хэвээр байна (B1/B2-ыг худалдан авагч уншина), зурагдах
                        нь л өөрчлөгдөв: доор баруун талын "N өнцөг" шошготой
                        нэг үг — цагаан гадаргуу + үсэн хил. */}
                    {showBlocks && unit.block?.trim() && (
                      <span className="rounded-full border border-night/15 bg-surface/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-night backdrop-blur">
                        {unit.block}
                      </span>
                    )}
                  </span>
                  {unit.views.length > 0 && (
                    <span className="absolute bottom-4 right-4 rounded-full border border-night/15 bg-surface/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-night backdrop-blur">
                      {unit.views.length} {apartments.viewsWord}
                    </span>
                  )}
                </button>
                <div className="mt-auto flex items-end justify-between gap-3 border-t border-night/10 p-6">
                  <div>
                    <h3 className="text-2xl font-extrabold tracking-tight text-night">{unit.rooms}</h3>
                    <p className="mt-1 text-sm font-semibold text-night/55">{unit.area}</p>
                  </div>
                  <button
                    type="button"
                    data-cursor-hover
                    onClick={() => setInquiry(unit)}
                    aria-haspopup="dialog"
                    aria-label={`${unit.title} — ${apartments.cardCta}`}
                    className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-night/25 px-5 text-[11px] font-bold uppercase tracking-[0.08em] text-night transition-colors duration-300 hover:border-night hover:bg-night hover:text-white"
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
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-night/50">
                <span aria-hidden className="h-px w-8 bg-moss" />
                {current.unit.title}
                {/* Блокийг ногоонгоор биш, бараанаар — §2-ын ногоон квот
                    зөвхөн kicker зураас/курсор/пин/node дээр. */}
                {showBlocks && current.unit.block?.trim() && (
                  <span className="text-night">· {current.unit.block}</span>
                )}
              </p>
              <p className="mt-2 text-lg font-extrabold tracking-tight text-night">{meta(current.unit)}</p>
            </div>
            <button
              ref={closeRef}
              type="button"
              data-cursor-hover
              onClick={close}
              aria-label="Хаах"
              className="min-h-11 rounded-full border border-night/25 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-night transition-colors duration-300 hover:bg-night hover:text-white"
            >
              Хаах ✕
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center px-5 pb-2 md:px-10" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.view}
              src={current.view}
              alt={alt(current.unit, current.viewIndex)}
              decoding="async"
              className="max-h-full max-w-full rounded-2xl object-contain"
            />
          </div>

          <div className="flex items-center justify-between gap-4 px-5 py-5 md:px-10" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              data-cursor-hover
              onClick={() => step(-1)}
              aria-label="Өмнөх зураг"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-night/25 text-sm font-bold text-night transition-colors duration-300 hover:bg-night hover:text-white"
            >
              ←
            </button>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-night/50">
              {apartments.viewsWord} {current.viewIndex + 1}/{current.unit.views.length} · {(open ?? 0) + 1}/{slides.length}
            </p>
            <button
              type="button"
              data-cursor-hover
              onClick={() => step(1)}
              aria-label="Дараах зураг"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-night/25 text-sm font-bold text-night transition-colors duration-300 hover:bg-night hover:text-white"
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
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-night/50">
              <span aria-hidden className="h-px w-8 bg-moss" />
              {label}
            </p>
            <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-night">{q.successTitle}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-night/65">{q.successBody}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div>
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-night/50">
                <span aria-hidden className="h-px w-8 bg-moss" />
                {q.title}
              </p>
              <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-night">{label}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-night/65">{q.sub}</p>
            </div>

            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-night/45">{q.name}</span>
              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                className="w-full border-b border-night/20 bg-transparent pb-3 pt-2 text-lg font-semibold text-night focus:border-night focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-night/45">{q.phone}</span>
              <input
                type="tel"
                name="phone"
                required
                inputMode="tel"
                autoComplete="tel"
                className="w-full border-b border-night/20 bg-transparent pb-3 pt-2 text-lg font-semibold text-night focus:border-night focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-night/45">{q.note}</span>
              <textarea
                name="note"
                rows={2}
                className="w-full resize-none border-b border-night/20 bg-transparent pb-3 text-base font-medium text-night focus:border-night focus:outline-none"
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

"use client";

/* / — the scroll chapter: a pinned section whose frame sequence scrubs with
   the scroll while the chapter's points crossfade one after another.

   It used to be a full-bleed dark plate — footage behind a night scrim,
   white type on top. Measured, that chapter was the worst thing on the
   page: 0.13 mean luminance, 0.0002 bare-ground share, and a masterplan
   render whose tonal range collapsed to 0.048 — present and invisible.

   It is now a light chapter on the page ground (design-system §1): the
   footage sits in a raised window, sized so the ground still owns most of
   the frame, and the chapter's type is ink beside it rather than white on
   top of it. The two veils that used to bridge dark→dark and dark→light
   are gone; there is nothing to bridge.

   The bottom rail is clickable — picking an entry jumps the scroll to that
   point. Frames start loading only when the section nears the viewport. */

import { Fragment, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap, type ScrollTrigger as ScrollTriggerType } from "@/lib/gsap";
import { MonoKicker } from "./shared";

export type StoryPoint = {
  n: string;
  heading: string;
  accent?: string; // rendered right after the heading in lighter ink (e.g. "%")
  text: string;
};

const framePathIn = (dir: string, ext: string) => (i: number) =>
  `${dir}/frame_${String(i).padStart(3, "0")}.${ext}`;

/* The chapter intro title scrubs away over the first INTRO_OUT screens and
   the chapter exit takes the last EXIT_IN screens. Point layers live strictly
   between the two: they never overlap the intro title, and the window they
   share is split into equal slices so every point runs for the same distance. */
const INTRO_OUT = 0.55;
const EXIT_IN = 0.22;

/* The intro → (header + points) handoff, in screens of scroll.

   These three used to butt-joint: the intro faded to 0 over exactly INTRO_OUT
   and the header and the point layers both started at INTRO_OUT. On the scroll
   frame in between, every mark in the type column was at or near zero — at
   390×844, scrollY 1294 measured a 272px blank run (intro 0.03, header 0,
   points 0), and 360×640 the same 270px. All three marks share one place by
   design, so the handoff is now an overlapping dissolve: the header and the
   first point are already coming up while the intro title is still going. */
const INTRO_FADE = 0.44;   // the big intro headline is gone by here
const LAYERS_IN = 0.4;     // …point 01 is already coming up under it
const LAYERS_SPAN = 0.18;
const HEAD_IN = 0.44;      // …and the small persistent headline takes over
const HEAD_SPAN = 0.22;

export function MonoScrollStory({
  id,
  chapter,
  kicker,
  title,
  points,
  frameStart,
  frameEnd,
  frameDir = "/hero-frames",
  frameExt = "jpg",
  stillAt = 0.6,
  heightClass = "h-[300vh] md:h-[380vh]",
}: {
  id?: string;
  /** Chapter index label, e.g. "01". */
  chapter: string;
  kicker: string;
  title: string;
  points: StoryPoint[];
  frameStart: number;
  frameEnd: number;
  /** Public folder holding the `frame_NNN` sequence. */
  frameDir?: string;
  frameExt?: string;
  /** Where in the sequence the mobile / reduced-motion still is taken from (0–1). */
  stillAt?: number;
  /** Section height — controls how much scroll each point gets. */
  heightClass?: string;
}) {
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const layersWrap = useRef<HTMLDivElement>(null);
  const progFill = useRef<HTMLDivElement>(null);
  const st = useRef<ScrollTriggerType | null>(null);
  const prevActive = useRef(0);
  /** Гар утасны зам: цэг бүрд өөр зураг. Desktop дээр `null` (scrub эзэмшинэ). */
  const swapStill = useRef<((i: number) => void) | null>(null);
  /** Progress window the points share, minus the intro / exit run-outs. */
  const slot = useRef({ lead: 0, span: 1 });
  const [active, setActive] = useState(0);

  /** Jump the scroll so point `i` is centred in its own equal slice. */
  const goTo = (i: number) => {
    const t = st.current;
    if (!t) return;
    const { lead, span } = slot.current;
    const p = lead + ((i + 0.5) / points.length) * span;
    const target = t.start + p * (t.end - t.start);
    if (lenis) lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  /* ---- canvas scrub + chapter intro/header choreography ------------- */
  useEffect(() => {
    const cvs = canvas.current;
    const sec = root.current;
    if (!cvs || !sec) return;
    const ctx2d = cvs.getContext("2d");
    if (!ctx2d) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const framePath = framePathIn(frameDir, frameExt);
    const count = frameEnd - frameStart + 1;

    /* Гар утас / reduced-motion дээр frame-scrub байхгүй — зөвхөн ЗУРАГ
       (design-system §7). Гэвч ЦОРЫН ГАНЦ зураг байх нь бүлгийн дөрвөн
       тоог нэг л хөдөлгөөнгүй кадр дээр уншуулж байв: "506 / 513 / 2027·II"
       гурвуулаа ижил төлөвлөгөөн дээр. Дараалал нь дөрвөн клипээс, цэг тус
       бүрд нэг, дөрөвний нэгийн хил дээр crossfade-тайгаар барьсан тул цэг
       бүрийн ДУНД цэгээс нэг зураг авбал тоо тус бүр өөрийг нь батлах
       кадрын дээр гарна. Reduced-motion дээр яг нэг зураг хэвээр. */
    const stillMode = reduce || isMobile;
    const stillFrames = reduce
      ? [Math.floor(count * stillAt)]
      : points.map((_, i) => Math.floor(count * ((i + 0.5) / points.length)));
    const framesToLoad = stillMode ? stillFrames.length : count;
    const images: HTMLImageElement[] = [];
    /** `f` = одоогийн кадр, `from` = гарч байгаа кадр. Скроллын tween-ий бай. */
    const state = { f: 0, from: 0, scrub: 0 };
    /* Дискийн зэрэг ӨӨР объект дээр байх ёстой: `state` нь скроллын tween-ий
       бай учраас түүн дээр `overwrite`-тай tween тавибал скролл tween нь
       (progFill ба цэгийн индекс) устана. */
    const dis = { mix: 1 };
    let loading = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = Math.round(cvs.clientWidth * dpr);
      cvs.height = Math.round(cvs.clientHeight * dpr);
    };
    const at = (i: number) => images[Math.min(images.length - 1, Math.max(0, Math.round(i)))];
    const cover = (img: HTMLImageElement, alpha: number) => {
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = cvs.width;
      const ch = cvs.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx2d.globalAlpha = alpha;
      ctx2d.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      ctx2d.globalAlpha = 1;
    };
    const draw = () => {
      const cur = at(state.f);
      if (!cur || !cur.complete || !cur.naturalWidth) return;
      ctx2d.clearRect(0, 0, cvs.width, cvs.height);
      if (dis.mix < 1) cover(at(state.from), 1);
      cover(cur, dis.mix);
    };
    const load = () => {
      if (loading) return;
      loading = true;
      for (let i = 0; i < framesToLoad; i++) {
        const im = new Image();
        im.src = framePath(frameStart + (stillMode ? stillFrames[i] : i));
        if (i === 0) im.onload = () => { resize(); draw(); };
        images.push(im);
      }
    };

    /* Цэг сольсон үед зургийг цайруулж дүрсэлнэ (гар утасны зам). Layer-ийн
       crossfade 0.5s тул зураг ч 0.5s — тоо, зураг хамт солигдоно. */
    swapStill.current = stillMode && stillFrames.length > 1
      ? (i: number) => {
          const next = Math.min(stillFrames.length - 1, Math.max(0, i));
          if (next === Math.round(state.f)) return;
          state.from = state.f;
          state.f = next;
          dis.mix = 0;
          gsap.to(dis, { mix: 1, duration: 0.5, ease: "power2.out", overwrite: true, onUpdate: draw });
        }
      : null;

    // defer frame downloads until the section is near the viewport
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          load();
          io.disconnect();
        }
      },
      { rootMargin: "120% 0px" }
    );
    io.observe(sec);

    resize();
    const onResize = () => { resize(); draw(); };
    window.addEventListener("resize", onResize);

    /* The slice each point owns, expressed in pin progress. Recomputed on
       every update so a resize (or a refresh) can't desync it from goTo. */
    const pointSlot = () => {
      const travel = Math.max(1, sec.offsetHeight - window.innerHeight);
      const lead = Math.min(0.35, (window.innerHeight * INTRO_OUT) / travel);
      const tail = Math.min(0.25, (window.innerHeight * EXIT_IN) / travel);
      return { lead, span: Math.max(0.1, 1 - lead - tail) };
    };
    slot.current = pointSlot(); // rail clicks work before the first scroll

    const ctx = gsap.context(() => {
      const tween = gsap.to(state, {
        // гар утсан дээр кадр нь ахицаас биш, цэгээс хамаарна (swapStill)
        ...(stillMode ? { scrub: 1 } : { f: count - 1 }),
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.9,
          onUpdate: (self) => {
            if (progFill.current) gsap.set(progFill.current, { scaleX: self.progress });
            const { lead, span } = pointSlot();
            slot.current = { lead, span };
            const t = (self.progress - lead) / span;
            const idx = Math.min(points.length - 1, Math.max(0, Math.floor(t * points.length)));
            setActive((prev) => (prev === idx ? prev : idx));
          },
        },
        onUpdate: stillMode ? undefined : draw,
      });
      st.current = tween.scrollTrigger ?? null;

      // chapter intro: the title owns the type column, then hands off to the
      // persistent header and lets the points take the column.
      const introEl = sec.querySelector("[data-intro]");
      const headEl = sec.querySelector("[data-head]");
      const layersEl = sec.querySelector("[data-layers]");
      const railEl = sec.querySelector("[data-rail]");
      if (reduce) {
        if (introEl) gsap.set(introEl, { autoAlpha: 0 });
      } else {
        if (introEl) {
          gsap.fromTo(
            introEl,
            { autoAlpha: 1, yPercent: 0, scale: 1 },
            {
              autoAlpha: 0,
              /* Дээш өргөх нь -16% байсан: 111px-ийн гарчгийг ~18px дээш
                 зөөж, доор нь цонх хүртэл 104px хоосон суурь онгойлгодог
                 байв (M11-ийн хамгийн урт зурвас интро дамжуулалтын үед).
                 -8% дээр гарчиг мөн л ухарч байгаа мэт уншигдана, харин
                 доод зай нь торны 20px зайнаас хэтрэхгүй. */
              yPercent: -5,
              scale: 0.97,
              ease: "none",
              scrollTrigger: {
                trigger: sec,
                start: "top top",
                end: () => "+=" + window.innerHeight * INTRO_FADE,
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }
        if (headEl) {
          gsap.fromTo(
            headEl,
            /* Хөдөлгөөнгүй, зөвхөн бүдгэрэлт: гарчиг нь интрогийн гарчигтай
               ЯГ ижил байрлалд сууж байгаа тул 8-16px зөрөх нь зөвхөн үсгийг
               "хоёр давхар" харагдуулна. Дээрх kicker нь тогтмол хэвээр. */
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              ease: "none",
              scrollTrigger: {
                trigger: sec,
                start: () => "top+=" + window.innerHeight * HEAD_IN + " top",
                end: () => "+=" + window.innerHeight * HEAD_SPAN,
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }
        const enterEls = [layersEl, railEl].filter(Boolean) as Element[];
        if (enterEls.length) {
          gsap.fromTo(
            enterEls,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              ease: "none",
              scrollTrigger: {
                trigger: sec,
                start: () => "top+=" + window.innerHeight * LAYERS_IN + " top",
                end: () => "+=" + window.innerHeight * LAYERS_SPAN,
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        /* Бүлгийн гарц — ХӨНДӨГДӨХГҮЙ, зориудаар.
           Урьд нь `layers` / `rail` / `head` нь `bottom 122%`→`106%` дээр
           бүдгэрч, төлөвлөгөөний цонх ЗУУРАЛТААС САЛААГҮЙ байхад л текст
           алга болдог байв. 390×844 дээр scrollY 2312-аас хойш kicker,
           гарчиг, тоо, тайлбар, 01-04 цэгүүд бүгд байхгүй, зураг л дэлгэц
           дээр — хүрээний дээд талд 272px-ийн хоосон зурвас (хуудсаар
           хамгийн урт). Одоо гарц гэж байхгүй: `sticky` салах мөчид
           текстийн багана ба цонх ХАМТ дээшээ гулсаж явна, тэгээд дараагийн
           хэсэг доороос ирнэ. Хоосон зурвас нь торны дотоод зайнаас (28px /
           24px) хэтрэхгүй. */
      }
    }, sec);

    return () => {
      io.disconnect();
      window.removeEventListener("resize", onResize);
      st.current = null;
      swapStill.current = null;
      ctx.revert();
    };
  }, [frameStart, frameEnd, frameDir, frameExt, stillAt, points.length]);

  /* ---- point crossfade engine (no remounts) ------------------------- */
  useEffect(() => {
    const cont = layersWrap.current;
    if (!cont) return;
    const layers = Array.from(cont.querySelectorAll<HTMLElement>("[data-layer]"));
    if (!layers.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prev = prevActive.current;
    prevActive.current = active;

    // гар утсан дээр цэгийн зураг нь тоотой ХАМТ солигдоно
    swapStill.current?.(active);

    layers.forEach((l, i) => {
      if (i !== active && i !== prev) gsap.set(l, { autoAlpha: 0 });
    });
    const incoming = layers[active];
    const outgoing = prev !== active ? layers[prev] : null;

    if (reduce) {
      if (outgoing) gsap.set(outgoing, { autoAlpha: 0 });
      gsap.set(incoming, { autoAlpha: 1, y: 0 });
      return;
    }

    if (outgoing) {
      gsap.to(outgoing, { autoAlpha: 0, y: -14, duration: 0.45, ease: "power2.inOut", overwrite: true });
    }
    gsap.set(incoming, { y: 0 });
    gsap.to(incoming, { autoAlpha: 1, duration: 0.5, ease: "power2.out", overwrite: true });

    // staggered children
    const kids = incoming.querySelectorAll("[data-sw]");
    if (kids.length) {
      gsap.fromTo(
        kids,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.06, delay: 0.08, overwrite: true }
      );
    }
    // char roll
    const chars = incoming.querySelectorAll("[data-ch]");
    if (chars.length) {
      gsap.fromTo(
        chars,
        { yPercent: 112 },
        { yPercent: 0, duration: 0.65, ease: "power4.out", stagger: 0.05, overwrite: true }
      );
    }
  }, [active]);

  return (
    <section id={id} ref={root} className={`relative border-b border-night/10 bg-ground ${heightClass}`}>
      {/* pb-20 гар утсанд: агуулга дэлгэцийн бүтэн өндрийг эзэлдэг болсон
          тул доод захын цэгүүдийн зурвас чатын хөвөгч товчтой (bottom-5 +
          52px) давхцаж байв. 80px нь түүнийг цэвэр гаргана. */}
      <div className="sticky top-0 flex h-[100svh] min-h-[560px] w-full items-center overflow-hidden pb-20 pt-[calc(var(--header-h)+1vh)] md:pb-[5vh] md:pt-[calc(var(--header-h)+3vh)]">
        {/* The window is sized off the viewport rather than off its own width:
            at 1440×900 an aspect-ratio window left ~180px of bare ground under
            the chapter and ~230px over it — more empty ground than any section
            on the page. Both columns are now the same height as the window, so
            the intro title starts level with its top edge and the point layers
            finish level with its bottom. */}
        {/* Гар утсан дээр багана босоогоор ТӨВЛӨРДӨГ байсан: 390×844 дээр
            kicker-ийн дээр 197px хоосон суурь үлдэж, ижил хэмжээний зай доор
            ч байв (M11-ийн хамгийн урт хоосон зурвас бүх хуудсаар).
            Одоо тор нь бэхлэгдсэн дэлгэцийг БҮТЭН эзэлж, илүү өндрийг
            төлөвлөгөөний цонх авна — хоосон зай биш. `md:` дээр бүх зүйл
            өмнөх шигээ. */}
        <div className="mx-auto grid h-full w-full max-w-[1500px] grid-rows-[auto_minmax(0,1fr)] items-stretch gap-5 px-5 md:h-auto md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:grid-rows-none md:gap-[4vw] md:px-10">
          {/* type column — intro title, then the persistent header + points */}
          <div className="relative min-h-[184px] md:min-h-[min(58vh,570px)]">
            {/* ONE kicker for the whole chapter, and it never fades.
                The intro block and the persistent header each used to carry
                their own copy of it. They sit at the same place by design, so
                during the handoff the reader saw two kickers a few px apart
                and two headlines of different sizes ghosting through each
                other. Now the mark is rendered once and only the HEADLINE
                changes size — and because the kicker is always ink, the top of
                the type column is never bare, which is what let the headline
                swap stop overlapping at all (M11: the column no longer has a
                scroll frame with nothing in it). */}
            <div className="absolute inset-x-0 top-0">
              <MonoKicker>
                {chapter} — {kicker}
              </MonoKicker>

              {/* both headlines share one slot: same top, same left edge, one
                  visible at a time */}
              <div className="relative mt-4">
                {/* Гар утсан дээрх доод хэмжээ 2rem → 2.5rem. 2rem дээр
                    бүлгийн гарчиг 390px-д ЯГ нэг мөрд шахагдаж, доор нь
                    120px хоосон суурь үлдээдэг байв; 2.5rem дээр [text-wrap:
                    balance]-тай хоёр мөр болж, гарчгийн карт шиг уншигдана.
                    5.4vw ба 4.2rem-ийн хязгаар хөндөгдөөгүй — ≥741px дээр
                    хэмжээ өмнөхтэй яг адил. */}
                <h2
                  data-intro
                  className="max-w-xl text-[clamp(2.5rem,5.4vw,4.2rem)] font-extrabold leading-[1.04] tracking-tight text-night [text-wrap:balance]"
                >
                  {title}
                </h2>
                <h2
                  data-head
                  className="absolute inset-x-0 top-0 text-[clamp(1.3rem,2.2vw,1.9rem)] font-extrabold leading-tight tracking-tight text-night"
                >
                  {title}
                </h2>
              </div>
            </div>

            <div ref={layersWrap} data-layers className="pointer-events-none absolute inset-x-0 bottom-0">
              {points.map((p, i) => (
                <div
                  key={p.n}
                  data-layer
                  className={`absolute inset-x-0 bottom-0 ${i === 0 ? "" : "opacity-0"}`}
                >
                  <h3
                    className={`flex items-end font-extrabold leading-none tracking-tight text-night ${
                      p.heading.length > 4
                        ? "text-[clamp(2.6rem,7.4vw,5.6rem)]"
                        : "text-[clamp(4rem,11vw,8.5rem)]"
                    }`}
                  >
                    {p.heading.split("").map((c, ci) => (
                      <span key={ci} className="inline-block overflow-hidden">
                        <span data-ch className="inline-block">
                          {c === " " ? " " : c}
                        </span>
                      </span>
                    ))}
                    {p.accent && (
                      <span data-sw className="mb-[0.06em] text-[0.34em] font-bold text-night/35">
                        {p.accent}
                      </span>
                    )}
                  </h3>
                  <p
                    data-sw
                    className="mt-5 max-w-sm text-[13px] font-semibold uppercase leading-relaxed tracking-[0.22em] text-night/55"
                  >
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* the window: the footage, finally legible, on a raised surface.
              Гар утсан дээр өндрөө торны сүүлийн эгнээнээс авна (flex-1) —
              ингэснээр хоосон зай гарахгүй, төлөвлөгөө нь том харагдана.
              `md:` дээр өмнөх шигээ 58vh-ийн тогтмол цонх. */}
          <div className="flex min-h-0 flex-col">
            <figure className="relative m-0 min-h-0 w-full flex-1 overflow-hidden rounded-2xl border border-night/10 bg-surface shadow-[0_40px_120px_-40px_rgba(21,23,23,0.7)] md:h-[min(58vh,570px)] md:flex-none">
              <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
            </figure>

            {/* progress rule + clickable point rail */}
            <div className="mt-6 flex items-center gap-6">
              <div className="h-px flex-1 bg-night/15">
                <div ref={progFill} className="h-px w-full origin-left scale-x-0 bg-moss" />
              </div>
              {/* Цэгүүдийн зурвас — тоо нь 11px хэвээр, харин ХҮРЭХ хайрцаг
                  хуруугаар оролддог өргөнд 44×44 (M8-ын платформын доод
                  хязгаар). Урьд нь 13×17px байсан: rail нь хэмжигдэх агшинд
                  бүдэг байдаг тул анхны шалгалтад тороогүй. `lg:`-ээс дээш
                  (хулгана) хайрцаг өмнөх хэмжээндээ буцаж, ахиц хэмжигчийн
                  урт desktop дээр өмнөхтэй яг адил хэвээр байна. */}
              <div data-rail className="flex items-center gap-0.5 lg:gap-3">
                {points.map((p, i) => (
                  <Fragment key={p.n}>
                    {i > 0 && (
                      <span
                        aria-hidden
                        className={`h-px w-3 transition-colors duration-500 lg:w-7 ${
                          i <= active ? "bg-night/40" : "bg-night/15"
                        }`}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      data-cursor-hover
                      aria-label={`${p.n} — ${p.heading}`}
                      aria-current={active === i}
                      className={`inline-flex min-h-11 min-w-11 items-center justify-center text-[11px] font-bold tracking-[0.08em] transition-all duration-300 lg:min-h-0 lg:min-w-0 ${
                        active === i ? "scale-125 text-night" : "text-night/40 hover:text-night/80"
                      }`}
                    >
                      {p.n}
                    </button>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

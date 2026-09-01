"use client";

/* Interactive image accordion — зурган самбарууд, идэвхтэй нь дэлгэгдэж
   бусад нь нарийн зурвас хэвээр үлдэнэ.

   Хоёр урсгал (lane) DOM-д зэрэг байна:
     • md-ээс дээш — хэвтээ: `flex-grow` шилжинэ,
     • md-ээс доош — босоо: `height` шилжинэ.
   `hidden` (display:none) нь идэвхгүй урсгалыг tab дарааллаас ч хасдаг тул
   гар утсанд ганцхан хүрэх талбай үлдэнэ.

   Харилцан үйлдэл (хоёр урсгалд ижил, JS дотор media query БАЙХГҮЙ):
     • хулганаар дээгүүр нь өнгөрөх → дэлгэнэ (зөвхөн pointerType==="mouse";
       iPad-ын хуурамч mouseenter эхний хүрэлтээр pop-up нээхээс сэргийлнэ),
     • аль хэдийн дэлгэгдсэн самбар дээр дарах → `onOpen` (pop-up),
     • дэлгэгдээгүй самбар дээр дарах → зөвхөн дэлгэнэ,
     • сум / Home / End → фокус зөөнө, фокус нь тухайн самбарыг дэлгэнэ.

   Самбар ӨӨРӨӨ товч — үүрлэсэн интерактив элемент байхгүй, нэг л tab
   зогсоол, нэг л хүрэх талбай. "Дэлгэрэнгүй" шошго нь идэвхгүй <span>.
   Товч дотор блок элемент бүр <span> (button-ы агуулгын загвар нь
   phrasing content тул <div>/<p> хүчингүй). */

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type AccordionPanel = {
  /** React key — дуудагч давхцахгүйг баталгаажуулна. */
  id: string;
  /** Самбар бүрийн тогтмол рельс дээрх нэг тэмдэгт (ж: E·L·Y·S).
   *  Дуудагч гаргаж өгнө; компонент гарчгийг задлан шинжлэхгүй. */
  letter: string;
  /** Гарчиг — хураангуй үед босоо, дэлгэгдсэн үед хэвтээ, мөн товчны нэр. */
  title: string;
  /** Дэлгэгдсэн самбар дээр л харагдах тайлбар (2 мөрөөр таслагдана). */
  body: string;
  /** Дэвсгэр зураг. */
  image: string;
};

export type InteractiveImageAccordionProps = {
  items: AccordionPanel[];
  /** Эхэнд дэлгэгдсэн байх самбар. Хүрээнд нь багтаана. Өгөгдмөл 0. */
  defaultIndex?: number;
  /** Аль хэдийн дэлгэгдсэн самбарыг ДАХИН идэвхжүүлэхэд дуудагдана
   *  (click / Enter / Space) — энэ нь "pop-up нээ" гэсэн дохио. */
  onOpen: (index: number) => void;
  /** Дэлгэгдсэн самбар доторх идэвхгүй шошго, ж: "Дэлгэрэнгүй". */
  openLabel: string;
  /** Дэлгэгдсэн самбарын flex-grow, хураангуй самбар бүр 1-тэй харьцуулахад. */
  activeRatio?: number;
  /** Гадна бүрхүүлийн класс — зөвхөн зай (хэмнэлийг дуудагч эзэмшинэ). */
  className?: string;
};

const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";

/* Хоёр давхар scrim, opacity-гоор солигдоно. Градиентээс градиент руу
   шилжих нь найдваргүй тул хоёуланг нь үргэлж зурж, зөвхөн ил тодыг
   нь шилжүүлнэ (opacity нь compositable, хямд).

   Өнгө нь `--color-charcoal` (#16280f = 22,40,15) — брэндийн хамгийн
   гүн ногоон, footer/film-д хэрэглэдэг. Өмнө нь `--color-night`
   (21,23,23) байсныг захиалагчийн санлаар сольсон: хураангуй самбарууд
   хайнга хар биш, Elysium-ын ногооноор бүрэлзэнэ. Гэрэлтэлт бараг
   ижил (L 0.008 → 0.017) тул доорх зогсоолуудын контраст хэвээр.

   Ногоон хөшиг ДАХИН СУЛАРСАН (захиалагчийн санал):
     • хураангуй самбарын их бие  .45/.39 → .34/.29,
     • дэлгэгдсэн самбарын их бие .22/.08/.05 → .16/.06/.04,
     • дээд рельс (хоёуланд ижил) .40/.43 → .34/.37.
   Зураг бүрэн урагшилж, ногоон нь өнгө засварын filter шиг л үлдэнэ.

   §7 КОНТРАСТЫН ХҮСНЭГТ. Дөрвөн ЖИНХЭНЭ рендер дээр хэмжсэн: зургийг
   object-cover-оор самбарын хайрцагт суулгаж, CSS filter (хураангуй
   самбарт brightness .75 · grayscale .55) хэрэглэж, дараа нь хөшгийг
   зогсоол зогсоолоор нь давхарлаад WCAG 2.1 харьцааг бодов. Бичвэрийн
   хайрцаг доторх ДУНДАЖ (мөн хамгийн цайвар 5% нь) —
     • E·L·Y·S үсэг, дэлгэгдсэн, дээд рельс (α .34–.37):
       4.76 / 3.26 / 3.33 / 3.94 : 1 — 46px extrabold = том бичвэр,
       босго 3:1,
     • E·L·Y·S үсэг, хураангуй: 5.79 / 11.57 / 4.51 / 7.28 : 1,
     • хураангуй босоо гарчиг (12px, босго 4.5:1):
       6.55 / 6.72 / 8.70 / 4.64 : 1,
     • утасны рельсийн гарчиг (13px): 4.95 / 8.78 / 8.89 / 7.59 : 1.
   Бүгд өөрийн босгоо давсан; хамгийн нарийн зай нь `efficiency`
   рендерийн босоо гарчиг (4.64 vs 4.5) тул 0–84% хоорондын alpha-г
   энэ утгуудаас ЦААШ бууруулах зай БАРАГ АЛГА.

   ⚠️ ХОЦРОГДСОН: энэ хүснэгтийг бичих үед CAPTION_SCRIM нь .86-гийн
   оргилтой ХЭВЭЭР үлдсэн байсан ба «түүнийг хагаславал контраст ≈2.2:1
   хүртэл унана» гэж анхааруулсан. 2026-09-01-нд захиалагч түүнийг ч
   10% болгохыг шаардсан тул тэр анхааруулга ХЭРЭГЖСЭН — гарчиг/тайлбар
   одоо хөшгөөр биш `CAPTION_SHADOW`-оор баригдана (доороос үз).

   84%-аас дээшх зогсоолууд ХОЁУЛАНД ИЖИЛ — тиймээс самбар аль нь ч
   дэлгэгдсэн бай, дээд захаар нь тасралтгүй бараан рельс үргэлжилж,
   E·L·Y·S үсгүүд түүн дээр суух нь энэ хэсгийн гарын үсэг болно.
   Зогсоолуудыг §7-гийн контрастын хүснэгтгүйгээр өөрчилж БОЛОХГҮЙ.

   2026-09-01 — ЗАХИАЛАГЧИЙН ШААРДЛАГА: самбарын хөшгийг 10% болгож
   бууруулав (өмнөх оргил α .37 → .10). Дээрх §7 хүснэгт ҮҮНД ХАМААРАХАА
   БОЛЬСОН: E·L·Y·S үсэг ба хураангуй самбарын босоо гарчиг одоо зөвхөн
   зургийн ӨӨРИЙН бараан хэсэг дээр тулгуурлана (хураангуй самбарт
   `brightness .75 · grayscale .55` filter хэвээр тул тэнд нөөц үлдсэн).
   Гарчиг/тайлбар/товч ЭНЭ алхмаар хөндөгдөөгүй ч дараа нь CAPTION_SCRIM
   ч мөн 10% болсон — тэдгээрийг одоо `CAPTION_SHADOW` барина. */
const SCRIM_IDLE =
  "bg-[linear-gradient(to_top,rgba(22,40,15,0.10)_0%,rgba(22,40,15,0.08)_45%,rgba(22,40,15,0.10)_84%,rgba(22,40,15,0.10)_100%)]";
const SCRIM_ACTIVE =
  "bg-[linear-gradient(to_top,rgba(22,40,15,0.05)_0%,rgba(22,40,15,0.02)_35%,rgba(22,40,15,0.01)_58%,rgba(22,40,15,0.09)_84%,rgba(22,40,15,0.10)_100%)]";

/* Бичвэрийн ӨӨРИЙН дэвсгэр. Самбарын scrim дангаараа хангалтгүй: scrim-ийн
   зогсоолууд самбарын ӨНДРИЙН ХУВИАР тавигддаг бол бичвэрийн блокийн өндөр
   нь ПИКСЕЛЭЭР тогтмол — тиймээс намхан (гар утасны) самбар дээр гарчиг
   scrim-ийн тунгалаг цонхонд таарч контраст 1.3:1 хүртэл унана. Бичвэр
   өөрийнхөө ард градиент авснаар контраст самбарын өндрөөс ХАМААРАХГҮЙ
   болно.

   ӨНГӨ: энэ хөшиг ГАНЦААРАА `--color-charcoal` (#16280f) БИШ, түүнээс
   хамаагүй бараан, ногоон нь дөнгөж мэдрэгдэх #121611 (18,22,17).
   Шалтгаан: 0.85 alpha-тай ханасан ногоон нь рендерийн модон,
   даавуун, арьсан өнгийг БҮГДИЙГ олив болгож "бүдгэрүүлдэг" —
   хэрэглэгчийн гомдол яг үүн дээр байв. Бараан саарал-ногоон нь
   зургийн ӨНГИЙГ хадгалаад зөвхөн ГЭРЭЛТЭЛТИЙГ нь буулгадаг тул
   давхарга биш ЖИНХЭНЭ СҮҮДЭР шиг уншигдана. Гэрэлтэлт нь charcoal-оос
   бага (L .0075 vs .017) тул контраст ч мөн сайжирна.
   Хураангуй самбарын SCRIM_IDLE / дээд рельс нь ХЭВЭЭР ногоон —
   захиалагчийн "хайнга хар биш, ногооноор бүрэлзэнэ" гэсэн санал тэнд
   хүчинтэй; энд бичвэрийн ард л сүүдэр болов.

   ХЭЛБЭР: уусалт нь ЗӨВХӨН доороос дээш (захиалагчийн заавар) —
   хэвтээ маск байхгүй, хөшиг самбарын өргөнөөр жигд суух ба зөвхөн
   өгсөх тусам сулрана. Тэгш өндөрлөг огт байхгүй: доод захаас эхлээд
   зогсоол бүр буурна. Уусалтын урт нь ЗӨВХӨН дээд дүүргэлтээс
   (`pad`-ийн pt) хамаардаг тул түүнийг pt-16 → pt-40 (утас pt-12 →
   pt-24) болгов: сүүл ≈59px-ээс ≈151px болж бараг гурав дахин уртсав.
   Хуучин хувилбарын "хавтгай ногоон тэгш өнцөгт + огцом ирмэг" гэсэн
   хоёр асуудлын аль аль нь ингэж арилна.

   §7 КОНТРАСТ. Хамгийн тод рендер (интерьер, L≈0.76) дээр, ЖИНХЭНЭ
   хэмжсэн байрлалаар (хайрцаг 328px, доороос дээш хувиар):
     • товч 7–21%: α .85 — гэхдээ товч өөрөө цагаан дүүргэлттэй,
     • тайлбар 14px white/85, 26–40%: α .85–.84 → 4.9:1
       (энэ бичвэр хамгийн ХАТУУ хязгаар: α .825-аас доош 4.5 унана),
     • гарчиг 18px extrabold цагаан, 42–50%: α .836–.821 → 5.5:1
       (энд хязгаар нь α .767),
     • 54%-аас дээш бичвэр БАЙХГҮЙ тул сүүл чөлөөтэй тэглэнэ.
   Утасны хайрцаг (214px) дээр гарчиг 37–49% дээр таарч α .84–.82 авна.
   ӨӨР ҮГЭЭР: доорх alpha-нууд нь AA-гийн ЯГ ШАЛ дээр сууж байна.
   Үүнээс цаашид ногоонг сулруулах цорын ганц зам бол панел дээрх
   2 мөр тайлбарыг pop-up руу нь буулгаж, зөвхөн гарчиг үлдээх. */
/* 2026-09-01 — ЗАХИАЛАГЧИЙН ШААРДЛАГА: caption хөшгийг ч 10% болгов.
   Бүх зогсоолыг 10/86 = 0.116 коэффициентээр хуваасан тул уусалтын
   ХЭЛБЭР (доод захаас дээш жигд буурах, 100%-д тэглэх) хэвээр, зөвхөн
   гүн нь буурсан. Дээрх §7 хүснэгт ҮҮНД ХАМААРАХАА БОЛЬСОН: гэрэлт
   интерьер дээр гарчиг/тайлбарын контраст ≈2.2:1 хүртэл унана.

   Тиймээс уншигдацыг ХӨШГӨӨР биш, бичвэрийн СҮҮДРЭЭР хангана
   (`CAPTION_SHADOW`) — 01 ба 03 бүлэгт хэрэглэсэнтэй яг ижил утга.
   Сүүдэр нь зургийн ӨНГИЙГ огт хөнддөггүй тул «хөшиг буцаж ирсэн»
   гэсэн үр дүн гарахгүй. Тайлбарын хоёр мөр (`white/85` → бүтэн цагаан
   болгосон ч) хамгийн тод интерьер дээр сул хэвээр — үүнээс цааш
   хөшиггүйгээр сайжруулах ЦОРЫН ГАНЦ зам бол тэр 2 мөрийг самбараас
   авч (бүтэн тайлбар pop-up дотор аль хэдийн бий), зөвхөн гарчиг
   үлдээх. Дээрх §7 хүснэгт ч мөн үүнийг заасан. */
const CAPTION_SCRIM =
  "bg-[linear-gradient(to_top,rgba(18,22,17,0.100)_0%,rgba(18,22,17,0.099)_26%,rgba(18,22,17,0.098)_40%,rgba(18,22,17,0.095)_50%,rgba(18,22,17,0.092)_54%,rgba(18,22,17,0.079)_60%,rgba(18,22,17,0.060)_68%,rgba(18,22,17,0.042)_76%,rgba(18,22,17,0.026)_84%,rgba(18,22,17,0.013)_91%,rgba(18,22,17,0.005)_96%,rgba(18,22,17,0)_100%)]";

/** Хөшиг 10% болсны дараа бичвэрийг барих цорын ганц зүйл. */
const CAPTION_SHADOW =
  "[text-shadow:0_1px_2px_rgba(9,14,7,0.45),0_2px_22px_rgba(9,14,7,0.55)]";

/** Самбарын дотоод — хоёр урсгалд хуваалцана. */
function PanelBody({
  item,
  isActive,
  openLabel,
  lane,
  captionId,
}: {
  item: AccordionPanel;
  isActive: boolean;
  openLabel: string;
  lane: "row" | "col";
  /** `aria-expanded` нь ЯГ энэ мужийг заана (aria-controls). */
  captionId: string;
}) {
  /* pt нь градиентэд уусах зай өгнө; pb/px нь бичвэрийн зай. pt-г
     өмнөх pt-16/pt-12-оос сунгав — CAPTION_SCRIM-ийн сүүл энэ хоосон
     зайд л тэглэдэг тул уусалтын урт нь ЯГ энэ утгаас хамаарна. */
  const pad = lane === "row" ? "px-6 pb-6 pt-40" : "px-5 pb-5 pt-24";

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt=""
        draggable={false}
        loading="lazy"
        decoding="async"
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-[filter,transform] duration-700",
          EASE,
          isActive
            ? "scale-100 brightness-100 grayscale-0"
            : "scale-[1.04] brightness-[0.75] grayscale-[0.55] motion-reduce:scale-100"
        )}
      />

      <span
        aria-hidden
        className={cn(
          "absolute inset-0 transition-opacity duration-[550ms]",
          EASE,
          SCRIM_IDLE,
          isActive ? "opacity-0" : "opacity-100"
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 transition-opacity duration-[550ms]",
          EASE,
          SCRIM_ACTIVE,
          isActive ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Акронимын үсэг — хэвтээ урсгалд голоос зүүн тийш гулсана;
          босоо урсгалд эхний 72px-ийн голд тогтмол сууна (мөр өөрөө
          72px тул хураангуй үед яг голлоно, дэлгэгдсэн үед дээд рельс). */}
      {lane === "row" ? (
        <span
          aria-hidden
          data-elys-letter
          className={cn(
            "pointer-events-none absolute top-5 z-[3] whitespace-nowrap text-[clamp(2rem,3.2vw,3.4rem)] font-extrabold leading-none tracking-tight text-white transition-[left,transform] duration-700",
            EASE,
            isActive ? "left-6 translate-x-0" : "left-1/2 -translate-x-1/2"
          )}
        >
          {item.letter}
        </span>
      ) : (
        <span
          aria-hidden
          data-elys-letter
          className="pointer-events-none absolute left-5 top-0 z-[3] flex h-[72px] items-center text-[30px] font-extrabold leading-none tracking-tight text-white"
        >
          {item.letter}
        </span>
      )}

      {/* Хураангуй гарчиг. Хэвтээ урсгалд БОСОО бичиглэлээр —
          `rotate-90` БИШ: эргүүлсэн хайрцгийн мөрийн урт нь самбарын
          ӨРГӨНӨӨР хязгаарлагддаг тул ~10 тэмдэгтийн дараа таслагдана.
          `writing-mode: vertical-rl` нь самбарын ӨНДРИЙГ мөрийн тэнхлэг
          болгодог тул 380–540px зай чөлөөтэй болно. Энэ техникийг бас
          учир шалтгааныг нь хамт хадгална. */}
      {lane === "row" ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-5 left-1/2 z-[2] max-h-[62%] -translate-x-1/2 rotate-180 overflow-hidden whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-opacity duration-300 [writing-mode:vertical-rl]",
            isActive ? "opacity-0 delay-0" : "opacity-100 delay-200"
          )}
        >
          {item.title}
        </span>
      ) : (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-16 right-5 z-[2] flex items-center transition-opacity duration-300",
            isActive ? "opacity-0 delay-0" : "opacity-100 delay-200"
          )}
        >
          <span className="min-w-0 truncate text-[13px] font-bold uppercase tracking-[0.14em] text-white">
            {item.title}
          </span>
        </span>
      )}

      {/* Дэлгэгдсэн үеийн бичвэр — "Дэлгэрэнгүй" шошго нь энгийн урсгалд
          сууна, absolute БИШ; тиймээс бичвэртэй давхцах боломжгүй. */}
      <span
        id={captionId}
        className={cn(
          "absolute inset-x-0 bottom-0 z-[2] block transition-[opacity,transform] duration-300 ease-out",
          CAPTION_SCRIM,
          CAPTION_SHADOW,
          pad,
          isActive
            ? "translate-y-0 opacity-100 delay-200"
            : "pointer-events-none translate-y-2 opacity-0 delay-0"
        )}
      >
        {/* Бараан scrim дээр lime — цайвар суурьт moss (shared.tsx-ийн дүрэм) */}
        <span aria-hidden className="mb-3 block h-px w-8 bg-lime" />
        <span className="block text-lg font-extrabold leading-snug tracking-tight text-white">
          {item.title}
        </span>
        {/* Гар утсанд тайлбарыг харуулахгүй: 320px самбар дээр бичвэрийн
            блок өндрийн 2/3-ыг эзэлж, рендер бараг харагдахгүй болно.
            Бүтэн тайлбарыг pop-up агуулна.

            БҮТЭН ЦАГААН (өмнө нь `white/85`): хөшиг 10% болсны дараа
            цайвар интерьер дээр уншигдахаа больж байв. Уншигдацыг
            кадрыг харанхуйлж биш, бэхээ нэмж хангана. */}
        {lane === "row" && (
          <span className="mt-2 line-clamp-2 max-w-md text-[14px] leading-relaxed text-white">
            {item.body}
          </span>
        )}
        {/* Товч нь ЦАГААН дүүргэлттэй, бичиг нь бараан — өвлөж ирсэн
            `CAPTION_SHADOW` энд бохир болно, тиймээс тэглэнэ. */}
        <span className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-night [text-shadow:none]">
          {openLabel}
          <span
            aria-hidden
            className={cn("transition-transform duration-500 group-hover:translate-x-1", EASE)}
          >
            →
          </span>
        </span>
      </span>
    </>
  );
}

export function InteractiveImageAccordion({
  items,
  defaultIndex = 0,
  onOpen,
  openLabel,
  activeRatio = 6,
  className,
}: InteractiveImageAccordionProps) {
  const last = Math.max(items.length - 1, 0);
  const [committed, setCommitted] = useState(() =>
    Math.min(Math.max(defaultIndex, 0), last)
  );
  const [hovered, setHovered] = useState<number | null>(null);
  const uid = useId();

  /* Төлөвийн ТОЛЬ ref-үүд. React-ийн setState нь асинхрон тул
     `pointerenter` ба `pointerdown` хоёрын хооронд дахин рендер
     хийгдсэн эсэх нь баталгаагүй — рендерийн хувьсагчаас уншвал
     шийдвэр нь хугацааны тохиолдлоос хамаарна. Эдгээр ref-ийг
     тухайн үйл явдал дотор шууд шинэчилдэг тул үргэлж хамгийн
     сүүлийн үнэн утгыг барина. */
  const hoverRef = useRef<number | null>(null);
  const committedRef = useRef(committed);

  /* Дарахаас ӨМНӨХ төлөвийг тэмдэглэнэ. `focus` нь `click`-ээс өмнө
     ажиллаж самбарыг идэвхжүүлчихдэг тул `click` дотор тухайн үеийн
     төлөвийг уншвал МЭДРЭГЧТЭЙ дэлгэц дээр эхний хүрэлт шууд pop-up
     нээнэ (хэрэглэгч юу нээж байгаагаа хараагүй байхад). pointerdown
     үеийн төлөвөөр шийдвэл:
       • хулгана — hover аль хэдийн дэлгэсэн тул НЭГ даралтаар нээнэ,
       • хүрэлт  — 1 дэх хүрэлт дэлгэнэ, 2 дахь нь нээнэ,
       • гар     — pointerdown байхгүй тул фокусын дараах төлөвөөр нээнэ. */
  const press = useRef<{ index: number; wasActive: boolean } | null>(null);

  const commit = (i: number) => {
    committedRef.current = i;
    setCommitted(i);
  };
  const hover = (i: number | null) => {
    hoverRef.current = i;
    setHovered(i);
  };

  /* Админ сүүлийн зүйлийг устгасан ч хүрээнээс гарахгүй. */
  const safeCommitted = Math.min(committed, last);
  const active = hovered ?? safeCommitted;

  /* Нэг сонсогч — roving tabindex хэрэггүй, самбар бүр tab-д хүрнэ.
     Дөрвөн сумыг хоёр урсгалд хүлээж авснаар breakpoint салаалалт
     хэрэггүй болно. */
  const onListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const nav = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!nav.includes(e.key)) return;
    const btns = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-elys-panel]")
    );
    const from = btns.indexOf(document.activeElement as HTMLButtonElement);
    if (from < 0) return;
    e.preventDefault();
    const end = btns.length - 1;
    const to =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? end
          : e.key === "ArrowLeft" || e.key === "ArrowUp"
            ? Math.max(0, from - 1)
            : Math.min(end, from + 1);
    btns[to]?.focus();
  };

  const panelButton = (item: AccordionPanel, i: number, lane: "row" | "col") => {
    const isActive = active === i;
    /* Хоёр урсгал ижил зүйлийг рендерлэдэг тул id-д урсгалыг оруулна —
       эс бөгөөс баримт бичигт давхардсан id үүснэ. */
    const captionId = `${uid}-${lane}-${i}`;
    return (
      <button
        type="button"
        data-elys-panel
        data-cursor-hover
        /* `aria-haspopup` нь ЗӨВХӨН идэвхтэй үед: тэр үед л дарахад
           яриа цонх нээгдэнэ. Идэвхгүй самбар дээр дарахад зөвхөн
           дэлгэгддэг тул popup зарлах нь худал мэдээлэл болно. */
        aria-haspopup={isActive ? "dialog" : undefined}
        /* `aria-controls`-той хослуулснаар `aria-expanded` нь яриа цонхны
           бус, ЯГ дэлгэгдэж буй бичвэрийн мужийн төлөвийг заана. */
        aria-expanded={isActive}
        aria-controls={captionId}
        /* Шилжилтийн 300ms-д босоо ба хэвтээ гарчиг хоёулаа DOM-д байдаг
           тул нэрийг тодорхой зааж өгнө — эс тэгвээс хоёуланг уншина.
           Идэвхтэй үед харагдах "Дэлгэрэнгүй" шошгыг нэрэнд оруулна
           (SC 2.5.3 Label in Name — дуу хоолойгоор удирдагч тааруулна). */
        aria-label={isActive ? `${item.title} — ${openLabel}` : item.title}
        onClick={() => {
          const rec = press.current;
          press.current = null;
          const wasActive = rec && rec.index === i ? rec.wasActive : isActive;
          if (wasActive) onOpen(i);
          else commit(i);
        }}
        onPointerDown={() => {
          press.current = {
            index: i,
            wasActive: (hoverRef.current ?? committedRef.current) === i,
          };
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") hover(i);
        }}
        onFocus={() => {
          hover(null);
          commit(i);
        }}
        className="group absolute inset-0 block h-full w-full text-left focus-visible:shadow-[inset_0_0_0_7px_rgba(22,40,15,0.72)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
      >
        <PanelBody
          item={item}
          isActive={isActive}
          openLabel={openLabel}
          lane={lane}
          captionId={captionId}
        />
      </button>
    );
  };

  if (!items.length) return null;

  return (
    <div className={className}>
      {/* Хэвтээ урсгал — md-ээс дээш. Өндөр нь vw, vh БИШ: гар утасны
          хаягийн мөр хураагдахад vh дахин хэмжигдэж, MonoStoryNav нь
          #elys-ийн offsetHeight-ыг гүйлт бүрд уншдаг тул цэг нь анивчина. */}
      <ul
        className="hidden h-[clamp(380px,40vw,540px)] gap-2 md:flex"
        onPointerLeave={() => hover(null)}
        onKeyDown={onListKeyDown}
      >
        {items.map((item, i) => (
          <li
            key={item.id}
            /* flexBasis:0 заавал — эс бөгөөс `auto` нь агуулгаараа хэмжигдэж
               grow-ийн шилжилт огт харагдахгүй. min-w нь `min-width:auto`-г
               дарж, хураангуй рельсэнд уншигдах доод хэмжээ өгнө. */
            style={{ flexGrow: active === i ? activeRatio : 1, flexShrink: 1, flexBasis: 0 }}
            className={cn(
              "relative min-w-[4.5rem] overflow-hidden rounded-2xl bg-charcoal transition-[flex-grow] duration-700",
              EASE
            )}
          >
            {panelButton(item, i, "row")}
          </li>
        ))}
      </ul>

      {/* Босоо урсгал — md-ээс доош. Тэнхлэг эргэнэ, accordion хэвээр. */}
      <ul
        className="flex flex-col gap-2 md:hidden"
        onPointerLeave={() => hover(null)}
        onKeyDown={onListKeyDown}
      >
        {items.map((item, i) => (
          <li
            key={item.id}
            className={cn(
              "relative w-full overflow-hidden rounded-2xl bg-charcoal transition-[height] duration-700",
              EASE,
              active === i ? "h-[clamp(320px,82vw,380px)]" : "h-[72px]"
            )}
          >
            {panelButton(item, i, "col")}
          </li>
        ))}
      </ul>
    </div>
  );
}

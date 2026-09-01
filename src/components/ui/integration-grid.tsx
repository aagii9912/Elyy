"use client";

/* Integration grid — брэнд/нийлүүлэгчийн карт бүхий тор.

   Figma: «Барилга бүтээц тоноглол» (29:157) — 2 багана × N мөр, карт
   657×131, gap 12, радиус 16, хүрээ rgba(0,0,0,.2).

   Карт бүр НЭГ МӨР:
     • материалын зураг картыг БҮТНЭЭР дүүргэнэ (`object-cover`), дээр
       нь зүүнээс баруун тийш цагаан хөшиг 53.4%-д тунгалаг болж
       уусна — зүүн талын бичвэр ямар ч зураг дээр уншигдана,
     • зүүн дээд талд ангилал, доор нь улсын далбаа + улсын нэр,
       (улсгүй зүйлд далбааны мөрийг тайлбар эзэлнэ),
     • баруун талд брэндийн лого; лого байхгүй бол брэндийн нэр өөрөө
       wordmark болно. Тэр бүс дээр цагаан хөшиг аль хэдийн тунгалаг
       болсон тул зурагтай картад БАРУУН талаас үл мэдэг бараан хөшиг
       нэмнэ — цайвар зураг дээр цагаан лого, бараан зураг дээр
       брэндийн нэр хоёулаа уншигдана.

   Зураггүй карт зөвхөн цагаан суурьтай үлдэнэ — `min-height` бүх
   картыг жигд барих тул орлуулагч хэрэггүй.

   Хамаарал байхгүй — зөвхөн Tailwind. */

import { cn } from "@/lib/utils";

export type IntegrationItem = {
  /** React key — дуудагч давхцахгүйг баталгаажуулна. */
  id: string;
  /** Юуны тоноглол болох (картын гарчиг). */
  category: string;
  /** Үйлдвэрлэгч / брэнд. Хоосон байж болно. */
  brand?: string;
  /** Улс, эсвэл бусад товч тэмдэглэгээ. */
  meta?: string;
  /** Улсын далбаа. Хоосон бол `meta`-гаас дотоод далбаа таарна. */
  flag?: string;
  /** Брэндийн лого. Байвал брэндийн нэрийг орлоно. */
  logo?: string;
  /** Материалын зураг — картыг бүтнээр дүүргэж, зүүн тийш уусна. */
  image?: string;
  /** Нэмэлт тайлбар (2 мөрөөр таслагдана). */
  note?: string;
};

/* Дотоод далбаанууд — админ зураг оруулаагүй үед улсын нэрээр таарна.
   Танихгүй улсад далбаа гарахгүй, зөвхөн нэр үлдэнэ (тиймээс админ
   дурын улс бичиж болно). Солонгосынх нь дизайнаас гарсан яг файл.

   Тааруулалт нь бүтэн ҮГЭЭР явна, дэд мөрөөр БИШ: «Туркменистан»
   дотор «Турк» байгаа ч Туркийн далбаа гаргах нь далбаагүй үлдээхээс
   дор — админ буруудсаныг нь сайт дээр очиж харахгүйгээр мэдэхгүй.
   `exclude` нь нэг нэрийн доор хоёр өөр улс байх тохиолдлыг барина
   («Хойд Солонгос» → далбаагүй; хэрэгтэй бол админ өөрөө оруулна). */
const FLAGS: Array<{ names: string[]; exclude?: string[]; src: string }> = [
  { names: ["турк", "türkiye", "turkiye", "turkey"], src: "/flags/tr.svg" },
  { names: ["франц", "france"], src: "/flags/fr.svg" },
  { names: ["герман", "germany", "deutschland"], src: "/flags/de.svg" },
  {
    names: ["солонгос", "korea"],
    exclude: ["хойд", "умард", "кндр", "north", "dprk"],
    src: "/flags/kr.png",
  },
  { names: ["япон", "japan"], src: "/flags/jp.svg" },
];

/** «Өмнөд Солонгос, Азия» → `{"өмнөд", "солонгос", "азия"}`. */
const wordsOf = (meta: string) =>
  new Set(meta.toLowerCase().split(/[\s,;:.!?\/|\\()"'«»·–—-]+/).filter(Boolean));

const flagFor = (item: IntegrationItem) => {
  const own = item.flag?.trim();
  if (own) return own;
  if (!item.meta?.trim()) return undefined;
  const words = wordsOf(item.meta);
  return FLAGS.find(
    (f) => f.names.some((n) => words.has(n)) && !f.exclude?.some((n) => words.has(n))
  )?.src;
};

export function IntegrationGrid({
  items,
  className,
}: {
  items: IntegrationItem[];
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {items.map((item) => {
        const flag = flagFor(item);

        return (
          <li
            key={item.id}
            className="relative flex min-h-[116px] items-center overflow-hidden rounded-2xl border border-night/20 bg-surface py-4 pl-5 pr-6 transition-colors duration-500 hover:border-night/35 sm:min-h-[131px] sm:py-5 sm:pl-[26px] sm:pr-12"
          >
            {/* Материалын зураг — картыг бүтнээр дүүргэнэ. `alt` нь
                ЗОРИУДААР хоосон: яг хажууд нь ангилал, брэнд, улс
                бичигдсэн тул дэлгэц уншигчид давхар сонсох хэрэггүй. */}
            {item.image && (
              <span aria-hidden className="pointer-events-none absolute inset-0 select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                {/* Зургийн зүүн талыг картын суурь руу уусгах хөшиг. Өнгө нь
                    `#fff` БИШ, `--color-surface` — картын `bg-surface`-ийг
                    админ палитрын өнгө дарж бичдэг (`lib/theme-css.ts`), тэр
                    үед тогтмол цагаан бичвэл картан дээр цагаан хавтан
                    үлдэж, хажуугийн зураггүй карттай зөрнө.
                    Дизайны зогсоол 53.365% нь 657px ӨРГӨН картад тохирсон
                    тоо — `sm:` дээр хоёр баганын карт ердөө ~300px болдог
                    тул тэнд түүнийг хэрэглэвэл улсын нэр хөшигнөөс хальж
                    зураг дээр гарна. Тиймээс дизайны тоог карт ~470px
                    болдог `lg:`-ээс эхэлж хэрэглэнэ; түүнээс нарийн үед
                    хөшгийг уртасгана. */}
                <span className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-surface)_0%,transparent_82%)] lg:bg-[linear-gradient(to_right,var(--color-surface)_0%,transparent_53.365%)]" />
                {/* Брэндийн бүс — цагаан хөшиг энд бүрэн тунгалаг тул
                    лого/нэр нь ЗУРАГ ДЭЭР шууд сууна. Материалын зураг
                    цайвар ч, бараан ч байж болох тул тогтвортой бараан
                    суурь өгнө: цагаан лого цайвар зураг дээр, брэндийн
                    нэр бараан зураг дээр алга болохоо болино.

                    Дээрх хөшгөөс ЯЛГААТАЙ нь: энэ нь токен хэрэглэхгүй.
                    Үүрэг нь «картын өнгөтэй тааруулах» биш «БАРААН
                    байх» — доор нь тогтмол `text-white` сууж байгаа тул
                    админ палитраас хамаарах ёсгүй. */}
                {(item.logo || item.brand) && (
                  <span className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(to_left,rgba(21,23,23,0.62)_0%,rgba(21,23,23,0.3)_48%,rgba(21,23,23,0)_100%)]" />
                )}
              </span>
            )}

            <span
              className={cn(
                "relative min-w-0 flex-1",
                /* Зурагтай үед бичвэр нь цагаан хөшигний ард багтах
                   ёстой — эс тэгвээс урт тайлбар зураг руу гарч
                   уншигдахаа болино. Хязгаар нь дээрх хөшигтэй ЯГ ижил
                   таслалтаас (`lg:`) эхэлнэ. */
                item.image && "lg:max-w-[53%]"
              )}
            >
              <span className="block text-[15px] font-bold leading-tight tracking-tight text-night sm:text-[17px]">
                {item.category}
              </span>

              {/* Далбаа нь улсын нэргүй ч гарна — админ зөвхөн далбаа
                  оруулаад «Улс»-аа хоосон орхивол чимээгүй алга болох
                  ёсгүй. */}
              {(flag || item.meta) && (
                <span className="mt-1 flex items-center gap-2">
                  {flag && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={flag}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      decoding="async"
                      /* Цагаан давамгайлсан далбаа (Япон) цагаан картан
                         дээр хөвөхгүйн тулд үл мэдэг хүрээтэй. */
                      className="h-[26px] w-[39px] shrink-0 object-cover ring-1 ring-inset ring-night/10"
                    />
                  )}
                  {item.meta && (
                    <span className="text-[11px] font-bold uppercase leading-none tracking-[0.167em] text-night/50 sm:text-[12px]">
                      {item.meta}
                    </span>
                  )}
                </span>
              )}

              {/* Тайлбар нь улсын мөрөөс ХАМААРАХГҮЙ — хоёулаа байвал
                  доор нь нэмэгдэж, карт өндөрсөнө. */}
              {item.note && (
                <span className="mt-2 line-clamp-2 block text-[13px] leading-relaxed text-night/60">
                  {item.note}
                </span>
              )}
            </span>

            {/* Брэнд — лого байвал зураг, үгүй бол нэр нь wordmark. */}
            {item.logo ? (
              <span
                className={cn(
                  /* Өргөнийг ХУВИАР барина. `sm:` завсарт (640–980px)
                     хоёр баганын карт ердөө ~300px болдог тул тогтмол
                     232px лого `shrink-0`-той хамт бичвэрийн баганыг
                     0px хүртэл шахаж байсан. `min()` нь дизайны дээд
                     хэмжээг өргөн дэлгэцэд хэвээр барина. */
                  "relative ml-4 flex min-w-0 max-w-[min(45%,232px)] items-center sm:ml-6",
                  /* Дизайнд лого нь картын БАРУУН талын ил зураг дээр
                     сууна — тиймээс ЦАГААН лого хэрэглэгдэнэ. Зураггүй
                     цагаан картан дээр тэр нь алга болох тул бараан
                     тавцан дээр суулгана (MonoEquip-ийн `BrandMark`-тай
                     ижил заншил). */
                  !item.image && "rounded-lg bg-night/90 px-3 py-2"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.logo}
                  alt={item.brand || item.category}
                  loading="lazy"
                  decoding="async"
                  className="h-8 w-auto max-w-full object-contain object-right sm:h-10"
                />
              </span>
            ) : (
              item.brand && (
                <span
                  className={cn(
                    "relative ml-4 min-w-0 max-w-[45%] text-right text-[15px] font-extrabold leading-tight tracking-tight sm:ml-6 sm:text-[17px]",
                    /* Зурагтай картад нэр нь дээрх бараан хөшиг дээр
                       сууна — бараан бичвэр зураг дээр уншигдахгүй. */
                    item.image ? "text-white" : "text-night/75"
                  )}
                >
                  {item.brand}
                </span>
              )
            )}
          </li>
        );
      })}
    </ul>
  );
}

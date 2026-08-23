"use client";

/* Integration grid — брэнд/нийлүүлэгчийн карт бүхий тор.

   Карт бүр НЭГ МӨР: зүүн талд бичвэр (ангилал → брэнд·улс → тайлбар),
   баруун талд бүтээгдэхүүний зураг. Зураг нь ӨӨРИЙН ХҮРЭЭГҮЙ — баруун
   ирмэгээс эхлээд зүүн тийш `mask-image` градиентээр картын дэвсгэр рүү
   уусан ордог. Ингэснээр:
     • цагаан дэвсгэртэй каталогийн зургийн ирмэг мэдэгдэхгүй,
     • зураг тайрагдахгүй (`object-contain`),
     • зурагтай, зураггүй карт нэг мөрөнд зэрэгцсэн ч `min-height`
       тэднийг жигд барина — орлуулагч хэрэггүй.

   Хамаарал байхгүй — зөвхөн Tailwind. Лого зураг дурын харьцаатай байж
   болох тул тогтмол өндөртэй хайрцагт `object-contain`-аар суудаг. */

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
  /** Брэндийн лого. Байвал брэндийн нэрийг орлоно. */
  logo?: string;
  /** Бүтээгдэхүүний зураг — картын баруун талд уусан суудаг. Хоосон бол
   *  карт зөвхөн бичвэрээр үлдэнэ (өндөр нь хэвээр). */
  image?: string;
  /** Нэмэлт тайлбар (2 мөрөөр таслагдана). */
  note?: string;
};

/* Зургийн зүүн ирмэгийг дэвсгэр рүү уусгах хөшиг. Safari 15.4-өөс өмнөх
   хувилбарт `-webkit-` угтвар хэрэгтэй тул хоёуланг нь өгнө. */
const FADE = "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.2) 30%, #000 72%)";
const fadeStyle = { WebkitMaskImage: FADE, maskImage: FADE } as const;

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
        /* Лого харагдаж байвал брэндийн нэрийг давхар бичихгүй —
           логоноос нь аль хэдийн уншигдана. */
        const meta = [item.logo ? null : item.brand, item.meta].filter(Boolean).join(" · ");

        return (
          <li
            key={item.id}
            className="relative flex min-h-[116px] items-center overflow-hidden rounded-2xl border border-night/10 bg-surface px-5 py-4 transition-colors duration-500 hover:border-night/25 sm:min-h-[132px] sm:px-6 sm:py-5"
          >
            {/* Бүтээгдэхүүний зураг — хүрээгүй, зүүн тийшээ уусна.
                `alt` нь ЗОРИУДААР хоосон: яг хажууд нь ангилал, брэнд,
                улс бичигдсэн тул дэлгэц уншигчид давхар сонсох хэрэггүй. */}
            {item.image && (
              <span
                aria-hidden
                style={fadeStyle}
                className="pointer-events-none absolute inset-y-0 right-0 w-1/2 select-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain object-right"
                />
              </span>
            )}

            <span
              className={cn(
                "relative flex flex-col",
                item.image ? "w-[56%]" : "w-full"
              )}
            >
              {item.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.logo}
                  alt={item.brand ?? item.category}
                  loading="lazy"
                  decoding="async"
                  className="mb-2.5 h-6 max-w-[130px] object-contain object-left"
                />
              )}

              <span className="block text-[15px] font-extrabold leading-snug tracking-tight text-night sm:text-[17px]">
                {item.category}
              </span>

              {meta && (
                <span className="mt-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-night/45 sm:text-[12px]">
                  {meta}
                </span>
              )}

              {item.note && (
                <span className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-night/60">
                  {item.note}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

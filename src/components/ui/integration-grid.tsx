"use client";

/* Integration grid — брэнд/нийлүүлэгчийн карт бүхий тор.

   Карт бүр: дээд талд лого (эсвэл логогүй үед брэндийн нэрийг
   типографик тэмдэг болгож харуулна), доор нь ангилал (ж: "Ханын
   залгуур"), нийлүүлэгч + улс, товч тайлбар.

   Хамаарал байхгүй — зөвхөн Tailwind. Лого зураг нь дурын харьцаатай
   байж болох тул тогтмол өндөртэй хайрцагт `object-contain`-аар суудаг;
   ингэснээр өргөн (wordmark) ба дөрвөлжин лого зэрэгцээд жигд харагдана. */

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
  /** Брэндийн лого. Хоосон бол брэндийн нэр wordmark болно. */
  logo?: string;
  /** Нэмэлт тайлбар (2 мөрөөр таслагдана). */
  note?: string;
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
    <ul className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col rounded-2xl border border-night/10 bg-ground/60 p-5 transition-colors duration-500 hover:border-night/25"
        >
          {/* Толгой — лого зураг, эсвэл брэндийн нэр (брэндгүй үед
              ангилал өөрөө) типографик тэмдэг болно. */}
          <span className="flex h-9 items-center">
            {item.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.logo}
                alt={item.brand ?? item.category}
                loading="lazy"
                decoding="async"
                className="h-full max-w-[150px] object-contain object-left"
              />
            ) : (
              <span className="text-[19px] font-extrabold uppercase leading-none tracking-tight text-night">
                {item.brand || item.category}
              </span>
            )}
          </span>

          {/* Толгойд брэнд гарсан үед л ангиллыг давхар бичнэ — эс бөгөөс
              нэг нэр хоёр удаа давтагдана. */}
          {item.brand && (
            <span className="mt-5 block text-[15px] font-extrabold leading-snug tracking-tight text-night">
              {item.category}
            </span>
          )}

          {(item.meta || (item.logo && item.brand)) && (
            <span
              className={cn(
                "block text-[12px] font-semibold uppercase tracking-[0.12em] text-night/45",
                item.brand ? "mt-1" : "mt-5"
              )}
            >
              {[item.logo ? item.brand : null, item.meta].filter(Boolean).join(" · ")}
            </span>
          )}

          {item.note && (
            <span className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-night/60">
              {item.note}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

"use client";

/* Integration grid — брэнд/нийлүүлэгчийн карт бүхий тор.

   Карт бүр: (заавал биш) бүтээгдэхүүний зураг картын өргөнөөр, доор нь
   лого (эсвэл логогүй үед брэндийн нэрийг типографик тэмдэг болгож
   харуулна), улмаар ангилал (ж: "Ханын залгуур"), нийлүүлэгч + улс,
   товч тайлбар.

   Зураг нь ЗАРИМ картад л байж болно (админ бүрд нь оруулах албагүй) —
   тиймээс зурагтай, зураггүй карт нэг мөрөнд зэрэгцэж болно. Тор
   `items-start` БИШ хэвээр: карт бүр мөрийнхөө өндрөөр сунаж, ирмэг нь
   жигд тэгш үлдэнэ. Хосолсон мөрөнд зураггүй картын доод хэсэг хоосон
   үлдэх нь бий — тор тахир болохоос энэ нь дээр, мөн бүх карт зураггүй
   (өгөгдмөл) үед харагдац огт өөрчлөгдөхгүй. Хамгийн цэвэр үр дүн нь
   БҮХ картад зураг өгөх, эсвэл огт үл өгөх — админд `/admin/site` дээр
   яг үүнийг зөвлөсөн байгаа.

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
  /** Бүтээгдэхүүний зураг — картын толгойд бүтэн өргөнөөр. Хоосон бол
   *  карт зураггүй, зөвхөн бичвэрээр үлдэнэ. */
  image?: string;
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
          className="flex flex-col overflow-hidden rounded-2xl border border-night/10 bg-ground/60 transition-colors duration-500 hover:border-night/25"
        >
          {/* Бүтээгдэхүүний зураг — картын дээд ирмэг хүртэл бүтнээрээ.
              Тогтмол 16/10 харьцаатай тул мөр доторх картуудын зургийн
              өндөр үргэлж таарна. `alt` нь ЗОРИУДААР хоосон: яг доор нь
              брэнд, ангилал, улс бичигдсэн байдаг тул дэлгэц уншигчид
              нэг зүйлийг хоёр удаа сонсох хэрэггүй. */}
          {item.image && (
            <span className="block aspect-[16/10] w-full overflow-hidden bg-night/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </span>
          )}

          <span className="flex flex-1 flex-col p-5">
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
          </span>
        </li>
      ))}
    </ul>
  );
}

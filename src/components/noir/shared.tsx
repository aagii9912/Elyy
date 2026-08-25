"use client";

/* `/noir` — theme дотор дахин ашиглагдах жижиг хэсгүүд.

   Бүх секц админаас (`/admin/site` → Дизайн) удирдагдах `data-bg` /
   `data-tone`-той: дэвсгэрийг нь солиход бичгийн өнгө автоматаар
   эргэдэг (`noir.css` доторх `[data-tone="light"]` дүрэм). */

import { useLenis } from "lenis/react";
import { externalHref } from "@/lib/links";

/** Админаас ирсэн цэсний хаягийг браузерт өгөхөд аюулгүй болгоно.
 *  Хуудасны доторх зангуу (`#…`) ба дотоод зам (`/…`) хэвээр; бусад нь
 *  `externalHref` шүүлтүүрээр дамжиж, `javascript:` мэт схем хаягдана
 *  (хоосон мөр = холбоосыг огт үзүүлэхгүй). */
export function navHref(raw: string): string {
  const value = (raw ?? "").trim();
  if (value.startsWith("#") || value.startsWith("/")) return value;
  return externalHref(value);
}

/** Хуудас доторх зангуу руу Lenis-ээр зөөлөн гүйлгэнэ. */
export function useAnchorGo(offset = -90) {
  const lenis = useLenis();
  return (e: React.MouseEvent, href: string) => {
    if (!href.startsWith("#")) return;
    const el = document.querySelector(href);
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset });
    else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  };
}

/** Бүлгийн дугаар/шошго — зүүн талдаа нимгэн зураастай. */
export function NoirChapter({ children }: { children: React.ReactNode }) {
  return <p className="nv-chapter">{children}</p>;
}

/** Нэг секцийн бүрхүүл. `bg` нь админы дизайны түлхүүр. */
export function NoirSection({
  id,
  bg,
  tone,
  className = "",
  children,
}: {
  id?: string;
  bg: string;
  tone: "light" | "dark";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} data-bg={bg} data-tone={tone} className={`nv-sec ${className}`.trim()}>
      <div className="nv-wrap">{children}</div>
    </section>
  );
}

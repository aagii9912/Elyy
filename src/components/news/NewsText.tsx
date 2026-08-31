/* Нийтлэлийн мөр доторх хэлбэржүүлэлт — тод, налуу, холбоос.
   Нийтлэлийн хуудас (server) болон админы урьдчилсан харагдац (client)
   хоёулаа үүнийг дуудна: нэг дүрмээр рендерлэгдэнэ. */

import { Fragment } from "react";
import type { NewsInline } from "@/lib/news";

export function NewsText({ spans }: { spans: NewsInline[] }) {
  return (
    <>
      {spans.map((s, i) =>
        s.kind === "bold" ? (
          <strong key={i} className="font-bold text-night">
            {s.text}
          </strong>
        ) : s.kind === "italic" ? (
          <em key={i} className="italic">
            {s.text}
          </em>
        ) : s.kind === "bolditalic" ? (
          <strong key={i} className="font-bold italic text-night">
            {s.text}
          </strong>
        ) : s.kind === "link" ? (
          <a
            key={i}
            href={s.href}
            data-cursor-hover
            className="font-semibold text-night underline decoration-moss/60 underline-offset-[3px] transition-colors duration-200 hover:decoration-moss"
            {...(s.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {s.text}
          </a>
        ) : (
          <Fragment key={i}>{s.text}</Fragment>
        )
      )}
    </>
  );
}

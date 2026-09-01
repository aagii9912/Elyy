/* Мэдээний карт — /news жагсаалт болон нийтлэлийн доод "бусад мэдээ". */

import Link from "next/link";
import { formatNewsDate, type NewsDoc } from "@/lib/news";
import { newsHref } from "@/lib/news-links";

export function NewsCard({ item, readMore }: { item: NewsDoc; readMore: string }) {
  return (
    <article data-reveal="up" className="group">
      <Link
        href={newsHref(item.slug)}
        data-cursor-hover
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-night/10 bg-surface transition-colors duration-300 hover:border-night/30"
      >
        <div className="relative overflow-hidden bg-night/5">
          {item.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.cover}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex aspect-[16/10] w-full items-center justify-center text-label font-semibold uppercase tracking-caps text-night/25">
              Elysium
            </div>
          )}
          {item.tag && (
            <span className="absolute left-4 top-4 rounded-full bg-night px-3 py-1 text-label font-bold uppercase tracking-caps-sm text-white">
              {item.tag}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          {item.date && (
            <p className="text-label font-semibold uppercase tracking-caps text-mist">
              {formatNewsDate(item.date)}
            </p>
          )}
          <h2 className="mt-2 text-xl font-extrabold leading-snug tracking-tight text-night">
            {item.title}
          </h2>
          {item.excerpt && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-night/60">{item.excerpt}</p>
          )}
          <p className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-caps-sm text-night">
            {readMore} <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </p>
        </div>
      </Link>
    </article>
  );
}

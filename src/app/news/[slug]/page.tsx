import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";
import { loadSiteContent } from "@/lib/site";
import { formatNewsDate, parseNewsBody } from "@/lib/news";
import { NEWS_PATH } from "@/lib/news-links";
import { MonoMotion } from "@/components/mono/MonoMotion";
import { MonoCursor } from "@/components/mono/MonoCursor";
import { MonoHeader } from "@/components/mono/MonoHeader";
import { MonoFooter } from "@/components/mono/MonoFooter";
import { NewsCard } from "@/components/news/NewsCard";

/* Нэг нийтлэл: /news/<slug>. Ноорогийг зөвхөн ?preview=1-тэй үзнэ. */
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getStore().getNewsBySlug(slug).catch(() => null);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover ? [post.cover] : undefined,
      type: "article",
    },
    robots: post.status !== "published" ? { index: false, follow: false } : undefined,
  };
}

export default async function NewsDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;

  const store = getStore();
  const post = await store.getNewsBySlug(slug).catch(() => null);
  if (!post) notFound();
  if (post.status !== "published" && preview !== "1") notFound();

  const [site, all] = await Promise.all([
    loadSiteContent(),
    store.listNews(true).catch(() => []),
  ]);

  const others = all.filter((n) => n.id !== post.id).slice(0, 3);
  const blocks = parseNewsBody(post.body);

  return (
    <div className="mono-page min-h-screen bg-white font-gilroy text-night">
      <MonoMotion />
      <MonoCursor />
      <MonoHeader site={site} variant="page" />

      <main className="pt-[104px] md:pt-[124px]">
        <article>
          {/* Толгой */}
          <header className="border-b border-night/10 bg-paper py-12 md:py-16">
            <div className="mx-auto max-w-[820px] px-5 md:px-10">
              <Link
                href={NEWS_PATH}
                data-cursor-hover
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-night/50 transition-colors hover:text-night"
              >
                <span aria-hidden>←</span> {site.news.backLabel}
              </Link>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-mist">
                {post.tag && (
                  <span className="rounded-full bg-night px-3 py-1 text-white">{post.tag}</span>
                )}
                {post.date && <span>{formatNewsDate(post.date)}</span>}
                {post.status !== "published" && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">Ноорог</span>
                )}
              </div>

              <h1 className="mt-4 text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.08] tracking-tight text-night">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-5 text-[17px] leading-relaxed text-night/65">{post.excerpt}</p>
              )}
            </div>
          </header>

          {post.cover && (
            <div className="mx-auto max-w-[1100px] px-5 pt-10 md:px-10 md:pt-14">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-reveal="zoom"
                src={post.cover}
                alt={post.title}
                decoding="async"
                className="w-full rounded-2xl border border-night/10 object-cover"
              />
            </div>
          )}

          {/* Агуулга */}
          <div className="mx-auto max-w-[820px] px-5 py-12 md:px-10 md:py-16">
            {blocks.map((block, i) =>
              block.kind === "heading" ? (
                <h2
                  key={i}
                  className="mt-10 text-[clamp(1.25rem,2.2vw,1.6rem)] font-extrabold tracking-tight text-night first:mt-0"
                >
                  {block.text}
                </h2>
              ) : block.kind === "list" ? (
                <ul key={i} className="mt-5 space-y-2.5">
                  {block.items.map((li, j) => (
                    <li key={j} className="flex gap-3 text-[16px] leading-relaxed text-night/75">
                      <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                      {li}
                    </li>
                  ))}
                </ul>
              ) : (
                <p key={i} className="mt-5 text-[16px] leading-relaxed text-night/75 first:mt-0">
                  {block.text}
                </p>
              )
            )}

            {/* CTA */}
            <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-night/10 pt-8">
              <Link
                href="/#contact"
                data-cursor-hover
                className="inline-flex items-center gap-2 rounded-full bg-night px-6 py-3.5 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5"
              >
                {site.nav.ctaLabel} <span aria-hidden>→</span>
              </Link>
              <Link
                href={NEWS_PATH}
                data-cursor-hover
                className="inline-flex items-center gap-2 rounded-full border border-night/25 px-6 py-3.5 text-sm font-bold text-night transition-colors hover:bg-night hover:text-white"
              >
                {site.news.backLabel}
              </Link>
            </div>
          </div>
        </article>

        {others.length > 0 && (
          <section className="border-t border-night/10 bg-paper py-14 md:py-20">
            <div className="mx-auto max-w-[1500px] px-5 md:px-10">
              <h2
                data-reveal="heading"
                className="text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold tracking-tight text-night"
              >
                {site.news.moreTitle}
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {others.map((item) => (
                  <NewsCard key={item.id} item={item} readMore={site.news.readMore} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <MonoFooter site={site} variant="page" />
    </div>
  );
}

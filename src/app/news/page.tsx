import type { Metadata } from "next";
import { getStore } from "@/lib/store";
import { loadSiteContent } from "@/lib/site";
import { MonoMotion } from "@/components/mono/MonoMotion";
import { MonoCursor } from "@/components/mono/MonoCursor";
import { MonoHeader } from "@/components/mono/MonoHeader";
import { MonoFooter } from "@/components/mono/MonoFooter";
import { MonoKicker } from "@/components/mono/shared";
import { NewsCard } from "@/components/news/NewsCard";

/* Мэдээний жагсаалт. Нийтлэл нэмэх/засахад `/api/admin/news` нь энэ
   замыг revalidate хийнэ; доорх нь зөвхөн нөөц хамгаалалт. */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSiteContent();
  return { title: site.news.title, description: site.news.sub };
}

export default async function NewsListPage() {
  const [site, news] = await Promise.all([
    loadSiteContent(),
    getStore()
      .listNews(true)
      .catch((e) => {
        console.error("[news] list:", e);
        return [];
      }),
  ]);

  return (
    <div className="mono-page min-h-screen bg-ground font-gilroy text-night">
      <MonoMotion />
      <MonoCursor />
      <MonoHeader site={site} variant="page" />

      <main className="pt-[104px] md:pt-[124px]">
        <section className="border-b border-night/10 bg-ground py-14 md:py-20">
          <div className="mx-auto max-w-[1500px] px-5 md:px-10">
            <MonoKicker reveal>{site.news.kicker}</MonoKicker>
            <h1
              data-reveal="heading"
              className="mt-4 max-w-3xl text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-[1.05] tracking-tight text-night"
            >
              {site.news.title}
            </h1>
            <p data-reveal="up" className="mt-5 max-w-xl text-[15px] leading-relaxed text-night/60">
              {site.news.sub}
            </p>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-[1500px] px-5 md:px-10">
            {news.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-night/20 py-20 text-center">
                <p className="text-sm text-night/50">{site.news.empty}</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {news.map((item) => (
                  <NewsCard key={item.id} item={item} readMore={site.news.readMore} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <MonoFooter site={site} variant="page" />
    </div>
  );
}

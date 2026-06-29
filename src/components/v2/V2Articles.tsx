"use client";

import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { ScrollText } from "@/components/v2/ScrollText";
import { useT } from "@/components/LangProvider";

const posts = [
  { src: "/images/exterior-garden-path.jpg", date: "2027 · Q2" },
  { src: "/images/amenity-playground.jpg", date: "2027 · Q2" },
  { src: "/images/exterior-elevation-dusk.jpg", date: "2027 · Q2" },
];

export function V2Articles() {
  const t = useT();
  return (
    <section id="articles" className="scroll-mt-20 bg-paper py-24 text-night md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="find-label text-night/50">{t.articles.kicker}</p>
            <ScrollText as="h2" text={t.articles.title} className="mt-5 find-display text-[clamp(2.25rem,5vw,4.5rem)]" />
          </div>
          <p className="max-w-sm text-night/60 md:text-right">{t.articles.body}</p>
        </div>

        <div className="mt-16 border-t border-night/15">
          {posts.map((post, i) => (
            <Reveal key={post.src} delay={i * 0.06}>
              <article className="group grid items-center gap-6 border-b border-night/15 py-8 md:grid-cols-[120px_1fr_360px] md:gap-10">
                <span className="text-sm text-night/45">{post.date}</span>
                <div>
                  <h3 className="find-display text-[clamp(1.4rem,2.4vw,2rem)]">{t.articles.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-night/55">{t.articles.soon}</p>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
                  <Image
                    src={post.src}
                    alt="Elysium"
                    fill
                    sizes="(max-width:768px) 100vw, 360px"
                    className="object-cover grayscale-[0.15] transition-[transform,filter] duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

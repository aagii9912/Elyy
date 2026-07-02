import { FEATURED } from "./data";
import { Reveal } from "./Reveal";
import { SectionHead } from "./ui";
import { ArrowUpRight } from "./icons";

export function FeaturedProjects() {
  return (
    <section id="projects" className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
      <SectionHead title={FEATURED.title} subtitle={FEATURED.subtitle} />

      <div className="mt-16 grid gap-x-6 gap-y-12 md:grid-cols-3">
        {FEATURED.items.map((p, i) => (
          <Reveal
            key={p.title}
            delay={i * 100}
            className={`group ${i === 1 ? "md:translate-y-14" : ""}`}
          >
            <div className="overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.title}
                className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
                  p.tall ? "aspect-[428/583]" : "aspect-[428/512]"
                }`}
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <h3 className="text-[0.95rem] font-medium uppercase tracking-[0.01em] text-acs-brown">
                {p.title}
              </h3>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-acs-brown/40 text-acs-brown transition-colors group-hover:bg-acs-brown group-hover:text-acs-cream">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-[0.72rem] uppercase tracking-[0.05em] text-acs-brown/70">
              {p.category}
            </p>
            <p className="mt-1 text-[0.72rem] uppercase tracking-[0.05em] text-acs-brown/70">
              {p.location}
            </p>
          </Reveal>
        ))}
      </div>

      <div className="mt-24 text-center md:mt-28">
        <a
          href="#projects"
          className="text-[0.85rem] uppercase tracking-[0.05em] text-acs-brown underline-offset-8 hover:underline"
        >
          {FEATURED.viewMore}
        </a>
      </div>
    </section>
  );
}

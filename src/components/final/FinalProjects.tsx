"use client";

import { Reveal } from "@/components/Reveal";
import { ProjectsCarousel, type ProjectItem } from "@/components/final/ProjectsCarousel";
import { FINAL } from "@/lib/content";

const projectImages = [
  "/images/aerial-masterplan.jpg",
  "/images/exterior-towers-winter.jpg",
  "/images/aerial-courtyard-water.jpg",
  "/images/exterior-lowangle-towers.jpg",
];

// Fallbacks in case a data field is missing (per client brief).
const FALLBACK: Omit<ProjectItem, "image">[] = [
  { title: "Комфорт хотхон", meta: "15 давхар · 600 айл", floors: 15, units: 600, years: "2014–2019" },
  { title: "Мандала хотхон", meta: "18 давхар · 510 айл", floors: 18, units: 510, years: "2015–2019" },
  { title: "Мандала гарден", meta: "16 давхар · 2500 айл", floors: 16, units: 2500, years: "2019–2030" },
  { title: "360, 365 Мандала Тауэр", meta: "25 давхар · 200 айл", floors: 25, units: 200, years: "2018–2025" },
];

export function FinalProjects() {
  const { kicker, name, since, projectCount, body, projects } = FINAL.developer;

  const source = projects && projects.length ? projects : FALLBACK;
  const items: ProjectItem[] = source.map((p, i) => ({
    title: p.title ?? FALLBACK[i % FALLBACK.length].title,
    meta: p.meta ?? FALLBACK[i % FALLBACK.length].meta,
    floors: p.floors ?? FALLBACK[i % FALLBACK.length].floors,
    units: p.units ?? FALLBACK[i % FALLBACK.length].units,
    years: p.years ?? FALLBACK[i % FALLBACK.length].years,
    image: projectImages[i % projectImages.length],
  }));

  return (
    <section id="developer" className="scroll-mt-20 overflow-hidden bg-sand py-24 font-gilroy text-ink md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        <Reveal>
          <p className="fnl-kicker text-moss">{kicker}</p>
          <h2 className="mt-4 text-[clamp(1.9rem,4.5vw,3.5rem)] font-extrabold leading-[1.02] tracking-tight">{name}</h2>
          <p className="mt-6 max-w-2xl leading-relaxed text-ink/70 md:text-lg">{body}</p>

          {/* Developer credentials — 2006 оноос, 60+ төсөл */}
          <div className="mt-9 flex flex-wrap items-stretch gap-x-10 gap-y-6">
            <div>
              <p className="text-[clamp(1.9rem,3.4vw,2.75rem)] font-extrabold leading-none tracking-tight text-ink">
                {since}
              </p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-moss">оноос хойш</p>
            </div>
            <span aria-hidden className="w-px self-stretch bg-ink/15" />
            <div>
              <p className="text-[clamp(1.9rem,3.4vw,2.75rem)] font-extrabold leading-none tracking-tight text-ink">
                {projectCount}
              </p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-moss">төсөл хэрэгжүүлсэн</p>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-14 md:mt-20">
        <div className="mx-auto max-w-[1500px] px-5 md:px-8">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.14em] text-moss">Хэрэгжүүлсэн төслүүд</p>
          <ProjectsCarousel projects={items} />
        </div>
      </Reveal>
    </section>
  );
}

import { PROCESS } from "./data";
import { Reveal } from "./Reveal";
import { SectionHead } from "./ui";
import { PROCESS_ICONS } from "./icons";

export function Process() {
  return (
    <section id="process" className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
      <SectionHead title={PROCESS.title} subtitle={PROCESS.subtitle} />

      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PROCESS.items.map((p, i) => {
          const Icon = PROCESS_ICONS[p.icon];
          return (
            <Reveal
              key={p.title}
              delay={i * 90}
              className="group relative aspect-[323/331] overflow-hidden rounded-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25" />

              {/* Top row: tag + number, icon button */}
              <div className="absolute inset-x-4 top-4 flex items-start justify-between">
                <div className="text-acs-cream/90">
                  <div className="text-[0.68rem] uppercase tracking-[0.08em]">{p.tag}</div>
                  <div className="mt-0.5 text-[0.68rem] tracking-[0.08em]">{p.num}</div>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-acs-cream/90 text-acs-brown backdrop-blur-sm">
                  <Icon className="h-5 w-5" />
                </span>
              </div>

              {/* Bottom: title + desc */}
              <div className="absolute inset-x-5 bottom-5 text-acs-cream">
                <h3 className="text-[1.15rem] font-medium uppercase tracking-[-0.01em]">
                  {p.title}
                </h3>
                <p className="mt-2 text-[0.72rem] leading-snug text-acs-cream/85">
                  {p.desc}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

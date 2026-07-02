import { STATS } from "./data";

export function StatsMarquee() {
  // duplicate the sequence so the -50% translate loops seamlessly
  const sequence = [...STATS, ...STATS];
  return (
    <section className="overflow-hidden border-y border-acs-brown/12 py-8">
      <div className="acs-marquee-track">
        {sequence.map((stat, i) => (
          <span key={i} className="flex items-center">
            <span className="px-8 text-[clamp(1.1rem,1.8vw,1.5rem)] uppercase tracking-[0.01em] text-acs-brown">
              {stat}
            </span>
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full border border-acs-brown/50"
            />
          </span>
        ))}
      </div>
    </section>
  );
}

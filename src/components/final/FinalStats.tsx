"use client";

import { Counter } from "@/components/Counter";
import { Reveal } from "@/components/Reveal";
import { FINAL } from "@/lib/content";

/* Caption shared with every stat — 15px / 300 / 0.6px tracking / 1.25 lh
   (extreme scale contrast vs. the monumental numeral, per ref image23). */
const CAPTION =
  "mt-6 text-[15px] font-light leading-[1.25] tracking-[0.6px] text-bone/70";

/* One monumental BOLD numeral (Gilroy font-black — client overrides the
   reference serif-300) with its suffix rendered smaller BESIDE it in a
   flex row with a tiny gap. Count-up motion preserved. */
function StatNumeral({ value, suffix }: { value: number; suffix?: string }) {
  return (
    <div className="flex items-baseline font-black leading-[1.23] tracking-[-0.02em] text-bone [font-size:clamp(6.5rem,9.4vw,8.5rem)]">
      <Counter value={value} className="block" />
      {suffix ? (
        <span className="ml-[0.06em] self-end pb-[0.22em] text-[0.28em] font-light not-italic leading-none text-bone/60">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

export function FinalStats() {
  const { kicker, items } = FINAL.stats;
  const [anchor, ...rest] = items; // anchor = huge numeral bottom-left

  return (
    <section
      id="plan"
      className="scroll-mt-20 bg-charcoal py-28 font-gilroy text-bone md:py-44"
    >
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        <Reveal>
          <p className="fnl-kicker text-bone/55">{kicker}</p>
        </Reveal>

        {/* Asymmetric composition (ref image23): the two smaller numerals sit
            offset up-right, the monumental anchor drops to a low left baseline.
            NOT a uniform 3-col grid with equal baselines. */}
        <div className="relative mt-16 md:mt-24">
          {/* Up-right cluster */}
          <div className="grid grid-cols-1 gap-x-16 gap-y-16 sm:grid-cols-2 md:ml-auto md:w-[62%] md:gap-y-0">
            {rest.map((item, i) => (
              <Reveal
                key={item.label}
                delay={0.15 + i * 0.12}
                className={i === 1 ? "sm:mt-16 md:mt-24" : ""}
              >
                <StatNumeral value={item.value ?? 0} suffix={item.suffix} />
                <p className={`${CAPTION} max-w-[26ch]`}>{item.label}</p>
              </Reveal>
            ))}
          </div>

          {/* Monumental anchor, low & left */}
          {anchor ? (
            <Reveal delay={0.05} className="mt-16 md:mt-40 md:w-[55%]">
              <StatNumeral value={anchor.value ?? 0} suffix={anchor.suffix} />
              <p className={`${CAPTION} max-w-[30ch]`}>{anchor.label}</p>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

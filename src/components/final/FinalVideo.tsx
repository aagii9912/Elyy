"use client";

import { useRef, useState } from "react";
import { Reveal } from "@/components/Reveal";

const VIDEO_SRC = "/video/hero-source.mp4";
const POSTER = "/hero-frames/frame_001.jpg";

export function FinalVideo() {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  const play = () => {
    setPlaying(true);
    ref.current?.play();
  };

  return (
    <section id="video" className="bg-charcoal py-24 font-gilroy md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        <Reveal>
          <p className="fnl-kicker text-bone/55">Танилцуулга</p>
          <h2 className="mt-4 max-w-2xl text-[clamp(2rem,5vw,4rem)] font-extrabold leading-[0.98] tracking-tight text-bone">
            Elysium-ийг нэг хормоор
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="relative mt-12 aspect-video w-full overflow-hidden rounded-3xl bg-ink md:mt-16">
          <video
            ref={ref}
            src={VIDEO_SRC}
            poster={POSTER}
            controls={playing}
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />

          {!playing && (
            <button
              type="button"
              onClick={play}
              data-cursor-hover
              aria-label="Танилцуулга видео"
              className="group absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/35 transition-colors hover:bg-black/45"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-bone/70 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 md:h-24 md:w-24">
                <span className="ml-1.5 inline-block border-y-[13px] border-l-[22px] border-y-transparent border-l-bone" aria-hidden />
              </span>
              <span className="text-sm font-semibold uppercase tracking-[0.22em] text-bone">
                Видео үзэх
              </span>
            </button>
          )}
        </Reveal>
      </div>
    </section>
  );
}

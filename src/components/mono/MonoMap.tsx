/* /mono — Байршил. Interactive Google map in a quiet frame + clean
   landmark chips with drive minutes. */

import { MonoKicker } from "./shared";

const LANDMARKS = [
  { minutes: 1, place: "Үндэсний цэцэрлэгт хүрээлэн" },
  { minutes: 2, place: "Мишээл" },
  { minutes: 3, place: "Их дэлгүүр" },
  { minutes: 8, place: "Сүхбаатарын талбай" },
  { minutes: 12, place: "Зайсан" },
  { minutes: 25, place: "Чингис хаан ОУНБ" },
];

const MAP_SRC =
  "https://www.google.com/maps?q=National%20Garden%20Park%2C%20Ulaanbaatar&z=14&output=embed";
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=National+Garden+Park+Ulaanbaatar";

export function MonoMap() {
  return (
    <section id="location" className="border-b border-night/10 bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <MonoKicker>Байршил</MonoKicker>
            <h2 className="mt-4 max-w-xl text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-night">
              Хотын төвд, байгалийн хажууд
            </h2>
          </div>
          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener"
            data-cursor-hover
            className="inline-flex items-center gap-2 self-start rounded-full border border-night/25 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-night transition-colors hover:bg-night hover:text-white md:self-auto"
          >
            Чиглэл авах ↗
          </a>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-night/10 bg-white">
            <iframe
              title="Elysium Residence — байршил"
              src={MAP_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[320px] w-full grayscale-[0.25] md:h-[440px]"
            />
          </div>

          <ul className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {LANDMARKS.map((l) => (
              <li
                key={l.place}
                className="flex items-center gap-4 rounded-xl border border-night/10 bg-white px-4 py-3.5 transition-colors hover:border-night/30"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-night text-sm font-extrabold text-white">
                  {l.minutes}
                </span>
                <div>
                  <p className="text-sm font-bold text-night">{l.place}</p>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-night/50">мин машинаар</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

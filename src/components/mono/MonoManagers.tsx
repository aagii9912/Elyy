/* /mono — Борлуулалтын менежерүүд. Placed right before the FAQ:
   2–3 profiles with a direct-call button and a Viber deep link so a
   lead can reach a human in one tap. Initials avatars stand in until
   Монкон supplies real portraits; names/numbers are placeholders the
   sales team should replace in this file. */

import { MonoKicker } from "./shared";

type Manager = {
  name: string;
  initials: string;
  role: string;
  /** Display form, e.g. "7786-2222". */
  phone: string;
};

const MANAGERS: Manager[] = [
  { name: "Б. Анужин", initials: "БА", role: "Ахлах борлуулалтын менежер", phone: "7786-2222" },
  { name: "Д. Тэмүүлэн", initials: "ДТ", role: "Борлуулалтын менежер", phone: "7786-2222" },
  { name: "С. Номин", initials: "СН", role: "Борлуулалтын менежер", phone: "7786-2222" },
];

const digits = (phone: string) => `976${phone.replace(/[^0-9]/g, "")}`;

export function MonoManagers() {
  return (
    <section id="managers" className="border-b border-night/10 bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <MonoKicker reveal>Борлуулалтын баг</MonoKicker>
            <h2 data-reveal="heading" className="mt-4 max-w-xl text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-night">
              Менежертэй шууд холбогдох
            </h2>
          </div>
          <p data-reveal="up" data-reveal-delay="0.15" className="max-w-sm text-sm leading-relaxed text-night/60">
            Даваа–Ням · 09:00–18:00 цагт залгах эсвэл Viber-ээр бичээрэй — менежер тантай
            шууд ярилцаж, үзүүлэх цагийг тохирно.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MANAGERS.map((m) => (
            <article
              key={m.name}
              data-reveal="up"
              className="group flex flex-col rounded-2xl border border-night/10 bg-white p-7 transition-colors duration-300 hover:border-night/30"
            >
              <div className="flex items-center gap-4">
                <span
                  aria-hidden
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-night text-base font-extrabold text-white ring-2 ring-transparent transition-shadow duration-300 group-hover:ring-lime"
                >
                  {m.initials}
                </span>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-night">{m.name}</h3>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-night/50">
                    {m.role}
                  </p>
                </div>
              </div>

              <a
                href={`tel:+${digits(m.phone)}`}
                data-cursor-hover
                className="mt-6 text-2xl font-extrabold tracking-tight text-night transition-opacity hover:opacity-60"
              >
                {m.phone}
              </a>

              <div className="mt-5 flex gap-2.5">
                <a
                  href={`tel:+${digits(m.phone)}`}
                  data-cursor-hover
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-night px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Залгах
                </a>
                <a
                  href={`viber://chat?number=%2B${digits(m.phone)}`}
                  data-cursor-hover
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-night/25 px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-night transition-colors duration-300 hover:bg-night hover:text-white"
                >
                  Viber
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* /mono — Борлуулалтын менежерүүд. Placed right before the FAQ:
   2–3 profiles with a direct-call button and a Viber deep link so a
   lead can reach a human in one tap. A portrait sits at the top of the
   card when one is uploaded; without it the card falls back to the
   initials avatar. Photos/names/numbers are edited from the admin
   (`/admin/site` → Борлуулалтын баг). */

import type { SiteContent } from "@/lib/site-content";
import { MonoKicker } from "./shared";
import { sectionTone } from "@/lib/theme-css";

const digits = (phone: string) => `976${phone.replace(/[^0-9]/g, "")}`;

export function MonoManagers({ site }: { site: SiteContent }) {
  const { managers } = site;

  /* Цагийн хуваарь #contact дээр аль хэдийн гарсан — дараалсан хоёр секц
     ижил мөрийг давтахгүй. Админд өөр хуваарь бичвэл мөр хэвээр гарна. */
  const sameHours =
    managers.hours.trim() !== "" && managers.hours.trim() === site.contact.hours.trim();
  const showHours = !sameHours && Boolean(managers.hoursLabel || managers.hours);

  return (
    <section
      id="managers"
      data-bg="managers"
      data-tone={sectionTone(site.theme, "managers", "light")}
      className="border-b border-fg/10 bg-ground py-24 md:py-28"
    >
      <div className="mx-auto max-w-[1500px] px-6 md:px-10">
        {/* тайлбар нь гарчгийн доор — баруун талын багана нь гарчгаас дээш
            гарч, хэсгийн навигацитай мөргөлддөг байв */}
        <div className="max-w-2xl">
          <MonoKicker reveal>{managers.kicker}</MonoKicker>
          <h2 data-reveal="heading" className="mt-4 mono-h2">
            {managers.title}
          </h2>
          <p data-reveal="up" data-reveal-delay="0.15" className="mt-5 mono-lead">
            {managers.body}
          </p>
          {showHours && (
            <div data-reveal="up" data-reveal-delay="0.2" className="mt-5 border-t border-fg/10 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg/45">
                {managers.hoursLabel}
              </p>
              <p className="mt-1 text-sm font-bold text-fg">{managers.hours}</p>
            </div>
          )}
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {managers.items.map((m, i) => (
            <article
              key={`${m.name}-${i}`}
              data-reveal="up"
              className="group flex flex-col rounded-2xl border border-fg/10 bg-surface p-7 transition-colors duration-300 hover:border-fg/30"
            >
              {m.photo && (
                /* Хөрөг бүр өөр өндөртэй тул зургийн харьцаагаар биш,
                   тогтмол 1:1 хайрцагт `cover`-оор тайрна. Дээд захаас нь
                   авбал нүүр/бие багтаж, хөл нь хасагдана. */
                <div className="relative mb-5 aspect-square w-40 overflow-hidden rounded-xl bg-night/5 sm:w-44">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.photo}
                    alt={m.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full origin-top object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
              )}

              <div className="flex items-center gap-4">
                {!m.photo && (
                  <span
                    aria-hidden
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-night text-base font-extrabold text-white ring-2 ring-transparent transition-shadow duration-300 group-hover:ring-lime"
                  >
                    {m.initials}
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-fg">{m.name}</h3>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg/50">
                    {m.role}
                  </p>
                </div>
              </div>

              {/* `mt-auto` — зурагтай/зураггүй картууд холилдсон ч холбоо
                  барих блок бүгд картын доод захад тэгширнэ. */}
              <a
                href={`tel:+${digits(m.phone)}`}
                data-cursor-hover
                className="mt-auto pt-6 text-2xl font-extrabold tracking-tight text-fg transition-opacity duration-300 hover:opacity-60"
              >
                {m.phone}
              </a>

              <div className="mt-5 flex gap-2.5">
                <a
                  href={`tel:+${digits(m.phone)}`}
                  data-cursor-hover
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-night px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {managers.callLabel}
                </a>
                <a
                  href={`viber://chat?number=%2B${digits(m.phone)}`}
                  data-cursor-hover
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-fg/25 px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-fg transition-colors duration-300 hover:bg-night hover:text-white"
                >
                  {managers.viberLabel}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

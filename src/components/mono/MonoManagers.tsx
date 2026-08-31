/* /mono — Борлуулалтын менежерүүд. Placed right before the FAQ:
   2–3 profiles a lead can reach in one tap — the phone number itself is
   the call link, with a Viber deep link beside it.

   Картын тор биш, ҮС ЗУРААСАН ЖАГСААЛТ: яг доор нь ирэх FAQ нь ижил
   `divide-y` хэлээр, ижил 1100px хэмжээгээр бичигдсэн тул хоёр хэсэг
   нэг амьсгалаар уншигдана. Мөн менежер 3 ч бай 8 ч бай тор эвдрэхгүй,
   хөрөг байгаа/байхгүй нь мөрийн өндрийг өөрчлөхгүй — хөрөг нь
   `/admin/site`-аас ордог тул бүгд ижил хэмжээтэй байх баталгаа алга.

   Photos/names/numbers are edited from the admin
   (`/admin/site` → Борлуулалтын баг). */

import type { SiteContent } from "@/lib/site-content";
import { MonoKicker } from "./shared";
import { flatSectionTone } from "@/lib/theme-css";

const digits = (phone: string) => `976${phone.replace(/[^0-9]/g, "")}`;

/* Дүрс тэмдгүүд нь эмодзи биш, зурааст SVG — брэндийн бусад тэмдэгтэй
   ижил жинтэй, өнгө нь `currentColor`-оор хэсгийн tone-ыг дагана. */
const PhoneIcon = () => (
  <svg
    aria-hidden
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" />
  </svg>
);

const ChatIcon = () => (
  <svg
    aria-hidden
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.6 9.6 0 0 1-2.7-.4L4 21l1.4-3.9A8.2 8.2 0 0 1 3 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 9 8.4Z" />
  </svg>
);

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
      data-tone={flatSectionTone(site.theme, "managers")}
      className="border-b border-fg/10 bg-ground py-24 md:py-28"
    >
      {/* Хэмжээ нь доорх FAQ-тэй ижил 1100px — 1500px дээр мөрийн нэр,
          дугаар хоёрын хооронд эзгүй талбай үлддэг. Ингэснээр хуудас
          #contact (1500) → #managers → #faq (1100) гэж зөөлөн нарийсна. */}
      <div className="mx-auto max-w-[1100px] px-6 md:px-10">
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

        {/* FAQ-тэй нэг ижил хүрээ: дээд/доод зураас + мөр хооронд нь үс зураас */}
        <div className="mt-12 divide-y divide-fg/10 border-y border-fg/10">
          {managers.items.map((m, i) => (
            <div
              key={`${m.name}-${i}`}
              data-reveal="up"
              className="group grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-4 gap-y-5 py-6 lg:grid-cols-[88px_minmax(0,1fr)_190px_132px] lg:gap-7 lg:py-7"
            >
              {/* Хөрөг нь дугуй хүрээнд. Дэвсгэр нь брэндийн гүн ногоон тул
                  арчигдсан cut-out хөргүүд гурвуулаа нэг ижил дэвсгэр дээрх
                  силуэт болж уншигдана — мөн хэсгийн tone цайвар, хар аль
                  ч үед адилхан ажиллана. `object-top` нь ямар ч харьцаатай
                  хөргийн ТОЛГОЙГ хасахгүй хамгийн найдвартай тулгуур.
                  Хөрөг ороогүй үед мөн ЯГ ТЭР дугуйд товчлол гарах тул
                  мөрийн өндөр өөрчлөгдөхгүй. */}
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-charcoal lg:h-[88px] lg:w-[88px]">
                {m.photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={m.photo}
                    alt={m.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full origin-top object-cover object-top transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center text-base font-extrabold text-white/90 lg:text-xl"
                  >
                    {m.initials}
                  </span>
                )}
              </span>

              <div className="min-w-0">
                <h3 className="text-lg font-extrabold tracking-tight text-fg lg:text-[22px]">{m.name}</h3>
                <p className="mt-1 text-[11px] font-semibold uppercase leading-snug tracking-[0.14em] text-fg/50">
                  {m.role}
                </p>
              </div>

              {/* Хоёр үйлдэл нэг мөрөнд зэрэгцэнэ. 320px дээр нэрийн доор
                  шахагдвал дугаар тасарч хоёр мөр болдог тул хамгийн
                  нарийн дэлгэцэд мөрийн БҮТЭН өргөнийг эзэлнэ; `sm`-ээс
                  дээш нэрийн доор шилжиж, `lg` дээр `contents` нь энэ
                  савыг уусгаад холбоосуудыг мөрийн 3, 4-р багана болгоно. */}
              <div className="col-span-2 flex flex-wrap items-center gap-3 sm:col-span-1 sm:col-start-2 lg:contents">
                <a
                  href={`tel:+${digits(m.phone)}`}
                  aria-label={`${m.name} — ${managers.callLabel} ${m.phone}`}
                  data-cursor-hover
                  className="inline-flex min-h-11 items-center gap-2.5 whitespace-nowrap text-xl font-extrabold tracking-tight text-fg transition-opacity duration-300 hover:opacity-60 lg:text-[22px]"
                >
                  <PhoneIcon />
                  {m.phone}
                </a>
                <a
                  href={`viber://chat?number=%2B${digits(m.phone)}`}
                  aria-label={`${m.name} — ${managers.viberLabel}`}
                  data-cursor-hover
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-fg/25 px-5 text-[12px] font-bold uppercase tracking-[0.08em] text-fg transition-colors duration-300 hover:bg-night hover:text-white lg:w-full lg:px-0"
                >
                  <ChatIcon />
                  {managers.viberLabel}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

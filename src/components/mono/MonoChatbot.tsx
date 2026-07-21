"use client";

/* /mono — AI туслах. Төслийн мэдээлэл дээр суурилсан чатбот.
   Keyword-суурьлагдсан (client-side); бодит LLM endpoint холбохдоо
   answer() функцийг солино. Monochrome panel, lime avatar accent. */

import { useEffect, useRef, useState } from "react";
import { FINAL } from "@/lib/content";

type Msg = { from: "bot" | "user"; text: string };

const GREETING =
  "Сайн байна уу! Би Elysium Residence-ийн туслах. Байршил, өрөөний сонголт, ашиглалтад орох хугацааны талаар асуугаарай.";

const KB: { keys: string[]; a: string }[] = [
  {
    keys: ["байршил", "хаана", "байр", "map", "зураг"],
    a: `Төсөл ${FINAL.contact.location} оршино. Үндэсний цэцэрлэгт хүрээлэн 1 мин, Мишээл 2 мин, Их дэлгүүр 3 мин машины замтай.`,
  },
  {
    keys: ["хэзээ", "ашиглалт", "хугацаа", "бэлэн болох", "2027"],
    a: `${FINAL.about.completionLabel}: ${FINAL.about.completion}.`,
  },
  {
    keys: ["өрөө", "мкв", "м²", "талбай", "сонголт", "загвар"],
    a: `1 өрөө 38–52 м², 2 өрөө 58–74 м², 3 өрөө 82–104 м², 4 өрөө 110 м²-аас дээш талбайтай. "Өрөөний сонголт" хэсгээс дэлгэрэнгүйг үзнэ үү.`,
  },
  {
    keys: ["үнэ", "ханш", "зээл", "төлбөр", "өртөг", "скидк", "хөнгөлөлт"],
    a: `Үнийн мэдээллийг борлуулалтын менежер танд тохирох өрөөний төлөвлөгөөний хамт тодруулж өгнө. Утас: ${FINAL.contact.phone}.`,
  },
  {
    keys: ["блок", "айл", "506", "хэд"],
    a: "Нийт 4 блок, 506 айлын орон сууцтай. Нийт талбайн 85% нь нийтийн эзэмшлийн ногоон орон зай.",
  },
  {
    keys: ["зогсоол", "машин", "паркинг"],
    a: "513 автомашины зогсоолтой — айл бүрд хангалттай хуваарилна.",
  },
  {
    keys: ["монкон", "хэрэгжүүлэгч", "барилгачин", "компани"],
    a: `${FINAL.developer.name} — ${FINAL.developer.since} оноос хойш ${FINAL.developer.projectCount} гаруй төсөл хэрэгжүүлсэн (Мандала хотхон, Мандала гарден, 360/365 Мандала Тауэр г.м.).`,
  },
  {
    keys: ["уулзалт", "захиалга", "үзлэг", "бүртгэл"],
    a: `Доорх "Уулзалт товлох" хэсэгт нэр, утас, огноогоо үлдээхэд манай менежер холбогдоно. Эсвэл шууд ${FINAL.contact.phone} руу залгана уу.`,
  },
  {
    keys: ["ногоон", "цэцэрлэг", "green"],
    a: "Нийт талбайн 85% нь нийтийн эзэмшлийн ногоон байгууламж — Үндэсний цэцэрлэгт хүрээлэнтэй зэрэгцдэг.",
  },
  {
    keys: ["гадаад", "гадаадаас", "зайнаас"],
    a: "Тийм — цахим үзлэг, онлайн захиалга, зайнаас гэрээ байгуулах боломжтой. Менежер таньд тусална: " + FINAL.contact.phone,
  },
];

const QUICK = ["Үнэ хэд вэ?", "Байршил хаана вэ?", "Хэзээ ашиглалтад орох вэ?", "Өрөөний сонголт"];

function answer(q: string): string {
  const t = q.toLowerCase();
  for (const item of KB) {
    if (item.keys.some((k) => t.includes(k))) return item.a;
  }
  if (t.includes("сайн") || t.includes("hello") || t.includes("hi")) {
    return "Сайн байна уу! Танд юугаар туслах вэ?";
  }
  return `Уучлаарай, тодорхой ойлгосонгүй. Борлуулалтын менежер дэлгэрэнгүй хариулна: ${FINAL.contact.phone}. Эсвэл доорх сэдвүүдээс сонгоно уу.`;
}

export function MonoChatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: GREETING }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, open]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMsgs((m) => [...m, { from: "user", text: q }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      setMsgs((m) => [...m, { from: "bot", text: answer(q) }]);
      setTyping(false);
    }, 550);
  };

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        aria-label={open ? "Чатыг хаах" : "Чат нээх"}
        onClick={() => setOpen((v) => !v)}
        data-cursor-hover
        className="fixed bottom-5 right-5 z-[70] flex items-center justify-center rounded-full bg-night text-white shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:-translate-y-1 md:bottom-7 md:right-7"
        style={{ height: 52, width: 52 }}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Panel */}
      <div
        className={`fixed bottom-[86px] right-4 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-night/10 bg-white shadow-2xl transition-all duration-300 md:right-7 ${
          open ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0"
        }`}
        role="dialog"
        aria-label="Elysium туслах"
      >
        <div className="flex items-center gap-3 border-b border-white/10 bg-night px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime text-sm font-bold text-night">E</span>
          <div>
            <p className="text-sm font-bold text-white">Elysium туслах</p>
            <p className="text-[11px] text-white/55">Төслийн мэдээлэл дээр суурилсан</p>
          </div>
        </div>

        <div ref={listRef} className="flex max-h-[46vh] min-h-[220px] flex-col gap-3 overflow-y-auto px-4 py-4">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
                m.from === "bot"
                  ? "self-start rounded-bl-md bg-paper text-night"
                  : "self-end rounded-br-md bg-night font-medium text-white"
              }`}
            >
              {m.text}
            </div>
          ))}
          {typing && (
            <div className="flex gap-1.5 self-start rounded-2xl rounded-bl-md bg-paper px-4 py-3">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-night/60"
                  style={{ animationDelay: `${d * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              data-cursor-hover
              className="rounded-full border border-night/20 px-3 py-1.5 text-[12px] font-medium text-night/70 transition-colors hover:border-night hover:text-night"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-night/10 px-4 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Асуултаа бичнэ үү…"
            className="flex-1 bg-transparent text-sm text-night placeholder:text-night/40 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Илгээх"
            data-cursor-hover
            className="flex h-9 w-9 items-center justify-center rounded-full bg-night text-white transition-transform hover:scale-105"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M4 12h15M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}

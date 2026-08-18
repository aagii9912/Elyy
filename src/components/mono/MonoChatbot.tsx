"use client";

/* /mono — AI туслах. Төслийн мэдээлэл дээр суурилсан чатбот.
   Keyword-суурьлагдсан (client-side); мэндчилгээ, түлхүүр үг, хариултууд
   нь админаас (`/admin/site` → Чатбот) удирдагдана. Бодит LLM endpoint
   холбохдоо answerFrom() функцийг солино. Monochrome panel, lime avatar
   accent. */

import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/lib/site-content";

type Msg = { from: "bot" | "user"; text: string };

/** Түлхүүр үгээр хариулт хайна. Түлхүүрүүд таслалаар тусгаарлагдана. */
function answerFrom(chatbot: SiteContent["chatbot"], q: string): string {
  const t = q.toLowerCase();
  for (const item of chatbot.answers) {
    const keys = item.keys
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    if (keys.some((k) => t.includes(k))) return item.a;
  }
  return chatbot.fallback;
}

export function MonoChatbot({ site }: { site: SiteContent }) {
  const { chatbot } = site;
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: chatbot.greeting }]);
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
      setMsgs((m) => [...m, { from: "bot", text: answerFrom(chatbot, q) }]);
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
        aria-label={chatbot.title}
      >
        <div className="flex items-center gap-3 border-b border-white/10 bg-night px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime text-sm font-bold text-night">E</span>
          <div>
            <p className="text-sm font-bold text-white">{chatbot.title}</p>
            <p className="text-[11px] text-white/55">{chatbot.subtitle}</p>
          </div>
        </div>

        <div ref={listRef} className="flex max-h-[46vh] min-h-[220px] flex-col gap-3 overflow-y-auto px-4 py-4">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
                m.from === "bot"
                  ? "self-start rounded-bl-md bg-night/5 text-night"
                  : "self-end rounded-br-md bg-night font-medium text-white"
              }`}
            >
              {m.text}
            </div>
          ))}
          {typing && (
            <div className="flex gap-1.5 self-start rounded-2xl rounded-bl-md bg-night/5 px-4 py-3">
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
          {chatbot.quick.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              data-cursor-hover
              className="rounded-full border border-night/20 px-3 py-1.5 text-[12px] font-medium text-night/70 transition-colors duration-300 hover:border-night hover:text-night"
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
            placeholder={chatbot.placeholder}
            className="min-h-11 flex-1 bg-transparent text-sm text-night placeholder:text-night/40 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Илгээх"
            data-cursor-hover
            className="flex h-9 w-9 items-center justify-center rounded-full bg-night text-white transition-transform duration-300 hover:scale-105"
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

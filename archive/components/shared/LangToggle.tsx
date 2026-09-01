"use client";

import { LANGS } from "@/lib/content";
import { useLang } from "./LangProvider";

export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`flex items-center gap-1 text-xs tracking-wide ${className}`}>
      {LANGS.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="mx-1 opacity-40">/</span>}
          <button
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={`uppercase transition-opacity ${
              lang === l ? "opacity-100 underline underline-offset-4" : "opacity-50 hover:opacity-90"
            }`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}

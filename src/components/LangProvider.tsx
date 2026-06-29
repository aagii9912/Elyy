"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_LANG, DICT, type Dict, type Lang } from "@/lib/content";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
const LangContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "elysium-lang";

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Restore saved preference after mount (default stays MN for SSR).
  useEffect(() => {
    const saved = (typeof window !== "undefined" &&
      window.localStorage.getItem(STORAGE_KEY)) as Lang | null;
    if (saved === "mn" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: DICT[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}

/** Shortcut to the active dictionary. */
export function useT(): Dict {
  return useLang().t;
}

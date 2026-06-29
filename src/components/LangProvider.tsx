"use client";

import { createContext, useContext } from "react";
import type { Lang } from "@/lib/i18n";

export const LangContext = createContext<Lang>("en");
export const useLang = () => useContext(LangContext);

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}
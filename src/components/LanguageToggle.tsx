"use client";

import { useRouter } from "next/navigation";
import { useLang } from "./LangProvider";
import type { Lang } from "@/lib/i18n";

export function LanguageToggle() {
  const lang = useLang();
  const router = useRouter();

  function setLang(newLang: Lang) {
    document.cookie = `lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-xs font-semibold">
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 rounded transition ${
          lang === "en" ? "text-white bg-slate-700" : "text-slate-500 hover:text-slate-300"
        }`}
      >
        EN
      </button>
      <span className="text-slate-700">|</span>
      <button
        onClick={() => setLang("el")}
        className={`px-2 py-1 rounded transition ${
          lang === "el" ? "text-white bg-slate-700" : "text-slate-500 hover:text-slate-300"
        }`}
      >
        EL
      </button>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useLang } from "./LangProvider";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function getCookieValue(name: string): string | undefined {
  return document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")[1];
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

function loadGA(id: string) {
  if (document.getElementById("ga-script")) return;
  const s1 = document.createElement("script");
  s1.id = "ga-script";
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s1);
  const s2 = document.createElement("script");
  s2.id = "ga-init";
  s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`;
  document.head.appendChild(s2);
}

export function CookieBanner() {
  const lang = useLang();
  const [status, setStatus] = useState<"unknown" | "pending" | "accepted" | "declined">("unknown");

  useEffect(() => {
    const existing = getCookieValue("cookie_consent");
    const resolved = existing === "accepted" ? "accepted" : existing === "declined" ? "declined" : "pending";
    setStatus(resolved);
    if (resolved === "accepted" && GA_ID) loadGA(GA_ID);
  }, []);

  const accept = () => {
    writeCookie("cookie_consent", "accepted");
    setStatus("accepted");
    if (GA_ID) loadGA(GA_ID);
  };

  const decline = () => {
    writeCookie("cookie_consent", "declined");
    setStatus("declined");
  };

  return (
    <>

      {status === "pending" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xl">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100 mb-0.5">
                {lang === "el" ? "Χρησιμοποιούμε cookies" : "We use cookies"}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === "el"
                  ? "Χρησιμοποιούμε Google Analytics για να κατανοούμε πώς οι επισκέπτες χρησιμοποιούν το site. Δεν μοιραζόμαστε προσωπικά δεδομένα με τρίτους."
                  : "We use Google Analytics to understand how visitors use our site. No personal data is shared with third parties."}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={decline}
                className="text-xs text-slate-400 hover:text-slate-200 transition px-3 py-2 rounded-lg hover:bg-slate-800"
              >
                {lang === "el" ? "Απόρριψη" : "Decline"}
              </button>
              <button
                onClick={accept}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition"
              >
                {lang === "el" ? "Αποδοχή" : "Accept"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
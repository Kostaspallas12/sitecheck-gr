"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LangProvider";
import { getT } from "@/lib/i18n";

export default function HomePage() {
  const router = useRouter();
  const lang = useLang();
  const t = getT(lang);

  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, email, verifyMethod: "meta" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      sessionStorage.setItem(`site:${data.siteId}`, JSON.stringify({ token: data.verifyToken, method: "meta", domain }));
      router.push(`/verify?siteId=${data.siteId}`);
    } catch {
      setError(t.connError);
    } finally {
      setLoading(false);
    }
  }

  const CARD_COLORS = [
    "text-blue-400 bg-blue-500/10",
    "text-amber-400 bg-amber-500/10",
    "text-emerald-400 bg-emerald-500/10",
    "text-violet-400 bg-violet-500/10",
  ];

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-10 max-w-xl">
        <span className="inline-block text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-5 uppercase tracking-widest">
          {t.badge}
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-[1.15]">
          {t.title1}<br />
          <span className="text-blue-400">{t.title2}</span>
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.domainLabel}</label>
          <input
            type="text"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.emailLabel}</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm"
          />
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 font-semibold text-white text-sm transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              {t.starting}
            </span>
          ) : (
            <>
              {t.startBtn.replace(" →", "")}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M7 2.5l4.5 4.5L7 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl w-full">
        {t.features.map(({ icon, title, desc }, i) => (
          <div
            key={title}
            className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 text-left transition-colors"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base mb-4 ${CARD_COLORS[i % CARD_COLORS.length]}`}>
              {icon}
            </div>
            <div className="text-sm font-semibold text-slate-100 mb-1.5 leading-snug">{title}</div>
            <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
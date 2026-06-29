"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const features = [
  { icon: "🔒", title: "Security Headers", desc: "CSP, HSTS, X-Frame-Options και άλλα critical headers" },
  { icon: "⚡", title: "Performance", desc: "Core Web Vitals, LCP, CLS, speed score" },
  { icon: "🔍", title: "SEO", desc: "Meta tags, canonicals, robots.txt, structured data" },
  { icon: "👁️", title: "Accessibility", desc: "Contrast ratio, ARIA labels, keyboard navigation" },
];

export default function HomePage() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const method = "meta";
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
        body: JSON.stringify({ domain, email, verifyMethod: method }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      sessionStorage.setItem(`site:${data.siteId}`, JSON.stringify({ token: data.verifyToken, method, domain }));
      router.push(`/verify?siteId=${data.siteId}`);
    } catch {
      setError("Σφάλμα σύνδεσης. Δοκιμάστε ξανά.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="white" strokeWidth="1.5"/>
                <path d="M6.5 4v2.5l1.5 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-white text-sm tracking-tight">SiteCheck</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-10 max-w-xl">
          <span className="inline-block text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-5 uppercase tracking-widest">
            Δωρεάν εργαλείο
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-[1.15]">
            Audit του site σου<br />
            <span className="text-blue-400">σε λεπτά</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Πλήρης ανάλυση Security, SEO, Performance και Accessibility.<br />
            Πρώτα επαληθεύουμε ότι είναι δικό σου.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Domain</label>
            <input
              type="text"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-sm"
            />
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-red-400 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-2.5 font-bold text-white transition text-sm"
          >
            {loading ? "Καταχώρηση..." : "Ξεκίνα ανάλυση →"}
          </button>
        </form>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl w-full">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-left">
              <div className="text-xl mb-2.5">{icon}</div>
              <div className="text-sm font-semibold text-slate-200 mb-1">{title}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
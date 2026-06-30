"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LangProvider";
import { getT } from "@/lib/i18n";

const FEATURE_ICONS = [
  <svg key="shield" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>,
  <svg key="zap" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>,
  <svg key="search" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>,
  <svg key="eye" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>,
];

const FEATURE_COLORS = [
  { icon: "text-blue-400 bg-blue-500/10 border border-blue-500/20", border: "border-blue-500/50", accent: "text-blue-400" },
  { icon: "text-amber-400 bg-amber-500/10 border border-amber-500/20", border: "border-amber-500/50", accent: "text-amber-400" },
  { icon: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20", border: "border-emerald-500/50", accent: "text-emerald-400" },
  { icon: "text-violet-400 bg-violet-500/10 border border-violet-500/20", border: "border-violet-500/50", accent: "text-violet-400" },
];

const FEATURE_DETAILS = {
  en: [
    {
      detail: "We fetch your site's HTTP response headers and check for 7 critical security headers. For each one we verify both its presence and its correct configuration — a misconfigured header can be worse than a missing one.",
      bullets: ["Content-Security-Policy (CSP) — prevents script injection attacks", "Strict-Transport-Security (HSTS) — forces HTTPS", "X-Frame-Options — blocks clickjacking", "X-Content-Type-Options — prevents MIME sniffing", "Referrer-Policy — controls what info browsers send", "Permissions-Policy — limits access to camera, mic, location"],
    },
    {
      detail: "We launch a real headless Chrome browser running Lighthouse and load your page exactly as a visitor would — no caching, no shortcuts. We measure 6 Core Web Vitals and produce a score from 0–100.",
      bullets: ["Largest Contentful Paint (LCP) — how fast the main content appears", "Cumulative Layout Shift (CLS) — how much the layout jumps while loading", "Total Blocking Time (TBT) — how long the page ignores user input", "Speed Index — how quickly content becomes visible", "First Contentful Paint (FCP) — time to first visible element", "Time to Interactive (TTI) — when the page becomes fully responsive"],
    },
    {
      detail: "We parse your homepage HTML and check both on-page SEO elements and technical SEO factors that Google uses to rank your site in search results.",
      bullets: ["Meta title & description — what appears in Google results", "Canonical URL — prevents duplicate content penalties", "Open Graph & Twitter Card — controls link previews on social media", "Schema.org structured data — rich snippets in search results", "sitemap.xml & robots.txt — tells Google what to crawl", "Image alt texts & crawlable links — visibility and accessibility"],
    },
    {
      detail: "We run Lighthouse's accessibility audit to check how usable your site is for people with disabilities — blind users, people with color blindness, or those using keyboard-only navigation.",
      bullets: ["Color contrast ratio — text readable on any screen", "ARIA labels — descriptions for screen readers", "Form input labels — every field has a readable name", "Heading hierarchy (H1→H2→H3) — logical page structure", "Keyboard navigation — usable without a mouse", "Button & link names — clear purpose for assistive tech"],
    },
  ],
  el: [
    {
      detail: "Ελέγχουμε τα HTTP response headers του site σου και αναζητάμε 7 κρίσιμα security headers. Για κάθε ένα ελέγχουμε όχι μόνο αν υπάρχει, αλλά και αν έχει σωστή ρύθμιση — ένα λάθος ρυθμισμένο header μπορεί να είναι χειρότερο από την απουσία του.",
      bullets: ["Content-Security-Policy (CSP) — αποτρέπει επιθέσεις script injection", "Strict-Transport-Security (HSTS) — επιβάλλει HTTPS", "X-Frame-Options — μπλοκάρει επιθέσεις clickjacking", "X-Content-Type-Options — αποτρέπει MIME sniffing", "Referrer-Policy — ελέγχει τι πληροφορίες στέλνει ο browser", "Permissions-Policy — περιορίζει πρόσβαση σε κάμερα, μικρόφωνο, τοποθεσία"],
    },
    {
      detail: "Ανοίγουμε ένα πραγματικό headless Chrome browser με Lighthouse και φορτώνουμε τη σελίδα σου ακριβώς όπως ένας επισκέπτης — χωρίς cache, χωρίς συντομεύσεις. Μετράμε 6 Core Web Vitals και δίνουμε βαθμολογία 0–100.",
      bullets: ["Largest Contentful Paint (LCP) — πόσο γρήγορα εμφανίζεται το κύριο περιεχόμενο", "Cumulative Layout Shift (CLS) — πόσο «πηδά» το layout κατά τη φόρτωση", "Total Blocking Time (TBT) — πόσο η σελίδα αγνοεί τον χρήστη", "Speed Index — πόσο γρήγορα γίνεται ορατό το περιεχόμενο", "First Contentful Paint (FCP) — χρόνος μέχρι το πρώτο ορατό στοιχείο", "Time to Interactive (TTI) — πότε η σελίδα ανταποκρίνεται πλήρως"],
    },
    {
      detail: "Αναλύουμε το HTML της αρχικής σελίδας και ελέγχουμε on-page SEO στοιχεία αλλά και τεχνικούς παράγοντες που χρησιμοποιεί το Google για να κατατάξει το site σου στα αποτελέσματα αναζήτησης.",
      bullets: ["Meta title & description — αυτό που εμφανίζεται στο Google", "Canonical URL — αποτρέπει penalties από διπλό περιεχόμενο", "Open Graph & Twitter Card — έλεγχος link previews στα social media", "Schema.org structured data — rich snippets στα αποτελέσματα Google", "sitemap.xml & robots.txt — λέει στο Google τι να ανιχνεύσει", "Alt texts εικόνων & crawlable links — ορατότητα και προσβασιμότητα"],
    },
    {
      detail: "Τρέχουμε το accessibility audit του Lighthouse για να ελέγξουμε πόσο προσβάσιμο είναι το site σου για άτομα με αναπηρίες — τυφλούς χρήστες, άτομα με αχρωματοψία, ή πλοήγηση μόνο με πληκτρολόγιο.",
      bullets: ["Αντίθεση χρωμάτων — κείμενο ευανάγνωστο σε κάθε οθόνη", "ARIA labels — περιγραφές για screen readers", "Labels φορμών — κάθε πεδίο έχει ευανάγνωστο όνομα", "Ιεραρχία headings (H1→H2→H3) — λογική δομή σελίδας", "Πλοήγηση με πληκτρολόγιο — χρήση χωρίς ποντίκι", "Ονόματα κουμπιών & links — σαφής σκοπός για assistive tech"],
    },
  ],
};

export default function HomePage() {
  const router = useRouter();
  const lang = useLang();
  const t = getT(lang);

  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

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

  const details = FEATURE_DETAILS[lang === "el" ? "el" : "en"];
  const activeDetail = selected !== null ? details[selected] : null;
  const activeColor = selected !== null ? FEATURE_COLORS[selected] : null;

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-10 max-w-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-[1.15] tracking-tight">
          {t.title1}<br />
          <span className="text-blue-400">{t.title2}</span>
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">{t.subtitle}</p>
      </div>

      {/* Form */}
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
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 font-semibold text-white text-sm transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              {t.starting}
            </>
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

      {/* Feature cards */}
      <div className="mt-14 max-w-2xl w-full">
        <p className="text-xs text-slate-600 text-center mb-4">
          {lang === "el" ? "Πάτα σε κατηγορία για να δεις πώς αναλύουμε" : "Click a category to see how we analyse it"}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {t.features.map(({ title }, i) => {
            const isActive = selected === i;
            const colors = FEATURE_COLORS[i];
            return (
              <button
                key={title}
                onClick={() => setSelected(isActive ? null : i)}
                className={`text-left rounded-xl p-5 border transition-all ${
                  isActive
                    ? `bg-slate-900 ${colors.border} ring-1 ring-inset ${colors.border}`
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 shrink-0 ${colors.icon}`}>
                  {FEATURE_ICONS[i]}
                </div>
                <p className="text-sm font-semibold text-slate-100 leading-snug">{title}</p>
                <p className={`text-xs mt-2 font-medium ${isActive ? colors.accent : "text-slate-600"}`}>
                  {isActive
                    ? (lang === "el" ? "▲ κλείσιμο" : "▲ close")
                    : (lang === "el" ? "μάθε περισσότερα →" : "learn more →")}
                </p>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        {activeDetail && activeColor && (
          <div className={`mt-3 rounded-xl border ${activeColor.border} bg-slate-900 p-6`}>
            <p className="text-sm text-slate-300 leading-relaxed mb-5">{activeDetail.detail}</p>
            <ul className="space-y-2">
              {activeDetail.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className={`mt-0.5 shrink-0 text-xs font-bold ${activeColor.accent}`}>✓</span>
                  <span className="text-slate-400">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
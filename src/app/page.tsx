"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LangProvider";
import { getT } from "@/lib/i18n";
import { useSessionUser } from "@/components/AuthProvider";

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
      detail: "We check whether your site has the right protections in place against hackers and malicious attacks. These safeguards are invisible to visitors but make a big difference in keeping your site and its users safe.",
      bullets: [
        "Blocks hackers from injecting malicious code into your pages",
        "Ensures your site always uses an encrypted, private connection",
        "Prevents other sites from embedding your pages to trick your visitors",
        "Controls what information your site reveals to third parties",
        "Limits what the browser is allowed to do on your page",
      ],
    },
    {
      detail: "We measure how fast your site loads from a real visitor's perspective. A slow site loses visitors — most people leave if a page doesn't load within 3 seconds, and Google ranks slow sites lower.",
      bullets: [
        "How quickly the main content appears on screen",
        "Whether page elements jump around while loading (causes accidental clicks)",
        "How long the page looks ready but doesn't respond to taps or clicks",
        "How fast something visible appears so visitors know it's working",
        "When the page is fully usable and responds to all interactions",
      ],
    },
    {
      detail: "We check whether Google can find, understand, and properly display your site in search results — and whether your pages look good when shared on social media.",
      bullets: [
        "Whether your page has a title and description that show up in Google",
        "Whether your page previews correctly when shared on social media",
        "Whether Google can reach and index all your pages",
        "Whether your images have descriptions so Google understands them",
        "Whether your content is structured in a way that helps search rankings",
      ],
    },
    {
      detail: "We check whether everyone can use your site comfortably — including people with visual impairments, colour blindness, or those who navigate without a mouse.",
      bullets: [
        "Whether text is easy to read on all background colours",
        "Whether forms and buttons have clear, readable labels",
        "Whether the site works using only a keyboard",
        "Whether the page structure is logical for people using assistive tools",
        "Whether interactive elements clearly communicate their purpose",
      ],
    },
  ],
  el: [
    {
      detail: "Ελέγχουμε αν το site σου έχει τις σωστές προστασίες ενάντια σε χάκερς και κακόβουλες επιθέσεις. Αυτές οι ρυθμίσεις δεν φαίνονται στους επισκέπτες αλλά κάνουν μεγάλη διαφορά στην ασφάλεια.",
      bullets: [
        "Μπλοκάρει χάκερς που προσπαθούν να βάλουν κακόβουλο κώδικα στις σελίδες σου",
        "Διασφαλίζει ότι το site χρησιμοποιεί πάντα κρυπτογραφημένη σύνδεση",
        "Εμποδίζει άλλα sites να εμφανίσουν τη σελίδα σου για να εξαπατήσουν επισκέπτες",
        "Ελέγχει τι πληροφορίες αποκαλύπτει το site σου σε τρίτους",
        "Περιορίζει τι επιτρέπεται να κάνει ο browser στη σελίδα σου",
      ],
    },
    {
      detail: "Μετράμε πόσο γρήγορα φορτώνει το site σου ακριβώς όπως το βιώνει ένας πραγματικός επισκέπτης. Ένα αργό site χάνει κόσμο — οι περισσότεροι φεύγουν αν δεν φορτώσει μέσα σε 3 δευτερόλεπτα, και το Google το κατατάσσει χαμηλότερα.",
      bullets: [
        "Πόσο γρήγορα εμφανίζεται το κύριο περιεχόμενο στην οθόνη",
        "Αν τα στοιχεία της σελίδας μετακινούνται ενώ φορτώνει (προκαλεί λάθος κλικ)",
        "Πόση ώρα η σελίδα φαίνεται έτοιμη αλλά δεν ανταποκρίνεται σε αγγίγματα ή κλικ",
        "Πόσο γρήγορα ο επισκέπτης βλέπει κάτι ώστε να ξέρει ότι φορτώνει",
        "Πότε η σελίδα είναι πλήρως λειτουργική και ανταποκρίνεται σε όλες τις ενέργειες",
      ],
    },
    {
      detail: "Ελέγχουμε αν το Google μπορεί να βρει, να καταλάβει και να εμφανίσει σωστά το site σου στα αποτελέσματα αναζήτησης — και αν οι σελίδες σου φαίνονται καλά όταν μοιράζονται στα social media.",
      bullets: [
        "Αν υπάρχει τίτλος και περιγραφή που εμφανίζονται στο Google",
        "Αν η σελίδα σου προβάλλεται σωστά όταν κάποιος την μοιράζεται στα social media",
        "Αν το Google μπορεί να φτάσει και να καταχωρίσει όλες τις σελίδες σου",
        "Αν οι εικόνες έχουν περιγραφές ώστε να τις καταλαβαίνει το Google",
        "Αν το περιεχόμενο είναι οργανωμένο με τρόπο που βοηθά στις κατατάξεις",
      ],
    },
    {
      detail: "Ελέγχουμε αν το site σου μπορούν να το χρησιμοποιήσουν άνετα όλοι — συμπεριλαμβανομένων ατόμων με προβλήματα όρασης, αχρωματοψία ή όσων πλοηγούνται χωρίς ποντίκι.",
      bullets: [
        "Αν το κείμενο είναι ευανάγνωστο σε όλα τα χρώματα φόντου",
        "Αν οι φόρμες και τα κουμπιά έχουν σαφείς, αναγνώσιμες ετικέτες",
        "Αν το site λειτουργεί χρησιμοποιώντας μόνο το πληκτρολόγιο",
        "Αν η δομή της σελίδας είναι λογική για άτομα που χρησιμοποιούν βοηθητικά εργαλεία",
        "Αν τα διαδραστικά στοιχεία επικοινωνούν ξεκάθαρα τον σκοπό τους",
      ],
    },
  ],
};

export default function HomePage() {
  const router = useRouter();
  const lang = useLang();
  const t = getT(lang);
  const user = useSessionUser();

  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            {t.emailLabel}
            {user && (
              <span className="ml-2 text-xs text-blue-400/70 font-normal">
                {lang === "el" ? "(από τον λογαριασμό σου)" : "(from your account)"}
              </span>
            )}
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => !user && setEmail(e.target.value)}
            required
            readOnly={!!user}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm transition ${
              user
                ? "bg-slate-800/50 border-slate-700/40 text-slate-400 cursor-default select-none"
                : "bg-slate-900 border-slate-700/80 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
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
      <div className="mt-10 max-w-2xl w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {t.features.map(({ title }, i) => {
            const isActive = selected === i;
            const colors = FEATURE_COLORS[i];
            return (
              <button
                key={title}
                onClick={() => setSelected(isActive ? null : i)}
                className={`text-left rounded-xl p-5 border transition-all duration-200 ${
                  isActive
                    ? `bg-slate-900 ${colors.border}`
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 shrink-0 ${colors.icon}`}>
                  {FEATURE_ICONS[i]}
                </div>
                <p className="text-sm font-semibold text-slate-100 leading-snug">{title}</p>
                <div className={`flex items-center gap-1 text-xs mt-2 font-medium transition-colors duration-200 ${isActive ? colors.accent : "text-slate-600"}`}>
                  <span>{lang === "el" ? "λεπτομέρειες" : "details"}</span>
                  <svg
                    width="10" height="10" viewBox="0 0 10 10" fill="none"
                    className={`transition-transform duration-300 ${isActive ? "rotate-180" : ""}`}
                  >
                    <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        {/* Animated detail panel */}
        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${selected !== null ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className={`mt-3 rounded-xl border bg-slate-900 p-6 transition-opacity duration-300 ${selected !== null ? "opacity-100 " + (activeColor?.border ?? "") : "opacity-0 border-transparent"}`}>
              {selected !== null && activeDetail && activeColor && (
                <>
                  <p className="text-sm text-slate-300 leading-relaxed mb-5">{activeDetail.detail}</p>
                  <ul className="space-y-2.5">
                    {activeDetail.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className={`mt-0.5 shrink-0 font-bold text-xs ${activeColor.accent}`}>✓</span>
                        <span className="text-slate-400 leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
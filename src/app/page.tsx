"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"dns" | "meta" | "file">("dns");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
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

      sessionStorage.setItem(`site:${data.siteId}`, JSON.stringify({
        token: data.verifyToken,
        method,
        domain,
      }));
      router.push(`/verify?siteId=${data.siteId}`);
    } catch {
      setError("Σφάλμα σύνδεσης. Δοκιμάστε ξανά.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-400 text-sm mb-6">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          Δωρεάν ανάλυση website
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
          Ανακάλυψε τις αδυναμίες<br />του site σου
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          Αναλύουμε το site σου για θέματα Security, SEO, Performance και Accessibility.
          Πρώτα επαληθεύουμε ότι είναι δικό σου.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Domain</label>
          <input
            type="text"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Email σου</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Μέθοδος επαλήθευσης ιδιοκτησίας</label>
          <div className="grid grid-cols-3 gap-2">
            {(["dns", "meta", "file"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                  method === m
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {m === "dns" ? "DNS TXT" : m === "meta" ? "Meta Tag" : "Αρχείο"}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3.5 font-semibold text-white transition"
        >
          {loading ? "Γίνεται καταχώρηση..." : "Ξεκίνα ανάλυση →"}
        </button>
      </form>

      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl text-center">
        {[
          { icon: "🔒", label: "Security Headers" },
          { icon: "⚡", label: "Performance" },
          { icon: "🔍", label: "SEO" },
          { icon: "♿", label: "Accessibility" },
        ].map(({ icon, label }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-sm text-slate-400 font-medium">{label}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

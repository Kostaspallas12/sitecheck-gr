"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { ScoreHistoryChart } from "@/components/ScoreHistoryChart";

interface ScoreSet {
  performance?: number;
  seo?: number;
  accessibility?: number;
  bestPractices?: number;
  security?: number;
}

interface ScanEntry {
  scanId: string;
  createdAt: string;
  scores?: ScoreSet;
}

interface UptimeCheck {
  status: "up" | "down";
  checkedAt: string;
}

interface SiteData {
  id: string;
  domain: string;
  verified: boolean;
  latest: ScanEntry | null;
  history: ScanEntry[];
  uptimeMonitoring: boolean;
  uptimeStatus: "up" | "down" | null;
  uptimeResponseTime: number | null;
  uptimeCheckedAt: string | null;
  downtimeSince: string | null;
  uptimeChecks: UptimeCheck[];
}

function scoreColor(v: number) {
  if (v >= 90) return "text-green-400";
  if (v >= 70) return "text-yellow-400";
  if (v >= 50) return "text-orange-400";
  return "text-red-400";
}

function scoreBg(v: number) {
  if (v >= 90) return "bg-green-400";
  if (v >= 70) return "bg-yellow-400";
  if (v >= 50) return "bg-orange-400";
  return "bg-red-400";
}

function avg(s?: ScoreSet) {
  if (!s) return null;
  const vals = [s.performance, s.seo, s.accessibility, s.bestPractices, s.security].filter((v): v is number => v !== undefined);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function timeAgo(iso: string, lang: Lang) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return lang === "el" ? "μόλις τώρα" : "just now";
  if (diff < 3600) { const m = Math.floor(diff / 60); return lang === "el" ? `${m} λεπτά πριν` : `${m}m ago`; }
  if (diff < 86400) { const h = Math.floor(diff / 3600); return lang === "el" ? `${h} ώρες πριν` : `${h}h ago`; }
  const d = Math.floor(diff / 86400);
  return lang === "el" ? `${d} μέρες πριν` : `${d}d ago`;
}

const SCORE_LABELS: Record<string, { el: string; en: string }> = {
  performance: { el: "Απόδοση", en: "Perf" },
  seo: { el: "SEO", en: "SEO" },
  accessibility: { el: "Προσβ.", en: "Access." },
  bestPractices: { el: "Practices", en: "Practices" },
  security: { el: "Ασφάλεια", en: "Security" },
};

function SiteCard({ data, lang }: { data: SiteData; lang: Lang }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [uptimeEnabled, setUptimeEnabled] = useState(data.uptimeMonitoring);
  const [uptimeToggling, setUptimeToggling] = useState(false);
  const isEl = lang === "el";
  const overall = avg(data.latest?.scores);

  async function toggleUptime() {
    setUptimeToggling(true);
    const next = !uptimeEnabled;
    try {
      await fetch(`/api/sites/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uptimeMonitoring: next }),
      });
      setUptimeEnabled(next);
    } finally {
      setUptimeToggling(false);
    }
  }

  async function rescan() {
    setLoading(true);
    try {
      const res = await fetch(`/api/sites/${data.id}/scan`, { method: "POST" });
      const json = await res.json();
      if (json.scanId) router.push(`/scan?scanId=${json.scanId}&siteId=${data.id}`);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-white font-semibold text-base">{data.domain}</h2>
            {data.verified ? (
              <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5">
                {isEl ? "Επαληθευμένο" : "Verified"}
              </span>
            ) : (
              <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5">
                {isEl ? "Μη επαληθευμένο" : "Unverified"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            {data.latest && (
              <p className="text-slate-500 text-xs">{isEl ? "Τελευταία ανάλυση:" : "Last scan:"} {timeAgo(data.latest.createdAt, lang)}</p>
            )}
            {data.uptimeStatus && (
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${data.uptimeStatus === "up" ? "text-green-400" : "text-red-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${data.uptimeStatus === "up" ? "bg-green-400" : "bg-red-400 animate-pulse"}`} />
                {data.uptimeStatus === "up"
                  ? `Online${data.uptimeResponseTime ? ` · ${data.uptimeResponseTime}ms` : ""}`
                  : (isEl ? "Εκτός λειτουργίας" : "Offline")}
              </span>
            )}
          </div>
        </div>
        {overall !== null && (
          <div className={`text-2xl font-black ${scoreColor(overall)} shrink-0`}>{overall}</div>
        )}
      </div>

      {/* Score bars */}
      {data.latest?.scores && (
        <div className="space-y-2 mb-4">
          {(["performance", "seo", "security", "accessibility", "bestPractices"] as const).map((key) => {
            const val = data.latest!.scores![key];
            if (val === undefined) return null;
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-slate-500 text-xs w-20 shrink-0">{SCORE_LABELS[key][lang === "el" ? "el" : "en"]}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${scoreBg(val)}`} style={{ width: `${val}%` }} />
                </div>
                <span className={`text-xs font-semibold w-7 text-right ${scoreColor(val)}`}>{val}</span>
              </div>
            );
          })}
        </div>
      )}

      {!data.latest && data.verified && (
        <p className="text-slate-500 text-sm mb-4">{isEl ? "Δεν υπάρχει ανάλυση ακόμα." : "No scan yet."}</p>
      )}

      {!data.verified && (
        <p className="text-slate-500 text-sm mb-4">{isEl ? "Επαλήθευσε το site για να ξεκινήσεις ανάλυση." : "Verify the site to start scanning."}</p>
      )}

      {/* Score history chart */}
      {data.history.length >= 2 && (
        <ScoreHistoryChart history={data.history.map((h) => ({ createdAt: h.createdAt, scores: h.scores }))} />
      )}

      {/* Uptime dots */}
      {data.verified && (
        <div className="mt-4 border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">{isEl ? "Uptime Monitor" : "Uptime Monitor"}</span>
            <button
              onClick={toggleUptime}
              disabled={uptimeToggling}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${uptimeEnabled ? "bg-blue-600" : "bg-slate-700"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${uptimeEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
          {uptimeEnabled && data.uptimeChecks.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-600">{isEl ? "Τελευταίοι έλεγχοι" : "Recent checks"}</span>
                <span className="text-xs text-slate-500">
                  {Math.round((data.uptimeChecks.filter((c) => c.status === "up").length / data.uptimeChecks.length) * 100)}%
                </span>
              </div>
              <div className="flex gap-0.5 flex-wrap">
                {[...data.uptimeChecks].reverse().map((c, i) => (
                  <div
                    key={i}
                    title={`${c.status === "up" ? "✓" : "✗"} ${timeAgo(c.checkedAt, lang)}`}
                    className={`w-2.5 h-5 rounded-sm ${c.status === "up" ? "bg-green-500/70" : "bg-red-500/80"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap mt-4">
        {data.latest && (
          <a
            href={`/results/${data.latest.scanId}`}
            className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
          >
            {isEl ? "Αποτελέσματα" : "Results"}
          </a>
        )}
        {data.verified && (
          <button
            onClick={rescan}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50 font-medium"
          >
            {loading ? "..." : (
              <>
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                {isEl ? "Νέα ανάλυση" : "New scan"}
              </>
            )}
          </button>
        )}
        {!data.verified && (
          <a
            href={`/verify?siteId=${data.id}`}
            className="text-xs px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-lg transition"
          >
            {isEl ? "Επαλήθευση" : "Verify"}
          </a>
        )}
        {data.history.length > 1 && (
          <button
            onClick={() => setShowHistory((h) => !h)}
            className="text-xs px-3 py-1.5 text-slate-500 hover:text-slate-300 transition ml-auto"
          >
            {showHistory ? (isEl ? "Απόκρυψη ιστορικού" : "Hide history") : (isEl ? `Ιστορικό (${data.history.length})` : `History (${data.history.length})`)}
          </button>
        )}
      </div>

      {/* History */}
      {showHistory && data.history.length > 1 && (
        <div className="mt-4 border-t border-slate-800 pt-4 space-y-2">
          <p className="text-xs text-slate-500 mb-2">{isEl ? "Ιστορικό αναλύσεων" : "Scan history"}</p>
          {data.history.map((h) => {
            const a = avg(h.scores);
            return (
              <div key={h.scanId} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{timeAgo(h.createdAt, lang)}</span>
                <div className="flex items-center gap-3">
                  {a !== null && <span className={`text-xs font-bold ${scoreColor(a)}`}>{a}</span>}
                  <a href={`/results/${h.scanId}`} className="text-xs text-blue-400 hover:text-blue-300 transition">
                    {isEl ? "Δες" : "View"}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DashboardClient({
  user,
  sites,
  lang,
}: {
  user: { name: string | null; email: string | null };
  sites: SiteData[];
  lang: Lang;
}) {
  const isEl = lang === "el";
  const firstName = user.name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "";

  return (
    <main className="px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEl ? `Γεια, ${firstName}` : `Hi, ${firstName}`} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {sites.length === 0
                ? (isEl ? "Δεν έχεις sites ακόμα" : "No sites yet")
                : isEl
                ? `${sites.length} site${sites.length !== 1 ? "s" : ""} υπό παρακολούθηση`
                : `${sites.length} site${sites.length !== 1 ? "s" : ""} monitored`}
            </p>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            {isEl ? "Νέο site" : "New site"}
          </a>
        </div>

        {/* Sites grid */}
        {sites.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-500 text-sm mb-4">{isEl ? "Ξεκίνα αναλύοντας το πρώτο σου site" : "Start by analysing your first site"}</p>
            <a href="/" className="text-sm text-blue-400 hover:text-blue-300 transition">
              {isEl ? "Ανάλυση site →" : "Analyse a site →"}
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {sites.map((s) => <SiteCard key={s.id} data={s} lang={lang} />)}
          </div>
        )}
      </div>
    </main>
  );
}

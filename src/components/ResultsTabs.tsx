"use client";

import { useState } from "react";
import { useLang } from "./LangProvider";
import { getT } from "@/lib/i18n";
import { ScoreRing } from "./ScoreRing";
import { IssueCard } from "./IssueCard";
import { HeaderBadge } from "./HeaderBadge";
import { TechStack } from "./TechStack";
import type { TechItem } from "@/lib/scanner/extended-audit";

// ── plain data types (no server-only imports) ────────────────────────────────

type SslData = {
  valid: boolean;
  issuer?: string;
  daysUntilExpiry?: number;
  protocol?: string;
  issues: string[];
  score: number;
};

type SecHeaderResult = {
  header: string;
  present: boolean;
  value?: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  recommendation: string;
};

type IssueItem = {
  category: string;
  title: string;
  description: string;
  severity: "error" | "warning" | "info";
};

type CookieItem = {
  name: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: string;
  issues: string[];
};

type ExposedFile = {
  path: string;
  risk: "critical" | "high" | "medium";
  description: string;
};

type InfoLeak = {
  header: string;
  value: string;
  description: string;
};

type ExtAudit = {
  technologies: TechItem[];
  cookies: CookieItem[];
  infoLeaks: InfoLeak[];
  exposedFiles: ExposedFile[];
  sitemapFound: boolean;
  securityTxtFound: boolean;
  cors: { allowOrigin: string; allowCredentials: boolean; risky: boolean } | null;
  compression: { enabled: boolean; encoding?: string };
  openGraph: { title?: string; description?: string; image?: string } | null;
  twitterCard: { card?: string; title?: string } | null;
  schemaOrg: boolean;
  redirectsToHttps: boolean;
  directoryListing: boolean;
};

export type ResultsData = {
  scores: Array<{ label: string; value: number }>;
  ssl: SslData | null;
  secHeaders: SecHeaderResult[] | null;
  issues: IssueItem[] | null;
  ext: ExtAudit | null;
};

// ── helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_ORDER = { error: 0, warning: 1, info: 2 } as const;

const RISK_COLOR = {
  critical: "text-red-400",
  high: "text-red-400",
  medium: "text-orange-400",
} as const;

const RISK_BG = {
  critical: "bg-red-500/10 border-red-500/20",
  high: "bg-red-500/10 border-red-500/20",
  medium: "bg-orange-500/10 border-orange-500/20",
} as const;

function CheckRow({ ok, label, note }: { ok: boolean; label: string; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        {note && <span className="text-xs text-slate-500 hidden sm:block max-w-[260px] truncate text-right">{note}</span>}
        <span className={`text-xs font-bold w-4 text-center ${ok ? "text-green-400" : "text-red-400"}`}>
          {ok ? "✓" : "✗"}
        </span>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-5">{title}</h2>
      {children}
    </section>
  );
}

// ── tab panels ───────────────────────────────────────────────────────────────

type T = ReturnType<typeof getT>;

function OverviewTab({
  scores, overallScore, overallColor, overallRating, ext, t,
}: {
  scores: Array<{ label: string; value: number }>;
  overallScore: number;
  overallColor: string;
  overallRating: string;
  ext: ExtAudit | null;
  t: T;
}) {
  return (
    <div className="space-y-6">
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="text-lg font-semibold">{t.scoresTitle}</h2>
          <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl px-5 py-3">
            <span className="text-slate-400 text-sm">{t.overallScore}</span>
            <span className={`text-3xl font-extrabold ${overallColor}`}>{overallScore}</span>
            <span className={`text-xs font-semibold ${overallColor}`}>{overallRating}</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-around gap-8">
          {scores.map((s) => (
            <ScoreRing key={s.label} score={s.value} label={t.scoreLabels[s.label] ?? s.label} />
          ))}
        </div>
      </section>

      {ext && ext.technologies.length > 0 && (
        <SectionCard title={t.techStackTitle}>
          <TechStack technologies={ext.technologies} />
        </SectionCard>
      )}
    </div>
  );
}

function SecurityTab({
  ssl, secHeaders, ext, lang, t,
}: {
  ssl: SslData | null;
  secHeaders: SecHeaderResult[] | null;
  ext: ExtAudit | null;
  lang: string;
  t: T;
}) {
  return (
    <div className="space-y-6">
      {/* SSL */}
      {ssl && (
        <SectionCard title={t.sslTitle}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-slate-500 text-xs mb-1">{t.sslStatus}</p>
              <p className={ssl.valid ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                {ssl.valid ? t.sslValid : t.sslInvalid}
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-slate-500 text-xs mb-1">{t.sslIssuer}</p>
              <p className="text-slate-200 font-medium truncate">{ssl.issuer ?? "—"}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-slate-500 text-xs mb-1">{t.sslExpiry}</p>
              <p className={`font-semibold ${(ssl.daysUntilExpiry ?? 0) < 30 ? "text-orange-400" : "text-green-400"}`}>
                {ssl.daysUntilExpiry !== undefined ? `${ssl.daysUntilExpiry} ${t.days}` : "—"}
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-slate-500 text-xs mb-1">{t.sslProtocol}</p>
              <p className="text-slate-200 font-medium">{ssl.protocol ?? "—"}</p>
            </div>
          </div>
          {ssl.issues.length > 0 && (
            <div className="space-y-2">
              {ssl.issues.map((issue, i) => (
                <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {issue}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Security Headers */}
      {secHeaders && (
        <SectionCard title={t.secHeadersTitle}>
          <div className="divide-y divide-slate-800">
            {secHeaders.map((h) => (
              <HeaderBadge key={h.header} result={h} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* Extended Security */}
      {ext && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-7">
          <h2 className="text-lg font-semibold">{t.extSecurityTitle}</h2>

          {/* Quick checks */}
          <div className="divide-y divide-slate-800">
            <CheckRow ok={ext.redirectsToHttps} label={t.redirectHttpsLabel} />
            <CheckRow
              ok={ext.compression.enabled}
              label={t.compressionLabel}
              note={ext.compression.encoding}
            />
            <CheckRow
              ok={!ext.directoryListing}
              label={t.directoryListingLabel}
              note={ext.directoryListing
                ? (lang === "el" ? "Ο κατάλογος είναι ορατός!" : "Directory is publicly visible!")
                : undefined}
            />
            {ext.cors && (
              <CheckRow
                ok={!ext.cors.risky}
                label={t.corsLabel}
                note={ext.cors.risky ? t.corsRiskyNote : `Allow-Origin: ${ext.cors.allowOrigin}`}
              />
            )}
          </div>

          {/* Exposed sensitive files */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3">{t.exposedFilesTitle}</h3>
            {ext.exposedFiles.length === 0 ? (
              <p className="text-sm text-green-400 flex items-center gap-2">
                <span>✓</span> {t.exposedFilesNone}
              </p>
            ) : (
              <div className="space-y-2">
                {ext.exposedFiles.map((f) => (
                  <div key={f.path} className={`rounded-lg border px-4 py-3 ${RISK_BG[f.risk]}`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-bold uppercase ${RISK_COLOR[f.risk]}`}>{f.risk}</span>
                      <code className="text-xs text-slate-300 font-mono">{f.path}</code>
                    </div>
                    <p className="text-xs text-slate-400">{f.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info leaks */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3">{t.infoLeaksTitle}</h3>
            {ext.infoLeaks.length === 0 ? (
              <p className="text-sm text-green-400 flex items-center gap-2">
                <span>✓</span> {t.infoLeaksNone}
              </p>
            ) : (
              <div className="space-y-2">
                {ext.infoLeaks.map((leak) => (
                  <div key={leak.header} className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-3">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <code className="text-xs font-mono text-orange-300">{leak.header}:</code>
                      <code className="text-xs font-mono text-slate-300">{leak.value}</code>
                    </div>
                    <p className="text-xs text-slate-400">{leak.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cookies */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3">{t.cookiesTitle}</h3>
            {ext.cookies.length === 0 ? (
              <p className="text-sm text-slate-500">{t.cookiesNone}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="pb-2 font-medium pr-4">Cookie</th>
                      <th className="pb-2 font-medium pr-4">Secure</th>
                      <th className="pb-2 font-medium pr-4">HttpOnly</th>
                      <th className="pb-2 font-medium pr-4">SameSite</th>
                      <th className="pb-2 font-medium">{lang === "el" ? "Κατάσταση" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {ext.cookies.map((c, i) => (
                      <tr key={i}>
                        <td className="py-2 pr-4 font-mono text-slate-300 max-w-[160px] truncate">{c.name}</td>
                        <td className={`py-2 pr-4 font-semibold ${c.secure ? "text-green-400" : "text-red-400"}`}>
                          {c.secure ? "✓" : "✗"}
                        </td>
                        <td className={`py-2 pr-4 font-semibold ${c.httpOnly ? "text-green-400" : "text-red-400"}`}>
                          {c.httpOnly ? "✓" : "✗"}
                        </td>
                        <td className="py-2 pr-4 text-slate-400">{c.sameSite ?? "—"}</td>
                        <td className="py-2">
                          {c.issues.length === 0
                            ? <span className="text-green-400">{t.cookieNoIssues}</span>
                            : <span className="text-orange-400">{c.issues.join(", ")}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function SeoTab({
  ext, issues, lang, t,
}: {
  ext: ExtAudit | null;
  issues: IssueItem[] | null;
  lang: string;
  t: T;
}) {
  const seoIssues = issues?.filter((i) => i.category === "seo") ?? [];
  const accessibilityIssues = issues?.filter((i) => i.category === "accessibility") ?? [];

  return (
    <div className="space-y-6">
      {ext && (
        <SectionCard title={t.seoExtrasTitle}>
          <div className="divide-y divide-slate-800">
            <CheckRow
              ok={!!ext.openGraph}
              label={t.openGraphLabel}
              note={ext.openGraph?.title ? `"${ext.openGraph.title.slice(0, 60)}"` : undefined}
            />
            <CheckRow ok={!!ext.twitterCard} label={t.twitterCardLabel} note={ext.twitterCard?.card} />
            <CheckRow ok={ext.schemaOrg} label={t.schemaOrgLabel} />
            <CheckRow ok={ext.sitemapFound} label={t.sitemapLabel} />
            <CheckRow ok={ext.securityTxtFound} label={t.securityTxtLabel} />
          </div>
        </SectionCard>
      )}

      {seoIssues.length > 0 && (
        <SectionCard title={`SEO ${lang === "el" ? "Προβλήματα" : "Issues"} (${seoIssues.length})`}>
          <div className="space-y-3">
            {seoIssues
              .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
              .map((issue, i) => <IssueCard key={i} issue={issue} />)}
          </div>
        </SectionCard>
      )}

      {accessibilityIssues.length > 0 && (
        <SectionCard title={`${lang === "el" ? "Προσβασιμότητα" : "Accessibility"} (${accessibilityIssues.length})`}>
          <div className="space-y-3">
            {accessibilityIssues
              .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
              .map((issue, i) => <IssueCard key={i} issue={issue} />)}
          </div>
        </SectionCard>
      )}

      {!ext && seoIssues.length === 0 && accessibilityIssues.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-slate-500">{lang === "el" ? "Δεν υπάρχουν δεδομένα SEO." : "No SEO data available."}</p>
        </div>
      )}
    </div>
  );
}

function IssuesTab({ issues, lang, t }: { issues: IssueItem[] | null; lang: string; t: T }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
        <div className="text-3xl mb-3">✓</div>
        <p className="text-green-400 font-semibold">{t.noIssuesFound}</p>
      </div>
    );
  }

  const byCategory: Record<string, IssueItem[]> = {};
  for (const issue of issues) {
    (byCategory[issue.category] ??= []).push(issue);
  }

  const categoryLabel: Record<string, string> = {
    performance:    lang === "el" ? "Απόδοση" : "Performance",
    seo:            "SEO",
    accessibility:  lang === "el" ? "Προσβασιμότητα" : "Accessibility",
    "best-practices": lang === "el" ? "Βέλτιστες Πρακτικές" : "Best Practices",
  };

  const categoryOrder = ["performance", "seo", "accessibility", "best-practices"];
  const orderedCategories = [
    ...categoryOrder.filter((c) => byCategory[c]),
    ...Object.keys(byCategory).filter((c) => !categoryOrder.includes(c)),
  ];

  return (
    <div className="space-y-6">
      {orderedCategories.map((cat) => {
        const catIssues = byCategory[cat].sort(
          (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
        );
        return (
          <SectionCard key={cat} title={`${categoryLabel[cat] ?? cat} (${catIssues.length})`}>
            <div className="space-y-3">
              {catIssues.map((issue, i) => <IssueCard key={i} issue={issue} />)}
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}

// ── main export ──────────────────────────────────────────────────────────────

type TabId = "overview" | "security" | "seo" | "issues";

export function ResultsTabs({ data }: { data: ResultsData }) {
  const lang = useLang();
  const t = getT(lang);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const { scores, ssl, secHeaders, issues, ext } = data;

  const overallScore = Math.round(scores.reduce((s, x) => s + x.value, 0) / scores.length);
  const overallColor =
    overallScore >= 90 ? "text-green-400" : overallScore >= 50 ? "text-orange-400" : "text-red-400";
  const overallRating =
    overallScore >= 90 ? t.excellent : overallScore >= 70 ? t.good : overallScore >= 50 ? t.fair : t.poor;

  const secIssueCount =
    (secHeaders?.filter((h) => !h.present && h.severity !== "info").length ?? 0) +
    (ext?.exposedFiles.length ?? 0);
  const totalIssueCount = issues?.length ?? 0;

  const tabs: Array<{ id: TabId; label: string; count?: number }> = [
    { id: "overview",  label: t.tabOverview },
    { id: "security",  label: t.tabSecurity,  count: secIssueCount  || undefined },
    { id: "seo",       label: t.tabSeo },
    { id: "issues",    label: t.tabIssues,    count: totalIssueCount || undefined },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-slate-800 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap
              ${activeTab === tab.id
                ? "text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500"
                : "text-slate-400 hover:text-slate-200"}`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <OverviewTab
          scores={scores}
          overallScore={overallScore}
          overallColor={overallColor}
          overallRating={overallRating}
          ext={ext}
          t={t}
        />
      )}
      {activeTab === "security" && (
        <SecurityTab ssl={ssl} secHeaders={secHeaders} ext={ext} lang={lang} t={t} />
      )}
      {activeTab === "seo" && (
        <SeoTab ext={ext} issues={issues} lang={lang} t={t} />
      )}
      {activeTab === "issues" && (
        <IssuesTab issues={issues} lang={lang} t={t} />
      )}
    </div>
  );
}
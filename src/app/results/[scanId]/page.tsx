import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { findScanWithResult } from "@/lib/db";
import { ScoreRing } from "@/components/ScoreRing";
import { IssueCard } from "@/components/IssueCard";
import { HeaderBadge } from "@/components/HeaderBadge";
import { TechStack } from "@/components/TechStack";
import type { Lang } from "@/lib/i18n";
import { getT } from "@/lib/i18n";
import type { ExtendedAuditResult } from "@/lib/scanner/extended-audit";

interface PageProps {
  params: Promise<{ scanId: string }>;
  searchParams: Promise<{ siteId?: string; failed?: string }>;
}

function parseField<F>(field: unknown): F | null {
  if (!field) return null;
  if (typeof field === "string") { try { return JSON.parse(field) as F; } catch { return null; } }
  return field as F;
}

function CheckRow({ ok, label, note }: { ok: boolean; label: string; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        {note && <span className="text-xs text-slate-500 hidden sm:block">{note}</span>}
        <span className={`text-xs font-semibold shrink-0 ${ok ? "text-green-400" : "text-red-400"}`}>
          {ok ? "✓" : "✗"}
        </span>
      </div>
    </div>
  );
}

export default async function ResultsPage({ params, searchParams }: PageProps) {
  const { scanId } = await params;
  const { siteId } = await searchParams;
  const lang = ((await cookies()).get("lang")?.value ?? "en") as Lang;
  const t = getT(lang);

  const scan = await findScanWithResult(scanId);

  if (!scan || scan.status !== "DONE" || !scan.result) notFound();
  if (siteId && scan.siteId !== siteId) notFound();

  const r = scan.result;

  const secHeaders = parseField<{ results: Array<{
    header: string; present: boolean; value?: string;
    severity: "critical"|"high"|"medium"|"low"|"info";
    description: string; recommendation: string;
  }> }>(r.securityHeaders);

  const ssl = parseField<{
    valid: boolean; issuer?: string; daysUntilExpiry?: number;
    protocol?: string; issues: string[]; score: number;
  }>(r.sslData);

  const issues = parseField<Array<{
    category: string; title: string; description: string;
    severity: "error"|"warning"|"info";
  }>>(r.issues);

  const ext = parseField<ExtendedAuditResult>(r.extendedAudit);

  const scores = [
    { label: "Performance",    value: r.performanceScore    ?? 0 },
    { label: "SEO",            value: r.seoScore            ?? 0 },
    { label: "Accessibility",  value: r.accessibilityScore  ?? 0 },
    { label: "Best Practices", value: r.bestPracticesScore  ?? 0 },
    { label: "Security",       value: r.securityScore       ?? 0 },
  ];

  const overallScore = Math.round(scores.reduce((s, x) => s + x.value, 0) / scores.length);
  const overallColor = overallScore >= 90 ? "text-green-400" : overallScore >= 50 ? "text-orange-400" : "text-red-400";
  const overallRating = overallScore >= 90 ? t.excellent : overallScore >= 70 ? t.good : overallScore >= 50 ? t.fair : t.poor;

  const riskColor = { critical: "text-red-400", high: "text-red-400", medium: "text-orange-400" };
  const riskBg   = { critical: "bg-red-500/10 border-red-500/20", high: "bg-red-500/10 border-red-500/20", medium: "bg-orange-500/10 border-orange-500/20" };

  return (
    <main className="px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Domain */}
        <div>
          <p className="text-slate-500 text-sm mb-1">{t.resultsFor}</p>
          <h1 className="text-3xl font-bold text-blue-400">{scan.site.domain}</h1>
        </div>

        {/* Score rings */}
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

        {/* Technology Stack */}
        {ext && ext.technologies.length > 0 && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-5">{t.techStackTitle}</h2>
            <TechStack technologies={ext.technologies} />
          </section>
        )}

        {/* SSL */}
        {ssl && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">{t.sslTitle}</h2>
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
                  <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{issue}</div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Security Headers */}
        {secHeaders && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">{t.secHeadersTitle}</h2>
            <div className="divide-y divide-slate-800">
              {secHeaders.results.map((h) => (
                <HeaderBadge key={h.header} result={h} />
              ))}
            </div>
          </section>
        )}

        {/* Extended Security */}
        {ext && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold">{t.extSecurityTitle}</h2>

            {/* Quick checks */}
            <div className="divide-y divide-slate-800">
              <CheckRow ok={ext.redirectsToHttps} label={t.redirectHttpsLabel} />
              <CheckRow ok={ext.compression.enabled} label={t.compressionLabel} note={ext.compression.encoding} />
              <CheckRow ok={!ext.directoryListing} label={t.directoryListingLabel}
                note={ext.directoryListing ? (lang === "el" ? "Ο κατάλογος είναι ορατός!" : "Directory is publicly visible!") : undefined} />
              {ext.cors && (
                <CheckRow ok={!ext.cors.risky} label={t.corsLabel}
                  note={ext.cors.risky ? t.corsRiskyNote : `Allow-Origin: ${ext.cors.allowOrigin}`} />
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
                    <div key={f.path} className={`rounded-lg border px-4 py-3 ${riskBg[f.risk]}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-bold uppercase ${riskColor[f.risk]}`}>{f.risk}</span>
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
                          <td className={`py-2 pr-4 font-semibold ${c.secure ? "text-green-400" : "text-red-400"}`}>{c.secure ? "✓" : "✗"}</td>
                          <td className={`py-2 pr-4 font-semibold ${c.httpOnly ? "text-green-400" : "text-red-400"}`}>{c.httpOnly ? "✓" : "✗"}</td>
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

        {/* SEO Extras */}
        {ext && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">{t.seoExtrasTitle}</h2>
            <div className="divide-y divide-slate-800">
              <CheckRow ok={!!ext.openGraph}      label={t.openGraphLabel}
                note={ext.openGraph?.title ? `"${ext.openGraph.title.slice(0, 60)}"` : undefined} />
              <CheckRow ok={!!ext.twitterCard}    label={t.twitterCardLabel}
                note={ext.twitterCard?.card} />
              <CheckRow ok={ext.schemaOrg}        label={t.schemaOrgLabel} />
              <CheckRow ok={ext.sitemapFound}     label={t.sitemapLabel} />
              <CheckRow ok={ext.securityTxtFound} label={t.securityTxtLabel} />
            </div>
          </section>
        )}

        {/* Lighthouse Issues */}
        {issues && issues.length > 0 && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">{t.issuesTitle} ({issues.length})</h2>
            <div className="space-y-3">
              {issues
                .sort((a, b) => ({ error: 0, warning: 1, info: 2 }[a.severity] - { error: 0, warning: 1, info: 2 }[b.severity]))
                .map((issue, i) => (
                  <IssueCard key={i} issue={issue} />
                ))}
            </div>
          </section>
        )}

        <div className="pt-2 pb-6">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition font-medium">
            {t.returnHome}
          </a>
        </div>

      </div>
    </main>
  );
}
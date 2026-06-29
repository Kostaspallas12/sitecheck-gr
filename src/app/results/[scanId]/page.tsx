import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { findScanWithResult } from "@/lib/db";
import { ScoreRing } from "@/components/ScoreRing";
import { IssueCard } from "@/components/IssueCard";
import { HeaderBadge } from "@/components/HeaderBadge";
import type { Lang } from "@/lib/i18n";
import { getT } from "@/lib/i18n";

interface PageProps {
  params: Promise<{ scanId: string }>;
  searchParams: Promise<{ siteId?: string; failed?: string }>;
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

  function parseField<F>(field: unknown): F | null {
    if (!field) return null;
    if (typeof field === "string") { try { return JSON.parse(field) as F; } catch { return null; } }
    return field as F;
  }

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

  const scores = [
    { label: "Performance", value: r.performanceScore ?? 0 },
    { label: "SEO", value: r.seoScore ?? 0 },
    { label: "Accessibility", value: r.accessibilityScore ?? 0 },
    { label: "Best Practices", value: r.bestPracticesScore ?? 0 },
    { label: "Security", value: r.securityScore ?? 0 },
  ];

  const overallScore = Math.round(scores.reduce((sum, s) => sum + s.value, 0) / scores.length);
  const overallColor = overallScore >= 90 ? "text-green-400" : overallScore >= 50 ? "text-orange-400" : "text-red-400";
  const overallRating = overallScore >= 90 ? t.excellent : overallScore >= 70 ? t.good : overallScore >= 50 ? t.fair : t.poor;

  return (
    <main className="px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">

        <div>
          <p className="text-slate-500 text-sm mb-1">{t.resultsFor}</p>
          <h1 className="text-3xl font-bold text-blue-400">{scan.site.domain}</h1>
        </div>

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
                  <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {issue}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

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
import { notFound } from "next/navigation";
import { findScanWithResult } from "@/lib/db";
import { ScoreRing } from "@/components/ScoreRing";
import { IssueCard } from "@/components/IssueCard";
import { HeaderBadge } from "@/components/HeaderBadge";

interface PageProps {
  params: Promise<{ scanId: string }>;
  searchParams: Promise<{ siteId?: string; failed?: string }>;
}

export default async function ResultsPage({ params, searchParams }: PageProps) {
  const { scanId } = await params;
  const { siteId } = await searchParams;

  const scan = await findScanWithResult(scanId);

  if (!scan || scan.status !== "DONE" || !scan.result) notFound();

  if (siteId && scan.siteId !== siteId) notFound();

  const r = scan.result;

  function parseField<T>(field: unknown): T | null {
    if (!field) return null;
    if (typeof field === "string") { try { return JSON.parse(field) as T; } catch { return null; } }
    return field as T;
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-10">

        <div>
          <p className="text-slate-500 text-sm mb-1">Αποτελέσματα για</p>
          <h1 className="text-3xl font-bold text-indigo-400">{scan.site.domain}</h1>
          <p className="text-slate-500 text-xs mt-1">
            Ανάλυση: {new Date(scan.finishedAt!).toLocaleString("el-GR")}
          </p>
        </div>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-lg font-semibold mb-8">Συνολικές βαθμολογίες</h2>
          <div className="flex flex-wrap justify-around gap-8">
            {scores.map((s) => (
              <ScoreRing key={s.label} score={s.value} label={s.label} />
            ))}
          </div>
        </section>

        {ssl && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">SSL / HTTPS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div className="bg-slate-800 rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-1">Κατάσταση</p>
                <p className={ssl.valid ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                  {ssl.valid ? "Έγκυρο" : "Μη έγκυρο"}
                </p>
              </div>
              <div className="bg-slate-800 rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-1">Εκδότης</p>
                <p className="text-slate-200 font-medium truncate">{ssl.issuer ?? "—"}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-1">Λήγει σε</p>
                <p className={`font-semibold ${(ssl.daysUntilExpiry ?? 0) < 30 ? "text-orange-400" : "text-green-400"}`}>
                  {ssl.daysUntilExpiry !== undefined ? `${ssl.daysUntilExpiry} μέρες` : "—"}
                </p>
              </div>
              <div className="bg-slate-800 rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-1">Πρωτόκολλο</p>
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
            <h2 className="text-lg font-semibold mb-4">Security Headers</h2>
            <div className="space-y-3">
              {secHeaders.results.map((h) => (
                <HeaderBadge key={h.header} result={h} />
              ))}
            </div>
          </section>
        )}

        {issues && issues.length > 0 && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">
              Προβλήματα ({issues.length})
            </h2>
            <div className="space-y-3">
              {issues
                .sort((a, b) => {
                  const order = { error: 0, warning: 1, info: 2 };
                  return order[a.severity] - order[b.severity];
                })
                .map((issue, i) => (
                  <IssueCard key={i} issue={issue} />
                ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}

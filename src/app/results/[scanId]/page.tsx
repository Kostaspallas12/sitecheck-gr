import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { findScanWithResult } from "@/lib/db";
import type { Lang } from "@/lib/i18n";
import { getT } from "@/lib/i18n";
import { ResultsTabs } from "@/components/ResultsTabs";
import type { ResultsData } from "@/components/ResultsTabs";
import { EmailResultsButton } from "@/components/EmailResultsButton";

interface PageProps {
  params: Promise<{ scanId: string }>;
  searchParams: Promise<{ siteId?: string }>;
}

function parseField<F>(field: unknown): F | null {
  if (!field) return null;
  if (typeof field === "string") { try { return JSON.parse(field) as F; } catch { return null; } }
  return field as F;
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

  const secHeadersParsed = parseField<{
    results: Array<{
      header: string; present: boolean; value?: string;
      severity: "critical" | "high" | "medium" | "low" | "info";
      description: string; recommendation: string;
    }>;
  }>(r.securityHeaders);

  const data: ResultsData = {
    scores: [
      { label: "Performance",    value: r.performanceScore    ?? 0 },
      { label: "SEO",            value: r.seoScore            ?? 0 },
      { label: "Accessibility",  value: r.accessibilityScore  ?? 0 },
      { label: "Best Practices", value: r.bestPracticesScore  ?? 0 },
      { label: "Security",       value: r.securityScore       ?? 0 },
    ],
    ssl: parseField(r.sslData),
    secHeaders: secHeadersParsed?.results ?? null,
    issues: parseField(r.issues),
    ext: parseField(r.extendedAudit),
  };

  return (
    <main className="px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Domain header */}
        <div>
          <p className="text-slate-500 text-sm mb-1">{t.resultsFor}</p>
          <h1 className="text-3xl font-bold text-blue-400">{scan.site.domain}</h1>
        </div>

        {/* Tabbed results */}
        <ResultsTabs data={data} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-6">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition font-medium">
            {t.returnHome}
          </a>
          {scan.userEmail && (
            <EmailResultsButton scanId={scanId} email={scan.userEmail} />
          )}
        </div>

      </div>
    </main>
  );
}
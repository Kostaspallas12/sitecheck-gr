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

  if (!scan) notFound();
  if (siteId && scan.siteId !== siteId) notFound();

  if (scan.status === "FAILED" || !scan.result) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-400">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Η ανάλυση απέτυχε</h1>
          <p className="text-slate-400 text-sm mb-6">Κάτι πήγε στραβά κατά τη σάρωση. Δοκιμάστε ξανά σε λίγο.</p>
          <a href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition">
            ← Νέα ανάλυση
          </a>
        </div>
      </main>
    );
  }

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

        {/* Email results */}
        <EmailResultsButton scanId={scanId} defaultEmail={scan.site.userEmail ?? ""} />

        <div className="pt-2 pb-6">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition font-medium">
            {t.returnHome}
          </a>
        </div>

      </div>
    </main>
  );
}
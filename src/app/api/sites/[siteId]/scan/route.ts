import { NextRequest, NextResponse } from "next/server";
import { findSiteById, findRunningScan, createScan, updateScan, createScanResult } from "@/lib/db";
import { runFullScan } from "@/lib/scanner";
import { checkRateLimit, getClientIP } from "@/lib/security/rate-limiter";

export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  if (!checkRateLimit(`scan:${getClientIP(req)}`, 3, 60_000)) {
    return NextResponse.json({ error: "Υπερβολικά πολλά αιτήματα. Δοκιμάστε σε λίγο." }, { status: 429 });
  }

  const { siteId } = await params;
  const site = await findSiteById(siteId);

  if (!site) {
    return NextResponse.json({ error: "Site δεν βρέθηκε" }, { status: 404 });
  }

  if (!site.verified) {
    return NextResponse.json(
      { error: "Το site δεν έχει επαληθευτεί. Επαληθεύστε πρώτα την ιδιοκτησία σας." },
      { status: 403 }
    );
  }

  const running = await findRunningScan(siteId);
  if (running) {
    return NextResponse.json({ scanId: running.id, status: running.status });
  }

  const scan = await createScan(siteId);

  runFullScan(`https://${site.domain}`)
    .then(async (result) => {
      await createScanResult({
        scanId: scan.id,
        performanceScore: result.scores.performance,
        seoScore: result.scores.seo,
        accessibilityScore: result.scores.accessibility,
        bestPracticesScore: result.scores.bestPractices,
        securityScore: result.scores.security,
        lighthouseData: JSON.stringify(result.lighthouse),
        securityHeaders: JSON.stringify(result.securityHeaders),
        sslData: JSON.stringify(result.ssl),
        issues: JSON.stringify(result.lighthouse.issues),
        extendedAudit: JSON.stringify(result.extendedAudit),
      });
      await updateScan(scan.id, { status: "DONE", finishedAt: new Date() });
    })
    .catch(async () => {
      await updateScan(scan.id, { status: "FAILED", finishedAt: new Date() });
    });

  return NextResponse.json({ scanId: scan.id, status: "RUNNING" }, { status: 202 });
}

import { createScanResult, updateScan } from "@/lib/db";
import { runFullScan, type FullScanResult } from "./index";

// Runs a scan and persists its result, marking the scan DONE or FAILED.
export async function runAndSaveScan(scanId: string, domain: string): Promise<FullScanResult | null> {
  try {
    const result = await runFullScan(`https://${domain}`);
    await createScanResult({
      scanId,
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
    await updateScan(scanId, { status: "DONE", finishedAt: new Date() });
    return result;
  } catch (e) {
    console.error(`[scan] ${scanId} failed:`, e);
    await updateScan(scanId, { status: "FAILED", finishedAt: new Date() });
    return null;
  }
}

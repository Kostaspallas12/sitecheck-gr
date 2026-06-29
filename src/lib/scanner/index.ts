import { checkSecurityHeaders } from "./security-headers";
import { checkSSL } from "./ssl-checker";
import { runLighthouse } from "./lighthouse-runner";
import { runExtendedAudit, type ExtendedAuditResult } from "./extended-audit";

export interface FullScanResult {
  url: string;
  scores: {
    performance: number;
    seo: number;
    accessibility: number;
    bestPractices: number;
    security: number;
    ssl: number;
  };
  securityHeaders: Awaited<ReturnType<typeof checkSecurityHeaders>>;
  ssl: Awaited<ReturnType<typeof checkSSL>>;
  lighthouse: Awaited<ReturnType<typeof runLighthouse>>;
  extendedAudit: ExtendedAuditResult;
  scannedAt: string;
}

export async function runFullScan(url: string): Promise<FullScanResult> {
  const hostname = new URL(url).hostname;

  const [lighthouse, securityHeaders, ssl, extendedAudit] = await Promise.all([
    runLighthouse(url),
    checkSecurityHeaders(url),
    checkSSL(hostname),
    runExtendedAudit(url),
  ]);

  const securityScore = Math.round(
    securityHeaders.score * 0.6 + ssl.score * 0.4
  );

  return {
    url,
    scores: {
      performance: lighthouse.performance,
      seo: lighthouse.seo,
      accessibility: lighthouse.accessibility,
      bestPractices: lighthouse.bestPractices,
      security: securityScore,
      ssl: ssl.score,
    },
    securityHeaders,
    ssl,
    lighthouse,
    extendedAudit,
    scannedAt: new Date().toISOString(),
  };
}
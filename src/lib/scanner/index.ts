import { checkSecurityHeaders } from "./security-headers";
import { checkSSL, type SSLResult } from "./ssl-checker";
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

const EMPTY_EXTENDED: ExtendedAuditResult = {
  technologies: [], cookies: [], infoLeaks: [], exposedFiles: [],
  sitemapFound: false, securityTxtFound: false, cors: null,
  compression: { enabled: false }, openGraph: null, twitterCard: null,
  schemaOrg: false, redirectsToHttps: false, directoryListing: false,
};

const EMPTY_SSL: SSLResult = {
  valid: false, issues: ["Αδύνατη σύνδεση SSL"], score: 0,
};

export async function runFullScan(url: string): Promise<FullScanResult> {
  const hostname = new URL(url).hostname;

  const [lighthouse, securityHeaders, ssl, extendedAudit] = await Promise.all([
    runLighthouse(url).catch((e) => {
      console.error("[scan] lighthouse failed:", e);
      return { performance: 0, seo: 0, accessibility: 0, bestPractices: 0, issues: [] as Awaited<ReturnType<typeof runLighthouse>>["issues"] };
    }),
    checkSecurityHeaders(url).catch((e) => {
      console.error("[scan] security-headers failed:", e);
      return { results: [] as Awaited<ReturnType<typeof checkSecurityHeaders>>["results"], score: 0, missingCritical: [] as string[] };
    }),
    checkSSL(hostname).catch((e) => {
      console.error("[scan] ssl-checker failed:", e);
      return EMPTY_SSL;
    }),
    runExtendedAudit(url).catch((e) => {
      console.error("[scan] extended-audit failed:", e);
      return EMPTY_EXTENDED;
    }),
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
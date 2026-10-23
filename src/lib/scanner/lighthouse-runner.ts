import { assertPublicDomain } from "@/lib/security/ssrf-guard";

export interface LighthouseScores {
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
  issues: LighthouseIssue[];
}

export interface LighthouseIssue {
  category: string;
  title: string;
  description: string;
  severity: "error" | "warning" | "info";
}

// The subset of Lighthouse's result (LHR) that we read
interface LhrAudit {
  title: string;
  description: string;
  score: number | null;
  errorMessage?: string;
}
interface LhrCategory {
  title: string;
  score: number | null;
  auditRefs: { id: string; weight: number }[];
}
interface Lhr {
  runtimeError?: { code: string; message: string };
  categories: Record<string, LhrCategory>;
  audits: Record<string, LhrAudit>;
}

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

// Lighthouse runs on Google's PageSpeed Insights infrastructure rather than a headless Chrome in our
// function: sites with bot protection block datacenter headless browsers but generally let Google through.
async function fetchLhr(url: string): Promise<Lhr> {
  const params = new URLSearchParams({ url, strategy: "mobile" });
  for (const c of ["performance", "seo", "accessibility", "best-practices"]) params.append("category", c);
  if (process.env.PAGESPEED_API_KEY) params.set("key", process.env.PAGESPEED_API_KEY);

  const res = await fetch(`${PSI_ENDPOINT}?${params}`, { signal: AbortSignal.timeout(120_000) });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.lighthouseResult) {
    throw new Error(`PageSpeed Insights ${res.status}: ${body?.error?.message ?? "no Lighthouse result"}`);
  }
  return body.lighthouseResult as Lhr;
}

export async function runLighthouse(url: string): Promise<LighthouseScores> {
  await assertPublicDomain(new URL(url).hostname);

  const lhr = await fetchLhr(url);

  // The page itself failed to load (e.g. the site answered 403)
  if (lhr.runtimeError) {
    console.error("[lighthouse] runtime error:", lhr.runtimeError);
    return {
      performance: 0, seo: 0, accessibility: 0, bestPractices: 0,
      issues: [{
        category: "Performance",
        title: "Lighthouse could not load the page",
        description: lhr.runtimeError.message,
        severity: "error",
      }],
    };
  }

  const { categories, audits } = lhr;
  const issues: LighthouseIssue[] = [];

  // Lighthouse nulls a category's score if any weighted audit errored.
  // Fall back to the weighted mean of the audits that did run.
  const score = (cat: string) => {
    const category = categories[cat];
    if (!category) return 0;
    if (category.score !== null) return Math.round(category.score * 100);

    let total = 0, weight = 0;
    for (const ref of category.auditRefs) {
      if (!ref.weight) continue;
      const audit = audits[ref.id];
      if (audit?.score == null) {
        console.error(`[lighthouse] ${cat}/${ref.id} not measured:`, audit?.errorMessage);
        issues.push({
          category: category.title,
          title: audit?.title ?? ref.id,
          description: `Could not be measured: ${audit?.errorMessage ?? "unknown error"}`,
          severity: "info",
        });
        continue;
      }
      total += audit.score * ref.weight;
      weight += ref.weight;
    }
    return weight ? Math.round((total / weight) * 100) : 0;
  };

  const pushIssues = (auditIds: string[], category: string) => {
    for (const id of auditIds) {
      const audit = audits[id];
      if (!audit || audit.score === null || audit.score === 1) continue;
      issues.push({
        category,
        title: audit.title,
        description: audit.description,
        severity: audit.score === 0 ? "error" : audit.score < 0.5 ? "warning" : "info",
      });
    }
  };

  pushIssues(
    ["first-contentful-paint", "speed-index", "largest-contentful-paint",
     "interactive", "total-blocking-time", "cumulative-layout-shift",
     "render-blocking-resources", "unused-javascript", "unused-css-rules",
     "uses-optimized-images", "uses-webp-images"],
    "Performance"
  );
  pushIssues(
    ["meta-description", "document-title", "hreflang", "canonical",
     "robots-txt", "image-alt", "link-text", "crawlable-anchors"],
    "SEO"
  );
  pushIssues(
    ["color-contrast", "image-alt", "label", "button-name",
     "aria-required-attr", "heading-order"],
    "Accessibility"
  );
  pushIssues(
    ["is-on-https", "no-vulnerable-libraries", "csp-xss",
     "deprecations", "errors-in-console"],
    "Best Practices"
  );

  return {
    performance: score("performance"),
    seo: score("seo"),
    accessibility: score("accessibility"),
    bestPractices: score("best-practices"),
    issues,
  };
}

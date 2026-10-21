import lighthouse from "lighthouse";
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

// Vercel has no system Chrome: use the serverless Chromium build there, and puppeteer's bundled Chrome locally.
async function launchBrowser() {
  if (process.env.VERCEL) {
    const [{ default: puppeteer }, { default: chromium }] = await Promise.all([
      import("puppeteer-core"),
      import("@sparticuz/chromium"),
    ]);
    return puppeteer.launch({
      args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  }

  const { default: puppeteer } = await import("puppeteer");
  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
}

export async function runLighthouse(url: string): Promise<LighthouseScores> {
  await assertPublicDomain(new URL(url).hostname);

  let browser;
  try {
    browser = await launchBrowser();

    const port = parseInt(new URL(browser.wsEndpoint()).port);

    const result = await lighthouse(url, {
      port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "seo", "accessibility", "best-practices"],
    });

    if (!result?.lhr) throw new Error("Lighthouse δεν επέστρεψε αποτελέσματα");

    // The page itself failed to load (e.g. the site answered 403 to the headless browser)
    if (result.lhr.runtimeError) {
      console.error("[lighthouse] runtime error:", result.lhr.runtimeError);
      return {
        performance: 0, seo: 0, accessibility: 0, bestPractices: 0,
        issues: [{
          category: "Performance",
          title: "Lighthouse could not load the page",
          description: result.lhr.runtimeError.message,
          severity: "error",
        }],
      };
    }

    const { categories, audits } = result.lhr;
    const issues: LighthouseIssue[] = [];

    // Lighthouse nulls a category's score if any weighted audit errored (e.g. a metric the
    // serverless Chromium couldn't measure). Fall back to the weighted mean of the audits that did run.
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
  } finally {
    await browser?.close();
  }
}

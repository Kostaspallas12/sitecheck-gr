import puppeteer from "puppeteer";
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

export async function runLighthouse(url: string): Promise<LighthouseScores> {
  await assertPublicDomain(new URL(url).hostname);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const port = parseInt(new URL(browser.wsEndpoint()).port);

    const result = await lighthouse(url, {
      port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "seo", "accessibility", "best-practices"],
    });

    if (!result?.lhr) throw new Error("Lighthouse δεν επέστρεψε αποτελέσματα");

    const { categories, audits } = result.lhr;
    const score = (cat: string) => Math.round((categories[cat]?.score ?? 0) * 100);

    const issues: LighthouseIssue[] = [];

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

import { NextRequest, NextResponse } from "next/server";
import { getSitesForWeeklyRescan, createScan, updateScan, createScanResult, getLatestCompletedScan } from "@/lib/db";
import { runFullScan } from "@/lib/scanner";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sites = await getSitesForWeeklyRescan();
  const triggered: string[] = [];

  for (const site of sites) {
    try {
      const prev = await getLatestCompletedScan(site.siteId);
      const scan = await createScan(site.siteId);

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

          // Send email if score changed significantly
          if (prev?.scores && site.userId) {
            const newAvg = Math.round((result.scores.performance + result.scores.seo + result.scores.accessibility + result.scores.bestPractices + result.scores.security) / 5);
            const prevAvg = Math.round(((prev.scores.performance ?? 0) + (prev.scores.seo ?? 0) + (prev.scores.accessibility ?? 0) + (prev.scores.bestPractices ?? 0) + (prev.scores.security ?? 0)) / 5);
            if (Math.abs(newAvg - prevAvg) >= 5) {
              const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : "");
              const apiKey = process.env.BREVO_API_KEY;
              const senderEmail = process.env.BREVO_SENDER_EMAIL;
              if (apiKey && senderEmail && baseUrl) {
                await fetch("https://api.brevo.com/v3/smtp/email", {
                  method: "POST",
                  headers: { "api-key": apiKey, "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sender: { name: "SiteCheck", email: senderEmail },
                    to: [{ email: site.userId }],
                    subject: `Αλλαγή βαθμολογίας για ${site.domain}`,
                    htmlContent: `<p>Το site <strong>${site.domain}</strong> άλλαξε βαθμολογία: ${prevAvg} → ${newAvg}.</p><p><a href="${baseUrl}/results/${scan.id}">Δες τα αποτελέσματα</a></p>`,
                  }),
                }).catch(() => {});
              }
            }
          }
        })
        .catch(async () => {
          await updateScan(scan.id, { status: "FAILED", finishedAt: new Date() });
        });

      triggered.push(site.domain);
    } catch (e) {
      console.error(`[cron/rescan] failed for ${site.domain}:`, e);
    }
  }

  return NextResponse.json({ triggered, count: triggered.length });
}

import { NextRequest, NextResponse, after } from "next/server";
import { getSitesForWeeklyRescan, createScan, getLatestCompletedScan } from "@/lib/db";
import { runAndSaveScan } from "@/lib/scanner/run-and-save";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sites = await getSitesForWeeklyRescan();

  // One at a time, to stay within PageSpeed Insights rate limits
  after(async () => {
    for (const site of sites) {
      try {
        const prev = await getLatestCompletedScan(site.siteId);
        const scan = await createScan(site.siteId);
        const result = await runAndSaveScan(scan.id, site.domain);

        // Send email if score changed significantly
        if (result && prev?.scores && site.userId) {
          const newAvg = Math.round((result.scores.performance + result.scores.seo + result.scores.accessibility + result.scores.bestPractices + result.scores.security) / 5);
          const prevAvg = Math.round(((prev.scores.performance ?? 0) + (prev.scores.seo ?? 0) + (prev.scores.accessibility ?? 0) + (prev.scores.bestPractices ?? 0) + (prev.scores.security ?? 0)) / 5);
          if (Math.abs(newAvg - prevAvg) >= 5) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sitecheck-gr.vercel.app";
            const apiKey = process.env.BREVO_API_KEY;
            const senderEmail = process.env.BREVO_SENDER_EMAIL;
            if (apiKey && senderEmail) {
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
      } catch (e) {
        console.error(`[cron/rescan] failed for ${site.domain}:`, e);
      }
    }
  });

  const triggered = sites.map((s) => s.domain);
  return NextResponse.json({ triggered, count: triggered.length });
}

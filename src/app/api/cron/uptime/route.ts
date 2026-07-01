import { NextRequest, NextResponse } from "next/server";
import { getAllVerifiedSites, saveUptimeCheck, updateSiteUptimeStatus } from "@/lib/db";

export const maxDuration = 60;

async function sendUptimeEmail(
  site: { domain: string; userId: string },
  status: "up" | "down",
  downtimeSince: Date | null
) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) return;

  const isDown = status === "down";

  let durationText = "";
  if (!isDown && downtimeSince) {
    const mins = Math.round((Date.now() - downtimeSince.getTime()) / 60_000);
    durationText = mins < 60
      ? ` μετά από ${mins} λεπτά`
      : ` μετά από ${Math.round(mins / 60)} ώρες`;
  }

  const subject = isDown
    ? `⚠️ Το ${site.domain} είναι εκτός λειτουργίας`
    : `✅ Το ${site.domain} επανήλθε online`;

  const htmlContent = isDown
    ? `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0f172a;color:#e2e8f0;border-radius:12px">
        <h2 style="color:#f87171;margin:0 0 16px">⚠️ Site Down</h2>
        <p>Το <strong>${site.domain}</strong> δεν ανταποκρίνεται.</p>
        <p style="color:#94a3b8;font-size:14px">Θα σε ειδοποιήσουμε μόλις επανέλθει online.</p>
        <p style="color:#475569;font-size:12px;margin-top:24px">SiteCheck Uptime Monitor</p>
      </div>`
    : `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0f172a;color:#e2e8f0;border-radius:12px">
        <h2 style="color:#4ade80;margin:0 0 16px">✅ Site Online</h2>
        <p>Το <strong>${site.domain}</strong> είναι πάλι online${durationText}.</p>
        <p style="color:#475569;font-size:12px;margin-top:24px">SiteCheck Uptime Monitor</p>
      </div>`;

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "SiteCheck", email: senderEmail },
      to: [{ email: site.userId }],
      subject,
      htmlContent,
    }),
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sites = await getAllVerifiedSites();
  const results: string[] = [];

  await Promise.allSettled(
    sites.map(async (site) => {
      const start = Date.now();
      let status: "up" | "down" = "down";
      let statusCode: number | null = null;

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10_000);
        const res = await fetch(`https://${site.domain}`, {
          method: "HEAD",
          signal: controller.signal,
          headers: { "User-Agent": "SiteCheck-Uptime/1.0" },
          redirect: "follow",
        });
        clearTimeout(timer);
        statusCode = res.status;
        status = res.status < 400 ? "up" : "down";
      } catch {
        status = "down";
      }

      const responseTime = Date.now() - start;
      const prevStatus = site.uptimeStatus;

      let downtimeSince = site.downtimeSince ?? null;
      if (status === "down" && prevStatus !== "down") {
        downtimeSince = new Date();
      } else if (status === "up") {
        downtimeSince = null;
      }

      await saveUptimeCheck(site.id, status, responseTime, statusCode);
      await updateSiteUptimeStatus(site.id, status, responseTime, downtimeSince);

      // Email only when status changes (and we have a previous status to compare)
      if (prevStatus !== null && prevStatus !== status) {
        await sendUptimeEmail(site, status, site.downtimeSince);
      }

      results.push(`${site.domain}: ${status} (${responseTime}ms)`);
    })
  );

  return NextResponse.json({ checked: sites.length, results });
}
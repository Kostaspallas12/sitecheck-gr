import { NextRequest, NextResponse } from "next/server";
import { findScanWithResult } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest, { params }: { params: Promise<{ scanId: string }> }) {
  try {
    const { scanId } = await params;
    const { email } = await req.json();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const scan = await findScanWithResult(scanId);
    if (!scan || scan.status !== "DONE" || !scan.result) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    const r = scan.result;
    const domain = scan.site.domain;
    const scores = [
      { label: "Performance", value: r.performanceScore ?? 0 },
      { label: "SEO", value: r.seoScore ?? 0 },
      { label: "Accessibility", value: r.accessibilityScore ?? 0 },
      { label: "Best Practices", value: r.bestPracticesScore ?? 0 },
      { label: "Security", value: r.securityScore ?? 0 },
    ];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : new URL(req.url).origin);
    const resultsUrl = `${baseUrl}/results/${scanId}`;

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    if (!apiKey || !senderEmail) {
      return NextResponse.json({ error: "Email not configured" }, { status: 500 });
    }

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "SiteCheck", email: senderEmail },
        to: [{ email }],
        subject: `Αποτελέσματα ανάλυσης για ${domain}`,
        htmlContent: buildEmailHtml(domain, scores, resultsUrl),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Brevo error:", err);
      return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function scoreColor(v: number) {
  if (v >= 90) return "#22c55e";
  if (v >= 70) return "#eab308";
  if (v >= 50) return "#f97316";
  return "#ef4444";
}

function buildEmailHtml(domain: string, scores: { label: string; value: number }[], resultsUrl: string) {
  const rows = scores
    .map(
      (s) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #f3f4f6;">
        <span style="color:#6b7280;font-size:13px;font-weight:500;text-transform:uppercase;letter-spacing:0.4px;">${s.label}</span>
        <div style="margin-top:6px;background:#f3f4f6;border-radius:4px;height:6px;width:100%;">
          <div style="background:${scoreColor(s.value)};border-radius:4px;height:6px;width:${s.value}%;"></div>
        </div>
      </td>
      <td style="padding:14px 0 14px 16px;text-align:right;border-bottom:1px solid #f3f4f6;white-space:nowrap;vertical-align:top;">
        <span style="font-weight:800;font-size:22px;color:${scoreColor(s.value)};">${s.value}</span><span style="color:#d1d5db;font-size:12px;font-weight:500;">/100</span>
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#f3f4f6;">Τα αποτελέσματα ανάλυσης για ${domain} είναι έτοιμα.</div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
    <tr><td align="center" style="padding:40px 16px;">

      <table width="520" cellpadding="0" cellspacing="0">

        <!-- Header -->
        <tr>
          <td style="background:#1e40af;border-radius:16px 16px 0 0;padding:32px 36px;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:8px;padding:6px 14px;margin-bottom:20px;">
              <span style="color:#ffffff;font-weight:700;font-size:13px;letter-spacing:0.5px;">SITECHECK</span>
            </div>
            <div>
              <p style="color:rgba(255,255,255,0.65);font-size:12px;margin:0 0 6px 0;letter-spacing:0.5px;text-transform:uppercase;">Ανάλυση ολοκληρώθηκε για</p>
              <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0;word-break:break-all;">${domain}</h1>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:32px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tbody>${rows}</tbody>
            </table>

            <div style="margin-top:32px;">
              <a href="${resultsUrl}" style="display:block;background:#1e40af;color:#ffffff;text-decoration:none;padding:16px 24px;border-radius:10px;font-weight:600;font-size:15px;text-align:center;">
                Δες τα πλήρη αποτελέσματα →
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-radius:0 0 16px 16px;border-top:1px solid #e5e7eb;padding:20px 36px;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">SiteCheck · Εργαλείο ανάλυσης website</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

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
      <td style="padding:16px 0;border-bottom:1px solid #1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:8px;">${s.label}</td>
            <td style="text-align:right;vertical-align:top;padding-bottom:8px;">
              <span style="font-weight:800;font-size:20px;color:${scoreColor(s.value)};">${s.value}</span><span style="color:#475569;font-size:11px;"> /100</span>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:4px;height:5px;">
                <tr><td width="${s.value}%" style="background:${scoreColor(s.value)};border-radius:4px;height:5px;font-size:0;">&nbsp;</td><td></td></tr>
              </table>
            </td>
          </tr>
        </table>
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
<body style="margin:0;padding:0;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#020617;">Τα αποτελέσματα ανάλυσης για ${domain} είναι έτοιμα.</div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020617;">
    <tr><td align="center" style="padding:40px 16px;">

      <table width="520" cellpadding="0" cellspacing="0" style="border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#0f172a;padding:32px 36px;border-bottom:1px solid #1e293b;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#2563eb;border-radius:8px;padding:7px 14px;">
                  <span style="color:#ffffff;font-weight:700;font-size:13px;letter-spacing:0.3px;">SiteCheck</span>
                </td>
              </tr>
            </table>
            <p style="color:#64748b;font-size:12px;margin:20px 0 5px 0;text-transform:uppercase;letter-spacing:0.6px;">Ανάλυση ολοκληρώθηκε για</p>
            <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0;word-break:break-all;">${domain}</h1>
          </td>
        </tr>

        <!-- Scores -->
        <tr>
          <td style="background:#0f172a;padding:8px 36px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tbody>${rows}</tbody>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="background:#0f172a;padding:0 36px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#2563eb;border-radius:10px;text-align:center;padding:16px;">
                  <a href="${resultsUrl}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;">
                    Δες τα πλήρη αποτελέσματα →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#020617;padding:20px 36px;text-align:center;border-top:1px solid #1e293b;">
            <p style="color:#334155;font-size:12px;margin:0;">SiteCheck · Εργαλείο ανάλυσης website</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

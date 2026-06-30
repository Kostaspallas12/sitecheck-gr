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
      <td style="padding:14px 20px;color:#cbd5e1;font-size:14px;border-bottom:1px solid #0f172a;">${s.label}</td>
      <td style="padding:14px 20px;text-align:right;border-bottom:1px solid #0f172a;">
        <span style="display:inline-block;background:${scoreColor(s.value)}22;color:${scoreColor(s.value)};font-weight:700;font-size:15px;padding:3px 10px;border-radius:20px;">${s.value}<span style="font-size:11px;opacity:0.7;">/100</span></span>
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
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">

  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;">Τα αποτελέσματα ανάλυσης για ${domain} είναι έτοιμα.</div>

  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <!-- Card -->
    <div style="background:#0f172a;border-radius:16px;overflow:hidden;">

      <!-- Header -->
      <div style="background:#1e293b;padding:24px 32px;border-bottom:1px solid #334155;">
        <div style="display:inline-block;background:#2563eb;border-radius:8px;padding:6px 14px;margin-bottom:16px;">
          <span style="color:#fff;font-weight:700;font-size:14px;letter-spacing:-0.2px;">SiteCheck</span>
        </div>
        <p style="color:#64748b;font-size:12px;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.8px;">Αποτελέσματα για</p>
        <h1 style="color:#60a5fa;font-size:22px;font-weight:700;margin:0;word-break:break-all;">${domain}</h1>
      </div>

      <!-- Scores -->
      <div style="padding:8px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tbody>${rows}</tbody>
        </table>
      </div>

      <!-- CTA -->
      <div style="padding:24px 32px;">
        <a href="${resultsUrl}" style="display:block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:600;font-size:15px;text-align:center;">
          Δες τα πλήρη αποτελέσματα →
        </a>
      </div>

      <!-- Footer -->
      <div style="padding:16px 32px 24px;text-align:center;border-top:1px solid #1e293b;">
        <p style="color:#475569;font-size:12px;margin:0;">SiteCheck — εργαλείο ανάλυσης website</p>
      </div>

    </div>
  </div>
</body>
</html>`;
}

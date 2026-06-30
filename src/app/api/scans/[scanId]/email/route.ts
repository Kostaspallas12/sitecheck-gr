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

    const baseUrl = new URL(req.url).origin;
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
      <td style="padding:12px 20px;color:#94a3b8;font-size:14px;border-bottom:1px solid #1e293b;">${s.label}</td>
      <td style="padding:12px 20px;text-align:right;border-bottom:1px solid #1e293b;">
        <span style="font-weight:700;font-size:16px;color:${scoreColor(s.value)};">${s.value}</span>
        <span style="color:#475569;font-size:12px;margin-left:2px;">/100</span>
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">

    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-block;background:#2563eb;border-radius:8px;padding:10px 20px;">
        <span style="color:#ffffff;font-weight:700;font-size:16px;letter-spacing:-0.3px;">SiteCheck</span>
      </div>
    </div>

    <p style="color:#64748b;font-size:13px;margin:0 0 6px 0;text-transform:uppercase;letter-spacing:0.5px;">Αποτελέσματα για</p>
    <h1 style="color:#60a5fa;font-size:28px;font-weight:700;margin:0 0 32px 0;">${domain}</h1>

    <table style="width:100%;border-collapse:collapse;background:#1e293b;border-radius:12px;overflow:hidden;margin-bottom:36px;">
      <thead>
        <tr style="background:#0f172a;">
          <th style="padding:12px 20px;text-align:left;color:#475569;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">Κατηγορία</th>
          <th style="padding:12px 20px;text-align:right;color:#475569;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">Βαθμολογία</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div style="text-align:center;margin-bottom:48px;">
      <a href="${resultsUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px;">
        Δες τα πλήρη αποτελέσματα →
      </a>
    </div>

    <div style="border-top:1px solid #1e293b;padding-top:24px;text-align:center;">
      <p style="color:#334155;font-size:12px;margin:0;line-height:1.6;">
        SiteCheck — εργαλείο ανάλυσης website
      </p>
    </div>

  </div>
</body>
</html>`;
}

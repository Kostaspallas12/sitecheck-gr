import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { findScanWithResult } from "@/lib/db";

const FROM = "SiteCheck <onboarding@resend.dev>";

function scoreColor(score: number) {
  if (score >= 90) return "#4ade80";
  if (score >= 50) return "#fb923c";
  return "#f87171";
}

function scoreLabel(score: number, lang: string) {
  if (lang === "el") {
    if (score >= 90) return "Εξαιρετικό";
    if (score >= 70) return "Καλό";
    if (score >= 50) return "Μέτριο";
    return "Χρειάζεται βελτίωση";
  }
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Needs improvement";
}

function buildEmail(domain: string, scan: NonNullable<Awaited<ReturnType<typeof findScanWithResult>>>, lang: string) {
  const r = scan.result!;
  const scores = [
    { label: lang === "el" ? "Απόδοση"             : "Performance",    value: r.performanceScore   ?? 0 },
    { label: "SEO",                                                       value: r.seoScore           ?? 0 },
    { label: lang === "el" ? "Προσβασιμότητα"      : "Accessibility",  value: r.accessibilityScore ?? 0 },
    { label: lang === "el" ? "Βέλτιστες Πρακτικές" : "Best Practices", value: r.bestPracticesScore ?? 0 },
    { label: lang === "el" ? "Ασφάλεια"            : "Security",       value: r.securityScore      ?? 0 },
  ];
  const overall = Math.round(scores.reduce((s, x) => s + x.value, 0) / scores.length);

  const issues: Array<{ title: string; severity: string }> = (() => {
    try { return r.issues ? JSON.parse(r.issues as string) : []; } catch { return []; }
  })();
  const topIssues = issues
    .filter(i => i.severity === "error")
    .slice(0, 5);

  const resultsUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://sitecheck.gr"}/results/${scan.id}`;

  const scoresHtml = scores.map(s => `
    <tr>
      <td style="padding:8px 0;color:#94a3b8;font-size:14px;">${s.label}</td>
      <td style="padding:8px 0;text-align:right;">
        <span style="color:${scoreColor(s.value)};font-weight:700;font-size:14px;">${s.value}</span>
        <span style="color:#475569;font-size:12px;margin-left:6px;">/100</span>
      </td>
    </tr>
  `).join("");

  const issuesHtml = topIssues.length === 0 ? "" : `
    <div style="margin-top:28px;">
      <p style="color:#94a3b8;font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;margin:0 0 12px;">
        ${lang === "el" ? "Κρίσιμα προβλήματα" : "Critical issues"}
      </p>
      ${topIssues.map(i => `
        <div style="background:#1e1b33;border:1px solid #ef4444;border-left:3px solid #ef4444;border-radius:8px;padding:10px 14px;margin-bottom:8px;">
          <p style="margin:0;color:#fca5a5;font-size:13px;">${i.title}</p>
        </div>
      `).join("")}
    </div>
  `;

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">

    <!-- Header -->
    <div style="background:#1e40af;border-radius:16px 16px 0 0;padding:24px 32px;">
      <p style="margin:0;color:#bfdbfe;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;">SiteCheck</p>
      <h1 style="margin:4px 0 0;color:#fff;font-size:20px;font-weight:700;">
        ${lang === "el" ? "Αποτελέσματα ανάλυσης" : "Analysis results"}
      </h1>
    </div>

    <!-- Body -->
    <div style="background:#1e293b;border-radius:0 0 16px 16px;padding:32px;">

      <h2 style="margin:0 0 4px;color:#60a5fa;font-size:22px;font-weight:700;">${domain}</h2>

      <!-- Overall score -->
      <div style="display:inline-block;background:#0f172a;border-radius:12px;padding:14px 24px;margin:16px 0 24px;">
        <p style="margin:0;color:#64748b;font-size:12px;">${lang === "el" ? "Συνολική βαθμολογία" : "Overall score"}</p>
        <p style="margin:4px 0 0;">
          <span style="color:${scoreColor(overall)};font-size:36px;font-weight:800;">${overall}</span>
          <span style="color:#475569;font-size:14px;">/100 &nbsp;·&nbsp;</span>
          <span style="color:${scoreColor(overall)};font-size:13px;font-weight:600;">${scoreLabel(overall, lang)}</span>
        </p>
      </div>

      <!-- Scores breakdown -->
      <p style="color:#94a3b8;font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;margin:0 0 4px;">
        ${lang === "el" ? "Αναλυτικές βαθμολογίες" : "Score breakdown"}
      </p>
      <table style="width:100%;border-collapse:collapse;border-top:1px solid #334155;border-bottom:1px solid #334155;">
        ${scoresHtml}
      </table>

      ${issuesHtml}

      <!-- CTA -->
      <div style="margin-top:32px;text-align:center;">
        <a href="${resultsUrl}"
          style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:14px;">
          ${lang === "el" ? "Δες τα πλήρη αποτελέσματα →" : "View full results →"}
        </a>
      </div>

      <!-- Footer -->
      <p style="margin:32px 0 0;color:#334155;font-size:12px;text-align:center;">
        SiteCheck &mdash; ${lang === "el" ? "Δωρεάν εργαλείο ανάλυσης ιστοσελίδων" : "Free website audit tool"}
      </p>
    </div>
  </div>
</body>
</html>`;

  const subject = lang === "el"
    ? `Αποτελέσματα ανάλυσης για ${domain} — ${overall}/100`
    : `Analysis results for ${domain} — ${overall}/100`;

  return { html, subject };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;
  const { lang } = await req.json().catch(() => ({ lang: "el" }));

  const scan = await findScanWithResult(scanId);
  if (!scan || scan.status !== "DONE" || !scan.result) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }
  if (!scan.userEmail) {
    return NextResponse.json({ error: "No email on file" }, { status: 400 });
  }

  const { html, subject } = buildEmail(scan.site.domain, scan, lang ?? "el");

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM,
    to: scan.userEmail,
    subject,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

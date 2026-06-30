import { notFound } from "next/navigation";
import { findScanWithResult } from "@/lib/db";
import { AutoPrint } from "./AutoPrint";

interface PageProps {
  params: Promise<{ scanId: string }>;
}

function scoreColor(v: number) {
  if (v >= 90) return "#16a34a";
  if (v >= 70) return "#ca8a04";
  if (v >= 50) return "#ea580c";
  return "#dc2626";
}

function scoreBg(v: number) {
  if (v >= 90) return "#dcfce7";
  if (v >= 70) return "#fef9c3";
  if (v >= 50) return "#ffedd5";
  return "#fee2e2";
}

function parseField<F>(field: unknown): F | null {
  if (!field) return null;
  if (typeof field === "string") { try { return JSON.parse(field) as F; } catch { return null; } }
  return field as F;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value);
  const bg = scoreBg(value);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ background: "#f1f5f9", borderRadius: 8, height: 8 }}>
        <div style={{ background: color, borderRadius: 8, height: 8, width: `${value}%` }} />
      </div>
    </div>
  );
}

export default async function ReportPage({ params }: PageProps) {
  const { scanId } = await params;
  const scan = await findScanWithResult(scanId);
  if (!scan || scan.status !== "DONE" || !scan.result) notFound();

  const r = scan.result;

  const scores = [
    { label: "Performance",    value: r.performanceScore    ?? 0 },
    { label: "SEO",            value: r.seoScore            ?? 0 },
    { label: "Accessibility",  value: r.accessibilityScore  ?? 0 },
    { label: "Best Practices", value: r.bestPracticesScore  ?? 0 },
    { label: "Security",       value: r.securityScore       ?? 0 },
  ];

  const overall = Math.round(scores.reduce((a, s) => a + s.value, 0) / scores.length);

  const ssl = parseField<{
    valid: boolean; issuer?: string; daysUntilExpiry?: number;
    protocol?: string; issues: string[]; score: number;
  }>(r.sslData);

  const secHeadersParsed = parseField<{
    results: Array<{
      header: string; present: boolean; value?: string;
      severity: "critical" | "high" | "medium" | "low" | "info";
      description: string; recommendation: string;
    }>;
  }>(r.securityHeaders);
  const secHeaders = secHeadersParsed?.results ?? null;

  const issues = parseField<Array<{
    category: string; title: string; description: string;
    severity: "error" | "warning" | "info";
  }>>(r.issues);

  const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const sevColor = (s: string) =>
    s === "critical" ? "#dc2626" : s === "high" ? "#ea580c" : s === "medium" ? "#ca8a04" : "#6b7280";

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: 780, margin: "0 auto", padding: "48px 32px", color: "#111827", background: "#fff" }}>
      <AutoPrint />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, borderBottom: "2px solid #e2e8f0", paddingBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Site Audit Report</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>{scan.site.domain}</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "6px 0 0" }}>Generated on {date}</p>
        </div>
        <div style={{ textAlign: "center", background: scoreBg(overall), borderRadius: 16, padding: "16px 24px" }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: scoreColor(overall), lineHeight: 1 }}>{overall}</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>Overall Score</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
          Score Breakdown
        </h2>
        {scores.map((s) => <ScoreBar key={s.label} label={s.label} value={s.value} />)}
      </section>

      {/* SSL */}
      {ssl && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
            SSL / HTTPS
          </h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ background: ssl.valid ? "#dcfce7" : "#fee2e2", borderRadius: 10, padding: "10px 16px" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: ssl.valid ? "#16a34a" : "#dc2626" }}>
                {ssl.valid ? "Valid Certificate" : "Invalid Certificate"}
              </span>
            </div>
            {ssl.issuer && (
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 16px" }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Issuer: </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{ssl.issuer}</span>
              </div>
            )}
            {ssl.daysUntilExpiry !== undefined && (
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 16px" }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Expires in: </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: ssl.daysUntilExpiry < 30 ? "#dc2626" : "#374151" }}>{ssl.daysUntilExpiry} days</span>
              </div>
            )}
            {ssl.protocol && (
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 16px" }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Protocol: </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{ssl.protocol}</span>
              </div>
            )}
          </div>
          {ssl.issues.length > 0 && (
            <ul style={{ marginTop: 12, paddingLeft: 18, color: "#dc2626", fontSize: 13 }}>
              {ssl.issues.map((issue, i) => <li key={i} style={{ marginBottom: 4 }}>{issue}</li>)}
            </ul>
          )}
        </section>
      )}

      {/* Security Headers */}
      {secHeaders && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
            Security Headers
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>Header</th>
                <th style={{ textAlign: "center", padding: "8px 12px", color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #e2e8f0", width: 80 }}>Status</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>Severity</th>
              </tr>
            </thead>
            <tbody>
              {secHeaders.map((h, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 500, color: "#374151" }}>{h.header}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center" }}>
                    <span style={{
                      display: "inline-block", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600,
                      background: h.present ? "#dcfce7" : "#fee2e2",
                      color: h.present ? "#16a34a" : "#dc2626"
                    }}>{h.present ? "Present" : "Missing"}</span>
                  </td>
                  <td style={{ padding: "8px 12px", color: sevColor(h.severity), fontWeight: 500, textTransform: "capitalize" }}>{h.severity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Issues */}
      {issues && issues.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
            Issues Found ({issues.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {issues.slice(0, 20).map((issue, i) => (
              <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", borderLeft: `3px solid ${sevColor(issue.severity)}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: sevColor(issue.severity), textTransform: "uppercase" }}>{issue.severity}</span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>{issue.category}</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", margin: 0 }}>{issue.title}</p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>{issue.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>Generated by SiteCheck</span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>sitecheck.gr</span>
      </div>

      <style>{`
        @media print {
          body { margin: 0; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </div>
  );
}

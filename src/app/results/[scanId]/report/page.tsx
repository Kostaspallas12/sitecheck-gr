import { notFound } from "next/navigation";
import { findScanWithResult } from "@/lib/db";
import { AutoPrint } from "./AutoPrint";

interface PageProps {
  params: Promise<{ scanId: string }>;
}

function parseField<F>(field: unknown): F | null {
  if (!field) return null;
  if (typeof field === "string") { try { return JSON.parse(field) as F; } catch { return null; } }
  return field as F;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#111" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{value}/100</span>
      </div>
      <div style={{ background: "#e5e7eb", borderRadius: 4, height: 6 }}>
        <div style={{ background: "#111", borderRadius: 4, height: 6, width: `${value}%` }} />
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
      header: string; present: boolean;
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

  const sevLabel = (s: string) =>
    s === "critical" ? "Critical" : s === "high" ? "High" : s === "medium" ? "Medium" : s === "error" ? "Error" : s === "warning" ? "Warning" : "Info";

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", maxWidth: 760, margin: "0 auto", padding: "48px 32px", color: "#111", background: "#fff" }}>
      <AutoPrint />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, borderBottom: "2px solid #111", paddingBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Site Audit Report</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: 0 }}>{scan.site.domain}</h1>
          <p style={{ fontSize: 12, color: "#555", margin: "6px 0 0" }}>Generated on {date}</p>
        </div>
        <div style={{ textAlign: "center", border: "2px solid #111", borderRadius: 12, padding: "14px 22px" }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: "#111", lineHeight: 1 }}>{overall}</div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Overall Score</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 14, paddingBottom: 6, borderBottom: "1px solid #d1d5db", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Score Breakdown
        </h2>
        {scores.map((s) => <ScoreBar key={s.label} label={s.label} value={s.value} />)}
      </section>

      {/* SSL */}
      {ssl && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 14, paddingBottom: 6, borderBottom: "1px solid #d1d5db", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            SSL / HTTPS
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "7px 0", color: "#555", width: 160 }}>Certificate</td>
                <td style={{ padding: "7px 0", fontWeight: 600 }}>{ssl.valid ? "Valid" : "Invalid"}</td>
              </tr>
              {ssl.issuer && (
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "7px 0", color: "#555" }}>Issuer</td>
                  <td style={{ padding: "7px 0", fontWeight: 600 }}>{ssl.issuer}</td>
                </tr>
              )}
              {ssl.daysUntilExpiry !== undefined && (
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "7px 0", color: "#555" }}>Expires in</td>
                  <td style={{ padding: "7px 0", fontWeight: 600 }}>{ssl.daysUntilExpiry} days</td>
                </tr>
              )}
              {ssl.protocol && (
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "7px 0", color: "#555" }}>Protocol</td>
                  <td style={{ padding: "7px 0", fontWeight: 600 }}>{ssl.protocol}</td>
                </tr>
              )}
            </tbody>
          </table>
          {ssl.issues.length > 0 && (
            <ul style={{ marginTop: 10, paddingLeft: 18, fontSize: 13, color: "#111" }}>
              {ssl.issues.map((issue, i) => <li key={i} style={{ marginBottom: 3 }}>{issue}</li>)}
            </ul>
          )}
        </section>
      )}

      {/* Security Headers */}
      {secHeaders && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 14, paddingBottom: 6, borderBottom: "1px solid #d1d5db", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Security Headers
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #111" }}>
                <th style={{ textAlign: "left", padding: "7px 8px 7px 0", color: "#111", fontWeight: 700 }}>Header</th>
                <th style={{ textAlign: "center", padding: "7px 8px", color: "#111", fontWeight: 700, width: 80 }}>Status</th>
                <th style={{ textAlign: "left", padding: "7px 0 7px 8px", color: "#111", fontWeight: 700, width: 90 }}>Severity</th>
              </tr>
            </thead>
            <tbody>
              {secHeaders.map((h, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "7px 8px 7px 0", fontWeight: 500 }}>{h.header}</td>
                  <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: 600 }}>
                    {h.present ? "✓" : "✗"}
                  </td>
                  <td style={{ padding: "7px 0 7px 8px", color: "#333", textTransform: "capitalize" }}>{h.severity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Issues */}
      {issues && issues.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 14, paddingBottom: 6, borderBottom: "1px solid #d1d5db", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Issues Found ({issues.length})
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #111" }}>
                <th style={{ textAlign: "left", padding: "7px 8px 7px 0", color: "#111", fontWeight: 700, width: 80 }}>Severity</th>
                <th style={{ textAlign: "left", padding: "7px 8px", color: "#111", fontWeight: 700, width: 100 }}>Category</th>
                <th style={{ textAlign: "left", padding: "7px 0 7px 8px", color: "#111", fontWeight: 700 }}>Issue</th>
              </tr>
            </thead>
            <tbody>
              {issues.slice(0, 25).map((issue, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "7px 8px 7px 0", fontWeight: 600, textTransform: "capitalize" }}>{sevLabel(issue.severity)}</td>
                  <td style={{ padding: "7px 8px", color: "#555" }}>{issue.category}</td>
                  <td style={{ padding: "7px 0 7px 8px" }}>
                    <div style={{ fontWeight: 500 }}>{issue.title}</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{issue.description}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Footer */}
      <div style={{ borderTop: "1px solid #d1d5db", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#888" }}>Generated by SiteCheck</span>
        <span style={{ fontSize: 11, color: "#888" }}>sitecheck.gr</span>
      </div>

      <style>{`
        @media print {
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 1.2cm; size: A4; }
        }
      `}</style>
    </div>
  );
}

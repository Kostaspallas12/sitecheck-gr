import axios from "axios";
import { assertPublicDomain } from "@/lib/security/ssrf-guard";

export interface SecurityHeaderResult {
  header: string;
  present: boolean;
  value?: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  recommendation: string;
}

const SECURITY_HEADERS: Array<{
  name: string;
  severity: SecurityHeaderResult["severity"];
  description: string;
  recommendation: string;
}> = [
  {
    name: "Strict-Transport-Security",
    severity: "critical",
    description: "Αναγκάζει τον browser να χρησιμοποιεί HTTPS.",
    recommendation: 'Προσθέστε: Strict-Transport-Security: max-age=31536000; includeSubDomains',
  },
  {
    name: "Content-Security-Policy",
    severity: "high",
    description: "Προστατεύει από XSS επιθέσεις.",
    recommendation: "Ορίστε CSP policy που περιορίζει τις πηγές περιεχομένου.",
  },
  {
    name: "X-Frame-Options",
    severity: "high",
    description: "Αποτρέπει clickjacking επιθέσεις.",
    recommendation: 'Προσθέστε: X-Frame-Options: DENY ή SAMEORIGIN',
  },
  {
    name: "X-Content-Type-Options",
    severity: "medium",
    description: "Αποτρέπει MIME-type sniffing.",
    recommendation: 'Προσθέστε: X-Content-Type-Options: nosniff',
  },
  {
    name: "Referrer-Policy",
    severity: "medium",
    description: "Ελέγχει πόσες πληροφορίες στέλνονται στο Referrer header.",
    recommendation: 'Προσθέστε: Referrer-Policy: strict-origin-when-cross-origin',
  },
  {
    name: "Permissions-Policy",
    severity: "medium",
    description: "Ελέγχει πρόσβαση σε browser APIs (camera, mic, geolocation).",
    recommendation: 'Προσθέστε: Permissions-Policy: camera=(), microphone=(), geolocation=()',
  },
  {
    name: "X-XSS-Protection",
    severity: "low",
    description: "Ενεργοποιεί XSS φίλτρο σε παλιούς browsers (deprecated, αλλά καλό να υπάρχει).",
    recommendation: 'Προσθέστε: X-XSS-Protection: 1; mode=block',
  },
];

export async function checkSecurityHeaders(url: string): Promise<{
  results: SecurityHeaderResult[];
  score: number;
  missingCritical: string[];
}> {
  let headers: Record<string, string> = {};

  try {
    await assertPublicDomain(new URL(url).hostname);
    const res = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: { "User-Agent": "SiteAuditor/1.0 (+https://siteauditor.app)" },
    });
    headers = Object.fromEntries(
      Object.entries(res.headers).map(([k, v]) => [k.toLowerCase(), String(v)])
    );
  } catch {
    return { results: [], score: 0, missingCritical: ["Αδύνατη σύνδεση με τον server"] };
  }

  const results: SecurityHeaderResult[] = SECURITY_HEADERS.map((h) => {
    const key = h.name.toLowerCase();
    const present = key in headers;
    return {
      header: h.name,
      present,
      value: headers[key],
      severity: h.severity,
      description: h.description,
      recommendation: h.recommendation,
    };
  });

  const weights = { critical: 30, high: 20, medium: 10, low: 5, info: 0 };
  const totalWeight = SECURITY_HEADERS.reduce((s, h) => s + weights[h.severity], 0);
  const earned = results
    .filter((r) => r.present)
    .reduce((s, r) => s + weights[r.severity], 0);

  const score = Math.round((earned / totalWeight) * 100);
  const missingCritical = results
    .filter((r) => !r.present && (r.severity === "critical" || r.severity === "high"))
    .map((r) => r.header);

  return { results, score, missingCritical };
}

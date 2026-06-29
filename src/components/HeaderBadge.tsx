"use client";

import { useLang } from "./LangProvider";

interface HeaderResult {
  header: string;
  present: boolean;
  value?: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  recommendation: string;
}

const severityLabels: Record<string, { en: string; el: string; color: string }> = {
  critical: { en: "Critical", el: "Κρίσιμο",  color: "text-red-400" },
  high:     { en: "High",     el: "Υψηλό",    color: "text-red-400" },
  medium:   { en: "Medium",   el: "Μέτριο",   color: "text-orange-400" },
  low:      { en: "Low",      el: "Χαμηλό",   color: "text-yellow-400" },
  info:     { en: "Info",     el: "Info",      color: "text-slate-400" },
};

export function HeaderBadge({ result }: { result: HeaderResult }) {
  const lang = useLang();
  const s = severityLabels[result.severity];
  const label = lang === "el" ? s.el : s.en;

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${result.present ? "bg-green-400" : "bg-red-400"}`} />
        <code className="text-sm font-mono text-slate-300 truncate">{result.header}</code>
      </div>
      {result.present ? (
        <span className="text-xs text-green-400 font-semibold shrink-0">✓</span>
      ) : (
        <span className={`text-xs font-semibold shrink-0 ${s.color}`}>{label}</span>
      )}
    </div>
  );
}
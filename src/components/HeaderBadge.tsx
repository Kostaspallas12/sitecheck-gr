interface HeaderResult {
  header: string;
  present: boolean;
  value?: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  recommendation: string;
}

const severityColor: Record<string, string> = {
  critical: "text-red-400",
  high:     "text-red-400",
  medium:   "text-orange-400",
  low:      "text-yellow-400",
  info:     "text-slate-400",
};

const severityLabel: Record<string, string> = {
  critical: "Κρίσιμο", high: "Υψηλό", medium: "Μέτριο", low: "Χαμηλό", info: "Info",
};

export function HeaderBadge({ result }: { result: HeaderResult }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${result.present ? "bg-green-400" : "bg-red-400"}`} />
        <code className="text-sm font-mono text-slate-300 truncate">{result.header}</code>
      </div>
      {result.present ? (
        <span className="text-xs text-green-400 font-semibold shrink-0">✓</span>
      ) : (
        <span className={`text-xs font-semibold shrink-0 ${severityColor[result.severity]}`}>
          {severityLabel[result.severity]}
        </span>
      )}
    </div>
  );
}
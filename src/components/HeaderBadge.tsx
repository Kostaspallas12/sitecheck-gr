interface HeaderResult {
  header: string;
  present: boolean;
  value?: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  recommendation: string;
}

const severityColor: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  high:     "text-red-400 bg-red-500/10 border-red-500/20",
  medium:   "text-orange-400 bg-orange-500/10 border-orange-500/20",
  low:      "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  info:     "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

const severityLabel: Record<string, string> = {
  critical: "Κρίσιμο", high: "Υψηλό", medium: "Μέτριο", low: "Χαμηλό", info: "Info",
};

export function HeaderBadge({ result }: { result: HeaderResult }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5
      ${result.present ? "bg-green-500/5 border-green-500/15" : "bg-slate-900 border-slate-800"}`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${result.present ? "bg-green-400" : "bg-red-400"}`} />
        <code className="text-sm font-mono text-slate-200 truncate">{result.header}</code>
      </div>
      {result.present ? (
        <span className="text-xs text-green-400 font-medium shrink-0">✓ OK</span>
      ) : (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${severityColor[result.severity]}`}>
          {severityLabel[result.severity]}
        </span>
      )}
    </div>
  );
}
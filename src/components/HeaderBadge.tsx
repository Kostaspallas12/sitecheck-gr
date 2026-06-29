interface HeaderResult {
  header: string;
  present: boolean;
  value?: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  recommendation: string;
}

const severityLabel: Record<string, string> = {
  critical: "Κρίσιμο", high: "Υψηλό", medium: "Μέτριο", low: "Χαμηλό", info: "Πληροφορία",
};

export function HeaderBadge({ result }: { result: HeaderResult }) {
  return (
    <div className={`flex items-start justify-between gap-4 rounded-xl border p-4
      ${result.present ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <code className="text-sm font-mono text-slate-200">{result.header}</code>
          {!result.present && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              {severityLabel[result.severity]} — Λείπει
            </span>
          )}
        </div>
        {result.present ? (
          <p className="text-xs text-slate-400 mt-1 font-mono truncate">{result.value}</p>
        ) : (
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{result.recommendation}</p>
        )}
      </div>
      <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${result.present ? "bg-green-400" : "bg-red-400"}`} />
    </div>
  );
}

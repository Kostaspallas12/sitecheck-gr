"use client";

import { useLang } from "./LangProvider";
import { lighthouseTitlesEl, lighthouseFixesEn, lighthouseFixesEl } from "@/lib/i18n";

interface Issue {
  category: string;
  title: string;
  description: string;
  severity: "error" | "warning" | "info";
}

const severityConfig = {
  error:   { en: "Critical",     el: "Κρίσιμο",  bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/20" },
  warning: { en: "Warning",      el: "Προσοχή",   bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  info:    { en: "Improvement",  el: "Βελτίωση",  bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20" },
};

export function IssueCard({ issue }: { issue: Issue }) {
  const lang = useLang();
  const cfg = severityConfig[issue.severity];
  const label = lang === "el" ? cfg.el : cfg.en;
  const title = lang === "el" ? (lighthouseTitlesEl[issue.title] ?? issue.title) : issue.title;
  const fix = lang === "el"
    ? lighthouseFixesEl[issue.title]
    : lighthouseFixesEn[issue.title];
  const fixLabel = lang === "el" ? "Πώς να το διορθώσεις:" : "How to fix:";

  return (
    <div className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start gap-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border} shrink-0 mt-0.5`}>
          {label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-100 text-sm">{title}</p>
          <span className="text-slate-500 text-xs mt-0.5 inline-block">{issue.category}</span>
          {fix && (
            <div className="mt-2.5 bg-slate-950/50 border border-slate-700/50 rounded-lg px-3 py-2">
              <p className="text-xs font-semibold text-slate-400 mb-1">{fixLabel}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{fix}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
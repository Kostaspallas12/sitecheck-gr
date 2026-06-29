"use client";

import { useLang } from "./LangProvider";

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

  return (
    <div className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start gap-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border} shrink-0 mt-0.5`}>
          {label}
        </span>
        <div>
          <p className="font-semibold text-slate-100 text-sm">{issue.title}</p>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">{issue.description}</p>
          <span className="text-slate-500 text-xs mt-1 inline-block">{issue.category}</span>
        </div>
      </div>
    </div>
  );
}
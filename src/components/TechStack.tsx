"use client";

import { useLang } from "./LangProvider";
import type { TechItem } from "@/lib/scanner/extended-audit";

const CATEGORY_CONFIG: Record<TechItem["category"], { label: string; labelEl: string; color: string }> = {
  cms:       { label: "CMS",       labelEl: "CMS",       color: "bg-violet-500/15 text-violet-300 border-violet-500/25" },
  framework: { label: "Framework", labelEl: "Framework", color: "bg-blue-500/15 text-blue-300 border-blue-500/25" },
  server:    { label: "Server",    labelEl: "Server",    color: "bg-green-500/15 text-green-300 border-green-500/25" },
  cdn:       { label: "CDN",       labelEl: "CDN",       color: "bg-orange-500/15 text-orange-300 border-orange-500/25" },
  analytics: { label: "Analytics", labelEl: "Analytics", color: "bg-rose-500/15 text-rose-300 border-rose-500/25" },
  library:   { label: "Library",   labelEl: "Βιβλιοθήκη", color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25" },
  language:  { label: "Language",  labelEl: "Γλώσσα",   color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25" },
};

const CATEGORY_ORDER: TechItem["category"][] = ["cms", "framework", "language", "server", "cdn", "library", "analytics"];

export function TechStack({ technologies }: { technologies: TechItem[] }) {
  const lang = useLang();

  const grouped = CATEGORY_ORDER.reduce<Record<string, TechItem[]>>((acc, cat) => {
    const items = technologies.filter((t) => t.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  if (technologies.length === 0) {
    return (
      <p className="text-slate-500 text-sm">
        {lang === "el" ? "Δεν εντοπίστηκαν τεχνολογίες" : "No technologies detected"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([cat, items]) => {
        const cfg = CATEGORY_CONFIG[cat as TechItem["category"]];
        return (
          <div key={cat} className="flex items-start gap-3">
            <span className="text-xs text-slate-500 font-medium w-20 shrink-0 pt-1">
              {lang === "el" ? cfg.labelEl : cfg.label}
            </span>
            <div className="flex flex-wrap gap-2">
              {items.map((tech) => (
                <span
                  key={tech.name}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${cfg.color}`}
                >
                  {tech.name}
                  {tech.version && (
                    <span className="opacity-60 font-normal">{tech.version}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
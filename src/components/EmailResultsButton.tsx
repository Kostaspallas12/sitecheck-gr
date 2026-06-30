"use client";

import { useState } from "react";
import { useLang } from "./LangProvider";
import { getT } from "@/lib/i18n";

interface Props {
  scanId: string;
  defaultEmail?: string;
}

export function EmailResultsButton({ scanId, defaultEmail = "" }: Props) {
  const lang = useLang();
  const t = getT(lang);
  const [email, setEmail] = useState(defaultEmail);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSend() {
    if (!email) return;
    setState("sending");
    try {
      const res = await fetch(`/api/scans/${scanId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-blue-400 shrink-0">
          <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M1 5.5l7 4.5 7-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <h3 className="font-semibold text-white text-sm">{t.emailResultsTitle}</h3>
      </div>

      {state === "sent" ? (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M3 7.5l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t.emailResultsSent}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            onClick={handleSend}
            disabled={state === "sending" || !email}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition shrink-0"
          >
            {state === "sending" ? t.emailResultsSending : t.emailResultsBtn}
          </button>
        </div>
      )}

      {state === "error" && (
        <p className="text-red-400 text-sm mt-2">{t.emailResultsError}</p>
      )}
    </div>
  );
}

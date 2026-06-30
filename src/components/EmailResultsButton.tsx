"use client";

import { useState } from "react";
import { useLang } from "./LangProvider";

export function EmailResultsButton({ scanId, email }: { scanId: string; email: string }) {
  const lang = useLang();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function send() {
    setState("sending");
    try {
      const res = await fetch(`/api/scans/${scanId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="flex items-center gap-2.5 bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-3.5 text-sm text-green-400 font-medium">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {lang === "el" ? `Στάλθηκε στο ${email}` : `Sent to ${email}`}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3.5 text-sm text-red-400 font-medium">
        {lang === "el" ? "Σφάλμα αποστολής. Δοκίμασε ξανά." : "Failed to send. Try again."}
        <button onClick={() => setState("idle")} className="underline text-xs ml-1">
          {lang === "el" ? "Ξανά" : "Retry"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={send}
      disabled={state === "sending"}
      className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-5 py-3.5 text-sm text-slate-300 hover:text-white font-medium transition-all"
    >
      {state === "sending" ? (
        <>
          <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          {lang === "el" ? "Αποστολή..." : "Sending..."}
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          {lang === "el" ? `Αποστολή αποτελεσμάτων στο ${email}` : `Send results to ${email}`}
        </>
      )}
    </button>
  );
}

"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${checked ? "bg-blue-600" : "bg-slate-700"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export function AccountClient({
  user,
  paused: initialPaused,
  weeklyRescan: initialWeeklyRescan,
  lang,
}: {
  user: { uid: string; email: string | null; displayName: string | null };
  paused: boolean;
  weeklyRescan: boolean;
  lang: Lang;
}) {
  const isEl = lang === "el";
  const [paused, setPaused] = useState(initialPaused);
  const [weeklyRescan, setWeeklyRescan] = useState(initialWeeklyRescan);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [rescanLoading, setRescanLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  async function togglePause() {
    setPauseLoading(true);
    const newVal = !paused;
    try {
      await fetch("/api/account/pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paused: newVal }),
      });
      setPaused(newVal);
    } finally { setPauseLoading(false); }
  }

  async function toggleWeeklyRescan() {
    setRescanLoading(true);
    const newVal = !weeklyRescan;
    try {
      await fetch("/api/account/weekly-rescan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newVal }),
      });
      setWeeklyRescan(newVal);
    } finally { setRescanLoading(false); }
  }

  async function deleteAccount() {
    setDeleteLoading(true);
    try {
      await fetch("/api/account", { method: "DELETE" });
      window.location.href = "/";
    } finally { setDeleteLoading(false); }
  }

  const initial = (user.displayName ?? user.email ?? "U")[0].toUpperCase();

  return (
    <main className="px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Back */}
        <a href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dashboard
        </a>

        <h1 className="text-xl font-bold text-white">{isEl ? "Ρυθμίσεις λογαριασμού" : "Account settings"}</h1>

        {/* Profile card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
            {initial}
          </div>
          <div>
            {user.displayName && <p className="text-white font-semibold">{user.displayName}</p>}
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>
        </div>

        {/* Weekly rescan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">{isEl ? "Εβδομαδιαία αυτόματη ανάλυση" : "Weekly auto-rescan"}</p>
              <p className="text-slate-500 text-xs mt-1">
                {isEl
                  ? "Αυτόματη ανάλυση κάθε εβδομάδα με email αν αλλάξουν οι βαθμολογίες"
                  : "Auto-scan every week and email you if scores change"}
              </p>
            </div>
            <Toggle checked={weeklyRescan} onChange={toggleWeeklyRescan} disabled={rescanLoading} />
          </div>
        </div>

        {/* Pause */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">{isEl ? "Παύση λογαριασμού" : "Pause account"}</p>
              <p className="text-slate-500 text-xs mt-1">
                {isEl
                  ? "Απενεργοποιεί τις αναλύσεις προσωρινά χωρίς να χάσεις τα δεδομένα σου"
                  : "Temporarily disables scans without losing your data"}
              </p>
            </div>
            <Toggle checked={paused} onChange={togglePause} disabled={pauseLoading} />
          </div>
          {paused && (
            <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5 text-yellow-400 text-xs">
              {isEl ? "Ο λογαριασμός σου είναι σε παύση. Ενεργοποίησε τον ξανά για να κάνεις αναλύσεις." : "Your account is paused. Re-enable to run scans."}
            </div>
          )}
        </div>

        {/* Delete account */}
        <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-6">
          <p className="text-white font-medium text-sm mb-1">{isEl ? "Διαγραφή λογαριασμού" : "Delete account"}</p>
          <p className="text-slate-500 text-xs mb-4">
            {isEl
              ? "Διαγράφει μόνιμα τον λογαριασμό σου και όλα τα δεδομένα (sites, αναλύσεις). Αυτή η ενέργεια δεν αναιρείται."
              : "Permanently deletes your account and all data (sites, scans). This action cannot be undone."}
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition"
            >
              {isEl ? "Διαγραφή λογαριασμού" : "Delete account"}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                {isEl ? `Γράψε "${user.email}" για επιβεβαίωση:` : `Type "${user.email}" to confirm:`}
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={user.email ?? ""}
                className="w-full bg-slate-950 border border-red-500/30 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={deleteAccount}
                  disabled={deleteConfirmText !== user.email || deleteLoading}
                  className="text-sm px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  {deleteLoading ? (isEl ? "Διαγραφή..." : "Deleting...") : (isEl ? "Επιβεβαίωση διαγραφής" : "Confirm delete")}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
                  className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  {isEl ? "Ακύρωση" : "Cancel"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

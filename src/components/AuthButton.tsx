"use client";

import { useState, useRef, useEffect } from "react";
import { useSessionUser } from "./AuthProvider";
import { useLang } from "./LangProvider";

export function AuthButton() {
  const user = useSessionUser();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function signOut() {
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/";
  }

  if (!user) {
    return (
      <a
        href="/login"
        className="text-sm text-slate-400 hover:text-white transition font-medium px-3 py-1.5 rounded-lg hover:bg-slate-800"
      >
        {lang === "el" ? "Σύνδεση" : "Sign in"}
      </a>
    );
  }

  const initial = (user.displayName ?? user.email ?? "U")[0].toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition rounded-lg px-2 py-1.5 hover:bg-slate-800"
      >
        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
          {initial}
        </div>
        <span className="hidden sm:block max-w-[140px] truncate">
          {user.displayName ?? user.email}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-slate-500 shrink-0">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1 z-50">
          <div className="px-3 py-2.5">
            <p className="text-xs font-medium text-slate-200 truncate">{user.displayName ?? user.email}</p>
            {user.displayName && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
            )}
          </div>
          <div className="border-t border-slate-800 my-1" />
          <a href="/dashboard" className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            {lang === "el" ? "Dashboard" : "Dashboard"}
          </a>
          <a href="/account" className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            {lang === "el" ? "Ρυθμίσεις" : "Account"}
          </a>
          <div className="border-t border-slate-800 my-1" />
          <button
            onClick={signOut}
            className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            {lang === "el" ? "Αποσύνδεση" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}

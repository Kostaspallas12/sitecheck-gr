"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { clientAuth } from "@/lib/firebase-client";
import { useLang } from "@/components/LangProvider";

type Mode = "login" | "register";

const GOOGLE_ERRORS: Record<string, string> = {
  "auth/popup-closed-by-user": "",
  "auth/cancelled-popup-request": "",
};

const EMAIL_ERRORS: Record<string, Record<Mode, string>> = {
  "auth/user-not-found":   { login: "Λάθος email ή κωδικός.", register: "" },
  "auth/wrong-password":   { login: "Λάθος email ή κωδικός.", register: "" },
  "auth/invalid-credential": { login: "Λάθος email ή κωδικός.", register: "" },
  "auth/email-already-in-use": { login: "", register: "Αυτό το email χρησιμοποιείται ήδη." },
  "auth/weak-password":    { login: "", register: "Ο κωδικός χρειάζεται τουλάχιστον 6 χαρακτήρες." },
  "auth/invalid-email":    { login: "Μη έγκυρο email.", register: "Μη έγκυρο email." },
};

async function createSession(idToken: string) {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("session_failed");
}

export default function LoginPage() {
  const router = useRouter();
  const lang = useLang();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const isEl = lang === "el";

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(clientAuth, provider);
      const idToken = await cred.user.getIdToken();
      await createSession(idToken);
      router.push("/");
      router.refresh();
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? "";
      if (!GOOGLE_ERRORS[code]) {
        setError(isEl ? "Σφάλμα σύνδεσης με Google. Δοκίμασε ξανά." : "Google sign-in failed. Try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let cred;
      if (mode === "login") {
        cred = await signInWithEmailAndPassword(clientAuth, email, password);
      } else {
        cred = await createUserWithEmailAndPassword(clientAuth, email, password);
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
        }
      }
      const idToken = await cred.user.getIdToken();
      await createSession(idToken);
      router.push("/");
      router.refresh();
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? "";
      const msg = EMAIL_ERRORS[code]?.[mode];
      setError(msg || (isEl ? "Κάτι πήγε στραβά. Δοκίμασε ξανά." : "Something went wrong. Try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Back link */}
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition mb-8">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {isEl ? "Αρχική" : "Home"}
        </a>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          {/* Title */}
          <h1 className="text-xl font-bold text-white mb-1">
            {mode === "login"
              ? (isEl ? "Σύνδεση" : "Sign in")
              : (isEl ? "Δημιουργία λογαριασμού" : "Create account")}
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            {mode === "login"
              ? (isEl ? "Συνέχισε στο SiteCheck" : "Continue to SiteCheck")
              : (isEl ? "Ξεκίνα δωρεάν" : "Get started for free")}
          </p>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-semibold text-sm py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.5-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.5l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.4 4.2-4.4 5.5l6.2 5.2C36.9 36.3 44 31 44 24c0-1.2-.1-2.5-.4-3.5z"/>
              </svg>
            )}
            {isEl ? "Σύνδεση με Google" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-slate-600 text-xs">{isEl ? "ή" : "or"}</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  {isEl ? "Ονοματεπώνυμο" : "Full name"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isEl ? "Κώστας Παπαδόπουλος" : "John Smith"}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {isEl ? "Κωδικός" : "Password"}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 font-semibold text-white text-sm transition-all shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  {isEl ? "Παρακαλώ περίμενε..." : "Please wait..."}
                </>
              ) : mode === "login" ? (
                isEl ? "Σύνδεση →" : "Sign in →"
              ) : (
                isEl ? "Εγγραφή →" : "Create account →"
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-sm text-slate-500 mt-5">
            {mode === "login" ? (
              <>
                {isEl ? "Δεν έχεις λογαριασμό; " : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(""); }}
                  className="text-blue-400 hover:text-blue-300 font-medium transition"
                >
                  {isEl ? "Εγγραφή" : "Sign up"}
                </button>
              </>
            ) : (
              <>
                {isEl ? "Έχεις ήδη λογαριασμό; " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); }}
                  className="text-blue-400 hover:text-blue-300 font-medium transition"
                >
                  {isEl ? "Σύνδεση" : "Sign in"}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState, useRef } from "react";
import type { Lang } from "@/lib/i18n";
import { clientAuth } from "@/lib/firebase-client";
import {
  signInWithEmailAndPassword,
  updatePassword as fbUpdatePassword,
  updateEmail as fbUpdateEmail,
} from "firebase/auth";

// ── helpers ───────────────────────────────────────────────────────────────────

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

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">{children}</div>;
}

function SectionHeader({ title, subtitle, onEdit, editLabel, isEl }: {
  title: string; subtitle?: string; onEdit?: () => void; editLabel?: string; isEl: boolean;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-white font-semibold text-sm">{title}</p>
        {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {onEdit && (
        <button onClick={onEdit} className="text-xs text-blue-400 hover:text-blue-300 transition font-medium shrink-0 ml-4">
          {editLabel ?? (isEl ? "Επεξεργασία" : "Edit")}
        </button>
      )}
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-3 py-2 border-b border-slate-800 last:border-0">
      <span className="text-slate-500 text-sm w-28 shrink-0">{label}</span>
      <span className="text-slate-200 text-sm">{value || "—"}</span>
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return <p className="text-red-400 text-xs mt-2">{msg}</p>;
}

function SuccessMsg({ msg }: { msg: string }) {
  return <p className="text-green-400 text-xs mt-2">{msg}</p>;
}

// ── main component ────────────────────────────────────────────────────────────

export function AccountClient({
  user,
  provider,
  firstName: initFirstName,
  lastName: initLastName,
  photoURL: initPhotoURL,
  paused: initialPaused,
  weeklyRescan: initialWeeklyRescan,
  lang,
}: {
  user: { uid: string; email: string | null; displayName: string | null };
  provider: "password" | "google.com";
  firstName: string;
  lastName: string;
  photoURL: string | null;
  paused: boolean;
  weeklyRescan: boolean;
  lang: Lang;
}) {
  const isEl = lang === "el";
  const isPasswordUser = provider === "password";

  // Profile
  const [editingProfile, setEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState(initFirstName);
  const [lastName, setLastName] = useState(initLastName);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Avatar
  const [photoURL, setPhotoURL] = useState(initPhotoURL);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Email
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Password
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Preferences
  const [paused, setPaused] = useState(initialPaused);
  const [weeklyRescan, setWeeklyRescan] = useState(initialWeeklyRescan);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [rescanLoading, setRescanLoading] = useState(false);

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // ── actions ────────────────────────────────────────────────────────────────

  async function saveProfile() {
    setProfileLoading(true);
    setProfileMsg("");
    try {
      await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });
      setEditingProfile(false);
      setProfileMsg(isEl ? "Αποθηκεύτηκε!" : "Saved!");
      setTimeout(() => setProfileMsg(""), 2500);
    } finally {
      setProfileLoading(false);
    }
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/account/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (data.photoURL) setPhotoURL(data.photoURL);
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  }

  async function changeEmail() {
    if (!user.email) return;
    setEmailError("");
    setEmailLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(clientAuth, user.email, emailPassword);
      await fbUpdateEmail(cred.user, newEmail);
      await fetch("/api/account/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });
      const idToken = await cred.user.getIdToken(true);
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      setEmailSuccess(true);
      setTimeout(() => window.location.reload(), 1200);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential")
        setEmailError(isEl ? "Λάθος κωδικός" : "Wrong password");
      else if (code === "auth/email-already-in-use")
        setEmailError(isEl ? "Το email χρησιμοποιείται ήδη" : "Email already in use");
      else if (code === "auth/invalid-email")
        setEmailError(isEl ? "Μη έγκυρο email" : "Invalid email");
      else
        setEmailError(isEl ? "Κάτι πήγε στραβά" : "Something went wrong");
    } finally {
      setEmailLoading(false);
    }
  }

  async function changePassword() {
    if (!user.email) return;
    setPasswordError("");
    if (newPwd !== confirmPwd) {
      setPasswordError(isEl ? "Οι κωδικοί δεν ταιριάζουν" : "Passwords don't match");
      return;
    }
    if (newPwd.length < 6) {
      setPasswordError(isEl ? "Τουλάχιστον 6 χαρακτήρες" : "At least 6 characters");
      return;
    }
    setPasswordLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(clientAuth, user.email, currentPwd);
      await fbUpdatePassword(cred.user, newPwd);
      setPasswordSuccess(true);
      setEditingPassword(false);
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential")
        setPasswordError(isEl ? "Λάθος τρέχων κωδικός" : "Wrong current password");
      else
        setPasswordError(isEl ? "Κάτι πήγε στραβά" : "Something went wrong");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function togglePause() {
    setPauseLoading(true);
    const newVal = !paused;
    try {
      await fetch("/api/account/pause", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paused: newVal }) });
      setPaused(newVal);
    } finally { setPauseLoading(false); }
  }

  async function toggleWeeklyRescan() {
    setRescanLoading(true);
    const newVal = !weeklyRescan;
    try {
      await fetch("/api/account/weekly-rescan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: newVal }) });
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

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user.displayName || user.email?.split("@")[0] || "U";
  const initial = displayName[0].toUpperCase();

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <main className="px-4 py-10">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Back */}
        <a href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Dashboard
        </a>

        <h1 className="text-xl font-bold text-white">{isEl ? "Ρυθμίσεις λογαριασμού" : "Account settings"}</h1>

        {/* ── PROFILE ──────────────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            title={isEl ? "Προφίλ" : "Profile"}
            subtitle={isEl ? "Όνομα και φωτογραφία" : "Name and photo"}
            onEdit={() => { setEditingProfile(!editingProfile); setProfileMsg(""); }}
            editLabel={editingProfile ? (isEl ? "Ακύρωση" : "Cancel") : (isEl ? "Επεξεργασία" : "Edit")}
            isEl={isEl}
          />

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                {photoURL ? (
                  <img src={photoURL} alt="avatar" className="w-full h-full object-cover" />
                ) : initial}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarLoading}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-full flex items-center justify-center transition disabled:opacity-50"
                title={isEl ? "Αλλαγή φωτογραφίας" : "Change photo"}
              >
                {avatarLoading ? (
                  <svg className="animate-spin w-3 h-3 text-slate-300" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                )}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">{displayName}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
              {provider === "google.com" && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <svg width="10" height="10" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </span>
              )}
            </div>
          </div>

          {!editingProfile ? (
            <div>
              <FieldRow label={isEl ? "Όνομα" : "First name"} value={firstName} />
              <FieldRow label={isEl ? "Επώνυμο" : "Last name"} value={lastName} />
              {profileMsg && <SuccessMsg msg={profileMsg} />}
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">{isEl ? "Όνομα" : "First name"}</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">{isEl ? "Επώνυμο" : "Last name"}</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={saveProfile}
                disabled={profileLoading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
              >
                {profileLoading ? "..." : (isEl ? "Αποθήκευση" : "Save")}
              </button>
            </div>
          )}
        </SectionCard>

        {/* ── EMAIL ────────────────────────────────────────────────────────── */}
        {isPasswordUser && (
          <SectionCard>
            <SectionHeader
              title={isEl ? "Email" : "Email"}
              subtitle={user.email ?? ""}
              onEdit={() => { setEditingEmail(!editingEmail); setEmailError(""); setEmailSuccess(false); }}
              editLabel={editingEmail ? (isEl ? "Ακύρωση" : "Cancel") : (isEl ? "Αλλαγή" : "Change")}
              isEl={isEl}
            />
            {editingEmail && !emailSuccess && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{isEl ? "Νέο email" : "New email"}</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{isEl ? "Τρέχων κωδικός (επιβεβαίωση)" : "Current password (to confirm)"}</label>
                  <input
                    type="password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                {emailError && <ErrorMsg msg={emailError} />}
                <button
                  onClick={changeEmail}
                  disabled={emailLoading || !newEmail || !emailPassword}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
                >
                  {emailLoading ? "..." : (isEl ? "Αλλαγή email" : "Change email")}
                </button>
              </div>
            )}
            {emailSuccess && <SuccessMsg msg={isEl ? "Το email άλλαξε! Ανανέωση..." : "Email changed! Reloading..."} />}
          </SectionCard>
        )}

        {/* ── PASSWORD ─────────────────────────────────────────────────────── */}
        {isPasswordUser && (
          <SectionCard>
            <SectionHeader
              title={isEl ? "Κωδικός πρόσβασης" : "Password"}
              subtitle="••••••••"
              onEdit={() => { setEditingPassword(!editingPassword); setPasswordError(""); }}
              editLabel={editingPassword ? (isEl ? "Ακύρωση" : "Cancel") : (isEl ? "Αλλαγή" : "Change")}
              isEl={isEl}
            />
            {passwordSuccess && <SuccessMsg msg={isEl ? "Ο κωδικός άλλαξε!" : "Password changed!"} />}
            {editingPassword && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{isEl ? "Τρέχων κωδικός" : "Current password"}</label>
                  <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{isEl ? "Νέος κωδικός" : "New password"}</label>
                  <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{isEl ? "Επιβεβαίωση νέου κωδικού" : "Confirm new password"}</label>
                  <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
                </div>
                {passwordError && <ErrorMsg msg={passwordError} />}
                <button
                  onClick={changePassword}
                  disabled={passwordLoading || !currentPwd || !newPwd || !confirmPwd}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
                >
                  {passwordLoading ? "..." : (isEl ? "Αλλαγή κωδικού" : "Change password")}
                </button>
              </div>
            )}
          </SectionCard>
        )}

        {/* ── NOTIFICATIONS ────────────────────────────────────────────────── */}
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">{isEl ? "Εβδομαδιαία ειδοποίηση" : "Weekly notifications"}</p>
              <p className="text-slate-500 text-xs mt-0.5">
                {isEl ? "Email αν αλλάξουν οι βαθμολογίες" : "Email when scores change"}
              </p>
            </div>
            <Toggle checked={weeklyRescan} onChange={toggleWeeklyRescan} disabled={rescanLoading} />
          </div>
        </SectionCard>

        {/* ── PAUSE ────────────────────────────────────────────────────────── */}
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">{isEl ? "Παύση λογαριασμού" : "Pause account"}</p>
              <p className="text-slate-500 text-xs mt-0.5">
                {isEl ? "Απενεργοποιεί τις αναλύσεις προσωρινά" : "Temporarily disables scans"}
              </p>
            </div>
            <Toggle checked={paused} onChange={togglePause} disabled={pauseLoading} />
          </div>
          {paused && (
            <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5 text-yellow-400 text-xs">
              {isEl ? "Ο λογαριασμός είναι σε παύση." : "Account is paused."}
            </div>
          )}
        </SectionCard>

        {/* ── DELETE ───────────────────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-6">
          <p className="text-white font-semibold text-sm mb-1">{isEl ? "Διαγραφή λογαριασμού" : "Delete account"}</p>
          <p className="text-slate-500 text-xs mb-4">
            {isEl ? "Διαγράφει μόνιμα τα πάντα. Δεν αναιρείται." : "Permanently deletes everything. Cannot be undone."}
          </p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="text-sm px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition">
              {isEl ? "Διαγραφή λογαριασμού" : "Delete account"}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                {isEl ? `Γράψε "${user.email}" για επιβεβαίωση:` : `Type "${user.email}" to confirm:`}
              </p>
              <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={user.email ?? ""}
                className="w-full bg-slate-950 border border-red-500/30 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 text-sm" />
              <div className="flex gap-2">
                <button onClick={deleteAccount}
                  disabled={deleteConfirmText !== user.email || deleteLoading}
                  className="text-sm px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed font-medium">
                  {deleteLoading ? (isEl ? "Διαγραφή..." : "Deleting...") : (isEl ? "Επιβεβαίωση" : "Confirm")}
                </button>
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
                  className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition">
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
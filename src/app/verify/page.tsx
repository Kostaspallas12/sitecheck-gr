"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

function MetaTagInstructions({ token }: { token: string }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-slate-300">Πρόσθεσε το παρακάτω meta tag μέσα στο <code className="text-indigo-400">&lt;head&gt;</code> της αρχικής σελίδας:</p>
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 font-mono text-xs text-green-400 break-all">
        {`<meta name="site-verify" content="site-verify=${token}" />`}
      </div>
      <p className="text-slate-500 text-xs">Αφού το προσθέσεις και κάνεις deploy, πάτα "Επαλήθευση".</p>
    </div>
  );
}

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const siteId = params.get("siteId") ?? "";

  const [token, setToken] = useState("");
  const [domain, setDomain] = useState("");
  const [ready, setReady] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!siteId) return;
    try {
      const stored = sessionStorage.getItem(`site:${siteId}`);
      if (stored) {
        const { token: t, domain: d } = JSON.parse(stored);
        setToken(t);
        setDomain(d);
      }
    } catch {
      // ignore
    }
    setReady(true);
  }, [siteId]);

  async function handleVerify() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/verify`, { method: "POST" });
      const data = await res.json();
      if (data.verified) {
        setVerified(true);
        setTimeout(() => triggerScan(), 1500);
      } else {
        setError(data.error ?? "Επαλήθευση απέτυχε. Ελέγξτε ότι ακολουθήσατε τις οδηγίες.");
      }
    } catch {
      setError("Σφάλμα σύνδεσης.");
    } finally {
      setLoading(false);
    }
  }

  async function triggerScan() {
    const res = await fetch(`/api/sites/${siteId}/scan`, { method: "POST" });
    const data = await res.json();
    if (data.scanId) router.push(`/scan?scanId=${data.scanId}&siteId=${siteId}`);
  }

  if (!ready) return null;

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-slate-400 mb-4">Η σύνδεση έληξε. Ξεκίνα από την αρχή.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-6 py-3 font-semibold text-white transition"
          >
            ← Αρχική
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">2</span>
            <h1 className="text-2xl font-bold">Επαλήθευση ιδιοκτησίας</h1>
          </div>
          <p className="text-slate-400 text-sm ml-11">
            Επαληθεύουμε ότι το <span className="text-indigo-400 font-mono">{domain}</span> είναι δικό σου πριν κάνουμε ανάλυση.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <MetaTagInstructions token={token} />
        </div>

        {verified ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-4 text-green-400 text-center">
            Επαλήθευση επιτυχής! Ξεκινά το scan...
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl py-3.5 font-semibold text-white transition"
            >
              {loading ? "Γίνεται έλεγχος..." : "Επαλήθευση →"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}

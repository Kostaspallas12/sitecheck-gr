"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { useLang } from "@/components/LangProvider";
import { getT } from "@/lib/i18n";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = useLang();
  const t = getT(lang);

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
        const { token: tk, domain: d } = JSON.parse(stored);
        setToken(tk);
        setDomain(d);
      }
    } catch { /* ignore */ }
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
        setError(data.error ?? t.verifyFail);
      }
    } catch {
      setError(t.connFailed);
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
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-slate-400 mb-4">{t.sessionExpired}</p>
          <button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-500 rounded-lg px-6 py-2.5 font-semibold text-white transition text-sm">
            {t.backHome}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">2</span>
            <h1 className="text-2xl font-bold">{t.verifyTitle}</h1>
          </div>
          <p className="text-slate-400 text-sm ml-11">
            {t.verifyDesc.replace("{domain}", domain)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <p className="text-slate-300 text-sm mb-3">{t.metaInstruction}</p>
          <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-xs text-green-400 break-all mb-3">
            {`<meta name="site-verify" content="site-verify=${token}" />`}
          </div>
          <p className="text-slate-500 text-xs">{t.metaNote}</p>
        </div>

        {verified ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-4 text-green-400 text-center text-sm">
            {t.verifyOk}
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
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl py-3 font-semibold text-white transition text-sm"
            >
              {loading ? t.verifying : t.verifyBtn}
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
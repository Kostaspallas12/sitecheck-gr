"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { getT } from "@/lib/i18n";

function ScanContent() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = useLang();
  const t = getT(lang);

  const scanId = params.get("scanId") ?? "";
  const siteId = params.get("siteId") ?? "";
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!scanId) return;

    const lastStep = t.scanSteps.length - 1;

    // Auto-advance through all steps except the last one
    const stepInterval = setInterval(() => {
      setStep((s) => (s < lastStep - 1 ? s + 1 : s));
    }, 9000);

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${scanId}`);
        const data = await res.json();
        if (data.status === "DONE") {
          clearInterval(pollInterval);
          clearInterval(stepInterval);
          setStep(lastStep);
          setTimeout(() => router.push(`/results/${scanId}?siteId=${siteId}`), 800);
        } else if (data.status === "FAILED") {
          clearInterval(pollInterval);
          clearInterval(stepInterval);
          router.push(`/results/${scanId}?siteId=${siteId}&failed=1`);
        }
      } catch { /* retry */ }
    }, 3000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(pollInterval);
    };
  }, [scanId, siteId, router, t.scanSteps.length]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
        </div>

        <h1 className="text-2xl font-bold mb-2">{t.scanTitle}</h1>
        <p className="text-slate-400 text-sm mb-8">{t.scanSubtitle}</p>

        <div className="space-y-2 text-left">
          {t.scanSteps.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-500 ${
              i < step ? "text-green-400" : i === step ? "text-blue-400" : "text-slate-600"
            }`}>
              <span className="text-base shrink-0">
                {i < step ? "✓" : i === step ? "⟳" : "○"}
              </span>
              {s}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense>
      <ScanContent />
    </Suspense>
  );
}
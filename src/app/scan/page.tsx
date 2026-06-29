"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const steps = [
  "Σύνδεση με τον server...",
  "Τρέχει Lighthouse ανάλυση...",
  "Ελέγχονται security headers...",
  "Αναλύεται το SSL πιστοποιητικό...",
  "Επεξεργασία αποτελεσμάτων...",
];

function ScanContent() {
  const params = useSearchParams();
  const router = useRouter();
  const scanId = params.get("scanId") ?? "";
  const siteId = params.get("siteId") ?? "";
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!scanId) return;

    const stepInterval = setInterval(() => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }, 4000);

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${scanId}`);
        const data = await res.json();
        if (data.status === "DONE") {
          clearInterval(pollInterval);
          clearInterval(stepInterval);
          router.push(`/results/${scanId}?siteId=${siteId}`);
        } else if (data.status === "FAILED") {
          clearInterval(pollInterval);
          clearInterval(stepInterval);
          router.push(`/results/${scanId}?siteId=${siteId}&failed=1`);
        }
      } catch {
        // retry
      }
    }, 3000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(pollInterval);
    };
  }, [scanId, router]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
        </div>

        <h1 className="text-2xl font-bold mb-3">Γίνεται ανάλυση...</h1>
        <p className="text-slate-400 text-sm mb-8">Αυτό μπορεί να πάρει 30–60 δευτερόλεπτα.</p>

        <div className="space-y-2 text-left">
          {steps.map((s, i) => (
            <div key={s} className={`flex items-center gap-3 text-sm transition-all duration-500 ${
              i < step ? "text-green-400" : i === step ? "text-indigo-400" : "text-slate-600"
            }`}>
              <span className="text-base">
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

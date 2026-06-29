"use client";

import { useEffect, useState } from "react";

interface Props {
  score: number;
  label: string;
  size?: number;
}

const labelMap: Record<string, string> = {
  "Performance": "Απόδοση",
  "SEO": "SEO",
  "Accessibility": "Προσβασιμότητα",
  "Best Practices": "Βέλτιστες Πρακτικές",
  "Security": "Ασφάλεια",
};

function getColor(score: number) {
  if (score >= 90) return "#22c55e";
  if (score >= 50) return "#f97316";
  return "#ef4444";
}

export function ScoreRing({ score, label, size = 96 }: Props) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;
  const color = getColor(score);

  const [offset, setOffset] = useState(circumference);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOffset(targetOffset));

    let start: number | null = null;
    const duration = 1000;

    function step(timestamp: number) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayScore(Math.round(progress * score));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [score, targetOffset]);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e293b" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <span className="text-2xl font-bold -mt-[68px] mb-[52px]" style={{ color }}>
        {displayScore}
      </span>
      <span className="text-xs text-slate-400 font-medium text-center leading-tight max-w-[90px]">
        {labelMap[label] ?? label}
      </span>
    </div>
  );
}
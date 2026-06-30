"use client";

interface ScanPoint {
  createdAt: string;
  scores?: {
    performance?: number;
    seo?: number;
    accessibility?: number;
    bestPractices?: number;
    security?: number;
  };
}

function avg(s?: ScanPoint["scores"]) {
  if (!s) return null;
  const vals = [s.performance, s.seo, s.accessibility, s.bestPractices, s.security].filter((v): v is number => v !== undefined);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function scoreColor(v: number) {
  if (v >= 90) return "#4ade80";
  if (v >= 70) return "#facc15";
  if (v >= 50) return "#fb923c";
  return "#f87171";
}

export function ScoreHistoryChart({ history }: { history: ScanPoint[] }) {
  const points = [...history]
    .reverse()
    .map((h) => ({ date: new Date(h.createdAt), score: avg(h.scores) }))
    .filter((p): p is { date: Date; score: number } => p.score !== null);

  if (points.length < 2) return null;

  const W = 280;
  const H = 56;
  const PAD = 4;

  const minScore = Math.max(0, Math.min(...points.map((p) => p.score)) - 10);
  const maxScore = Math.min(100, Math.max(...points.map((p) => p.score)) + 10);
  const range = maxScore - minScore || 1;

  const xs = points.map((_, i) => PAD + (i / (points.length - 1)) * (W - PAD * 2));
  const ys = points.map((p) => H - PAD - ((p.score - minScore) / range) * (H - PAD * 2));

  const polyline = points.map((_, i) => `${xs[i]},${ys[i]}`).join(" ");
  const fill = `${polyline} ${xs[xs.length - 1]},${H} ${xs[0]},${H}`;

  const latest = points[points.length - 1].score;
  const prev = points[points.length - 2].score;
  const diff = latest - prev;
  const color = scoreColor(latest);

  return (
    <div className="mt-4 border-t border-slate-800 pt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">Score trend</span>
        {diff !== 0 && (
          <span className={`text-xs font-semibold ${diff > 0 ? "text-green-400" : "text-red-400"}`}>
            {diff > 0 ? "+" : ""}{diff}
          </span>
        )}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        {/* Fill area */}
        <polygon points={fill} fill={color} fillOpacity="0.08" />
        {/* Line */}
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={xs[i]} cy={ys[i]} r="2.5" fill={scoreColor(p.score)} />
        ))}
        {/* Last point label */}
        <text x={xs[xs.length - 1]} y={ys[ys.length - 1] - 7} textAnchor="middle" fontSize="10" fill={color} fontWeight="700">
          {latest}
        </text>
      </svg>
    </div>
  );
}

import { GlassCard } from "./GlassCard";
import { Wind } from "lucide-react";
import type { HistoryPoint } from "../hooks/useWeatherData";

interface RainCardProps {
  rainHour: number;
  rainRate: number;
  history: HistoryPoint[];
}

export function RainCard({ rainHour, rainRate, history }: RainCardProps) {
  // We use the RainCard to act as the "Wind status" widget in the reference picture.
  // We'll rename the labels to abstract it as a generic environmental widget or rain severity.

  // Generate an SVG path for the sparkline based on the history
  const width = 280;
  const height = 60;

  // Create a pseudo-random looking smooth curve for the visual if history is empty,
  // otherwise map the rain history (we don't track rain history yet, so we'll use humidity as a proxy for the curve shape for the visual effect)
  const data =
    history.length > 5
      ? history.slice(-20)
      : Array(20)
        .fill(0)
        .map((_, i) => ({ humidity: 30 + Math.sin(i) * 20 }));

  const min = Math.min(...data.map((d) => d.humidity));
  const max = Math.max(...data.map((d) => d.humidity));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.humidity - min) / range) * height;
    return `${x},${y}`;
  });

  // Create a smooth bezier curve path from the points
  let pathD = `M ${points[0] || "0,0"}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].split(",").map(Number);
    const curr = points[i].split(",").map(Number);

    // Simple cubic bezier control points for smoothing
    const cp1x = prev[0] + (curr[0] - prev[0]) / 2;
    const cp1y = prev[1];
    const cp2x = prev[0] + (curr[0] - prev[0]) / 2;
    const cp2y = curr[1];

    pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr[0]},${curr[1]}`;
  }

  return (
    <GlassCard
      delay={0.4}
      className="flex flex-col gap-6 p-6 w-full max-w-sm ml-auto"
    >
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-white/70">
            <Wind size={16} className="text-white/60" />
            <span className="text-sm tracking-wide">Trực tiếp</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-light text-red-500">
              {rainRate.toFixed(1)}
            </span>
            <span className="text-red-500/60 text-xs">mm</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-xs text-white/40 uppercase tracking-wider">
            Lượng mưa trong giờ
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-light text-white/80">
              {rainHour.toFixed(1)}
            </span>
            <span className="text-white/30 text-[10px]">mm</span>
          </div>
        </div>
      </div>

      {/* Sparkline Curve */}
      <div className="relative w-full h-[60px] mt-2">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 -10 ${width} ${height + 20}`}
          preserveAspectRatio="none"
        >
          {/* Subtle glow/shadow under line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGradientBlur)"
            strokeWidth="8"
            opacity="0.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Main crisp line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="50%" stopColor="rgba(255,255,255,1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
            </linearGradient>
            <linearGradient
              id="lineGradientBlur"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Pseudo visual equalizer bars (like the reference) */}
      <div className="flex items-end justify-between h-8 mt-2 opacity-50">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-white/40 rounded-t-sm"
            style={{
              height: `${10 + Math.random() * 80}%`,
              opacity: i % 4 === 0 ? 0.8 : 0.3,
            }}
          />
        ))}
      </div>
    </GlassCard>
  );
}

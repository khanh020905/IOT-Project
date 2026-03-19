import { GlassCard } from "./GlassCard";
import { Sun, Moon } from "lucide-react";

interface HumidityCardProps {
  humidity: number;
}

export function HumidityCard({ humidity }: HumidityCardProps) {
  // Convert humidity card into the "Sunrise/Sunset" style semi-circle analog dial
  // Reference showed a 180-degree dashed semi circle with a dial point.

  const radius = 90;
  const circumference = Math.PI * radius; // Half circle
  const progress = (humidity / 100) * circumference;

  return (
    <GlassCard
      delay={0.6}
      className="flex flex-col p-6 w-full max-w-sm ml-auto mt-6 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Sun size={14} className="text-white/60" />
          <span className="text-white/70 text-xs font-medium tracking-wide">
            Độ ẩm
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs tracking-wide">
            Trạng thái &#8600;
          </span>
          <Moon size={14} className="text-white/60" />
        </div>
      </div>

      {/* Main 180-degree Dial Area */}
      <div className="relative w-full h-36 mt-8 flex justify-center overflow-hidden z-10">
        <svg
          className="w-[110%] h-[200%] absolute top-0"
          style={{ transform: "translateX(-5%)" }}
          viewBox="0 0 200 200"
        >
          {/* Dashed background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            strokeLinecap="round"
          />

          {/* Solid progress arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#humidityGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
          />

          {/* Center glowing sun/moon icon placement in SVG */}
          <path
            d="M 80 100 A 20 20 0 0 1 120 100"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          <line
            x1="60"
            y1="100"
            x2="140"
            y2="100"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />

          <defs>
            <linearGradient
              id="humidityGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating Indicator Dot */}
        <div
          className="absolute bottom-0 w-full h-[200%] transition-transform duration-1000 ease-out z-20"
          style={{ transform: `rotate(${(humidity / 100) * 180 - 90}deg)` }}
        >
          <div className="absolute top-[8px] left-[50%] -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        </div>

        {/* Center Text */}
        <div className="absolute bottom-4 flex flex-col items-center">
          <span className="text-4xl font-light text-white">
            {Math.round(humidity)}
            <span className="text-xl text-white/50">%</span>
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

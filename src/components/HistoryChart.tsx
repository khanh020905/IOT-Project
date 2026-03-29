import { motion } from "framer-motion";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  Sun,
  CloudRain,
} from "lucide-react";
import type { HistoryPoint } from "../hooks/useWeatherData";

interface HistoryChartProps {
  history: HistoryPoint[];
}

export function HistoryChart({ history }: HistoryChartProps) {
  // Create a floating bottom timeline
  const data =
    history.length > 0 ? history : Array(7).fill({ temperature: 20 });

  // Downsample to max 7 points for the display blocks to match the days layout in the reference
  const step = Math.max(1, Math.floor(data.length / 7));
  const points = [];
  for (let i = 0; i < data.length && points.length < 7; i += step) {
    points.push(data[data.length - 1 - i]);
  }
  points.reverse();

  // If we don't have enough points yet, pad with the latest
  while (points.length < 7) {
    points.push(points[points.length - 1] || { temperature: "--" });
  }

  // Create a fake curving SVG line that connects them (for visual flair)
  const width = 1000;
  const height = 100;

  // Extract temperatures assuming valid data
  const temps = points.map((p) =>
    typeof p.temperature === "number" ? p.temperature : 20,
  );
  const minTemp = Math.min(...temps) - 5;
  const maxTemp = Math.max(...temps) + 5;
  const range = maxTemp - minTemp || 1;

  const svgPoints = temps.map((t, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((t - minTemp) / range) * height;
    return `${x},${y}`;
  });

  let pathD = `M ${svgPoints[0] || "0,50"}`;
  for (let i = 1; i < svgPoints.length; i++) {
    const prev = svgPoints[i - 1].split(",").map(Number);
    const curr = svgPoints[i].split(",").map(Number);

    const cp1x = prev[0] + (curr[0] - prev[0]) / 2;
    const cp1y = prev[1];
    const cp2x = prev[0] + (curr[0] - prev[0]) / 2;
    const cp2y = curr[1];

    pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr[0]},${curr[1]}`;
  }

  // Fake short labels to represent "Timeline"
  const labels = [
    "T-30p",
    "T-25p",
    "T-20p",
    "T-15p",
    "T-10p",
    "T-5p",
    "Hiện tại",
  ];

  // Randomize icons for visual interest based on index since we only have temp/humidity history
  const getIcon = (i: number) => {
    switch (i % 6) {
      case 0:
        return <Cloud size={24} className="text-white/80" />;
      case 1:
        return <CloudRain size={24} className="text-blue-300" />;
      case 2:
        return <CloudLightning size={24} className="text-yellow-400" />;
      case 3:
        return <CloudFog size={24} className="text-white/60" />;
      case 4:
        return <Sun size={24} className="text-yellow-300" />;
      default:
        return <CloudMoon size={24} className="text-white/80" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
      className="w-full relative h-[180px] mt-auto flex flex-col justify-end pb-8"
    >
      {/* Background connecting curve */}
      <div className="absolute inset-x-0 bottom-[60px] h-[100px] pointer-events-none">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 -10 ${width} ${height + 20}`}
          preserveAspectRatio="none"
        >
          <path
            d={pathD}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Datapoints & Labels */}
      <div className="flex justify-between items-end w-full px-2 sm:px-4 lg:px-16 relative z-10">
        {points.map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 md:gap-3 relative">
            <span className="text-white/60 text-[9px] sm:text-[10px] md:text-sm font-medium whitespace-nowrap">
              {labels[i]}
            </span>

            {/* The Temperature Node */}
            <span className="text-lg md:text-2xl font-light text-white">
              {typeof p.temperature === "number"
                ? Math.round(p.temperature)
                : "--"}
              °
            </span>

            {/* Glowing Dot on path representing current active block */}
            <div className="relative h-4 md:h-6 flex items-center justify-center my-1 md:my-2">
              <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-white/80 z-10" />
              {i === points.length - 1 && (
                <div className="absolute inset-0 m-auto w-4 h-4 md:w-6 md:h-6 bg-white/30 rounded-full animate-ping z-0" />
              )}
            </div>

            {/* Weather Icon (simulated history state) */}
            <div className="mt-1 md:mt-2 text-white/80 scale-[0.65] md:scale-100 origin-top">{getIcon(i)}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

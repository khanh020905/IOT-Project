import { motion } from "framer-motion";
import { Thermometer } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { getTempColor } from "../utils/weather";

interface TemperatureCardProps {
  temperature: number;
}

export function TemperatureCard({ temperature }: TemperatureCardProps) {
  const color = getTempColor(temperature);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  // Map temp range -10 to 50 onto the gauge
  const normalized = Math.max(0, Math.min(1, (temperature + 10) / 60));
  const progress = normalized * circumference;

  const getLabel = () => {
    if (temperature < 15) return "Cold";
    if (temperature < 25) return "Mild";
    if (temperature < 33) return "Warm";
    return "Hot";
  };

  return (
    <GlassCard delay={0.25} className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 w-full">
        <Thermometer size={18} style={{ color }} />
        <span className="text-white/70 text-sm font-medium">Temperature</span>
      </div>

      {/* Circular Gauge */}
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{
              transition: "stroke-dashoffset 1s ease-out, stroke 0.5s ease",
            }}
          />
        </svg>
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          key={temperature}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-2xl font-bold" style={{ color }}>
            {temperature}
          </span>
          <span className="text-white/50 text-xs">°C</span>
        </motion.div>
      </div>

      <span className="text-sm text-white/60">{getLabel()}</span>
    </GlassCard>
  );
}

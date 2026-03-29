import { motion } from "framer-motion";
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudSnow,
  Snowflake,
  CloudHail,
  ChevronRight,
  MapPin,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ForecastHour } from "../api/openmeteo";

interface ForecastStripProps {
  hours: ForecastHour[];
  locationName?: string | null;
  onOpenLocationPicker: () => void;
  onResetLocation: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  "cloud-drizzle": CloudDrizzle,
  "cloud-fog": CloudFog,
  "cloud-lightning": CloudLightning,
  "cloud-rain-wind": CloudRain,
  "cloud-hail": CloudHail,
  snowflake: Snowflake,
  "cloud-snow": CloudSnow,
};

function getIconColor(iconKey: string): string {
  switch (iconKey) {
    case "sun":
      return "text-yellow-300";
    case "cloud-sun":
      return "text-amber-300";
    case "cloud-rain":
    case "cloud-drizzle":
    case "cloud-rain-wind":
      return "text-blue-300";
    case "cloud-lightning":
      return "text-yellow-400";
    case "cloud-fog":
      return "text-white/50";
    case "snowflake":
    case "cloud-snow":
    case "cloud-hail":
      return "text-cyan-200";
    default:
      return "text-white/70";
  }
}

export function ForecastStrip({
  hours,
  locationName,
  onOpenLocationPicker,
  onResetLocation,
}: ForecastStripProps) {
  // Show up to 12 hours for a nice strip
  const display = hours.slice(0, 12);

  if (display.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
      className="w-full"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 px-6 lg:px-16 mb-3">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
          <span className="text-white/50 text-[10px] md:text-xs uppercase tracking-widest font-medium shrink-0">
            Dự báo theo giờ
          </span>
          <div className="w-8 md:w-16 h-px bg-gradient-to-r from-white/20 to-transparent shrink-0" />
          {locationName && (
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2 py-0.5 md:px-2.5 md:py-1 rounded-full border border-white/10 max-w-full">
              <MapPin size={10} className="text-blue-400 shrink-0" />
              <span className="text-white/70 text-[9px] md:text-[10px] font-medium truncate max-w-[100px] md:max-w-[120px]">
                {locationName}
              </span>
              <button
                onClick={onResetLocation}
                className="ml-0.5 text-white/30 hover:text-white/60 transition-colors shrink-0"
                title="Về mặc định"
              >
                <X size={10} />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          {/* Location Picker Button */}
          <button
            onClick={onOpenLocationPicker}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 backdrop-blur-sm px-2.5 py-1 md:px-3 md:py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-all group shrink-0"
          >
            <MapPin
              size={12}
              className="text-white/40 group-hover:text-blue-400 transition-colors"
            />
            <span className="text-white/40 group-hover:text-white/70 text-[9px] md:text-[10px] uppercase tracking-wider font-medium transition-colors">
              Chọn vị trí
            </span>
          </button>
          <div className="flex items-center gap-1 text-white/30 text-[10px] md:text-xs shrink-0">
            <span>Open-Meteo</span>
            <ChevronRight size={12} />
          </div>
        </div>
      </div>

      {/* Scrollable Forecast Cards */}
      <div className="overflow-x-auto scrollbar-hide px-4 lg:px-14">
        <div className="flex gap-2 pb-4 min-w-max">
          {display.map((h, i) => {
            const IconComponent = iconMap[h.weatherIcon] || Cloud;
            const isFirst = i === 0;

            return (
              <motion.div
                key={h.time}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.1 + i * 0.05 }}
                className={`
                  flex flex-col items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl min-w-[64px] md:min-w-[72px]
                  transition-all duration-300 cursor-default shrink-0
                  ${
                    isFirst
                      ? "bg-white/15 backdrop-blur-xl border border-white/20 shadow-lg shadow-white/5"
                      : "bg-white/5 backdrop-blur-sm border border-white/[0.08] hover:bg-white/10 hover:border-white/15"
                  }
                `}
              >
                {/* Hour */}
                <span
                  className={`text-xs font-medium tracking-wide ${isFirst ? "text-white" : "text-white/50"}`}
                >
                  {isFirst ? "Tiếp" : h.hour}
                </span>

                {/* Icon */}
                <div className="scale-75 md:scale-100 flex items-center justify-center">
                  <IconComponent
                    size={22}
                    className={`${getIconColor(h.weatherIcon)} ${isFirst ? "drop-shadow-lg" : ""}`}
                  />
                </div>

                {/* Temperature */}
                <span
                  className={`text-xs md:text-sm font-light ${isFirst ? "text-white" : "text-white/80"}`}
                >
                  {h.temperature}°
                </span>

                {/* Humidity mini-bar */}
                <div className="w-6 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-400/60"
                    style={{ width: `${h.humidity}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

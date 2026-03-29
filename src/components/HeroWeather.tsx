import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import {
  getWeatherCondition,
  getWeatherDescription,
  calculateHeatIndex,
} from "../utils/weather";

interface HeroWeatherProps {
  temperature: number;
  humidity: number;
  rainRate: number;
}

export function HeroWeather({
  temperature,
  humidity,
  rainRate,
}: HeroWeatherProps) {
  // Use rainRate for live condition. If it's 0 (stopped raining), it will automatically fall through to sunshine logic.
  const condition = getWeatherCondition(temperature, humidity, rainRate);
  const description = getWeatherDescription(temperature, humidity, rainRate);
  const heatIndex = Math.round(calculateHeatIndex(temperature, humidity));

  return (
    <div className="flex flex-col gap-8 max-w-2xl px-10 lg:px-16 pt-10">
      {/* Title & Description */}
      <div className="flex flex-col gap-2">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight text-white leading-tight md:whitespace-nowrap whitespace-normal text-shadow-weather"
        >
          {condition}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-lg lg:text-xl font-normal text-white/90 tracking-wide mt-2 text-shadow-weather-sm"
        >
          điều kiện thời tiết hiện tại
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-sm lg:text-base text-white/60 leading-relaxed max-w-md mt-4 font-light text-shadow-weather-sm"
        >
          {description} Sự thay đổi ngẫu nhiên về nhiệt độ và độ ẩm có thể cho
          thấy sự chuyển biến của thời tiết khu vực.
        </motion.p>
      </div>

      {/* Hero Temperature */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="flex items-start gap-4 mt-8"
      >
        <span className="text-[140px] leading-none font-extralight tracking-tighter text-white text-shadow-weather">
          {Math.round(temperature)}
          <span className="text-[80px] align-top relative top-4">°</span>
        </span>
        <div className="flex flex-col pt-12 text-white/40 font-light text-4xl">
          <span>+</span>
          <span>_</span>
        </div>
      </motion.div>

      {/* Location / Meta Pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="flex items-center gap-6 mt-4"
      >
        <div className="flex items-center gap-2 text-white/70 text-shadow-weather-sm">
          <MapPin size={16} />
          <span className="text-sm font-medium">Trạm IoT</span>
        </div>

        <div className="glass-premium px-4 py-1.5 rounded-full flex items-center gap-2">
          <span className="text-white/40 text-xs uppercase tracking-wider">
            Cảm giác như:
          </span>
          <span className="text-white/90 text-sm font-medium">
            {heatIndex}°
          </span>
        </div>
      </motion.div>
    </div>
  );
}

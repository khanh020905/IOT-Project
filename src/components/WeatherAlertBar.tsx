import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  ShieldCheck,
  CloudRainWind,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Phone,
} from "lucide-react";
import type { AlertStatus } from "../hooks/useWeatherAlert";
import type { RainComparison } from "../api/openmeteo";

interface WeatherAlertBarProps {
  email: string;
  status: AlertStatus;
  rainData: RainComparison | null;
  lastChecked: Date | null;
  onUpdateEmail: (email: string) => void;
}

const statusConfig: Record<
  AlertStatus,
  { icon: typeof Mail; color: string; text: string }
> = {
  idle: {
    icon: Mail,
    color: "text-white/40",
    text: "Nhập email để nhận cảnh báo",
  },
  monitoring: {
    icon: ShieldCheck,
    color: "text-emerald-400",
    text: "Đang theo dõi...",
  },
  "alert-detected": {
    icon: CloudRainWind,
    color: "text-amber-400",
    text: "Phát hiện mưa bất thường! Đang gửi mail...",
  },
  "alert-sent": {
    icon: CheckCircle2,
    color: "text-emerald-400",
    text: "Đã gửi cảnh báo!",
  },
  "alert-failed": {
    icon: AlertTriangle,
    color: "text-red-400",
    text: "Gửi mail thất bại",
  },
  "no-alert": {
    icon: ShieldCheck,
    color: "text-emerald-400",
    text: "Không có mưa bất thường",
  },
};

export function WeatherAlertBar({
  email,
  status,
  rainData,
  lastChecked,
  onUpdateEmail,
}: WeatherAlertBarProps) {
  const [inputValue, setInputValue] = useState(email);
  const [isEditing, setIsEditing] = useState(!email);

  // Phone number state
  const [phoneValue, setPhoneValue] = useState(() => {
    return localStorage.getItem("emergency_phone") || "";
  });
  const [isEditingPhone, setIsEditingPhone] = useState(
    !localStorage.getItem("emergency_phone")
  );

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && inputValue.includes("@")) {
      onUpdateEmail(inputValue.trim());
      setIsEditing(false);
    }
  };

  const handleClear = () => {
    setInputValue("");
    onUpdateEmail("");
    setIsEditing(true);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneValue.trim();
    if (cleaned.length >= 9) {
      // Auto-format Vietnamese numbers
      const formatted = cleaned.startsWith("0")
        ? "+84" + cleaned.slice(1)
        : cleaned.startsWith("+")
        ? cleaned
        : "+84" + cleaned;
      setPhoneValue(formatted);
      localStorage.setItem("emergency_phone", formatted);
      setIsEditingPhone(false);
    }
  };

  const handlePhoneClear = () => {
    setPhoneValue("");
    localStorage.removeItem("emergency_phone");
    setIsEditingPhone(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="w-full px-6 lg:px-16"
    >
      <div className="flex flex-col gap-2">
        {/* Row 1: Email Alert */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3 px-4 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06]">
          {/* Left: Icon + Label */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
              <CloudRainWind size={14} className="text-blue-400" />
            </div>
            <span className="text-white/50 text-[11px] uppercase tracking-wider font-medium">
              Gửi mail nếu mưa bất thường
            </span>
          </div>

          {/* Center: Email Input or Status */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
                <div className="flex-1 relative">
                  <Mail
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    type="email"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.includes("@")}
                  className={`px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider font-semibold transition-all shrink-0 ${
                    inputValue.includes("@")
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90"
                      : "bg-white/5 text-white/20 cursor-not-allowed"
                  }`}
                >
                  Theo dõi
                </button>
              </form>
            ) : (
              <div className="flex-1 flex items-center gap-3 min-w-0">
                {/* Current email */}
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl min-w-0">
                  <Mail size={12} className="text-white/40 shrink-0" />
                  <span className="text-white/60 text-xs truncate">
                    {email}
                  </span>
                  <button
                    onClick={handleClear}
                    className="text-white/30 hover:text-white/60 transition-colors shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {status === "alert-detected" ? (
                    <Loader2 size={12} className={`${config.color} animate-spin`} />
                  ) : (
                    <StatusIcon size={12} className={config.color} />
                  )}
                  <span className={`text-[10px] ${config.color} font-medium`}>
                    {config.text}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Rain data summary */}
          {rainData && !isEditing && (
            <div className="flex items-center gap-3 text-[10px] text-white/30 shrink-0">
              <span>
                Qua: {rainData.yesterdayRainMm}mm
              </span>
              <span className="text-white/10">|</span>
              <span className={rainData.isSuddenRain ? "text-amber-400 font-medium" : ""}>
                Nay: {rainData.todayForecastRainMm}mm
              </span>
              {lastChecked && (
                <>
                  <span className="text-white/10">|</span>
                  <span>
                    {lastChecked.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Row 2: Emergency Phone Call */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3 px-4 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-red-500/10">
          {/* Left: Icon + Label */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Phone size={14} className="text-red-400" />
            </div>
            <span className="text-white/50 text-[11px] uppercase tracking-wider font-medium">
              Gọi khẩn cấp khi nguy hiểm
            </span>
          </div>

          {/* Center: Phone Input */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            {isEditingPhone ? (
              <form onSubmit={handlePhoneSubmit} className="flex-1 flex items-center gap-2">
                <div className="flex-1 relative">
                  <Phone
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    type="tel"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    placeholder="0912345678"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={phoneValue.trim().length < 9}
                  className={`px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider font-semibold transition-all shrink-0 ${
                    phoneValue.trim().length >= 9
                      ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90"
                      : "bg-white/5 text-white/20 cursor-not-allowed"
                  }`}
                >
                  Đăng ký
                </button>
              </form>
            ) : (
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl min-w-0">
                  <Phone size={12} className="text-red-400 shrink-0" />
                  <span className="text-white/60 text-xs truncate">
                    {phoneValue}
                  </span>
                  <button
                    onClick={handlePhoneClear}
                    className="text-white/30 hover:text-white/60 transition-colors shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <ShieldCheck size={12} className="text-red-400" />
                  <span className="text-[10px] text-red-400/80 font-medium">
                    Sẽ gọi khi mưa &gt;22mm hoặc nhiệt &gt;40°C
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


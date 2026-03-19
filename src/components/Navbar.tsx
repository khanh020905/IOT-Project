import { motion } from "framer-motion";
import { Navigation, Bell, Search, Hexagon } from "lucide-react";

interface NavbarProps {
  isOnline: boolean;
}

export function Navbar({ isOnline }: NavbarProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
  });
  const timeStr = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex items-center justify-between px-10 py-8 lg:px-16"
    >
      {/* Left: Logo Area */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Hexagon size={24} className="text-white fill-white/20" />
        </div>
        <span className="text-lg font-medium tracking-wide text-white/90">
          thời tiết<span className="text-white/50">.ngay bây giờ</span>
        </span>
      </div>

      {/* Center: Subtle Icons */}
      <div className="hidden md:flex items-center gap-6 glass-premium px-6 py-2 rounded-full border border-white/10 bg-white/5">
        <Search
          size={16}
          className="text-white/40 hover:text-white transition-colors cursor-pointer"
        />
        <Navigation
          size={16}
          className="text-white/40 hover:text-white transition-colors cursor-pointer"
        />
        <Bell
          size={16}
          className="text-white/40 hover:text-white transition-colors cursor-pointer"
        />
      </div>

      {/* Right: Date & Status */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-white/90 text-sm font-medium tracking-wide">
            {dateStr} | {timeStr}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-red-500"}`}
            />
            <span className="text-white/40 text-[10px] uppercase tracking-wider">
              {isOnline ? "Hệ thống Online" : "Ngoại tuyến"}
            </span>
          </div>
        </div>

        {/* User Profile Avatar Mock */}
        <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
          <span className="text-white/80 text-sm font-medium">IoT</span>
        </div>
      </div>
    </motion.nav>
  );
}

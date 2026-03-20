import "./index.css";
import { useWeatherData } from "./hooks/useWeatherData";
import { Navbar } from "./components/Navbar";
import { HeroWeather } from "./components/HeroWeather";
import { RainCard } from "./components/RainCard";
import { HumidityCard } from "./components/HumidityCard";
import { HistoryChart } from "./components/HistoryChart";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

function App() {
  const { data, history, isOnline, isLoading } = useWeatherData();

  // Helper function to pick the appropriate video background based on weather
  const getBackgroundVideo = () => {
    if (!data) return "video/Stormy_Sky_Video_Generation.mp4"; // Default fallback
    const { temperature, humidity, rainRate } = data;

    if (rainRate > 5) return "video/Melancholic_Rain_Video_Generation.mp4";
    if (rainRate > 1) return "video/Melancholic_Rain_Video_Generation.mp4";
    if (rainRate > 0) return "video/Overcast_Sky_Time_Lapse_Video.mp4";
    if (humidity > 85) return "video/Overcast_Sky_Time_Lapse_Video.mp4";
    if (temperature > 30) return "video/Sunny_Sky_Video_Generation.mp4";
    if (temperature > 18) return "video/Sunny_Sky_Video_Generation.mp4";

    return "video/Stormy_Sky_Video_Generation.mp4"; // Fallback/pleasant
  };

  const bgVideo = getBackgroundVideo();

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#1a202c]">
      {/* Dynamic AI Background Video Transition */}
      {/* We use purely opacity transitions on absolute video elements for a smooth crossfade */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={bgVideo}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="fixed inset-0 z-0"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            src={`/${bgVideo}`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Subtle overlay gradient to ensure text readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/0 via-black/10 to-[#1a202c]/90 pointer-events-none" />

      {/* Lightning Flash Effect (subtle, occasional) */}
      <motion.div
        className="fixed inset-0 z-0 bg-white/5 pointer-events-none"
        animate={{ opacity: [0, 0, 0.1, 0, 0, 0] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          times: [0, 0.9, 0.92, 0.95, 0.98, 1],
        }}
      />

      {/* Cloud Textures (CSS layered noise) */}
      <div
        className="fixed inset-0 z-0 opacity-30 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.005' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "800px 800px",
        }}
      />

      {/* Main content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar isOnline={isOnline} />

        <main className="flex-1 flex flex-col w-full h-full pb-0 relative">
          <AnimatePresence mode="wait">
            {isLoading || !data ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center -mt-20"
              >
                <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                <p className="mt-4 text-white/50 text-sm tracking-widest uppercase">
                  Đang khởi tạo Dữ liệu Trạm
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="flex-1 flex flex-col pt-4 lg:pt-10 w-full"
              >
                {/* Top Section: Hero (Left) and Widgets (Right) */}
                <div className="flex flex-col lg:flex-row justify-between w-full px-4 lg:px-8 xl:px-16">
                  {/* Left Hero */}
                  <div className="flex-1 lg:max-w-[60%] shrink-0">
                    <HeroWeather
                      temperature={data.temperature}
                      humidity={data.humidity}
                      rainRate={data.rainRate}
                    />
                  </div>

                  {/* Right Widgets */}
                  <div className="flex flex-col gap-6 mt-12 lg:mt-0 lg:w-[380px] shrink-0 xl:mr-16 relative z-20">
                    {/* Replaced 'Wind Status' with Rain Status sparkline */}
                    <div className="w-full">
                      <RainCard
                        rainHour={data.rainHour}
                        rainRate={data.rainRate}
                        history={history}
                      />
                    </div>

                    {/* Replaced 'Sunrise' with Humidity Dial */}
                    <div className="w-full">
                      <HumidityCard humidity={data.humidity} />
                    </div>
                  </div>
                </div>

                {/* Bottom Timeline Strip (History) */}
                <div className="w-full mt-auto mt-20 relative z-10">
                  <HistoryChart history={history} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;

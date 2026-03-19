import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchWeatherData,
  checkConnection,
  type WeatherData,
} from "../api/blynk";

const MAX_HISTORY = 60;
const POLL_INTERVAL = 5000;

export interface HistoryPoint {
  time: string;
  temperature: number;
  humidity: number;
}

export function useWeatherData() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const poll = useCallback(async () => {
    const [weatherData, connected] = await Promise.all([
      fetchWeatherData(),
      checkConnection(),
    ]);

    setIsOnline(connected);

    if (weatherData) {
      setData(weatherData);
      setLastUpdate(new Date());
      setIsLoading(false);

      setHistory((prev) => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

        const newPoint: HistoryPoint = {
          time: timeStr,
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
        };

        const updated = [...prev, newPoint];
        return updated.length > MAX_HISTORY
          ? updated.slice(-MAX_HISTORY)
          : updated;
      });
    }
  }, []);

  useEffect(() => {
    poll();
    intervalRef.current = window.setInterval(poll, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll]);

  return { data, history, isOnline, lastUpdate, isLoading };
}

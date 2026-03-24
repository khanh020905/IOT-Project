import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchRainComparison,
  type RainComparison,
} from "../api/openmeteo";
import { sendAlertEmail } from "../api/emailjs";

const CHECK_INTERVAL = 15 * 60 * 1000; // Check every 15 minutes
const LIVE_RAIN_THRESHOLD = 10; // mm — send alert when live sensor hits this

export type AlertStatus =
  | "idle" // No email set yet
  | "monitoring" // Watching for sudden rain
  | "alert-detected" // Sudden rain detected, sending email
  | "alert-sent" // Email sent successfully
  | "alert-failed" // Email failed
  | "no-alert"; // Checked, no sudden rain today

export function useWeatherAlert() {
  const [email, setEmail] = useState<string>(() => {
    return localStorage.getItem("weather_alert_email") || "";
  });
  const [status, setStatus] = useState<AlertStatus>("idle");
  const [rainData, setRainData] = useState<RainComparison | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const intervalRef = useRef<number | null>(null);
  const emailRef = useRef(email);
  const hasSentForecastRef = useRef(false);
  const hasSentLiveRef = useRef(false);

  // Keep email ref in sync
  emailRef.current = email;

  // --- Forecast-based check (Open-Meteo: yesterday dry → today ≥10mm) ---
  const checkAndAlert = useCallback(async () => {
    const currentEmail = emailRef.current;
    if (!currentEmail) return;

    const data = await fetchRainComparison();
    if (!data) return;

    setRainData(data);
    setLastChecked(new Date());

    if (data.isSuddenRain && !hasSentForecastRef.current) {
      setStatus("alert-detected");

      const today = new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const success = await sendAlertEmail({
        toEmail: currentEmail,
        rainAmount: data.todayForecastRainMm,
        location: "Trạm IoT",
        date: today,
        currentTemp: data.currentTemp,
        condition: data.condition,
        conditionIcon: data.conditionIcon,
        high: data.high,
        low: data.low,
        days: data.dailyForecast,
        hours: data.hourlyTemps,
      });

      if (success) {
        setStatus("alert-sent");
        hasSentForecastRef.current = true;
      } else {
        setStatus("alert-failed");
      }
    } else if (!data.isSuddenRain) {
      setStatus("no-alert");
    }
  }, []);

  // --- Live sensor check (IoT rain rate ≥ 10mm → send alert) ---
  const checkLiveRain = useCallback(
    async (liveRainRate: number) => {
      const currentEmail = emailRef.current;
      if (!currentEmail) return;
      if (liveRainRate < LIVE_RAIN_THRESHOLD) return;
      if (hasSentLiveRef.current) return;

      setStatus("alert-detected");

      const now = new Date();
      const today = now.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const success = await sendAlertEmail({
        toEmail: currentEmail,
        rainAmount: liveRainRate,
        location: "Trạm IoT (Cảm biến trực tiếp)",
        date: today,
        currentTemp: rainData?.currentTemp,
        condition: "Mưa lớn đang xảy ra",
        conditionIcon: "🌧️",
        high: rainData?.high,
        low: rainData?.low,
        days: rainData?.dailyForecast,
        hours: rainData?.hourlyTemps,
      });

      if (success) {
        setStatus("alert-sent");
        hasSentLiveRef.current = true;
      } else {
        setStatus("alert-failed");
      }
    },
    [rainData]
  );

  // Save email to localStorage when it changes
  const updateEmail = useCallback(
    (newEmail: string) => {
      setEmail(newEmail);
      if (newEmail) {
        localStorage.setItem("weather_alert_email", newEmail);
        setStatus("monitoring");
        hasSentForecastRef.current = false;
        hasSentLiveRef.current = false;
        checkAndAlert();
      } else {
        localStorage.removeItem("weather_alert_email");
        setStatus("idle");
      }
    },
    [checkAndAlert]
  );

  // Start monitoring when email is set
  useEffect(() => {
    if (!email) {
      setStatus("idle");
      return;
    }

    setStatus("monitoring");
    checkAndAlert();

    intervalRef.current = window.setInterval(checkAndAlert, CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [email, checkAndAlert]);

  return {
    email,
    status,
    rainData,
    lastChecked,
    updateEmail,
    checkLiveRain,
  };
}

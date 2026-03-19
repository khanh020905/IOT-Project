const BLYNK_TOKEN = "MKAd4T9QpS-qEnwbeNpFNpJqwgrlXIhF";
const BASE_URL = "https://blynk.cloud/external/api";

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainHour: number;
  rainDay: number;
  timestamp: number;
}

async function getPin(pin: string): Promise<number> {
  try {
    const response = await fetch(
      `${BASE_URL}/get?token=${BLYNK_TOKEN}&pin=${pin}`,
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const value = parseFloat(text.replace(/[[\]"]/g, ""));
    return isNaN(value) ? 0 : value;
  } catch (error) {
    console.error(`Failed to fetch pin ${pin}:`, error);
    return NaN;
  }
}

export async function fetchWeatherData(): Promise<WeatherData | null> {
  try {
    const [temperature, humidity, rainHour, rainDay] = await Promise.all([
      getPin("V0"),
      getPin("V1"),
      getPin("V2"),
      getPin("V4"),
    ]);

    if (isNaN(temperature) && isNaN(humidity)) return null;

    return {
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity * 10) / 10,
      rainHour: Math.round(rainHour * 10) / 10,
      rainDay: Math.round(rainDay * 10) / 10,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
}

export async function checkConnection(): Promise<boolean> {
  try {
    const response = await fetch(
      `${BASE_URL}/isHardwareConnected?token=${BLYNK_TOKEN}`,
    );
    if (!response.ok) return false;
    const text = await response.text();
    return text.trim() === "true";
  } catch {
    return false;
  }
}

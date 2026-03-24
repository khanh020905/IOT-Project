// Open-Meteo API — free, no API key required
// Docs: https://open-meteo.com/en/docs

// Default coordinates: Ho Chi Minh City area — update to your IoT station location
const LATITUDE = 10.82;
const LONGITUDE = 106.63;
const TIMEZONE = "Asia/Ho_Chi_Minh";

export interface ForecastHour {
  time: string; // ISO 8601
  hour: string; // "14:00"
  temperature: number;
  humidity: number;
  weatherCode: number;
  weatherLabel: string;
  weatherIcon: string; // icon key for lucide
}

export interface ForecastData {
  hourly: ForecastHour[];
  fetchedAt: number;
}

/**
 * WMO Weather interpretation codes → Vietnamese label + icon key
 * https://open-meteo.com/en/docs#weathervariables
 */
function interpretWeatherCode(code: number): {
  label: string;
  icon: string;
} {
  switch (code) {
    case 0:
      return { label: "Trời quang", icon: "sun" };
    case 1:
      return { label: "Ít mây", icon: "sun" };
    case 2:
      return { label: "Có mây", icon: "cloud-sun" };
    case 3:
      return { label: "Nhiều mây", icon: "cloud" };
    case 45:
    case 48:
      return { label: "Sương mù", icon: "cloud-fog" };
    case 51:
      return { label: "Mưa phùn nhẹ", icon: "cloud-drizzle" };
    case 53:
      return { label: "Mưa phùn", icon: "cloud-drizzle" };
    case 55:
      return { label: "Mưa phùn dày", icon: "cloud-drizzle" };
    case 56:
    case 57:
      return { label: "Mưa phùn lạnh", icon: "cloud-drizzle" };
    case 61:
      return { label: "Mưa nhỏ", icon: "cloud-rain" };
    case 63:
      return { label: "Mưa vừa", icon: "cloud-rain" };
    case 65:
      return { label: "Mưa lớn", icon: "cloud-rain-wind" };
    case 66:
    case 67:
      return { label: "Mưa lạnh", icon: "cloud-rain" };
    case 71:
    case 73:
    case 75:
    case 77:
      return { label: "Tuyết", icon: "snowflake" };
    case 80:
      return { label: "Mưa rào nhẹ", icon: "cloud-rain" };
    case 81:
      return { label: "Mưa rào", icon: "cloud-rain-wind" };
    case 82:
      return { label: "Mưa rào lớn", icon: "cloud-rain-wind" };
    case 85:
    case 86:
      return { label: "Mưa tuyết", icon: "snowflake" };
    case 95:
      return { label: "Giông", icon: "cloud-lightning" };
    case 96:
    case 99:
      return { label: "Giông mưa đá", icon: "cloud-lightning" };
    default:
      return { label: "Không rõ", icon: "cloud" };
  }
}

export async function fetchForecast(
  lat: number = LATITUDE,
  lon: number = LONGITUDE,
): Promise<ForecastData | null> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set(
      "hourly",
      "temperature_2m,relative_humidity_2m,weather_code"
    );
    url.searchParams.set("timezone", TIMEZONE);
    url.searchParams.set("forecast_days", "2"); // today + tomorrow

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const times: string[] = json.hourly.time;
    const temps: number[] = json.hourly.temperature_2m;
    const humidities: number[] = json.hourly.relative_humidity_2m;
    const codes: number[] = json.hourly.weather_code;

    const now = new Date();

    const hourly: ForecastHour[] = times
      .map((t, i) => {
        const date = new Date(t);
        const { label, icon } = interpretWeatherCode(codes[i]);
        return {
          time: t,
          hour: `${date.getHours().toString().padStart(2, "0")}:00`,
          temperature: Math.round(temps[i]),
          humidity: Math.round(humidities[i]),
          weatherCode: codes[i],
          weatherLabel: label,
          weatherIcon: icon,
          _date: date,
        };
      })
      // Only keep future hours (next 24h)
      .filter((h) => {
        const diff = h._date.getTime() - now.getTime();
        return diff > 0 && diff <= 24 * 60 * 60 * 1000;
      })
      .map(({ _date, ...rest }) => rest);

    return { hourly, fetchedAt: Date.now() };
  } catch (err) {
    console.error("Failed to fetch forecast:", err);
    return null;
  }
}

/**
 * Fetch yesterday's vs today's precipitation for sudden-rain detection,
 * plus daily & hourly forecast data for the alert email.
 */
export interface RainComparison {
  yesterdayRainMm: number;
  todayForecastRainMm: number;
  isSuddenRain: boolean;
  // Extra data for email
  currentTemp?: number;
  condition?: string;
  conditionIcon?: string;
  high?: number;
  low?: number;
  dailyForecast?: {
    day: string;
    icon: string;
    high: number;
    low: number;
    isToday?: boolean;
  }[];
  hourlyTemps?: { time: string; temp: number }[];
}

const WEEKDAY_VI = ["CN", "T.2", "T.3", "T.4", "T.5", "T.6", "T.7"];

function wmoToEmoji(code: number): string {
  if (code <= 1) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "☁️";
  if (code <= 57) return "🌦️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "⛈️";
  if (code <= 86) return "❄️";
  return "⛈️";
}

function wmoToCondition(code: number): string {
  if (code === 0) return "Trời nắng";
  if (code <= 2) return "Có mây";
  if (code === 3) return "Nhiều mây";
  if (code <= 48) return "Sương mù";
  if (code <= 57) return "Mưa phùn";
  if (code <= 65) return "Mưa";
  if (code <= 67) return "Mưa lạnh";
  if (code <= 77) return "Tuyết";
  if (code <= 82) return "Mưa lớn";
  return "Bão";
}

export async function fetchRainComparison(
  lat: number = LATITUDE,
  lon: number = LONGITUDE,
): Promise<RainComparison | null> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set(
      "daily",
      "precipitation_sum,weather_code,temperature_2m_max,temperature_2m_min"
    );
    url.searchParams.set(
      "hourly",
      "temperature_2m"
    );
    url.searchParams.set("current", "temperature_2m,weather_code");
    url.searchParams.set("timezone", TIMEZONE);
    url.searchParams.set("past_days", "1");
    url.searchParams.set("forecast_days", "7");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    // --- Rain comparison (index 0 = yesterday, 1 = today) ---
    const precip: number[] = json.daily.precipitation_sum;
    const yesterdayRainMm = Math.round((precip[0] || 0) * 10) / 10;
    const todayForecastRainMm = Math.round((precip[1] || 0) * 10) / 10;
    const isSuddenRain = yesterdayRainMm < 2 && todayForecastRainMm >= 10;

    // --- Current conditions ---
    const currentTemp = Math.round(json.current?.temperature_2m ?? 0);
    const currentWmo = json.current?.weather_code ?? 0;
    const condition = wmoToCondition(currentWmo);
    const conditionIcon = wmoToEmoji(currentWmo);

    // --- Today's high/low (index 1 = today) ---
    const high = Math.round(json.daily.temperature_2m_max[1] ?? 0);
    const low = Math.round(json.daily.temperature_2m_min[1] ?? 0);

    // --- Daily forecast (skip yesterday at index 0, take 6 days) ---
    const dailyForecast = [];
    const dailyDates: string[] = json.daily.time;
    const dailyWmo: number[] = json.daily.weather_code;
    const dailyMax: number[] = json.daily.temperature_2m_max;
    const dailyMin: number[] = json.daily.temperature_2m_min;

    for (let i = 1; i <= 6 && i < dailyDates.length; i++) {
      const d = new Date(dailyDates[i]);
      const dayNum = d.getDate();
      const dayName = WEEKDAY_VI[d.getDay()];
      dailyForecast.push({
        day: `${dayName} ${dayNum}`,
        icon: wmoToEmoji(dailyWmo[i] ?? 0),
        high: Math.round(dailyMax[i] ?? 0),
        low: Math.round(dailyMin[i] ?? 0),
        isToday: i === 1,
      });
    }

    // --- Hourly temps (next 8 hours from now) ---
    const hourlyTemps: { time: string; temp: number }[] = [];
    const hourlyTimes: string[] = json.hourly.time;
    const hourlyT: number[] = json.hourly.temperature_2m;
    const nowMs = Date.now();

    let startIdx = hourlyTimes.findIndex(
      (t) => new Date(t).getTime() >= nowMs
    );
    if (startIdx < 0) startIdx = 0;

    for (let i = startIdx; i < startIdx + 8 && i < hourlyTimes.length; i++) {
      const d = new Date(hourlyTimes[i]);
      const h = d.getHours();
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      hourlyTemps.push({
        time: `${h12} ${ampm}`,
        temp: Math.round(hourlyT[i] ?? 0),
      });
    }

    return {
      yesterdayRainMm,
      todayForecastRainMm,
      isSuddenRain,
      currentTemp,
      condition,
      conditionIcon,
      high,
      low,
      dailyForecast,
      hourlyTemps,
    };
  } catch (err) {
    console.error("Failed to fetch rain comparison:", err);
    return null;
  }
}


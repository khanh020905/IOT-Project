export function calculateHeatIndex(tempC: number, humidity: number): number {
  // Rothfusz regression (converted to Celsius)
  const T = (tempC * 9) / 5 + 32; // to Fahrenheit
  const RH = humidity;

  if (T < 80) return tempC; // Heat index only meaningful above ~27°C

  let HI =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T * T -
    0.05481717 * RH * RH +
    0.00122874 * T * T * RH +
    0.00085282 * T * RH * RH -
    0.00000199 * T * T * RH * RH;

  // Convert back to Celsius
  HI = ((HI - 32) * 5) / 9;
  return Math.round(HI * 10) / 10;
}

export type ComfortLevel =
  | "Lạnh"
  | "Mát mẻ"
  | "Dễ chịu"
  | "Ấm áp"
  | "Nóng"
  | "Nguy hiểm";

export function getComfortLevel(tempC: number, humidity: number): ComfortLevel {
  const heatIndex = calculateHeatIndex(tempC, humidity);

  if (heatIndex < 15) return "Lạnh";
  if (heatIndex < 22) return "Mát mẻ";
  if (heatIndex < 28) return "Dễ chịu";
  if (heatIndex < 33) return "Ấm áp";
  if (heatIndex < 40) return "Nóng";
  return "Nguy hiểm";
}

export function getComfortColor(level: ComfortLevel): string {
  switch (level) {
    case "Lạnh":
      return "#60a5fa";
    case "Mát mẻ":
      return "#22d3ee";
    case "Dễ chịu":
      return "#34d399";
    case "Ấm áp":
      return "#fbbf24";
    case "Nóng":
      return "#f87171";
    case "Nguy hiểm":
      return "#ef4444";
  }
}

export function getComfortEmoji(level: ComfortLevel): string {
  switch (level) {
    case "Lạnh":
      return "🥶";
    case "Mát mẻ":
      return "🌤️";
    case "Dễ chịu":
      return "😊";
    case "Ấm áp":
      return "🌡️";
    case "Nóng":
      return "🥵";
    case "Nguy hiểm":
      return "⚠️";
  }
}

export function getWeatherCondition(
  tempC: number,
  humidity: number,
  rainHour: number,
): string {
  if (rainHour > 5) return "Mưa lớn";
  if (rainHour > 1) return "Mưa vừa";
  if (rainHour > 0) return "Mưa nhỏ";
  if (humidity > 85) return "Có sương mù";
  if (humidity > 70 && tempC > 30) return "Nóng ẩm";
  if (tempC > 35) return "Rất nóng";
  if (tempC > 30) return "Nắng ấm";
  if (tempC > 25) return "Ít mây";
  if (tempC > 18) return "Thời tiết đẹp";
  return "Trời mát & Trong xanh";
}

export function getWeatherDescription(
  tempC: number,
  humidity: number,
  rainHour: number,
): string {
  if (rainHour > 5) return "Phát hiện lượng mưa lớn. Hạn chế ra ngoài.";
  if (rainHour > 1) return "Mưa rào nhẹ. Hãy mang theo ô khi ra ngoài.";
  if (rainHour > 0) return "Có mưa nhỏ rải rác xung quanh khu vực.";
  if (humidity > 85)
    return "Độ ẩm rất cao và có sương mù. Tầm nhìn có thể bị hạn chế.";
  if (tempC > 35)
    return "Nhiệt độ cực kỳ cao. Uống nhiều nước và tránh ánh nắng gắt.";
  if (tempC > 30)
    return "Trời quang đãng với vài cụm mây. Thời tiết ấm áp trong cả ngày.";
  if (tempC > 25) return "Thời tiết khá mát mẻ với nhiệt độ dễ chịu.";
  return "Trời se lạnh. Nên chuẩn bị áo khoác nhẹ khi ra ngoài.";
}

export function getTempColor(tempC: number): string {
  if (tempC < 15) return "#60a5fa";
  if (tempC < 25) return "#34d399";
  if (tempC < 33) return "#fbbf24";
  return "#f87171";
}

export function getHumidityColor(humidity: number): string {
  if (humidity < 30) return "#fbbf24";
  if (humidity < 60) return "#34d399";
  if (humidity < 80) return "#60a5fa";
  return "#3b82f6";
}

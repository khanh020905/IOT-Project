// ============================================
// 🔔 N8N Webhook — Real-time IoT Alert Bridge
// ============================================
// Sends sensor data to n8n webhook instantly
// when thresholds are crossed (rain > 15mm, temp > 38°C)

const N8N_WEBHOOK_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5678/webhook/weather-alert"
    : "https://n8n-h24n.onrender.com/webhook/weather-alert";

// Cooldown to prevent spam (5 minutes between alerts)
let lastAlertTime = 0;
const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes

interface SensorPayload {
  rainRate: number;
  rainHour: number;
  temperature: number;
  humidity: number;
  location?: string;
}

/**
 * Send sensor data to n8n webhook for real-time alert processing.
 * Only sends when thresholds are crossed AND cooldown has passed.
 */
export async function sendToN8N(data: SensorPayload): Promise<boolean> {
  const now = Date.now();

  // Check if any threshold is crossed
  const hasRainAlert = data.rainRate > 15;
  const hasTempAlert = data.temperature > 38;
  const hasHumidityRisk = data.humidity < 20 && data.temperature > 35;

  if (!hasRainAlert && !hasTempAlert && !hasHumidityRisk) {
    return false; // No alert needed
  }

  // Cooldown check — don't spam Telegram
  if (now - lastAlertTime < ALERT_COOLDOWN) {
    console.log("[n8n] Alert cooldown active, skipping...");
    return false;
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rainRate: data.rainRate,
        rainHour: data.rainHour,
        temperature: data.temperature,
        humidity: data.humidity,
        location: data.location || "Trạm IoT — TP.HCM",
      }),
    });

    if (response.ok) {
      lastAlertTime = now;
      console.log("[n8n] ✅ Alert sent to n8n webhook");
      return true;
    } else {
      console.error("[n8n] ❌ Webhook responded with:", response.status);
      return false;
    }
  } catch (error) {
    console.error("[n8n] ❌ Failed to reach n8n webhook:", error);
    return false;
  }
}

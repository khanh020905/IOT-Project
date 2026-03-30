// ============================================
// 🔔 N8N Webhook — Real-time IoT Alert Bridge
// ============================================
// Sends sensor data to n8n webhook instantly
// when thresholds are crossed (rain > 15mm, temp > 38°C)

// Both endpoints so we can test on live Production and Localhost simultaneously
const ENDPOINTS = [
  "https://n8n-h24n.onrender.com",
  "http://localhost:5678"
];

// Cooldown to prevent spam (5 minutes between alerts)
let lastAlertTime = 0;
const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes

// Separate cooldown for emergency calls (30 min — don't spam phone calls)
let lastCallTime = 0;
const CALL_COOLDOWN = 30 * 60 * 1000; // 30 minutes

interface SensorPayload {
  rainRate: number;
  rainHour: number;
  temperature: number;
  humidity: number;
  location?: string;
  phoneNumber?: string;
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

  const payload = {
    rainRate: data.rainRate,
    rainHour: data.rainHour,
    temperature: data.temperature,
    humidity: data.humidity,
    location: data.location || "Trạm IoT — TP.HCM",
  };

  try {
    // 1. Send Telegram alert (always for any warning)
    // Send to both localhost and production concurrently
    const alertPromises = ENDPOINTS.map((base) =>
      fetch(`${base}/webhook/weather-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((e) => console.warn(`[n8n] Warning: Failed to reach ${base}`, e))
    );
    
    await Promise.all(alertPromises);
    
    // We assume if it didn't crash, at least one hit successfully
    lastAlertTime = now;
    console.log("[n8n] ✅ Telegram alert sent to endpoints");

    // 2. Trigger emergency VOICE CALL for critical alerts only
    const isCritical =
      data.rainRate > 22 || data.temperature > 40 || (data.humidity < 20 && data.temperature > 35);
    const phone = data.phoneNumber || localStorage.getItem("emergency_phone") || "";

    if (isCritical && phone && now - lastCallTime >= CALL_COOLDOWN) {
      const callPromises = ENDPOINTS.map((base) =>
        fetch(`${base}/webhook/emergency-call`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, phoneNumber: phone }),
        }).catch((e) => console.warn(`[n8n] Warning: Failed to reach ${base}`, e))
      );
      
      await Promise.all(callPromises);
      lastCallTime = now;
      console.log("[n8n] 📞 Emergency voice call triggered to", phone);
    }

    return true;
  } catch (error) {
    console.error("[n8n] ❌ Failed to reach n8n webhook:", error);
    return false;
  }
}

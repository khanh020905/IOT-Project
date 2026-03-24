import emailjs from "@emailjs/browser";

// ============================================================
// EmailJS Configuration
// ============================================================
// To set up EmailJS (free, 200 emails/month):
//
// 1. Sign up at https://www.emailjs.com/
// 2. Go to "Email Services" → Add a service (e.g. Gmail)
// 3. Go to "Email Templates" → Create a template with these variables:
//    - {{to_email}}     → recipient email
//    - {{subject}}      → email subject
//    - {{message}}      → alert message body
//    - {{rain_amount}}  → forecasted rain amount
//    - {{location}}     → location name
//    - {{date}}         → date of the forecast
// 4. Go to "Account" → copy your Public Key
// 5. Fill in the constants below:
// ============================================================

const EMAILJS_SERVICE_ID = "service_ajnj8zr";
const EMAILJS_TEMPLATE_ID = "template_weather_alert"; // Replace with your template ID
const EMAILJS_PUBLIC_KEY = "WpOk9CDPBfXrPbZK5";

let initialized = false;

function ensureInit() {
  if (!initialized) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    initialized = true;
  }
}

export interface DayForecast {
  day: string; // e.g. "T.3 25"
  icon: string; // emoji
  high: number;
  low: number;
  isToday?: boolean;
}

export interface HourTemp {
  time: string; // e.g. "5 PM"
  temp: number;
}

export interface AlertEmailParams {
  toEmail: string;
  rainAmount: number;
  location: string;
  date: string;
  currentTemp?: number;
  condition?: string;
  conditionIcon?: string;
  high?: number;
  low?: number;
  days?: DayForecast[];
  hours?: HourTemp[];
}

function buildDayCell(d: DayForecast): string {
  const bg = d.isToday
    ? "background: #f1f5f9; border-radius: 12px;"
    : "";
  const label = d.isToday ? "Hôm nay" : d.day;
  return `
    <td style="text-align: center; padding: 12px 6px; ${bg} vertical-align: top; width: 16.6%;">
      <div style="font-size: 11px; color: ${d.isToday ? "#1e293b" : "#94a3b8"}; font-weight: ${d.isToday ? "600" : "500"}; margin-bottom: 8px;">${label}</div>
      <div style="font-size: 28px; margin-bottom: 8px;">${d.icon}</div>
      <div style="font-size: 13px;">
        <span style="color: #1e293b; font-weight: 600;">${d.high}°</span>
        <span style="color: #94a3b8; font-weight: 400;"> ${d.low}°</span>
      </div>
    </td>`;
}

function buildHourCell(h: HourTemp): string {
  return `
    <td style="text-align: center; padding: 8px 4px; vertical-align: bottom;">
      <div style="font-size: 14px; color: #1e293b; font-weight: 500; margin-bottom: 6px;">${h.temp}°</div>
      <div style="font-size: 11px; color: #94a3b8;">${h.time}</div>
    </td>`;
}

export async function sendAlertEmail(
  params: AlertEmailParams
): Promise<boolean> {
  try {
    ensureInit();

    const temp = params.currentTemp ?? "--";
    const cond = params.condition ?? "Mưa lớn";
    const condIcon = params.conditionIcon ?? "🌧️";
    const high = params.high ?? "--";
    const low = params.low ?? "--";

    // Build daily forecast row
    const daysHtml = params.days
      ? params.days.map(buildDayCell).join("")
      : "";

    // Build hourly row
    const hoursHtml = params.hours
      ? params.hours.map(buildHourCell).join("")
      : "";

    const htmlMessage = `
<div style="font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

  <!-- Location Header -->
  <div style="padding: 20px 24px 0;">
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div>
        <p style="font-size: 15px; font-weight: 600; color: #1e293b; margin: 0;">${params.location}&nbsp;&nbsp;${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
        <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0;">Cập nhật vừa xong</p>
      </div>
    </div>
  </div>

  <!-- Current Weather -->
  <div style="padding: 16px 24px 20px;">
    <table style="border-spacing: 0;">
      <tr>
        <td style="vertical-align: middle; padding-right: 16px;">
          <div style="font-size: 56px; line-height: 1;">${condIcon}</div>
        </td>
        <td style="vertical-align: middle;">
          <div style="font-size: 48px; font-weight: 300; color: #1e293b; line-height: 1;">
            ${temp}<span style="font-size: 24px; vertical-align: super; font-weight: 400;">°C</span>
          </div>
        </td>
        <td style="vertical-align: middle; padding-left: 16px;">
          <div style="font-size: 18px; font-weight: 500; color: #1e293b;">${cond}</div>
          <div style="font-size: 13px; color: #64748b; margin-top: 2px;">H:${high}° &nbsp;L:${low}°</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- Alert Banner -->
  <div style="margin: 0 16px 16px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 12px;">
    <p style="color: #92400e; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">
      ⚠️ Cảnh báo mưa bất thường — ${params.rainAmount}mm
    </p>
    <p style="color: #78350f; font-size: 12px; margin: 0; line-height: 1.5;">
      Hôm qua trời không mưa nhưng hôm nay có mưa lớn đột ngột. Hãy mang áo mưa!
    </p>
  </div>

  ${daysHtml ? `
  <!-- Daily Forecast -->
  <div style="padding: 0 16px 12px;">
    <table style="width: 100%; border-spacing: 0; border-collapse: collapse;">
      <tr>${daysHtml}</tr>
    </table>
  </div>
  ` : ""}

  <!-- Divider -->
  <div style="height: 1px; background: #f1f5f9; margin: 0 24px;"></div>

  ${hoursHtml ? `
  <!-- Hourly Temperatures -->
  <div style="padding: 16px 16px 8px;">
    <table style="width: 100%; border-spacing: 0; border-collapse: collapse;">
      <tr>${hoursHtml}</tr>
    </table>
  </div>
  ` : ""}

  <!-- Tips -->
  <div style="padding: 8px 24px 16px;">
    <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.8;">
      🌂 Mang ô/áo mưa &nbsp;•&nbsp; 🚗 Đường trơn, lái xe cẩn thận &nbsp;•&nbsp; 📱 Theo dõi thời tiết
    </p>
  </div>

  <!-- Footer -->
  <div style="background: #f8fafc; padding: 14px 24px; text-align: center; border-top: 1px solid #f1f5f9;">
    <p style="font-size: 11px; color: #94a3b8; margin: 0;">
      Open-Meteo API &nbsp;•&nbsp; Trạm IoT Weather Station &nbsp;•&nbsp; ${params.date}
    </p>
  </div>
</div>`;

    const templateParams = {
      to_email: params.toEmail,
      subject: `⚠️ Cảnh báo mưa bất thường - ${params.location} | ${params.rainAmount}mm`,
      message: htmlMessage,
      rain_amount: `${params.rainAmount}mm`,
      location: params.location,
      date: params.date,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log("Alert email sent:", response.status);
    return true;
  } catch (error) {
    console.error("Failed to send alert email:", error);
    return false;
  }
}


#define BLYNK_PRINT Serial
#define BLYNK_TEMPLATE_ID   "TMPL6paj12lTU"
#define BLYNK_TEMPLATE_NAME "Weather Station"
#define BLYNK_AUTH_TOKEN    "MKAd4T9QpS-qEnwbeNpFNpJqwgrlXIhF"

#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <Wire.h>
#include <TimeLib.h>
#include <WidgetRTC.h>
#include <AHT20.h>

AHT20 aht20;

// ====== BLYNK & WIFI INFO ======
char auth[] = BLYNK_AUTH_TOKEN;
char ssid[] = "iPhone";       // <-- Fill your WiFi name here
char pass[] = "11111111";    // <-- Fill your WiFi password here

// ====== RTC ======
WidgetRTC rtc;

// ====== TIPPING BUCKET RAIN GAUGE ======
#define RAIN_PIN    D5
#define RAIN_PER_TIP 0.6  // mm per tip

unsigned long tipCount = 0;
unsigned long lastTipCount = 0;

float rainHour = 0;
float rainDay  = 0;
float rainRate = 0; // Live rain intensity (mm) - decays over time

int currentHour = -1;
int currentDay  = -1;

bool initSensor = true;
unsigned long lastTipTime = 0;
unsigned long lastDecayTime = 0;

// ====== VIRTUAL PINS MAP ======
// V0 - Temperature (°C)
// V1 - Humidity (%)
// V2 - Rain per Hour (mm)
// V3 - Manual Reset Button
// V4 - Rain per Day (mm)
// V5 - Live Decaying Rain (mm)

// ====== MANUAL RESET BUTTON (V3) ======
BLYNK_WRITE(V3) {
  if (param.asInt() == 1) {
    rainHour = 0;
    rainDay  = 0;
    tipCount = 0;
    lastTipCount = 0;
    rainRate = 0;
    Blynk.virtualWrite(V2, rainHour);
    Blynk.virtualWrite(V4, rainDay);
    Blynk.virtualWrite(V5, rainRate);
    Serial.println("[RESET] Manual Reset Done");
  }
}

// ====== SEND TEMPERATURE & HUMIDITY EVERY 5 SECONDS ======
unsigned long lastSendTemp = 0;

void sendTempHumidity() {
  if (millis() - lastSendTemp >= 5000) {
    lastSendTemp = millis();

    float temperature = aht20.getTemperature();
    float humidity    = aht20.getHumidity();

    if (!isnan(temperature) && !isnan(humidity)) {
      Blynk.virtualWrite(V0, temperature);
      Blynk.virtualWrite(V1, humidity);

      Serial.print("[SENSOR] Temp: ");
      Serial.print(temperature, 1);
      Serial.print(" °C  |  Hum: ");
      Serial.print(humidity, 1);
      Serial.println(" %");
    } else {
      Serial.println("[SENSOR] Failed to read from AHT20!");
    }
  }
}

// ====== READ TIPPING BUCKET (POLLING) ======
int lastRainState = HIGH;

void readRainSensor() {
  int currentState = digitalRead(RAIN_PIN);

  // Detect falling edge
  if (lastRainState == HIGH && currentState == LOW) {
    unsigned long currentTime = millis();
    
    // Increment live rain
    rainRate += RAIN_PER_TIP;
    if (rainRate > 10.0) rainRate = 10.0; // Cap to prevent excessive values

    lastTipTime = currentTime;
    tipCount++;
    float rainAmount = RAIN_PER_TIP;

    rainHour += rainAmount;
    rainDay  += rainAmount;

    Blynk.virtualWrite(V2, rainHour);
    Blynk.virtualWrite(V4, rainDay);
    Blynk.virtualWrite(V5, rainRate);

    Serial.print("[RAIN] Tip Event! Live: ");
    Serial.print(rainRate, 1);
    Serial.println(" mm");

    lastRainState = LOW;
    delay(200);  // debounce
  } else if (currentState == HIGH) {
    lastRainState = HIGH;
  }
}

// ====== GRADUAL DECAY LOGIC (LEAKY BUCKET) ======
void checkRainDecay() {
  // Only start decaying if 4.5 seconds have passed since the last tip
  if (rainRate > 0 && (millis() - lastTipTime > 4500)) {
    if (millis() - lastDecayTime >= 500) {
      lastDecayTime = millis();
      
      // Decay rate: -0.2 mm per 0.5s (0.4 mm/s)
      rainRate -= 0.2;
      if (rainRate < 0) rainRate = 0;
      
      // Update Blynk
      Blynk.virtualWrite(V5, rainRate);
    }
  }
}

// ====== AUTO-RESET BY HOUR AND DAY (USING RTC) ======
void checkTimeEvent() {
  if (year() < 2020) return;  // RTC not synced yet

  // Hourly reset
  if (hour() != currentHour) {
    currentHour = hour();
    rainHour = 0;
    Blynk.virtualWrite(V2, rainHour);
    Serial.println("[TIME] Hourly rain reset");
  }

  // Daily reset
  if (day() != currentDay) {
    currentDay = day();
    rainDay = 0;
    Blynk.virtualWrite(V4, rainDay);
    Serial.println("[TIME] Daily rain reset");
  }
}

// ====== SETUP ======
void setup() {
  Serial.begin(9600);
  Serial.println("\n==============================");
  Serial.println("  Weather Station - Starting");
  Serial.println("==============================");

  pinMode(RAIN_PIN, INPUT_PULLUP);

  // Initialize AHT20
  Wire.begin();
  if (aht20.begin() == false) {
    Serial.println("[ERROR] AHT20 not detected! Check wiring.");
    initSensor = false;
  } else {
    Serial.println("[OK] AHT20 sensor initialized");
  }

  // Connect to Blynk
  Serial.print("[WIFI] Connecting to ");
  Serial.println(ssid);
  Blynk.begin(auth, ssid, pass);
  rtc.begin();

  Serial.println("[OK] System Ready!\n");
}

// ====== MAIN LOOP ======
void loop() {
  Blynk.run();

  if (initSensor) {
    sendTempHumidity();
  }

  readRainSensor();
  checkRainDecay();
  checkTimeEvent();
}

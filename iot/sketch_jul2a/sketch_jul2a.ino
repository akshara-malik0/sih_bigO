#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include "DHT.h"

// WiFi credentials
const char* ssid = "Aksk7";
const char* password = "12345678";

// MQTT credentials
const char* mqtt_server = "29fcdac0ec29495ba077d6154881bbdf.s1.eu.hivemq.cloud";
const char* mqtt_user = "user123";
const char* mqtt_pass = "%p&7!YBx)ky-Ny7";
const char* mqtt_client_id = "ESP32_SensorClient";
const uint16_t mqtt_port = 8883;

// MQTT Topics
const char* topicTemp = "sensor/temperature";
const char* topicHum = "sensor/humidity";
const char* topicNH3 = "sensor/nh3";
const char* topicH2S = "sensor/h2s";
const char* topicCO2 = "sensor/co2";
const char* topicMQ135Analog = "sensor/mq135_analog";
const char* topicMoisture = "sensor/soil_moisture";

// Pins
#define MQ135_AO_PIN 32
#define MQ135_DO_PIN 4
#define DHTPIN 5
#define DHTTYPE DHT11
#define SOIL_MOISTURE_PIN 33
#define FAN_PIN 15

const float RLOAD = 10000.0;
const float baselineResistance = 10000.0;

DHT dht(DHTPIN, DHTTYPE);
WiFiClientSecure secureClient;
PubSubClient client(secureClient);

unsigned long lastPublishMillis = 0;
const unsigned long publishInterval = 3000;
unsigned long lastMqttAttempt = 0;
const unsigned long mqttRetryInterval = 5000;

void setup_wifi() {
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to WiFi");
  }
}

void attemptMqttConnect() {
  if (client.connected()) return;

  Serial.print("Attempting MQTT connection...");
  if (client.connect(mqtt_client_id, mqtt_user, mqtt_pass)) {
    Serial.println("connected");
  } else {
    Serial.print("failed, rc=");
    Serial.print(client.state());
    Serial.println(" (will retry later)");
  }
}

float estimateGasPPM(float resistance, float baselineResistance, float coefficient) {
  return coefficient * (resistance / baselineResistance);
}

void setup() {
  Serial.begin(115200);
  delay(50);
  dht.begin();

  analogReadResolution(12);
  analogSetPinAttenuation(MQ135_AO_PIN, ADC_11db);
  analogSetPinAttenuation(SOIL_MOISTURE_PIN, ADC_11db);
  pinMode(MQ135_DO_PIN, INPUT);

  pinMode(FAN_PIN, OUTPUT);
  digitalWrite(FAN_PIN, LOW);

  setup_wifi();

  secureClient.setInsecure(); // For testing -- replace with setCACert() for production

  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected() && (millis() - lastMqttAttempt > mqttRetryInterval)) {
    lastMqttAttempt = millis();
    attemptMqttConnect();
  }

  client.loop();

  if (millis() - lastPublishMillis >= publishInterval) {
    lastPublishMillis = millis();

    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    int mq135Analog = analogRead(MQ135_AO_PIN);
    int mq135Digital = digitalRead(MQ135_DO_PIN);

    float voltage = mq135Analog * (3.3f / 4095.0f);
    float resistance = (voltage > 0.01f) ? (RLOAD * (3.3f - voltage) / voltage) : 1e6;

    float nh3_ppm = estimateGasPPM(resistance, baselineResistance, 10.0);
    float h2s_ppm = estimateGasPPM(resistance, baselineResistance, 5.0);
    float co2_ppm = estimateGasPPM(resistance, baselineResistance, 15.0);

    int soilRaw = analogRead(SOIL_MOISTURE_PIN);
    int soilMoisturePercent = map(soilRaw, 4095, 0, 0, 100);
    soilMoisturePercent = constrain(soilMoisturePercent, 0, 100);

    Serial.println("--- Sensor Readings ---");
    Serial.print("WiFi Connected: ");
    Serial.println(WiFi.status() == WL_CONNECTED ? "YES" : "NO");
    Serial.print("MQTT Connected: ");
    Serial.println(client.connected() ? "YES" : "NO");

    if (!isnan(temperature)) {
      Serial.printf("Temperature: %.2f °C\n", temperature);
    } else {
      Serial.println("Temperature read error");
    }
    if (!isnan(humidity)) {
      Serial.printf("Humidity: %.2f %%\n", humidity);
    } else {
      Serial.println("Humidity read error");
    }
    Serial.printf("MQ135 Analog: %d (Voltage: %.3f V)\n", mq135Analog, voltage);
    Serial.printf("Sensor Resistance: %.1f Ohms\n", resistance);
    Serial.printf("Estimated NH3: %.2f ppm\n", nh3_ppm);
    Serial.printf("Estimated H2S: %.2f ppm\n", h2s_ppm);
    Serial.printf("Estimated CO2: %.2f ppm\n", co2_ppm);
    Serial.printf("MQ135 Digital Threshold: %d\n", mq135Digital);
    Serial.printf("Soil Moisture: %d %%\n", soilMoisturePercent);

    Serial.print("Fan: ");
    if (humidity > 55.0) {
      digitalWrite(FAN_PIN, HIGH);
      Serial.println("ON");
    } else {
      digitalWrite(FAN_PIN, LOW);
      Serial.println("OFF");
    }
    
    Serial.println("---------------------------");

    if (client.connected()) {
      if (!isnan(temperature)) client.publish(topicTemp, String(temperature, 2).c_str());
      if (!isnan(humidity)) client.publish(topicHum, String(humidity, 2).c_str());
      client.publish(topicNH3, String(nh3_ppm, 2).c_str());
      client.publish(topicH2S, String(h2s_ppm, 2).c_str());
      client.publish(topicCO2, String(co2_ppm, 2).c_str());
      client.publish(topicMQ135Analog, String(mq135Analog).c_str());
      client.publish(topicMoisture, String(soilMoisturePercent).c_str());
    } else {
      Serial.println("Not connected to MQTT — skipping publish");
    }
  }
}
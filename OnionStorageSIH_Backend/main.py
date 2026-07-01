import eventlet
eventlet.monkey_patch()

from flask import Flask, request, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import paho.mqtt.client as mqtt
from dotenv import load_dotenv
import os
import json
from datetime import datetime, time
from pathlib import Path
import threading

# ------------------- LOAD ENV -------------------
load_dotenv()

MQTT_USER = os.getenv("MQTT_USER")
MQTT_PASS = os.getenv("MQTT_PASS")

if not MQTT_USER or not MQTT_PASS:
    print("❌ ERROR: MQTT credentials missing in .env")
else:
    print("✅ Loaded MQTT credentials")

# ------------------- BASIC SETUP -------------------
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", max_http_buffer_size=20_000_000)

# MQTT Broker details
MQTT_BROKER = "29fcdac0ec29495ba077d6154881bbdf.s1.eu.hivemq.cloud"
MQTT_PORT = 8883

# Updated MQTT topics
MQTT_TOPICS = [
    "sensor/temperature",
    "sensor/humidity",
    "sensor/nh3",
    "sensor/h2s",
    "sensor/co2",
    "sensor/mq135_analog",
    "/camera",
    "camera/photo",
    "camera/end"
]

# Storage paths
IMAGES_DIR = Path("images")
IMAGES_DIR.mkdir(exist_ok=True)

# Keep latest values
latest_values = {
    "temperature": None,
    "humidity": None,
    "co2": None,
    "h2s": None,
    "nh3": None
}

# Device states
device_states = {
    "fans": False,
    "relay": False,
    "humidifier": False,
    "ozone": False
}

# Manual override flags - when True, automation won't control these devices
manual_override = {
    "fans": False,
    "relay": False,
    "humidifier": False,
    "ozone": False
}

# Ozone scheduler state
ozone_last_run_date = None
ozone_timer = None

# ------------------- MQTT CONTROL FUNCTIONS -------------------
def publish_device_state(device, state):
    """Publish device control command to MQTT"""
    control_topics = {
        "fans": "control/fans",
        "relay": "control/relay",
        "humidifier": "control/humidifier",
        "ozone": "control/ozone"
    }
    
    topic = control_topics.get(device)
    if topic:
        payload = "1" if state else "0"
        mqtt_client.publish(topic, payload)
        print(f"📤 MQTT: {topic} → {payload}")

def update_device_and_publish(device, state, is_manual=False):
    """Update device state and publish to MQTT"""
    device_states[device] = state
    
    if is_manual:
        manual_override[device] = True
        print(f"🔧 Manual override enabled for {device}")
    
    publish_device_state(device, state)
    socketio.emit("device_update", {
        "devices": device_states,
        "manual_override": manual_override
    })

# ------------------- MQTT EVENTS -------------------
def on_connect(client, userdata, flags, rc):
    print("\n===============================")
    print("✅ CONNECTED TO MQTT BROKER")
    print("===============================\n")

    for topic in MQTT_TOPICS:
        client.subscribe(topic)
        print(f"📡 Subscribed to: {topic}")


def on_message(client, userdata, msg):
    topic = msg.topic
    current_time = datetime.now().strftime("%I:%M %p")

    # IMAGE HANDLING
    if topic == "/camera":
        print("\n📸 IMAGE RECEIVED from ESP32")
        try:
            image_bytes = msg.payload
            filename = f"capture_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
            filepath = IMAGES_DIR / filename

            with open(filepath, "wb") as f:
                f.write(image_bytes)

            print(f"✅ Image saved as {filename}")

            socketio.emit("new_image", {
                "filename": filename,
                "timestamp": current_time,
                "url": f"/images/{filename}"
            })

        except Exception as e:
            print(f"❌ Error saving image: {e}")
        return

    # SENSOR HANDLING
    payload = msg.payload.decode()
    print(f"📨 MQTT Data: {topic} → {payload}")

    if topic == "sensor/co2":
        latest_values["co2"] = float(payload)

    elif topic == "sensor/h2s":
        latest_values["h2s"] = float(payload)

    elif topic == "sensor/nh3":
        latest_values["nh3"] = float(payload)

    elif topic == "sensor/temperature":
        latest_values["temperature"] = float(payload)

    elif topic == "sensor/humidity":
        latest_values["humidity"] = float(payload)

    # 🔥 AUTOMATION LOGIC - Only if we have all sensor values
    if all(v is not None for v in latest_values.values()):
        temp = latest_values["temperature"]
        humidity = latest_values["humidity"]
        co2 = latest_values["co2"]
        h2s = latest_values["h2s"]
        nh3 = latest_values["nh3"]

        # FANS: Turn ON when any condition is out of safe range (only if not manually overridden)
        if not manual_override["fans"]:
            new_fans_state = temp < 15 or temp > 20 or humidity < 65 or humidity > 80 or co2 > 100 or h2s > 100 or nh3 > 100
            if device_states["fans"] != new_fans_state:
                print(f"🤖 AUTO: Fans → {'ON' if new_fans_state else 'OFF'}")
                update_device_and_publish("fans", new_fans_state, is_manual=False)

        # RELAY: Turn ON when temperature < 25°C (only if not manually overridden)
        if not manual_override["relay"]:
            new_relay_state = temp < 25
            if device_states["relay"] != new_relay_state:
                print(f"🤖 AUTO: Relay → {'ON' if new_relay_state else 'OFF'}")
                update_device_and_publish("relay", new_relay_state, is_manual=False)

        # HUMIDIFIER: Turn ON when humidity < 65%, OFF when > 70% (only if not manually overridden)
        if not manual_override["humidifier"]:
            if humidity < 65 and not device_states["humidifier"]:
                print(f"🤖 AUTO: Humidifier → ON")
                update_device_and_publish("humidifier", True, is_manual=False)
            elif humidity > 70 and device_states["humidifier"]:
                print(f"🤖 AUTO: Humidifier → OFF")
                update_device_and_publish("humidifier", False, is_manual=False)

        # OZONE: Automated daily at 11 PM for 2 minutes
        check_ozone_schedule()

    record = {
        "time": current_time,
        "temperature": latest_values["temperature"],
        "humidity": latest_values["humidity"],
        "co2": latest_values["co2"],
        "h2s": latest_values["h2s"],
        "nh3": latest_values["nh3"],
        "devices": device_states,
        "manual_override": manual_override
    }

    socketio.emit("sensor_data", record)


# ------------------- MQTT CLIENT -------------------
mqtt_client = mqtt.Client()
mqtt_client.username_pw_set(MQTT_USER, MQTT_PASS)
mqtt_client.tls_set()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

# ------------------- OZONE SCHEDULER -------------------
def turn_off_ozone():
    """Turn off ozone after 2 minutes"""
    global device_states, ozone_timer
    print("⏰ Ozone turned OFF after 2 minutes")
    update_device_and_publish("ozone", False, is_manual=False)
    ozone_timer = None

def check_ozone_schedule():
    """Check if it's time to run ozone (daily at 11 PM for 2 minutes)"""
    global ozone_last_run_date, ozone_timer, device_states
    
    # Skip if manually overridden
    if manual_override["ozone"]:
        return
    
    now = datetime.now()
    current_date = now.date()
    current_time = now.time()
    
    # Target time: 11:00 PM (23:00)
    target_time = time(23, 0)
    
    # Check if it's 11 PM and we haven't run today
    if current_time.hour == 23 and current_time.minute == 0:
        if ozone_last_run_date != current_date:
            # Turn on ozone
            ozone_last_run_date = current_date
            print(f"⏰ Ozone turned ON at {now.strftime('%I:%M %p')} for 2 minutes")
            update_device_and_publish("ozone", True, is_manual=False)
            
            # Cancel existing timer if any
            if ozone_timer:
                ozone_timer.cancel()
            
            # Schedule turn off after 2 minutes (120 seconds)
            ozone_timer = threading.Timer(120, turn_off_ozone)
            ozone_timer.start()

# ------------------- SOCKET EVENTS -------------------
@socketio.on("connect")
def on_ws_connect():
    print("🖥 Dashboard connected")
    emit("message", {"status": "connected"})
    # Send current states to newly connected client
    emit("device_update", {
        "devices": device_states,
        "manual_override": manual_override
    })

# ------------------- MANUAL DEVICE CONTROLS -------------------
@socketio.on("toggle_fans")
def toggle_fans(data):
    state = data.get("state", False)
    print(f"🔧 Fans manually toggled to: {state}")
    update_device_and_publish("fans", state, is_manual=True)

@socketio.on("toggle_relay")
def toggle_relay(data):
    state = data.get("state", False)
    print(f"🔧 Relay manually toggled to: {state}")
    update_device_and_publish("relay", state, is_manual=True)

@socketio.on("toggle_humidifier")
def toggle_humidifier(data):
    state = data.get("state", False)
    print(f"🔧 Humidifier manually toggled to: {state}")
    update_device_and_publish("humidifier", state, is_manual=True)

@socketio.on("toggle_ozone")
def toggle_ozone(data):
    global ozone_timer
    state = data.get("state", False)
    print(f"🔧 Ozone manually toggled to: {state}")
    
    # If manually turned off, cancel any running timer
    if not state and ozone_timer:
        ozone_timer.cancel()
        ozone_timer = None
    
    update_device_and_publish("ozone", state, is_manual=True)

# Clear manual override for a specific device (return to auto mode)
@socketio.on("clear_override")
def clear_override(data):
    device = data.get("device")
    if device in manual_override:
        manual_override[device] = False
        print(f"✅ Manual override cleared for {device} - returning to AUTO mode")
        socketio.emit("device_update", {
            "devices": device_states,
            "manual_override": manual_override
        })

# Clear all manual overrides (return all to auto mode)
@socketio.on("clear_all_overrides")
def clear_all_overrides():
    for device in manual_override:
        manual_override[device] = False
    print("✅ All manual overrides cleared - all devices returning to AUTO mode")
    socketio.emit("device_update", {
        "devices": device_states,
        "manual_override": manual_override
    })

# ------------------- API ROUTES -------------------
@app.route("/")
def home():
    return {"message": "server running"}, 200

@app.route("/images/<filename>")
def serve_image(filename):
    return send_from_directory(IMAGES_DIR, filename)

@app.route("/images")
def list_images():
    images = []
    for img in sorted(IMAGES_DIR.glob("*.jpg"), reverse=True):
        images.append({
            "filename": img.name,
            "url": f"/images/{img.name}",
            "timestamp": datetime.fromtimestamp(img.stat().st_mtime).strftime("%I:%M %p"),
        })
    return {"images": images}, 200

@app.route("/status")
def get_status():
    """Get current device states and sensor values"""
    return {
        "devices": device_states,
        "manual_override": manual_override,
        "sensors": latest_values
    }, 200

# ------------------- MAIN -------------------
if __name__ == "__main__":
    print("\n🚀 Starting backend...\n")

    try:
        mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
        print("🔗 MQTT connect called")
    except Exception as e:
        print(f"❌ MQTT connection error: {e}")

    mqtt_client.loop_start()

    socketio.run(app, host="0.0.0.0", port=8000, debug=False)
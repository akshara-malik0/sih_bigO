#  BigO – Smart Onion Storage System

An IoT-powered smart storage system designed to reduce post-harvest onion losses by continuously monitoring environmental conditions and automating storage management. The system combines embedded hardware, cloud connectivity, and AI-assisted spoilage detection to help maintain optimal storage conditions and improve crop quality.



## Project Overview

Large quantities of onions are lost after harvest due to improper storage conditions such as high humidity, temperature fluctuations, and poor ventilation. BigO addresses this problem by collecting real-time sensor data, monitoring storage conditions remotely, and automating environmental controls when required.

The system also integrates an AI-based onion spoilage detection module to assist in identifying spoiled onions, enabling timely intervention and reducing wastage.


##  Features

* Real-time environmental monitoring
* Gas concentration monitoring for storage conditions
* Cloud-connected IoT dashboard
* MQTT-based communication
* Automated environmental control
* AI-assisted onion spoilage detection
* Remote monitoring and management


##  Hardware Components

* ESP32 DevKit
* Temperature & Humidity Sensor
* Gas Sensors (MQ Series)
* CO₂ Sensor
* Relay Module
* Cooling and Ventilation System
* Servo-controlled Air Flaps
* Ozone Sprayer
* Power Management Module


##  Software & Technologies

* Embedded C / Arduino IDE
* ESP32
* MQTT
* HTML, CSS & JavaScript
* Python
* Machine Learning (YOLO-based spoilage detection)
* Git & GitHub



##  System Workflow

1. Sensors continuously collect environmental data.
2. The ESP32 processes and transmits data via MQTT.
3. The dashboard displays live storage conditions.
4. Automated actuators regulate the storage environment when thresholds are exceeded.
5. The integrated AI module analyzes onion images for spoilage detection.






##  My Contributions

Designed and developed the backend for seamless communication between IoT devices and the dashboard.
Built APIs and backend services to process, store, and manage real-time sensor data.
Implemented MQTT-based communication for reliable data exchange between the ESP32, backend, and dashboard.
Integrated cloud services and database functionality to enable remote monitoring and historical data visualization.
Assisted in integrating the AI-based onion spoilage detection module into the complete system workflow.
Collaborated on system integration, testing, debugging, and deployment

> **Note:** The AI model used for onion spoilage detection was developed by another team member.


##  Future Improvements

* Mobile application for remote monitoring
* Predictive analytics for storage optimization
* Cloud-based historical data analysis
* Automated notification and alert system
* Edge AI inference directly on embedded hardware





##  Team Project

This repository represents my contribution to a collaborative project. Different team members contributed to various aspects of the system, including embedded development, AI, hardware integration, and testing.


##  License

This project is shared for educational and portfolio purposes. Please contact the repository owner before using significant portions of the project in commercial or academic work.


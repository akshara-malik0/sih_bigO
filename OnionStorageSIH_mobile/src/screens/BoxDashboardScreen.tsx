import React, { useState, useEffect } from "react";
import { useStorage } from "../contexts/StorageContext";
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Wind,
  Heart,
  Power,
  Sparkles,
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import MultiLineChart from "../components/LineChart";
import GasMonitoringChart from "../components/GasMonitoringChart";
import { SensorData } from "../types";
import CameraViewer from "../components/CameraViewer";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ControlTable from "../components/ControlTable";
import TranslatedText from "../components/TranslatedText";
import { io } from "socket.io-client";

interface BoxDashboardScreenProps {
  boxId: string;
  onBack: () => void;
}

const BoxDashboardScreen: React.FC<BoxDashboardScreenProps> = ({
  boxId,
  onBack,
}) => {
  const { getBoxById, getBoxHistory } = useStorage();
  const [chartData, setChartData] = useState<SensorData[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [activeStates, setActiveStates] = useState({
    fans: false,
    relay: false,
    humidifier: false,
    ozone: false,
  });

  const box = getBoxById(boxId);

  // Create socket connection once on mount
  useEffect(() => {
    const newSocket = io("http://localhost:8000", {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected");
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    setSocket(newSocket);

    return () => {
      console.log("🧹 Cleaning up socket connection");
      newSocket.disconnect();
    };
  }, []);

  // Load stored history once
  useEffect(() => {
    if (box) {
      const history = getBoxHistory(boxId);
      setChartData(history);
    }
  }, [box, boxId, getBoxHistory]);

  // Listen for sensor data
  useEffect(() => {
    if (!socket) return;

    socket.on("sensor_data", (data: any) => {
      console.log("🔥 LIVE SENSOR DATA:", data);

      if (!box) return;

      if (data.temperature !== null) box.temperature = data.temperature;
      if (data.humidity !== null) box.humidity = data.humidity;

      const gasValue = data.co2 ?? data.h2s ?? data.nh3 ?? 0;
      box.gasLevel = gasValue;

      // 🔥 UPDATE DEVICE STATES FROM BACKEND
      if (data.devices) {
        setActiveStates({
          fans: data.devices.fans,
          relay: data.devices.relay,
          humidifier: data.devices.humidifier,
          ozone: data.devices.ozone,
        });
      }

      setChartData((prev) => [
        ...prev,
        {
          time: data.time,
          temperature: data.temperature,
          humidity: data.humidity,
          gasLevel: gasValue,
        },
      ]);
    });

    // 🔥 LISTEN FOR DEVICE UPDATES
    socket.on("device_update", (data: any) => {
      if (data.devices) {
        setActiveStates({
          fans: data.devices.fans,
          relay: data.devices.relay,
          humidifier: data.devices.humidifier,
          ozone: data.devices.ozone,
        });
      }
    });

    return () => {
      socket.off("sensor_data");
      socket.off("device_update");
    };
  }, [socket, box]);

  const handleControlClick = (id: string) => {
    if (!socket) return;

    const newState = !activeStates[id as keyof typeof activeStates];

    // Emit to backend for all devices
    socket.emit(`toggle_${id}`, { state: newState });

    // Optimistic update
    setActiveStates((prev) => ({
      ...prev,
      [id]: newState,
    }));
  };
  const controls = [
    {
      id: "fans",
      label: "Fans",
      subscript: "Ventilation control",
      icon: Wind,
      activeColor: "text-blue-600",
      activeBgColor: "bg-blue-200 border-blue-400", // FILLED WHEN ON
      inactiveBgColor: "bg-blue-50 border-blue-200", // NORMAL WHEN OFF
    },
    {
      id: "relay",
      label: "Relay",
      subscript: "Power control",
      icon: Power,
      activeColor: "text-purple-900",
      activeBgColor: "bg-purple-200 border-purple-400",
      inactiveBgColor: "bg-purple-50 border-purple-200",
    },
    {
      id: "humidifier",
      label: "Humidifier",
      subscript: "Humidity regulation",
      icon: Droplets,
      activeColor: "text-green-600",
      activeBgColor: "bg-green-200 border-green-400",
      inactiveBgColor: "bg-green-50 border-green-200",
    },
    {
      id: "ozone",
      label: "Ozone",
      subscript: "Air purification",
      icon: Sparkles,
      activeColor: "text-orange-600",
      activeBgColor: "bg-orange-200 border-orange-400",
      inactiveBgColor: "bg-orange-50 border-orange-200",
    },
  ];

  if (!box) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            <TranslatedText text="Box Not Found" />
          </h2>

          <p className="text-gray-600 mb-6">
            <TranslatedText text="The storage box" /> "{boxId}"{" "}
            <TranslatedText text="could not be found." />
          </p>

          <button
            onClick={onBack}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <TranslatedText text="Back to Grid" />
          </button>
        </div>
      </div>
    );
  }

  const isRisk =
    box.gasLevel > 120 || box.temperature > 20 || box.humidity > 80;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3">
                <img src="/onion.png" className="w-8 h-8" alt="Onion Logo" />

                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    <TranslatedText text="Storage Box" /> {boxId}
                  </h1>

                  <p className="text-sm text-gray-600">
                    <TranslatedText text="Real-time monitoring dashboard" />
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />

              <div
                className={`w-3 h-3 rounded-full ${
                  box.status === "healthy" ? "bg-green-500" : "bg-red-500"
                } animate-pulse`}
              />

              <span
                className={`text-sm font-medium ${
                  box.status === "healthy" ? "text-green-600" : "text-red-600"
                }`}
              >
                <TranslatedText
                  text={
                    box.status === "healthy" ? "Healthy" : "Spoilage Detected"
                  }
                />
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ALERT BANNER */}
        {isRisk ? (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>

              <div>
                <h3 className="text-red-800 font-semibold">
                  <TranslatedText text="Risk Detected" />
                </h3>

                <p className="text-red-700 text-sm">
                  <TranslatedText text="Environmental conditions are outside optimal ranges. Immediate attention required." />
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>

              <div>
                <h3 className="text-green-800 font-semibold">
                  <TranslatedText text="All Conditions Optimal" />
                </h3>

                <p className="text-green-700 text-sm">
                  <TranslatedText text="Temperature, humidity, and gas levels are within ideal safe limits." />
                </p>
              </div>
            </div>
          </div>
        )}

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Temperature"
            value={box.temperature.toFixed(1)}
            unit="°C"
            icon={Thermometer}
            status={box.temperature > 20 ? "warning" : "healthy"}
            subtitle="Optimal: 15–18°C"
          />

          <MetricCard
            title="Humidity"
            value={Math.round(box.humidity)}
            unit="%"
            icon={Droplets}
            status={box.humidity > 80 ? "warning" : "healthy"}
            subtitle="Optimal: 65–75%"
          />

          <MetricCard
            title="Gas Level"
            value={Math.round(box.gasLevel)}
            unit=" ppm"
            icon={Wind}
            status={box.gasLevel > 120 ? "warning" : "healthy"}
            subtitle="Optimal: <100 ppm"
          />

          <MetricCard
            title="Onion Health"
            value={isRisk ? "Spoilage Detected" : "Healthy"}
            icon={Heart}
            status={isRisk ? "warning" : "healthy"}
            subtitle={isRisk ? "Risk Detected" : "All Good"}
            translateValue={true}
          />
        </div>

        {/* CONTROL BUTTONS - MATCHING METRIC CARD STYLE */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <TranslatedText text="Device Controls" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {controls.map((control) => {
              const Icon = control.icon;
              const isActive =
                activeStates[control.id as keyof typeof activeStates];

              return (
                <button
                  key={control.id}
                  onClick={() => handleControlClick(control.id)}
                  className={`
    p-6 rounded-xl border-2 transition-all duration-200 
    hover:shadow-lg cursor-pointer
    ${isActive ? control.activeBgColor : control.inactiveBgColor}
  `}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Icon
                      className={`w-6 h-6 ${
                        isActive ? control.activeColor : "text-gray-500"
                      }`}
                    />
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                      <TranslatedText text={control.label} />
                    </h3>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isActive
                            ? "bg-green-500 animate-pulse"
                            : "bg-gray-300"
                        }`}
                      />
                      <span className="text-2xl font-exo text-[#2a2234]">
                        {isActive ? "ON" : "OFF"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      <TranslatedText text={control.subscript} />
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CAMERA VIEWER */}
        <div className="mb-8">
          <CameraViewer
            boxId={boxId}
            temperature={box.temperature}
            humidity={box.humidity}
            gasLevel={box.gasLevel}
          />
        </div>

        {/* CHARTS */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MultiLineChart
              data={chartData}
              title="Temperature Monitoring"
              metrics={[
                {
                  key: "temperature",
                  label: "Temperature",
                  color: "#ef4444",
                  unit: "°C",
                  visible: true,
                },
              ]}
            />

            <MultiLineChart
              data={chartData}
              title="Humidity Monitoring"
              metrics={[
                {
                  key: "humidity",
                  label: "Humidity",
                  color: "#3b82f6",
                  unit: "%",
                  visible: true,
                },
              ]}
            />
          </div>

          <div className="w-full">
            <GasMonitoringChart />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            <TranslatedText text="Manual Controls" />
          </h3>
          <ControlTable boxId={boxId} />
        </div>
      </div>
    </div>
  );
};

export default BoxDashboardScreen;

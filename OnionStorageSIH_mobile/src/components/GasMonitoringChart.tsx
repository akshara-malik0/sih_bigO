import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar } from "lucide-react";
import { io } from "socket.io-client";

// === GAS TYPES ===
interface GasDataPoint {
  timestamp: string;
  time: string;
  date: string;
  nh3: number;
  co2: number;
  h2s: number;
}

type GasKey = keyof Omit<GasDataPoint, "timestamp" | "time" | "date">;

interface GasMetric {
  key: GasKey;
  label: string;
  color: string;
  unit: string;
}

type DateRange = "24h" | "7d" | "30d";

// Gas definitions with lowercase keys matching backend
const gasDefinitions: GasMetric[] = [
  { key: "nh3", label: "Ammonia (NH₃)", color: "#ef4444", unit: " ppm" },
  { key: "co2", label: "Carbon Dioxide (CO₂)", color: "#3b82f6", unit: " ppm" },
  {
    key: "h2s",
    label: "Hydrogen Sulfide (H₂S)",
    color: "#8b5cf6",
    unit: " ppm",
  },
];

const BACKEND_URL = "http://localhost:8000";

const GasMonitoringChart: React.FC = () => {
  const [gasData, setGasData] = useState<GasDataPoint[]>([]);
  const [filteredData, setFilteredData] = useState<GasDataPoint[]>([]);
  const [selectedRange, setSelectedRange] = useState<DateRange>("24h");
  const [selectedGasKey, setSelectedGasKey] = useState<GasKey>("nh3");

  const currentMetric =
    gasDefinitions.find((m) => m.key === selectedGasKey) || gasDefinitions[0];

  // ==========================================================
  // 🚀 REAL TIME SENSOR DATA FROM BACKEND
  // ==========================================================
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("📡 Connected to backend for GAS data");
    });

    socket.on("sensor_data", (data: any) => {
      console.log("🔥 Live Gas Data:", data);

      const ts = new Date();

      const point: GasDataPoint = {
        timestamp: ts.toISOString(),
        time:
          data.time ||
          ts.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        date: ts.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        nh3: Number(data.nh3) || 0,
        co2: Number(data.co2) || 0,
        h2s: Number(data.h2s) || 0,
      };

      console.log("📊 Processed point:", point);

      setGasData((prev) => [...prev, point].slice(-300));
      setFilteredData((prev) => [...prev, point].slice(-300));
    });

    socket.on("disconnect", () => {
      console.log("📡 Disconnected from backend");
    });

    return () => socket.disconnect();
  }, []);

  // ==========================================================
  // 🎨 CUSTOM TOOLTIP
  // ==========================================================
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    // Get value directly from payload (this is the correct approach)
    const value = payload[0]?.value;
    const dataPoint = payload[0]?.payload; // This contains the full data point

    console.log("Tooltip Debug:", {
      label,
      value,
      dataPoint,
      selectedGas: selectedGasKey,
    });

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-xs text-gray-600 mb-2">
          {dataPoint?.timestamp
            ? new Date(dataPoint.timestamp).toLocaleString()
            : label}
        </p>
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentMetric.color }}
          />
          <span className="text-sm font-medium">
            {currentMetric.label}:{" "}
            <span className="text-purple-600 font-bold">
              {value !== undefined && value !== null
                ? Number(value).toFixed(2)
                : "0.00"}
              {currentMetric.unit}
            </span>
          </span>
        </div>
        {/* Show all gas values for debugging */}
        {dataPoint && (
          <div className="mt-2 pt-2 border-t text-xs text-gray-500">
            <div className="flex justify-between">
              <span>NH₃:</span>
              <span className="font-mono">
                {dataPoint.nh3?.toFixed(2) || "0.00"} ppm
              </span>
            </div>
            <div className="flex justify-between">
              <span>CO₂:</span>
              <span className="font-mono">
                {dataPoint.co2?.toFixed(2) || "0.00"} ppm
              </span>
            </div>
            <div className="flex justify-between">
              <span>H₂S:</span>
              <span className="font-mono">
                {dataPoint.h2s?.toFixed(2) || "0.00"} ppm
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const rangeOptions = useMemo(
    () => [
      { value: "24h" as DateRange, label: "Last 24 Hours" },
      { value: "7d" as DateRange, label: "Last 7 Days" },
      { value: "30d" as DateRange, label: "Last 30 Days" },
    ],
    []
  );

  // Y-Axis auto scaling
  const values = filteredData.map((d) => d[selectedGasKey] ?? 0);
  const maxGasValue = Math.max(...values, 0);
  const yAxisDomain = [0, Math.ceil(maxGasValue * 1.1) || 50];

  // Expand chart width based on points
  const chartWidth = Math.max(filteredData.length * 80, 1200);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {currentMetric.label} Trend Monitoring
        </h2>

        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-purple-500" />
          {rangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedRange(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedRange === opt.value
                  ? "bg-purple-500 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gas Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {gasDefinitions.map((metric) => (
          <button
            key={metric.key}
            onClick={() => setSelectedGasKey(metric.key)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedGasKey === metric.key
                ? "bg-purple-500 text-white border border-purple-500 shadow-md"
                : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
            }`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metric.color }}
            />
            <span>{metric.label}</span>
          </button>
        ))}
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p>
          <strong>Data Points:</strong> {filteredData.length} |
          <strong> Selected Gas:</strong> {selectedGasKey} |
          <strong> Latest Value:</strong>{" "}
          {filteredData.length > 0
            ? filteredData[filteredData.length - 1][selectedGasKey].toFixed(2)
            : "N/A"}{" "}
          {currentMetric.unit}
        </p>
      </div>

      {/* Scrollable Chart */}
      <div className="overflow-x-auto overflow-y-hidden mb-6 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-gray-200">
        <div style={{ width: `${chartWidth}px`, height: "400px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis
                domain={yAxisDomain}
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={selectedGasKey}
                stroke={currentMetric.color}
                strokeWidth={2}
                dot={{ fill: currentMetric.color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(() => {
          const vals = filteredData.map((d) => d[currentMetric.key] ?? 0);
          const avg = vals.length
            ? vals.reduce((a, b) => a + b, 0) / vals.length
            : 0;
          const max = vals.length ? Math.max(...vals) : 0;
          const min = vals.length ? Math.min(...vals) : 0;

          return (
            <>
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="text-xs text-gray-600">Average</p>
                <p className="text-xl font-bold text-blue-600">
                  {avg.toFixed(2)}
                  {currentMetric.unit}
                </p>
              </div>

              <div className="bg-red-100 p-4 rounded-lg">
                <p className="text-xs text-gray-600">Maximum</p>
                <p className="text-xl font-bold text-red-600">
                  {max.toFixed(2)}
                  {currentMetric.unit}
                </p>
              </div>

              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-xs text-gray-600">Minimum</p>
                <p className="text-xl font-bold text-green-600">
                  {min.toFixed(2)}
                  {currentMetric.unit}
                </p>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default GasMonitoringChart;

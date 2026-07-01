import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import TranslatedText from "./TranslatedText";

/* Recharts */
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { io } from "socket.io-client";

/* ---- TYPES ---- */
interface DataPoint {
  time: string;
  temperature?: number;
  humidity?: number;
  co2?: number;
  h2s?: number;
  nh3?: number;
  [key: string]: any;
}

interface MetricConfig {
  key: string;
  label: string;
  color: string;
  unit?: string;
  visible: boolean;
}

interface MultiLineChartProps {
  title: string;
  metrics: MetricConfig[];
}

/* ============================================================
              FINAL REALTIME MULTI-LINE CHART
============================================================ */
const MultiLineChart: React.FC<MultiLineChartProps> = ({ title, metrics }) => {
  const { currentLanguage } = useLanguage();

  const [localMetrics, setLocalMetrics] = useState(metrics);
  const [data, setData] = useState<DataPoint[]>([]);

  /* Correct Backend URL */
  const BACKEND_URL = "http://10.145.2.219:8000";

  /* SOCKET.IO */
  const socket = useMemo(
    () => io(BACKEND_URL, { transports: ["websocket"] }),
    []
  );

  /* REALTIME SENSOR LISTENER */
  useEffect(() => {
    const handler = (incoming: any) => {
      if (!incoming) return;

      const now = new Date();

      const record: DataPoint = {
        time: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Map backend values dynamically
      localMetrics.forEach((m) => {
        if (incoming[m.key] !== undefined && incoming[m.key] !== null) {
          record[m.key] = Number(incoming[m.key]);
        }
      });

      setData((prev) => [...prev, record].slice(-200));
    };

    socket.on("sensor_data", handler);
    return () => socket.off("sensor_data", handler);
  }, [localMetrics, socket]);

  /* Translation helper */
  const translateSync = (text: string) => {
    if (!text || currentLanguage.code === "en") return text;
    // @ts-ignore
    const cache = window.__translationsCache || {};
    return cache[text]?.[currentLanguage.code] ?? text;
  };

  /* Toggle line visibility */
  const handleToggle = (metricKey: string) => {
    setLocalMetrics((prev) =>
      prev.map((m) => (m.key === metricKey ? { ...m, visible: !m.visible } : m))
    );
  };

  const visibleMetrics = localMetrics.filter((m) => m.visible);

  /* Auto width based on data */
  const chartWidth = Math.max(data.length * 80, 1200);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      {/* Header & Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <TranslatedText
          as="h3"
          text={title}
          className="text-lg font-semibold text-gray-900"
        />

        <div className="flex flex-wrap gap-2">
          {localMetrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => handleToggle(metric.key)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                metric.visible
                  ? "bg-purple-100 text-purple-800 border border-purple-300"
                  : "bg-gray-100 text-gray-600 border border-gray-300"
              }`}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: metric.visible ? metric.color : "#aaa",
                }}
              />
              <TranslatedText text={metric.label} />
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable chart */}
      <div
        className="w-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-gray-200"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#a78bfa #e5e7eb",
        }}
      >
        <div style={{ width: `${chartWidth}px`, height: "320px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              <XAxis
                dataKey="time"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
                minTickGap={50}
              />

              <YAxis
                tick={{ fontSize: 10 }}
                label={{
                  value: translateSync(visibleMetrics[0]?.label || ""),
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
              />

              <Tooltip
                formatter={(value: any, name: string) => {
                  const metric = localMetrics.find((m) => m.key === name);
                  return [`${value}${metric?.unit || ""}`, metric?.label];
                }}
              />

              <Legend
                formatter={(value) => {
                  const metric = localMetrics.find((m) => m.key === value);
                  return metric?.label || value;
                }}
              />

              {visibleMetrics.map((metric) => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: metric.color }}
                  activeDot={{ r: 6 }}
                  animationDuration={300}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scrollbar CSS */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar { height: 8px; }
        .scrollbar-thumb-purple-400::-webkit-scrollbar-thumb {
          background-color: #a78bfa; border-radius: 4px;
        }
        .scrollbar-thumb-purple-400::-webkit-scrollbar-thumb:hover {
          background-color: #8b5cf6;
        }
        .scrollbar-track-gray-200::-webkit-scrollbar-track {
          background-color: #e5e7eb; border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default MultiLineChart;

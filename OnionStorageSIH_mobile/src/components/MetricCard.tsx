import React, { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";
import TranslatedText from "./TranslatedText";
import { socket } from "../socket"; // <-- Reusing shared socket

interface MetricCardProps {
  title: string;
  value?: string | number;
  dataKey?: string;
  unit?: string;
  icon: LucideIcon;
  status?: "healthy" | "warning" | "danger";
  subtitle?: string;
  translateValue?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  dataKey,
  unit,
  icon: Icon,
  status = "healthy",
  subtitle,
  translateValue = false,
}) => {
  const [liveValue, setLiveValue] = useState<number | string | null>(null);

  /* ---------------------------
      LISTEN TO SENSOR DATA
  ---------------------------- */
  useEffect(() => {
    if (!dataKey) return;

    const handler = (incoming: any) => {
      if (incoming && incoming[dataKey] !== undefined) {
        setLiveValue(incoming[dataKey]);
      }
    };

    socket.on("sensor_data", handler);

    return () => {
      socket.off("sensor_data", handler);
    };
  }, [dataKey]);

  /* ---------------------------
          FINAL DISPLAY VALUE
      liveValue → value → 0
  ---------------------------- */
  const resolvedValue = liveValue ?? value ?? 0;

  /* ---------------------------
          COLOR + BG LOGIC
  ---------------------------- */
  const getStatusColor = () => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "danger":
        return "text-red-600";
      default:
        return "text-purple-600";
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case "healthy":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "danger":
        return "bg-red-50 border-red-200";
      default:
        return "bg-purple-50 border-purple-200";
    }
  };

  return (
    <div
      className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${getStatusBg()}`}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-6 h-6 ${getStatusColor()}`} />
        <TranslatedText
          as="h3"
          text={title}
          className="text-sm font-bold text-gray-700 uppercase tracking-wide"
        />
      </div>

      <div className="mt-3">
        <div className="flex items-baseline space-x-1">
          {translateValue ? (
            <TranslatedText
              as="span"
              text={String(resolvedValue)}
              className="text-3xl font-exo text-[#2a2234]"
            />
          ) : (
            <span className="text-3xl font-exo text-[#2a2234]">
              {resolvedValue}
            </span>
          )}

          {unit && (
            <span className="text-lg font-exo text-gray-500">{unit}</span>
          )}
        </div>

        {subtitle && (
          <TranslatedText
            as="p"
            text={subtitle}
            className="text-sm text-gray-600 mt-1"
          />
        )}
      </div>
    </div>
  );
};

export default MetricCard;

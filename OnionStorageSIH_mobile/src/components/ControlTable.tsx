import React from "react";
import { Clock, Settings, Thermometer, Droplets, Wind } from "lucide-react";
import TranslatedText from "./TranslatedText";

interface ControlAction {
  id: number;
  timestamp: string;
  action: string;
  parameter: string;
  oldValue: string;
  newValue: string;
  status: "success" | "pending" | "failed";
}

const recentActions: ControlAction[] = [
  {
    id: 1,
    timestamp: "2025-01-23 14:30",
    action: "Temperature Adjustment",
    parameter: "Temperature",
    oldValue: "18°C",
    newValue: "16°C",
    status: "success",
  },
  {
    id: 2,
    timestamp: "2025-01-23 13:45",
    action: "Ventilation Control",
    parameter: "Fan Speed",
    oldValue: "60%",
    newValue: "80%",
    status: "success",
  },
  {
    id: 3,
    timestamp: "2025-01-23 12:20",
    action: "Humidity Control",
    parameter: "Humidity",
    oldValue: "75%",
    newValue: "70%",
    status: "pending",
  },
  {
    id: 4,
    timestamp: "2025-01-23 11:15",
    action: "System Check",
    parameter: "All Sensors",
    oldValue: "-",
    newValue: "-",
    status: "success",
  },
];

const ControlTable: React.FC = () => {
  const getStatusBadge = (status: string) => {
    const style =
      status === "success"
        ? "bg-green-100 text-green-800"
        : status === "pending"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${style}`}>
        <TranslatedText
          text={
            status === "success"
              ? "Success"
              : status === "pending"
              ? "Pending"
              : "Failed"
          }
        />
      </span>
    );
  };

  const getIcon = (action: string) => {
    if (action.includes("Temperature"))
      return <Thermometer className="w-4 h-4 text-purple-600" />;
    if (action.includes("Humidity"))
      return <Droplets className="w-4 h-4 text-purple-600" />;
    if (action.includes("Ventilation"))
      return <Wind className="w-4 h-4 text-purple-600" />;
    return <Settings className="w-4 h-4 text-purple-600" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b bg-purple-50">
        <TranslatedText
          as="h3"
          text="Recent Control Actions"
          className="text-lg font-semibold text-purple-900"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                <Clock className="w-4 h-4 inline mr-2" />
                <TranslatedText text="Time" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                <TranslatedText text="Action" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                <TranslatedText text="Parameter" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                <TranslatedText text="Change" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                <TranslatedText text="Status" />
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {recentActions.map((action) => (
              <tr key={action.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {action.timestamp}
                </td>

                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center space-x-2">
                    {getIcon(action.action)}
                    <TranslatedText
                      text={action.action}
                      className="font-medium text-gray-900"
                    />
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-900">
                  <TranslatedText text={action.parameter} />
                </td>

                <td className="px-6 py-4 text-sm text-gray-900">
                  {action.oldValue !== "-" ? (
                    <>
                      <span className="text-red-600 line-through">
                        {action.oldValue}
                      </span>
                      <span className="mx-2">→</span>
                      <span className="text-green-600 font-medium">
                        {action.newValue}
                      </span>
                    </>
                  ) : (
                    <TranslatedText
                      text="System Check"
                      className="text-gray-500"
                    />
                  )}
                </td>

                <td className="px-6 py-4">{getStatusBadge(action.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ControlTable;

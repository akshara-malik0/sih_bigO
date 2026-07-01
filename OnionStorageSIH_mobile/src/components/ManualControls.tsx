import React, { useState } from "react";
import { Power, Fan, Thermometer, Wind, CheckCircle } from "lucide-react";
import TranslatedText from "./TranslatedText";

interface ControlState {
  tec: boolean;
  fan: boolean;
  ventilation: boolean;
  heater: boolean;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'info';
}

const ManualControls: React.FC = () => {
  const [controls, setControls] = useState<ControlState>({
    tec: false,
    fan: false,
    ventilation: false,
    heater: false,
  });

  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'success'
  });

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleToggle = (controlName: keyof ControlState) => {
    const newState = !controls[controlName];
    setControls(prev => ({
      ...prev,
      [controlName]: newState
    }));

    const controlLabels = {
      tec: 'TEC',
      fan: 'Fan',
      ventilation: 'Ventilation',
      heater: 'Heater'
    };

    const message = `${controlLabels[controlName]} turned ${newState ? 'ON' : 'OFF'}`;
    showNotification(message);
  };

  const controlConfigs = [
    {
      key: 'tec' as keyof ControlState,
      label: 'TEC Cooler',
      icon: Thermometer,
      description: 'Thermoelectric cooling system',
      color: 'blue'
    },
    {
      key: 'fan' as keyof ControlState,
      label: 'Circulation Fan',
      icon: Fan,
      description: 'Air circulation control',
      color: 'green'
    },
    {
      key: 'ventilation' as keyof ControlState,
      label: 'Ventilation',
      icon: Wind,
      description: 'Fresh air intake system',
      color: 'purple'
    },
    {
      key: 'heater' as keyof ControlState,
      label: 'Heater',
      icon: Power,
      description: 'Heating element control',
      color: 'red'
    }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: {
        active: 'bg-blue-500 border-blue-600 text-white shadow-blue-200',
        inactive: 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300'
      },
      green: {
        active: 'bg-green-500 border-green-600 text-white shadow-green-200',
        inactive: 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-green-50 hover:border-green-300'
      },
      purple: {
        active: 'bg-purple-500 border-purple-600 text-white shadow-purple-200',
        inactive: 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-purple-50 hover:border-purple-300'
      },
      red: {
        active: 'bg-red-500 border-red-600 text-white shadow-red-200',
        inactive: 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300'
      }
    };
    return colors[color as keyof typeof colors][isActive ? 'active' : 'inactive'];
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <TranslatedText
            as="h3"
            text="Manual Controls"
            className="text-lg font-semibold text-gray-900"
          />
          <TranslatedText
            as="p"
            text="Control storage environment actuators"
            className="text-sm text-gray-600 mt-1"
          />
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <TranslatedText text="System Ready" className="text-green-600 font-medium" />
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`mb-4 p-3 rounded-lg border-l-4 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-400 text-green-800' 
            : 'bg-blue-50 border-blue-400 text-blue-800'
        } transition-all duration-300`}>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Control Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {controlConfigs.map((config) => {
          const isActive = controls[config.key];
          const Icon = config.icon;
          
          return (
            <div key={config.key} className="space-y-3">
              <button
                onClick={() => handleToggle(config.key)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                  getColorClasses(config.color, isActive)
                } ${isActive ? 'shadow-lg' : ''}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Icon className="w-8 h-8" />
                  <div className="text-center">
                    <TranslatedText
                      text={config.label}
                      className="font-semibold text-sm"
                    />
                    <div className={`text-xs mt-1 ${
                      isActive ? 'text-white/90' : 'text-gray-500'
                    }`}>
                      <TranslatedText text={isActive ? 'ON' : 'OFF'} />
                    </div>
                  </div>
                </div>
              </button>
              
              <TranslatedText
                text={config.description}
                className="text-xs text-gray-500 text-center"
              />
            </div>
          );
        })}
      </div>

      {/* System Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <TranslatedText text="Active Systems:" className="font-medium text-gray-700" />
          <span className="text-purple-600 font-semibold">
            {Object.values(controls).filter(Boolean).length} / {Object.keys(controls).length}
          </span>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.entries(controls).map(([key, isActive]) => {
            const config = controlConfigs.find(c => c.key === key);
            return isActive ? (
              <span
                key={key}
                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
              >
                <TranslatedText text={config?.label || key} />
              </span>
            ) : null;
          })}
          {Object.values(controls).every(v => !v) && (
            <TranslatedText
              text="No systems active"
              className="text-gray-500 text-xs italic"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualControls;
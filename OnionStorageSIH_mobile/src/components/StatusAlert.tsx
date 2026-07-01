import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import TranslatedText from './TranslatedText';

interface StatusAlertProps {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const StatusAlert: React.FC<StatusAlertProps> = ({
  message,
  type,
  onClose,
  autoClose = false,
  duration = 5000
}) => {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, duration]);

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-500'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: AlertTriangle,
          iconColor: 'text-yellow-500'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: XCircle,
          iconColor: 'text-red-500'
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: Info,
          iconColor: 'text-blue-500'
        };
    }
  };

  const { container, icon: Icon, iconColor } = getAlertStyles();

  return (
    <div className={`mx-3 sm:mx-4 md:mx-6 lg:mx-8 mb-4 p-4 border rounded-lg ${container} flex items-start space-x-3`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
      <div className="flex-1">
        <TranslatedText text={message} className="text-sm font-medium" />
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-auto pl-3"
        >
          <X className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" />
        </button>
      )}
    </div>
  );
};

export default StatusAlert;
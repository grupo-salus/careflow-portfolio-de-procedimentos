import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Alert: React.FC<AlertProps> = ({ 
  type, 
  message, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: AlertCircle,
          iconColor: 'text-red-500'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: CheckCircle,
          iconColor: 'text-green-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: AlertCircle,
          iconColor: 'text-yellow-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: Info,
          iconColor: 'text-blue-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: Info,
          iconColor: 'text-gray-500'
        };
    }
  };

  const styles = getAlertStyles();
  const IconComponent = styles.icon;

  if (!isVisible) return null;

  return (
    <div className={`${styles.bg} ${styles.border} ${styles.text} px-4 py-3 rounded-lg text-sm flex items-center animate-in slide-in-from-top-2 duration-300`}>
      <IconComponent className={`w-5 h-5 mr-2 flex-shrink-0 ${styles.iconColor}`} />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={handleClose}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert; 
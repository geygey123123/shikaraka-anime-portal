import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

/**
 * Toast notification component
 * Displays temporary notification messages with auto-dismiss
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-400 flex-shrink-0" />;
      case 'error':
        return <XCircle size={20} className="text-red-400 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-400 flex-shrink-0" />;
      case 'info':
        return <AlertCircle size={20} className="text-blue-400 flex-shrink-0" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/20 border-green-900';
      case 'error':
        return 'bg-red-900/20 border-red-900';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-900';
      case 'info':
        return 'bg-blue-900/20 border-blue-900';
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        animate-in slide-in-from-right duration-300
        ${getStyles()}
      `}
      role="alert"
    >
      {getIcon()}
      
      <p className="flex-1 text-sm text-white">{message}</p>
      
      <button
        onClick={() => onClose(id)}
        className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
};

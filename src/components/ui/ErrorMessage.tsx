import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning';
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  onRetry,
  className = '',
}) => {
  const Icon = type === 'error' ? XCircle : AlertCircle;
  const bgColor = type === 'error' ? 'bg-red-900/20' : 'bg-yellow-900/20';
  const borderColor = type === 'error' ? 'border-red-500' : 'border-yellow-500';
  const textColor = type === 'error' ? 'text-red-400' : 'text-yellow-400';
  
  return (
    <div
      className={`${bgColor} ${borderColor} border rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={`${textColor} flex-shrink-0 mt-0.5`} size={20} />
        <div className="flex-1">
          <p className={`${textColor} text-sm`}>{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-gray-300 hover:text-white underline focus:outline-none"
            >
              Попробовать снова
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

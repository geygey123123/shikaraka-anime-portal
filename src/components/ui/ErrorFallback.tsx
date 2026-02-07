import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorFallbackProps {
  error?: Error | null;
  resetError?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
}

/**
 * ErrorFallback - Generic error display component
 * Used as a fallback UI when components fail to load or encounter errors
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = 'Что-то пошло не так',
  message,
  showRetry = true,
}) => {
  const displayMessage = message || error?.message || 'Произошла непредвиденная ошибка';

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="bg-red-900/20 rounded-full p-4 mb-4">
        <AlertTriangle className="text-red-400" size={48} />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      
      <p className="text-gray-400 mb-6 max-w-md">{displayMessage}</p>
      
      {showRetry && resetError && (
        <Button variant="primary" onClick={resetError}>
          <RefreshCw size={18} className="mr-2" />
          Попробовать снова
        </Button>
      )}
      
      {import.meta.env.DEV && error && (
        <details className="mt-6 text-left max-w-2xl w-full">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
            Детали ошибки (только в режиме разработки)
          </summary>
          <pre className="mt-2 p-4 bg-gray-900 rounded-lg text-xs text-red-400 overflow-auto">
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  );
};

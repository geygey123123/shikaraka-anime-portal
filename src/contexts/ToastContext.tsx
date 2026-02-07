import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/ToastContainer';
import type { ToastType } from '../components/ui/ToastContainer';

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => string;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * ToastProvider - Provides toast notification functionality to the app
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider
      value={{
        showToast: toast.showToast,
        success: toast.success,
        error: toast.error,
        warning: toast.warning,
        info: toast.info,
        dismissToast: toast.dismissToast,
      }}
    >
      {children}
      <ToastContainer toasts={toast.toasts} onClose={toast.dismissToast} />
    </ToastContext.Provider>
  );
};

/**
 * useToastContext - Hook to access toast functionality
 */
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};

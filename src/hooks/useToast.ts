import { useState, useCallback } from 'react';
import type { ToastData, ToastType } from '../components/ui/ToastContainer';

let toastId = 0;

/**
 * useToast hook - Manages toast notifications
 * Provides methods to show and dismiss toast messages
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = `toast-${++toastId}`;
    const newToast: ToastData = {
      id,
      type,
      message,
      duration,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    return showToast('success', message, duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    return showToast('error', message, duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    return showToast('warning', message, duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    return showToast('info', message, duration);
  }, [showToast]);

  return {
    toasts,
    showToast,
    dismissToast,
    success,
    error,
    warning,
    info,
  };
};

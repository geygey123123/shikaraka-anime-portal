/**
 * Utility functions for error handling across the application
 */

export interface ErrorInfo {
  message: string;
  retry: boolean;
  action?: string;
}

/**
 * Handle network errors and return user-friendly messages
 */
export const handleNetworkError = (error: unknown): ErrorInfo => {
  console.error('Network error:', error);

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Не удалось загрузить данные. Проверьте подключение к интернету.',
      retry: true,
      action: 'Попробовать снова',
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      retry: true,
      action: 'Попробовать снова',
    };
  }

  return {
    message: 'Произошла неизвестная ошибка',
    retry: true,
    action: 'Попробовать снова',
  };
};

/**
 * Handle authentication errors and return user-friendly messages
 */
export const handleAuthError = (error: unknown): string => {
  console.error('Authentication error:', error);

  if (error instanceof Error) {
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Неверный email или пароль',
      'User already registered': 'Пользователь с таким email уже существует',
      'Email not confirmed': 'Подтвердите email для входа',
      'Invalid email': 'Введите корректный email адрес',
      'Password should be at least 6 characters': 'Пароль должен содержать минимум 6 символов',
    };

    return errorMessages[error.message] || error.message || 'Ошибка аутентификации';
  }

  return 'Ошибка аутентификации';
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Введите корректный email адрес';
  }
  return null;
};

/**
 * Validate password
 */
export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return 'Пароль должен содержать минимум 6 символов';
  }
  return null;
};

/**
 * Log error to console with context
 */
export const logError = (context: string, error: unknown): void => {
  console.error(`[${context}]`, error);
  
  if (error instanceof Error) {
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
};

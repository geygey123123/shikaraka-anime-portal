/**
 * Utility functions for error handling across the application
 */

export interface ErrorInfo {
  message: string;
  retry: boolean;
  action?: string;
}

/**
 * API Error class for structured error handling
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Exponential backoff retry utility
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param baseDelay - Base delay in ms (default: 1000)
 * @returns Promise with the result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (error instanceof APIError) {
        // Don't retry on client errors (4xx except 429)
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          throw error;
        }
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.3 * delay; // Add 0-30% jitter
      const totalDelay = delay + jitter;

      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(totalDelay)}ms`);
      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError;
}

/**
 * Handle API errors and return user-friendly messages
 */
export const handleAPIError = (error: unknown): ErrorInfo => {
  console.error('API error:', error);

  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 429:
        return {
          message: 'Слишком много запросов. Пожалуйста, подождите немного.',
          retry: true,
          action: 'Попробовать снова',
        };
      case 404:
        return {
          message: 'Данные не найдены.',
          retry: false,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: 'Сервис временно недоступен. Попробуйте позже.',
          retry: true,
          action: 'Попробовать снова',
        };
      default:
        return {
          message: `Ошибка сервера (${error.statusCode}). Попробуйте позже.`,
          retry: true,
          action: 'Попробовать снова',
        };
    }
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Не удалось подключиться к серверу. Проверьте подключение к интернету.',
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

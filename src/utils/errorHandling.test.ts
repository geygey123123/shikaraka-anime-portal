import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  handleNetworkError,
  handleAuthError,
  validateEmail,
  validatePassword,
  logError,
} from './errorHandling';

describe('errorHandling utilities', () => {
  describe('handleNetworkError', () => {
    it('should handle TypeError with fetch message', () => {
      const error = new TypeError('fetch failed');
      const result = handleNetworkError(error);

      expect(result.message).toBe('Не удалось загрузить данные. Проверьте подключение к интернету.');
      expect(result.retry).toBe(true);
      expect(result.action).toBe('Попробовать снова');
    });

    it('should handle generic Error', () => {
      const error = new Error('Custom error message');
      const result = handleNetworkError(error);

      expect(result.message).toBe('Custom error message');
      expect(result.retry).toBe(true);
    });

    it('should handle unknown error', () => {
      const result = handleNetworkError('unknown error');

      expect(result.message).toBe('Произошла неизвестная ошибка');
      expect(result.retry).toBe(true);
    });
  });

  describe('handleAuthError', () => {
    it('should return localized message for invalid credentials', () => {
      const error = new Error('Invalid login credentials');
      const result = handleAuthError(error);

      expect(result).toBe('Неверный email или пароль');
    });

    it('should return localized message for user already registered', () => {
      const error = new Error('User already registered');
      const result = handleAuthError(error);

      expect(result).toBe('Пользователь с таким email уже существует');
    });

    it('should return generic message for unknown error', () => {
      const error = new Error('Unknown auth error');
      const result = handleAuthError(error);

      expect(result).toBe('Unknown auth error');
    });

    it('should handle non-Error objects', () => {
      const result = handleAuthError('string error');

      expect(result).toBe('Ошибка аутентификации');
    });
  });

  describe('validateEmail', () => {
    it('should return null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('user.name+tag@example.co.uk')).toBeNull();
    });

    it('should return error message for invalid email', () => {
      expect(validateEmail('invalid')).toBe('Введите корректный email адрес');
      expect(validateEmail('invalid@')).toBe('Введите корректный email адрес');
      expect(validateEmail('@example.com')).toBe('Введите корректный email адрес');
      expect(validateEmail('test@')).toBe('Введите корректный email адрес');
    });
  });

  describe('validatePassword', () => {
    it('should return null for valid password', () => {
      expect(validatePassword('123456')).toBeNull();
      expect(validatePassword('longpassword')).toBeNull();
    });

    it('should return error message for short password', () => {
      expect(validatePassword('12345')).toBe('Пароль должен содержать минимум 6 символов');
      expect(validatePassword('')).toBe('Пароль должен содержать минимум 6 символов');
    });
  });

  describe('logError', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should log error with context', () => {
      const error = new Error('Test error');
      logError('TestContext', error);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[TestContext]', error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error message:', 'Test error');
    });

    it('should log non-Error objects', () => {
      logError('TestContext', 'string error');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[TestContext]', 'string error');
    });
  });
});

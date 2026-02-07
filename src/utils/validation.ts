/**
 * Validation utilities for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate username
 * Rules: 3-20 characters, only letters, numbers, and underscore
 */
export const validateUsername = (username: string): ValidationResult => {
  if (username.length === 0) {
    return { isValid: true }; // Username is optional
  }

  if (username.length < 3) {
    return {
      isValid: false,
      error: 'Имя пользователя должно содержать минимум 3 символа',
    };
  }

  if (username.length > 20) {
    return {
      isValid: false,
      error: 'Имя пользователя должно содержать максимум 20 символов',
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      error: 'Имя пользователя может содержать только буквы, цифры и подчеркивание',
    };
  }

  return { isValid: true };
};

/**
 * Validate email
 */
export const validateEmail = (email: string): ValidationResult => {
  if (email.length === 0) {
    return { isValid: false, error: 'Email обязателен' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Неверный формат email' };
  }

  return { isValid: true };
};

/**
 * Validate password
 * Rules: minimum 6 characters
 */
export const validatePassword = (password: string): ValidationResult => {
  if (password.length === 0) {
    return { isValid: false, error: 'Пароль обязателен' };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Пароль должен содержать минимум 6 символов',
    };
  }

  return { isValid: true };
};

/**
 * Validate comment content
 * Rules: 10-1000 characters
 */
export const validateComment = (content: string): ValidationResult => {
  if (content.length < 10) {
    return {
      isValid: false,
      error: 'Комментарий должен содержать минимум 10 символов',
    };
  }

  if (content.length > 1000) {
    return {
      isValid: false,
      error: 'Комментарий не должен превышать 1000 символов',
    };
  }

  return { isValid: true };
};

/**
 * Validate bio
 * Rules: maximum 500 characters
 */
export const validateBio = (bio: string): ValidationResult => {
  if (bio.length > 500) {
    return {
      isValid: false,
      error: 'Биография должна содержать максимум 500 символов',
    };
  }

  return { isValid: true };
};

/**
 * Validate rating
 * Rules: 1-10
 */
export const validateRating = (rating: number): ValidationResult => {
  if (rating < 1 || rating > 10) {
    return {
      isValid: false,
      error: 'Оценка должна быть от 1 до 10',
    };
  }

  return { isValid: true };
};

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onError }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email обязателен';
    }
    if (!emailRegex.test(email)) {
      return 'Введите корректный email адрес';
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) {
      return 'Пароль обязателен';
    }
    if (password.length < 6) {
      return 'Пароль должен содержать минимум 6 символов';
    }
    return null;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) {
      return 'Подтвердите пароль';
    }
    if (password !== confirmPassword) {
      return 'Пароли не совпадают';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
    
    if (emailError || passwordError || confirmPasswordError) {
      setErrors({
        email: emailError || undefined,
        password: passwordError || undefined,
        confirmPassword: confirmPasswordError || undefined,
      });
      return;
    }

    // Очистить ошибки
    setErrors({});
    setIsSubmitting(true);

    try {
      await register(email, password);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка регистрации';
      
      // Обработка специфичных ошибок Supabase
      let displayError = errorMessage;
      if (errorMessage.includes('User already registered')) {
        displayError = 'Пользователь с таким email уже существует';
      } else if (errorMessage.includes('already registered')) {
        displayError = 'Пользователь с таким email уже существует';
      } else if (errorMessage.includes('Password should be at least')) {
        displayError = 'Пароль должен содержать минимум 6 символов';
      }
      
      setErrors({ general: displayError });
      onError?.(displayError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email поле */}
      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-300 mb-1">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) {
              setErrors({ ...errors, email: undefined });
            }
          }}
          className={`w-full px-4 py-2 bg-gray-800 border ${
            errors.email ? 'border-red-500' : 'border-gray-700'
          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff0055] focus:border-transparent`}
          placeholder="your@email.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Пароль поле */}
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-300 mb-1">
          Пароль
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) {
              setErrors({ ...errors, password: undefined });
            }
          }}
          className={`w-full px-4 py-2 bg-gray-800 border ${
            errors.password ? 'border-red-500' : 'border-gray-700'
          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff0055] focus:border-transparent`}
          placeholder="Минимум 6 символов"
          disabled={isSubmitting}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password}</p>
        )}
      </div>

      {/* Подтверждение пароля */}
      <div>
        <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-300 mb-1">
          Подтвердите пароль
        </label>
        <input
          id="register-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) {
              setErrors({ ...errors, confirmPassword: undefined });
            }
          }}
          className={`w-full px-4 py-2 bg-gray-800 border ${
            errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff0055] focus:border-transparent`}
          placeholder="Повторите пароль"
          disabled={isSubmitting}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Общая ошибка */}
      {errors.general && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-sm text-red-500">{errors.general}</p>
        </div>
      )}

      {/* Кнопка отправки */}
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>
    </form>
  );
};

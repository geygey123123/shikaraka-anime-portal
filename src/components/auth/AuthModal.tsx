import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Сбросить режим при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Закрыть модальное окно при нажатии Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Предотвратить прокрутку body когда модальное окно открыто
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSuccess = () => {
    // Закрыть модальное окно при успешной аутентификации
    onClose();
  };

  const handleError = (error: string) => {
    // Ошибки обрабатываются в формах
    console.error('Auth error:', error);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#0a0a0c] border border-gray-800 rounded-lg shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Закрыть"
        >
          <X size={24} />
        </button>

        {/* Заголовок */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'login' ? 'Вход' : 'Регистрация'}
          </h2>
          <p className="text-gray-400 text-sm">
            {mode === 'login' 
              ? 'Войдите, чтобы сохранять избранные аниме' 
              : 'Создайте аккаунт, чтобы начать'}
          </p>
        </div>

        {/* Формы */}
        <div className="mb-6">
          {mode === 'login' ? (
            <LoginForm onSuccess={handleSuccess} onError={handleError} />
          ) : (
            <RegisterForm onSuccess={handleSuccess} onError={handleError} />
          )}
        </div>

        {/* Переключение между режимами */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            {mode === 'login' ? (
              <>
                Нет аккаунта?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-[#ff0055] hover:text-[#cc0044] font-medium transition-colors"
                >
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-[#ff0055] hover:text-[#cc0044] font-medium transition-colors"
                >
                  Войти
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

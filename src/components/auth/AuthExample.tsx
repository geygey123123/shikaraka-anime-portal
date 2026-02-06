/**
 * Example usage of authentication components
 * This file demonstrates how to use LoginForm, RegisterForm, and AuthModal
 * 
 * Usage in your app:
 * 
 * import { useState } from 'react';
 * import { AuthModal } from './components/auth/AuthModal';
 * import { useAuth } from './hooks/useAuth';
 * 
 * function App() {
 *   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
 *   const { user, isAuthenticated, logout } = useAuth();
 * 
 *   return (
 *     <div>
 *       {!isAuthenticated ? (
 *         <button onClick={() => setIsAuthModalOpen(true)}>
 *           Войти
 *         </button>
 *       ) : (
 *         <div>
 *           <span>Привет, {user?.email}</span>
 *           <button onClick={logout}>Выйти</button>
 *         </div>
 *       )}
 * 
 *       <AuthModal
 *         isOpen={isAuthModalOpen}
 *         onClose={() => setIsAuthModalOpen(false)}
 *         initialMode="login"
 *       />
 *     </div>
 *   );
 * }
 */

import React, { useState } from 'react';
import { AuthModal } from './AuthModal';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export const AuthExample: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, isAuthenticated, logout } = useAuth();

  const handleOpenLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          ShiKaraKa Auth Demo
        </h1>

        {!isAuthenticated ? (
          <div className="space-y-4">
            <Button onClick={handleOpenLogin} variant="primary" className="w-full">
              Войти
            </Button>
            <Button onClick={handleOpenRegister} variant="secondary" className="w-full">
              Зарегистрироваться
            </Button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Вы вошли как:</p>
              <p className="text-white font-medium">{user?.email}</p>
            </div>
            <Button onClick={logout} variant="ghost" className="w-full">
              Выйти
            </Button>
          </div>
        )}

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authMode}
        />
      </div>
    </div>
  );
};

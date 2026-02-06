import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  user_metadata: {
    username?: string;
    avatar_url?: string;
  };
}

/**
 * Hook для управления аутентификацией пользователя
 * Подписывается на изменения сессии и предоставляет функции для входа, регистрации и выхода
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Получить текущую сессию при монтировании
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError.message);
        }
        
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Подписаться на изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Отписаться при размонтировании
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Вход пользователя с email и паролем
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        throw loginError;
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка входа';
      setError(errorMessage);
      console.error('Login error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Регистрация нового пользователя
   */
  const register = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Отключаем подтверждение email для упрощения процесса
          emailRedirectTo: window.location.origin,
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      // Проверяем, требуется ли подтверждение email
      if (data.user && !data.session) {
        throw new Error('Проверьте вашу почту для подтверждения регистрации');
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка регистрации';
      setError(errorMessage);
      console.error('Registration error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Выход пользователя из системы
   */
  const logout = async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка выхода';
      setError(errorMessage);
      console.error('Logout error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};

/**
 * Преобразует Supabase User в наш тип User
 */
function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    user_metadata: {
      username: supabaseUser.user_metadata?.username,
      avatar_url: supabaseUser.user_metadata?.avatar_url,
    },
  };
}

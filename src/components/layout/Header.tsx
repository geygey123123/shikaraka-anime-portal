import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Debounce search with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  const handleAuthClick = useCallback(() => {
    setIsMobileMenuOpen(false);
    // This will be connected to AuthModal in future tasks
    console.log('Open auth modal');
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0c] border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-white hover:text-[#ff0055] transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ShiKaraKa
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Поиск аниме..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055] transition-colors"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/favorites">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Heart size={18} />
                    <span>Избранное</span>
                  </Button>
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-300"
                  >
                    <User size={18} />
                    <span className="text-sm">{user?.email}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 min-h-[44px]"
                      >
                        <LogOut size={16} />
                        <span>Выйти</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleAuthClick}>
                  Войти
                </Button>
                <Button variant="primary" size="sm" onClick={handleAuthClick}>
                  Регистрация
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 text-gray-300 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Поиск аниме..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-[#0a0a0c]">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors min-h-[44px]"
                >
                  <Heart size={18} />
                  <span>Избранное</span>
                </Link>
                
                <div className="px-4 py-2 text-sm text-gray-400">
                  {user?.email}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors min-h-[44px]"
                >
                  <LogOut size={18} />
                  <span>Выйти</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleAuthClick}
                  className="w-full"
                >
                  Войти
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleAuthClick}
                  className="w-full"
                >
                  Регистрация
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

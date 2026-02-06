import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';
import * as authHook from '../../hooks/useAuth';

// Mock useAuth hook
vi.mock('../../hooks/useAuth');

const renderHeader = (props = {}) => {
  return render(
    <BrowserRouter>
      <Header {...props} />
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  it('should display logo with link to home', () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
    });

    renderHeader();
    
    const logo = screen.getByText('ShiKaraKa');
    expect(logo).toBeInTheDocument();
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });

  it('should show login and registration buttons when not authenticated', () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
    });

    renderHeader();
    
    expect(screen.getByText('Войти')).toBeInTheDocument();
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
  });

  it('should show user email when authenticated', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {},
    };

    vi.mocked(authHook.useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });

    renderHeader();
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should call onSearch with debounced query', async () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
    });

    const onSearch = vi.fn();
    renderHeader({ onSearch });
    
    const searchInput = screen.getAllByPlaceholderText('Поиск аниме...')[0];
    fireEvent.change(searchInput, { target: { value: 'Naruto' } });
    
    // Should not call immediately
    expect(onSearch).not.toHaveBeenCalled();
    
    // Should call after 300ms debounce
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('Naruto');
    }, { timeout: 500 });
  });

  it('should show favorites link when authenticated', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {},
    };

    vi.mocked(authHook.useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });

    renderHeader();
    
    expect(screen.getByText('Избранное')).toBeInTheDocument();
  });
});

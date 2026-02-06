import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import * as authHook from '../../hooks/useAuth';

// Mock useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('LoginForm Component', () => {
  it('should render email and password fields', () => {
    const mockLogin = vi.fn();
    vi.mocked(authHook.useAuth).mockReturnValue({
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });

    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  it('should show validation error for invalid email', async () => {
    const mockLogin = vi.fn();
    vi.mocked(authHook.useAuth).mockReturnValue({
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    // Fill with invalid email but valid password
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.submit(submitButton.closest('form')!);

    // Wait a bit for state updates
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that login was not called due to validation error
    expect(mockLogin).not.toHaveBeenCalled();
    
    // Check that error message is displayed
    expect(screen.getByText(/введите корректный email адрес/i)).toBeInTheDocument();
  });

  it('should show validation error for short password', async () => {
    const mockLogin = vi.fn();
    vi.mocked(authHook.useAuth).mockReturnValue({
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/пароль должен содержать минимум 6 символов/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should call login with valid credentials', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    const mockOnSuccess = vi.fn();
    
    vi.mocked(authHook.useAuth).mockReturnValue({
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });

    render(<LoginForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should display error message on login failure', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid login credentials'));
    const mockOnError = vi.fn();
    
    vi.mocked(authHook.useAuth).mockReturnValue({
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });

    render(<LoginForm onError={mockOnError} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/неверный email или пароль/i)).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith('Неверный email или пароль');
    });
  });
});

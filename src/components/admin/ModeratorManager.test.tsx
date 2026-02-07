import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModeratorManager } from './ModeratorManager';

// Mock hooks
vi.mock('../../../hooks/useAdmin', () => ({
  useModerators: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useAddModerator: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useRemoveModerator: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ModeratorManager Component', () => {
  it('should render moderator list', () => {
    const { useModerators } = require('../../../hooks/useAdmin');
    useModerators.mockReturnValue({
      data: [
        { id: '1', email: 'mod1@example.com', user_id: 'user1' },
        { id: '2', email: 'mod2@example.com', user_id: 'user2' },
      ],
      isLoading: false,
    });
    
    render(<ModeratorManager />, { wrapper: createWrapper() });
    
    expect(screen.getByText('mod1@example.com')).toBeInTheDocument();
    expect(screen.getByText('mod2@example.com')).toBeInTheDocument();
  });

  it('should show add moderator form', () => {
    render(<ModeratorManager />, { wrapper: createWrapper() });
    
    expect(screen.getByPlaceholderText(/email модератора/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /добавить/i })).toBeInTheDocument();
  });

  it('should validate email format', () => {
    render(<ModeratorManager />, { wrapper: createWrapper() });
    
    const emailInput = screen.getByPlaceholderText(/email модератора/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const addButton = screen.getByRole('button', { name: /добавить/i });
    fireEvent.click(addButton);
    
    expect(screen.getByText(/некорректный email/i)).toBeInTheDocument();
  });

  it('should call addModerator with valid email', () => {
    const { useAddModerator } = require('../../../hooks/useAdmin');
    const mockMutate = vi.fn();
    useAddModerator.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    
    render(<ModeratorManager />, { wrapper: createWrapper() });
    
    const emailInput = screen.getByPlaceholderText(/email модератора/i);
    fireEvent.change(emailInput, { target: { value: 'newmod@example.com' } });
    
    const addButton = screen.getByRole('button', { name: /добавить/i });
    fireEvent.click(addButton);
    
    expect(mockMutate).toHaveBeenCalledWith('newmod@example.com');
  });

  it('should show remove button for each moderator', () => {
    const { useModerators } = require('../../../hooks/useAdmin');
    useModerators.mockReturnValue({
      data: [
        { id: '1', email: 'mod1@example.com', user_id: 'user1' },
      ],
      isLoading: false,
    });
    
    render(<ModeratorManager />, { wrapper: createWrapper() });
    
    expect(screen.getByRole('button', { name: /удалить/i })).toBeInTheDocument();
  });
});

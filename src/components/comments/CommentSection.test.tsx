import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommentSection } from './CommentSection';

// Mock hooks
vi.mock('../../../hooks/useComments', () => ({
  useComments: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useAddComment: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useDeleteComment: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
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

describe('CommentSection Component', () => {
  it('should show login prompt for unauthenticated users', () => {
    render(<CommentSection animeId={1} />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/войдите, чтобы оставить комментарий/i)).toBeInTheDocument();
  });

  it('should show comment form for authenticated users', () => {
    const { useAuth } = require('../../../hooks/useAuth');
    useAuth.mockReturnValue({ user: { id: 'user1' } });
    
    render(<CommentSection animeId={1} />, { wrapper: createWrapper() });
    
    expect(screen.getByPlaceholderText(/ваш комментарий/i)).toBeInTheDocument();
  });

  it('should display comments list', () => {
    const { useComments } = require('../../../hooks/useComments');
    useComments.mockReturnValue({
      data: [
        {
          id: '1',
          content: 'Great anime!',
          user_id: 'user1',
          profiles: { username: 'TestUser', avatar_url: null },
          created_at: new Date().toISOString(),
        },
      ],
      isLoading: false,
    });
    
    render(<CommentSection animeId={1} />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Great anime!')).toBeInTheDocument();
  });

  it('should show loading skeleton while fetching', () => {
    const { useComments } = require('../../../hooks/useComments');
    useComments.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    
    render(<CommentSection animeId={1} />, { wrapper: createWrapper() });
    
    expect(screen.getAllByTestId('comment-skeleton')).toHaveLength(3);
  });
});
